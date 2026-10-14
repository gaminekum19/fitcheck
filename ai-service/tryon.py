"""
Virtual try-on through a free Hugging Face Space running IDM-VTON
(Improving Diffusion Models for Authentic Virtual Try-on in the Wild).

The model only handles upper-body garments (tops, dresses) and needs a photo
of the garment. It runs on shared free GPUs, so a request can take a minute
or two and the daily quota is limited. Putting your Hugging Face token in
ai-service/.env as HF_TOKEN uses your own (larger) free quota.
"""

import os

from dotenv import load_dotenv
from gradio_client import Client, handle_file

load_dotenv()
SPACE = os.getenv("TRYON_SPACE", "yisol/IDM-VTON")


class TryOnError(Exception):
    def __init__(self, message, status=502):
        super().__init__(message)
        self.status = status


def _client():
    token = os.getenv("HF_TOKEN") or None
    try:
        return Client(SPACE, hf_token=token)
    except TypeError:  # newer gradio_client versions renamed the argument
        return Client(SPACE, token=token)


def _friendly(error):
    text = str(error)
    low = text.lower()
    if any(w in low for w in ("quota", "zerogpu", "too many requests", "rate limit")):
        return TryOnError("The free try-on service has reached its usage limit. Please try again later.", 429)
    if any(w in low for w in ("sleeping", "paused", "building", "runtime error", "not found", "could not get space")):
        return TryOnError("The try-on service is unavailable right now. Please try again in a few minutes.", 503)
    return TryOnError("Try-on failed: " + text[:200], 502)


def run_tryon(person_url, garment_url, description):
    """Returns (image_bytes, mime_type) of the person wearing the garment."""
    try:
        client = _client()
        result = client.predict(
            dict={"background": handle_file(person_url), "layers": [], "composite": None},
            garm_img=handle_file(garment_url),
            garment_des=description or "garment",
            is_checked=True,        # let the model detect the garment region itself
            is_checked_crop=False,
            denoise_steps=30,
            seed=42,
            api_name="/tryon",
        )
    except Exception as e:
        raise _friendly(e)

    path = result[0] if isinstance(result, (list, tuple)) else result
    if isinstance(path, dict):
        path = path.get("path") or path.get("value")
    if not path or not os.path.exists(path):
        raise TryOnError("The try-on service returned no image.", 502)

    with open(path, "rb") as f:
        data = f.read()
    ext = os.path.splitext(path)[1].lower()
    mime = {".png": "image/png", ".webp": "image/webp"}.get(ext, "image/jpeg")
    return data, mime
