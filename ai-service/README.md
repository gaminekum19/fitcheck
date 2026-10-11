# FitCheck AI Service

Python FastAPI service that analyzes selfie + full-body photos and returns
skin tone (undertone + depth) and body shape categories.

## Setup

```
cd ai-service
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Important:** always install from `requirements.txt`, not a bare `pip install mediapipe`.
A newer MediaPipe version (0.10.3x+) restructured its API and breaks the
`mediapipe.solutions.face_mesh` import this code relies on. The pinned
version (0.10.14) in requirements.txt is confirmed working.

## Run

```
uvicorn main:app --reload --port 8000
```

Visit http://localhost:8000 — you should see `{"message": "FitCheck AI service is running!"}`

## Test it

Once both this service AND the backend are running, the backend will call
this service automatically when a user uploads photos. You can also test
this service directly with a tool like Thunder Client:

POST http://localhost:8000/analyze
Body (JSON):
```json
{
  "selfieUrl": "https://some-image-url.com/selfie.jpg",
  "bodyPhotoUrl": "https://some-image-url.com/body.jpg"
}
```

## Known calibration note

The undertone/depth color thresholds in `skin_tone.py` are a reasonable
starting point based on color theory, but will benefit from tuning against
a real set of test photos once you have them. Treat early results as
"approximately right," not clinically precise — same philosophy as
documented in the project spec.
