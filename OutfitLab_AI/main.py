# OutfitLab_AI/main.py

import io
import json
import base64
import logging
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from rembg import remove

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
log = logging.getLogger("closi-ai")

OUTPUT_DIR = Path("outputs_fast")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Closi Fast Segmentation")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "ok": True,
        "service": "closi-ai",
        "message": "Closi AI is running",
    }


@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "closi-ai",
    }


def sanitize_label(label: str) -> str:
    label = str(label or "prenda").lower().strip()
    clean = "".join(c if c.isalnum() else "_" for c in label)
    return clean[:40] or "prenda"


def normalize_bbox(bbox: dict, width: int, height: int):
    """
    Acepta bbox normalizado 0-1 o bbox en pixeles.
    Devuelve left, top, right, bottom en pixeles.
    """

    x = float(bbox.get("x", 0))
    y = float(bbox.get("y", 0))
    w = float(bbox.get("width", 0))
    h = float(bbox.get("height", 0))

    if w <= 0 or h <= 0:
        raise ValueError("bbox inválido: width/height deben ser mayores a 0")

    # Si viene normalizado entre 0 y 1
    if x <= 1 and y <= 1 and w <= 1 and h <= 1:
        left = int(x * width)
        top = int(y * height)
        right = int((x + w) * width)
        bottom = int((y + h) * height)
    else:
        # Si ya viene en pixeles
        left = int(x)
        top = int(y)
        right = int(x + w)
        bottom = int(y + h)

    # Margen pequeño para no cortar bordes de la prenda
    margin_x = int((right - left) * 0.08)
    margin_y = int((bottom - top) * 0.08)

    left = max(0, left - margin_x)
    top = max(0, top - margin_y)
    right = min(width, right + margin_x)
    bottom = min(height, bottom + margin_y)

    if right <= left or bottom <= top:
        raise ValueError("bbox inválido después de normalizar")

    return left, top, right, bottom


@app.post("/segment-crop")
async def segment_crop(
    file: UploadFile = File(...),
    bbox: str = Form(...),
    label: str = Form("prenda"),
):
    try:
        contents = await file.read()

        if not contents:
            raise HTTPException(status_code=400, detail="Archivo vacío")

        try:
            bbox_data = json.loads(bbox)
        except Exception:
            raise HTTPException(status_code=400, detail="bbox no es JSON válido")

        image = Image.open(io.BytesIO(contents)).convert("RGBA")
        width, height = image.size

        left, top, right, bottom = normalize_bbox(bbox_data, width, height)

        crop = image.crop((left, top, right, bottom))

        # Intentar quitar fondo. Si falla, usamos crop normal.
        try:
            crop_no_bg = remove(crop)
            final_image = crop_no_bg.convert("RGBA")
            mode = "nobg"
        except Exception as e:
            log.warning(f"rembg falló, usando crop normal: {e}")
            final_image = crop.convert("RGBA")
            mode = "crop"

        safe_label = sanitize_label(label)
        filename = f"seg_{safe_label}_{left}_{top}_{right}_{bottom}.png"
        output_path = OUTPUT_DIR / filename

        final_image.save(output_path, format="PNG")

        buffer = io.BytesIO()
        final_image.save(buffer, format="PNG")
        image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return {
            "success": True,
            "file": filename,
            "mode": mode,
            "bbox_px": {
                "left": left,
                "top": top,
                "right": right,
                "bottom": bottom,
            },
            "mime_type": "image/png",
            "image_base64": image_base64,
        }

    except HTTPException:
        raise
    except Exception as e:
        log.exception("Error en /segment-crop")
        raise HTTPException(status_code=500, detail=str(e))