from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import numpy as np
import cv2

from skin_tone import analyze_skin_tone
from body_shape import analyze_body_shape
from color_name import name_dominant_color

app = FastAPI(title="FitCheck AI Service")


class AnalyzeRequest(BaseModel):
    selfieUrl: str
    bodyPhotoUrl: str


class ColorRequest(BaseModel):
    imageUrl: str


def _download_image(url: str):
    response = requests.get(url, timeout=15)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Could not download image from {url}")
    image_array = np.frombuffer(response.content, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Downloaded file is not a valid image.")
    return image


@app.get("/")
def root():
    return {"message": "FitCheck AI service is running!"}


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    """Skin undertone/depth from the selfie, body shape from the full-body photo."""
    try:
        selfie_image = _download_image(req.selfieUrl)
        body_image = _download_image(req.bodyPhotoUrl)

        skin_result = analyze_skin_tone(selfie_image)
        shape_result = analyze_body_shape(body_image)

        return {
            "undertone": skin_result["undertone"],
            "depth": skin_result["depth"],
            "bodyShape": shape_result["bodyShape"],
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/dominant-color")
def dominant_color(req: ColorRequest):
    """Names the dominant colour of a garment photo (used by the closet)."""
    try:
        return {"color": name_dominant_color(_download_image(req.imageUrl))}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Colour detection failed: {str(e)}")
