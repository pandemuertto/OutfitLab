import io
import json
import logging
from pathlib import Path

import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from rembg import remove

logging.basicConfig(level=logging.INFO, format="%(levelname)s │ %(message)s")
log = logging.getLogger("outfitlab-fast")

OUTPUT_DIR = Path("outputs_fast")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="OutfitLab Fast Segmentation")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def clamp_bbox(box, width, height, padding_ratio=0.05):
    x = max(0, int((box.get("x", 0)) * width))
    y = max(0, int((box.get("y", 0)) * height))
    w = max(1, int((box.get("width", 0)) * width))
    h = max(1, int((box.get("height", 0)) * height))

    pad_x = int(w * padding_ratio)
    pad_y = int(h * padding_ratio)

    x = max(0, x - pad_x)
    y = max(0, y - pad_y)
    w = min(width - x, w + pad_x * 2)
    h = min(height - y, h + pad_y * 2)

    if x >= width:
        x = width - 1
    if y >= height:
        y = height - 1

    w = min(w, width - x)
    h = min(h, height - y)

    return x, y, w, h


def safe_label(label: str):
    return "".join(c for c in label.lower().replace(" ", "_") if c.isalnum() or c == "_")


def alpha_coverage(img_rgba: Image.Image):
    arr = np.array(img_rgba)
    if arr.shape[-1] != 4:
        return 1.0
    alpha = arr[:, :, 3]
    opaque = np.sum(alpha > 20)
    total = alpha.shape[0] * alpha.shape[1]
    return opaque / max(total, 1)


def white_background_ratio(img_rgb: Image.Image):
    arr = np.array(img_rgb.convert("RGB"))
    bright = np.sum(
        (arr[:, :, 0] > 240) &
        (arr[:, :, 1] > 240) &
        (arr[:, :, 2] > 240)
    )
    total = arr.shape[0] * arr.shape[1]
    return bright / max(total, 1)


@app.post("/segment-crop")
async def segment_crop(
    file: UploadFile = File(...),
    bbox: str = Form(...),
    label: str = Form("prenda"),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="El archivo debe ser una imagen.")

    try:
        bbox_data = json.loads(bbox)
    except Exception:
        raise HTTPException(status_code=400, detail="bbox inválido")

    raw = await file.read()

    try:
        pil_img = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"No se pudo abrir la imagen: {exc}")

    img_rgb = np.array(pil_img)
    height, width = img_rgb.shape[:2]

    x, y, w, h = clamp_bbox(bbox_data, width, height)
    crop_rgb = img_rgb[y:y+h, x:x+w]

    if crop_rgb.size == 0:
        raise HTTPException(status_code=400, detail="El recorte salió vacío")

    crop_pil = Image.fromarray(crop_rgb).convert("RGB")
    clean_label = safe_label(label)

    # Guardar crop normal
    crop_filename = f"{clean_label}_{x}_{y}_{w}_{h}_crop.png"
    crop_path = OUTPUT_DIR / crop_filename
    crop_pil.save(crop_path)

    # Intentar rembg
    selected_path = crop_path
    selected_mode = "crop"
    alpha_ratio = None

    try:
        buffer = io.BytesIO()
        crop_pil.save(buffer, format="PNG")
        crop_bytes = buffer.getvalue()

        removed = remove(crop_bytes)
        rembg_img = Image.open(io.BytesIO(removed)).convert("RGBA")

        alpha_ratio = alpha_coverage(rembg_img)
        white_ratio = white_background_ratio(crop_pil)

        rembg_filename = f"{clean_label}_{x}_{y}_{w}_{h}_nobg.png"
        rembg_path = OUTPUT_DIR / rembg_filename
        rembg_img.save(rembg_path)

        log.info(
            "label=%s | alpha_ratio=%.3f | white_bg_ratio=%.3f",
            label,
            alpha_ratio,
            white_ratio
        )

        # Regla híbrida:
        # si rembg dejó suficiente contenido, usarlo
        # si dejó casi vacío, usar crop normal
        # para fondos muy blancos, exigir más evidencia antes de usar rembg
        if white_ratio > 0.55:
            if alpha_ratio >= 0.35:
                selected_path = rembg_path
                selected_mode = "rembg"
        else:
            if alpha_ratio >= 0.18:
                selected_path = rembg_path
                selected_mode = "rembg"

    except Exception as exc:
        log.warning("rembg falló, se usará crop normal: %s", exc)

    log.info("✅ Segmento final guardado: %s (%s)", selected_path.name, selected_mode)

    return {
        "success": True,
        "file": selected_path.name,
        "file_path": str(selected_path.resolve()),
        "mode": selected_mode,
        "alpha_ratio": alpha_ratio,
        "crop": {
            "x": x,
            "y": y,
            "width": w,
            "height": h,
        },
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "mode": "fast-bbox-hybrid",
        "output_dir": str(OUTPUT_DIR.resolve()),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)