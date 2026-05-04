import io
import os
import json
import uuid
import logging
from pathlib import Path

import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# Servir públicamente las imágenes generadas.
# Ejemplo:
# https://closi-ai.onrender.com/outputs_fast/archivo.png
app.mount("/outputs_fast", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs_fast")


def safe_label(label: str):
    return "".join(
        c for c in str(label).lower().replace(" ", "_")
        if c.isalnum() or c == "_"
    ) or "prenda"


def clamp_bbox(box, width, height, padding_ratio=0.08):
    """
    Soporta bbox relativo:
      { x: 0.1, y: 0.2, width: 0.5, height: 0.6 }

    Y bbox en pixeles:
      { x: 100, y: 200, width: 500, height: 600 }
    """

    raw_x = float(box.get("x", 0) or 0)
    raw_y = float(box.get("y", 0) or 0)
    raw_w = float(box.get("width", 0) or 0)
    raw_h = float(box.get("height", 0) or 0)

    # Si todos los valores principales son <= 1.5, asumimos que son relativos.
    values_are_relative = raw_x <= 1.5 and raw_y <= 1.5 and raw_w <= 1.5 and raw_h <= 1.5

    if values_are_relative:
        x = int(raw_x * width)
        y = int(raw_y * height)
        w = int(raw_w * width)
        h = int(raw_h * height)
    else:
        x = int(raw_x)
        y = int(raw_y)
        w = int(raw_w)
        h = int(raw_h)

    x = max(0, x)
    y = max(0, y)
    w = max(1, w)
    h = max(1, h)

    pad_x = int(w * padding_ratio)
    pad_y = int(h * padding_ratio)

    x = max(0, x - pad_x)
    y = max(0, y - pad_y)
    w = w + pad_x * 2
    h = h + pad_y * 2

    if x >= width:
        x = width - 1

    if y >= height:
        y = height - 1

    w = min(w, width - x)
    h = min(h, height - y)

    return x, y, w, h


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


def get_public_base_url(request: Request):
    """
    En Render conviene configurar:
    PUBLIC_AI_URL=https://closi-ai.onrender.com

    Si no existe, usamos request.base_url.
    """
    env_url = os.environ.get("PUBLIC_AI_URL", "").strip().rstrip("/")

    if env_url:
        return env_url

    return str(request.base_url).rstrip("/")


@app.get("/")
async def root():
    return {
        "ok": True,
        "service": "OutfitLab AI",
        "message": "API de segmentación funcionando",
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "mode": "bbox-rembg-segmentation",
        "output_dir": str(OUTPUT_DIR.resolve()),
        "public_ai_url": os.environ.get("PUBLIC_AI_URL", None),
    }


@app.post("/segment-crop")
async def segment_crop(
    request: Request,
    file: UploadFile = File(...),
    bbox: str = Form(...),
    label: str = Form("prenda"),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=422,
            detail="El archivo debe ser una imagen."
        )

    try:
        bbox_data = json.loads(bbox)
    except Exception:
        raise HTTPException(status_code=400, detail="bbox inválido")

    raw = await file.read()

    try:
        pil_img = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"No se pudo abrir la imagen: {exc}"
        )

    img_rgb = np.array(pil_img)
    height, width = img_rgb.shape[:2]

    x, y, w, h = clamp_bbox(bbox_data, width, height)

    log.info("📦 Imagen original: width=%s height=%s", width, height)
    log.info("📦 BBox recibido: %s", bbox_data)
    log.info("📦 BBox final: x=%s y=%s w=%s h=%s", x, y, w, h)

    crop_rgb = img_rgb[y:y + h, x:x + w]

    if crop_rgb.size == 0:
        raise HTTPException(status_code=400, detail="El recorte salió vacío")

    crop_pil = Image.fromarray(crop_rgb).convert("RGB")
    clean_label = safe_label(label)
    unique_id = uuid.uuid4().hex[:10]

    # Guardar crop normal
    crop_filename = f"{clean_label}_{unique_id}_crop.png"
    crop_path = OUTPUT_DIR / crop_filename
    crop_pil.save(crop_path)

    selected_path = crop_path
    selected_mode = "crop"
    alpha_ratio = None
    white_ratio = None

    # Intentar quitar fondo
    try:
        buffer = io.BytesIO()
        crop_pil.save(buffer, format="PNG")
        crop_bytes = buffer.getvalue()

        removed = remove(crop_bytes)
        rembg_img = Image.open(io.BytesIO(removed)).convert("RGBA")

        alpha_ratio = alpha_coverage(rembg_img)
        white_ratio = white_background_ratio(crop_pil)

        rembg_filename = f"{clean_label}_{unique_id}_nobg.png"
        rembg_path = OUTPUT_DIR / rembg_filename
        rembg_img.save(rembg_path)

        log.info(
            "label=%s | alpha_ratio=%.3f | white_bg_ratio=%.3f",
            label,
            alpha_ratio,
            white_ratio
        )

        # Regla para decidir si usamos rembg o crop normal.
        # Si rembg deja casi vacío, mejor usamos el crop.
        if white_ratio is not None and white_ratio > 0.55:
            if alpha_ratio is not None and alpha_ratio >= 0.30:
                selected_path = rembg_path
                selected_mode = "rembg"
        else:
            if alpha_ratio is not None and alpha_ratio >= 0.15:
                selected_path = rembg_path
                selected_mode = "rembg"

    except Exception as exc:
        log.warning("rembg falló, se usará crop normal: %s", exc)

    base_url = get_public_base_url(request)
    file_url = f"{base_url}/outputs_fast/{selected_path.name}"

    log.info("✅ Segmento final guardado: %s (%s)", selected_path.name, selected_mode)
    log.info("🌐 URL pública: %s", file_url)

    return {
        "success": True,
        "file": selected_path.name,
        "file_path": str(selected_path.resolve()),
        "file_url": file_url,
        "imageUrl": file_url,
        "url": file_url,
        "mode": selected_mode,
        "alpha_ratio": alpha_ratio,
        "white_ratio": white_ratio,
        "crop": {
            "x": x,
            "y": y,
            "width": w,
            "height": h,
        },
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )