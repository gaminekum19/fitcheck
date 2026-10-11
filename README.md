# FitCheck

**Your personal stylist, powered by computer vision.**

FitCheck reads your skin undertone and silhouette from two photos, builds a complete outfit around the clothes you already own, and shows you only what's missing, with direct links to buy it.

Most fashion apps recommend what's popular. FitCheck recommends what suits you.

---

## What it does

1. **Understands you.** Upload a selfie and a full-body photo. FitCheck estimates your undertone (warm, cool, neutral), depth (light, medium, deep) and body shape, and turns them into a colour palette and silhouette guide.
2. **Knows your wardrobe.** Add the pieces you already own. The outfit engine uses them first, so you never rebuy what you have.
3. **Builds the full look.** Pick an occasion or category and set a budget. FitCheck assembles a complete outfit and fills only the gaps with products from Indian retailers.
4. **Explains itself.** Every recommendation comes with a plain-language reason. The scoring is deterministic and inspectable, not a black box.
5. **Sends you to buy.** Clicks are logged and redirected to the retailer through affiliate links, disclosed in the interface.

## Status

| Capability | Status |
|---|---|
| Accounts and JWT authentication | Live |
| Photo upload and storage | Live |
| Undertone, depth and body-shape analysis | Live |
| Palette and silhouette guidance | Live |
| Outfit engine (owned items first, budget-aware) | Live |
| Digital closet | Live |
| Affiliate click tracking and redirect | Live |
| Consent flow and affiliate disclosure | Live |
| AI-written outfit explanations | Ready, requires a Gemini API key |
| Cross-platform price comparison | In development |
| Automatic garment tagging | Planned |
| Virtual try-on | Planned |
| Multi-day packing mode | Planned |
| Mobile app (Flutter) | Planned |

## Architecture

```
┌──────────────┐   REST + JWT   ┌──────────────────────┐
│  Web client  │ ─────────────► │  API  (Node/Express) │
└──────────────┘                └───┬──────────┬───────┘
                                    │          │
                  ┌─────────────────┘          └──────────────┐
                  ▼                                           ▼
        ┌───────────────────┐                     ┌────────────────────────┐
        │  MongoDB Atlas    │                     │  Vision service        │
        │  users · profiles │                     │  (Python / FastAPI)    │
        │  closet · products│                     │  MediaPipe · OpenCV    │
        │  outfits · clicks │                     │  scikit-learn          │
        └───────────────────┘                     └────────────────────────┘
                  ▲
                  │            ┌───────────────────┐
                  └──────────► │  Cloudinary       │  photo storage
                               └───────────────────┘
```

**Vision pipeline.** MediaPipe Face Mesh locates cheek and forehead regions. Their pixels are clustered with K-means and the dominant colour is mapped to undertone and depth. MediaPipe Pose provides shoulder and hip landmarks, and their width ratios classify body shape. Only the resulting categories are stored. Raw measurements are not.

**Outfit engine.** For each garment slot in the chosen category, every candidate (owned or from the catalogue) is scored on colour match, silhouette match, budget fit, and a bonus for items already owned. The best-scoring combination wins. This is a deterministic algorithm by design, so results are reproducible and explainable.

## Getting started

**Requirements:** Node.js 18+, Python 3.11 (MediaPipe does not yet publish wheels for newer versions), a MongoDB Atlas cluster, a Cloudinary account.

### 1. API

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm start
```

Runs on `http://localhost:3001`.

### 2. Vision service

```bash
cd ai-service
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Web client

```bash
cd frontend
python3 -m http.server 5500
```

Open `http://localhost:5500`.

### Configuration

Set these in `backend/.env`:

| Variable | Description |
|---|---|
| `MONGO_URI` | Atlas connection string, including the `/fitcheck` database name |
| `JWT_SECRET` | Long random string used to sign tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `AI_SERVICE_URL` | Vision service URL. Default `http://localhost:8000` |
| `GEMINI_API_KEY` | Optional. Enables AI-written explanations. Without it, a template sentence is used |

## API reference

All routes are prefixed with `/api`. Routes marked **auth** require `Authorization: Bearer <token>`.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | | Create an account, returns a token |
| POST | `/auth/login` | | Log in, returns a token |
| GET | `/auth/me` | yes | Check the current session |
| POST | `/profile/upload-images` | yes | Multipart upload (`selfie`, `bodyPhoto`). Runs analysis and saves the profile |
| GET | `/profile/me` | yes | Fetch the analysed profile |
| GET | `/closet` | yes | List owned items |
| POST | `/closet` | yes | Add an owned item (`garmentType`, `color`, `styleTag`, optional `image`) |
| DELETE | `/closet/:id` | yes | Remove an owned item |
| GET | `/products` | | List catalogue products. Optional `?category=` |
| POST | `/products` | | Add a catalogue product |
| GET | `/recommendations` | yes | Build an outfit. Query: `category`, optional `budget` |
| GET | `/click/:productId` | | Log the click and redirect to the retailer link |

Supported categories: `western-dresses`, `jeans-tops`, `indian-traditional`, `winter-wear`.

## Project structure

```
fitcheck/
├── backend/        API, data models, outfit engine
├── ai-service/     Vision service (FastAPI)
├── frontend/       Web client
└── docs/           Architecture and design notes
```

## Security and privacy

- Passwords are hashed with bcrypt. Sessions use signed JWTs that expire after seven days.
- Uploads are limited to image files under 8 MB.
- Users give explicit consent before any photo is analysed.
- Only derived style categories are saved to a profile.
- FitCheck provides fashion suggestions only. It makes no medical or personal judgements.
- Affiliate relationships are disclosed on the results page and in the footer.

## Known limitations

- Analysis produces styling categories, not measurements. Results depend on lighting, pose and clothing, and the classification thresholds have not yet been validated against a labelled dataset.
- The product catalogue is a small curated sample, and the affiliate URLs in the seed file are placeholders to replace with real links.
- On free-tier hosting, the first request after a period of inactivity can be slow.

## Roadmap

1. Cross-platform price comparison for products listed on more than one retailer
2. Automatic garment recognition with CLIP
3. Virtual try-on with an open-source diffusion model
4. Multi-day packing mode that maximises reuse across outfits
5. Flutter mobile app on the same API
6. Production deployment

## License

Copyright © 2026 FitCheck. All rights reserved.
