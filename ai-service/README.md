---
title: FitCheck AI Service
emoji: 👗
colorFrom: yellow
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

# FitCheck AI Service

FastAPI service for FitCheck: skin undertone and body-shape analysis (MediaPipe), garment colour detection, and virtual try-on.

Endpoints: `GET /`, `POST /analyze`, `POST /dominant-color`, `POST /tryon`.
The POST endpoints require the `X-Service-Key` header when `AI_SERVICE_KEY` is set.

Local run: use Python 3.11, `pip install -r requirements.txt`, then `uvicorn main:app --reload --port 8000`.
