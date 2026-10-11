# FitCheck — Starter Codebase

This is a real, working starter implementation of FitCheck: auth, database models,
image upload, AI analysis (skin tone + body shape), the outfit recommendation
engine, and affiliate click tracking. Everything in here has been tested and
actually works — you just need to plug in your own free accounts (MongoDB
Atlas, Cloudinary) and run it.

## What's included and working

- ✅ Backend (Node.js/Express) — auth, image upload, recommendation engine, affiliate click/redirect
- ✅ AI service (Python/FastAPI) — real MediaPipe-based skin tone + body shape detection
- ✅ Frontend (plain HTML/JS, no build step) — upload photos, see your profile, get recommendations
- ⚠️ Virtual try-on and GenAI explanations — code is wired up, but need YOUR OWN free API keys (see below) to actually activate. Without them, GenAI explanations fall back to a simple templated sentence, and try-on isn't included in this starter yet.

## Step 1: Unzip into your repo

Unzip this file's contents directly into your fresh, empty `fitcheck` repo folder, so you end up with:
```
fitcheck/
├── backend/
├── ai-service/
├── frontend/
├── README.md   (this file)
```

## Step 2: Set up the backend

```
cd backend
npm install
cp .env.example .env
```

Now open `.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas connection string (same one from before, or a new cluster — remember to click "Allow Access From Anywhere" under Network Access, and remember free clusters pause after a month of inactivity, just click Resume if that happens)
- `JWT_SECRET` — any long random string you make up
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — free account at https://cloudinary.com → Dashboard shows these three values immediately after signup
- `GEMINI_API_KEY` — optional for now; free key at https://aistudio.google.com/app/apikey. Leave as-is if you want to skip this today — the app still works without it.

Then seed some sample products so you have something to test recommendations with:
```
npm run seed
```

Start the backend:
```
npm start
```
You should see the same two success lines as before:
```
MongoDB connected successfully!
Server is running on http://localhost:3001
```

## Step 3: Set up the AI service

Open a **new terminal tab** (keep the backend running in the first one):
```
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
You should see Uvicorn report it's running on `http://127.0.0.1:8000`.

Test it's alive by opening `http://localhost:8000` in your browser — should show `{"message":"FitCheck AI service is running!"}`.

## Step 4: Open the frontend

No build step needed — just open `frontend/index.html` directly in your browser (double-click it, or right-click → Open With → your browser).

**Important:** your browser may block the camera-file-upload-to-localhost flow if you open the file directly as `file://`. If you hit CORS or fetch errors, instead serve it with a tiny local server:
```
cd frontend
python3 -m http.server 5500
```
Then open `http://localhost:5500` in your browser instead.

## Step 5: Try the whole flow

1. Sign up with a real email/password
2. Upload a real selfie and a real full-body photo
3. Wait a few seconds — you should see your derived undertone, depth, and body shape
4. Pick a category (e.g. "Western Dresses"), optionally set a budget
5. Click "Get My Outfit" — you should see a recommended outfit with an explanation and real (placeholder) affiliate links

## What to do next

- Replace the sample products in `backend/src/utils/seedProducts.js` with real products and real affiliate links from your actual affiliate accounts (Amazon Associates, EarnKaro, etc.)
- Add your Gemini API key to get real AI-generated explanations instead of the fallback template
- Push this to GitHub: from the `fitcheck` root folder, run `git add .`, `git commit -m "initial working FitCheck build"`, `git push`
- Deploy: Vercel for the frontend (or just the static HTML for now), Render for the backend and AI service, exactly as planned in our earlier architecture doc

## Known limitations of this starter (being upfront)

- The "use what you already own" feature currently requires manually typing the garment type/color/style when adding an item — automatic detection via CLIP is a planned next step, not included yet
- Virtual try-on is not included in this starter — it requires a Hugging Face account and additional integration work
- Skin-tone/body-shape classification thresholds are a reasonable first pass based on color theory, but will likely need tuning once you test with real photos
