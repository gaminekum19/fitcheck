import base64
import hmac
import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel
import requests
import numpy as np
import cv2

from skin_tone import analyze_skin_tone
from body_shape import analyze_body_shape
from color_name import name_dominant_color
from tryon import run_tryon, TryOnError

load_dotenv()
app = FastAPI(title="FitCheck AI Service")


def require_key(x_service_key: str = Header(default="")):
    """If AI_SERVICE_KEY is set, only callers that know it (our backend) may use the service."""
    expected = os.getenv("AI_SERVICE_KEY")
    if expected and not hmac.compare_digest(x_service_key, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


class AnalyzeRequest(BaseModel):
    selfieUrl: str
    bodyPhotoUrl: str


class ColorRequest(BaseModel):
    imageUrl: str


class TryOnRequest(BaseModel):
    personUrl: str
    garmentUrl: str
    description: str = "garment"


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


@app.post("/analyze", dependencies=[Depends(require_key)])
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


@app.post("/dominant-color", dependencies=[Depends(require_key)])
def dominant_color(req: ColorRequest):
    """Names the dominant colour of a garment photo (used by the closet)."""
    try:
        return {"color": name_dominant_color(_download_image(req.imageUrl))}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Colour detection failed: {str(e)}")


@app.post("/tryon", dependencies=[Depends(require_key)])
def tryon(req: TryOnRequest):
    """Generates a preview of the person wearing the garment (virtual try-on)."""
    try:
        data, mime = run_tryon(req.personUrl, req.garmentUrl, req.description)
        return {"imageBase64": base64.b64encode(data).decode("ascii"), "mime": mime}
    except TryOnError as e:
        raise HTTPException(status_code=e.status, detail=str(e))
