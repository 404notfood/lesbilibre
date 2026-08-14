import os
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException
from PIL import Image
from transformers import pipeline

MODEL_ID = os.getenv("NSFW_MODEL_ID", "Falconsai/nsfw_image_detection")
API_TOKEN = os.getenv("MODERATION_API_TOKEN", "")
IMAGES_ROOT = Path(os.getenv("IMAGES_ROOT", "../storage/app/public")).resolve()

app = FastAPI(title="LesbiLibre local image moderation", docs_url=None, redoc_url=None)
classifier = None


def get_classifier():
    global classifier
    if classifier is None:
        classifier = pipeline("image-classification", model=MODEL_ID, device=-1)
    return classifier


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_ID}


@app.post("/classify")
def classify(payload: dict, x_moderation_token: str = Header(default="")):
    if not API_TOKEN or x_moderation_token != API_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

    relative_path = payload.get("path")
    if not isinstance(relative_path, str) or not relative_path.startswith("photos/"):
        raise HTTPException(status_code=422, detail="Invalid image path")

    image_path = (IMAGES_ROOT / relative_path).resolve()
    if IMAGES_ROOT not in image_path.parents or not image_path.is_file():
        raise HTTPException(status_code=404, detail="Image not found")

    try:
        with Image.open(image_path) as image:
            image.verify()
        with Image.open(image_path) as image:
            result = get_classifier()(image.convert("RGB"))
    except Exception as error:
        raise HTTPException(status_code=422, detail="Unreadable image") from error

    scores = {item["label"].lower(): float(item["score"]) for item in result}
    return {"label": max(scores, key=scores.get), "scores": scores}
