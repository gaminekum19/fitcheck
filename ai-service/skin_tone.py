"""
Skin tone analysis: detects face landmarks, samples skin-colored
patches from cheeks/forehead (avoiding eyes/lips/hair), clusters the
dominant color with K-means, and maps it to undertone + depth categories.
"""

import cv2
import numpy as np
import mediapipe as mp
from sklearn.cluster import KMeans

mp_face_mesh = mp.solutions.face_mesh

# MediaPipe Face Mesh landmark indices for cheek and forehead regions
# (these indices avoid eyes, lips, eyebrows, and hairline)
CHEEK_LEFT_IDX = [50, 101, 118, 123]
CHEEK_RIGHT_IDX = [280, 330, 347, 352]
FOREHEAD_IDX = [10, 109, 338, 151]


def _get_region_pixels(image, landmarks, indices, img_w, img_h):
    points = []
    for idx in indices:
        lm = landmarks[idx]
        x, y = int(lm.x * img_w), int(lm.y * img_h)
        points.append((x, y))

    points = np.array(points)
    x_min, y_min = points.min(axis=0)
    x_max, y_max = points.max(axis=0)

    # Small safety margin, clipped to image bounds
    x_min, y_min = max(0, x_min - 5), max(0, y_min - 5)
    x_max, y_max = min(img_w, x_max + 5), min(img_h, y_max + 5)

    patch = image[y_min:y_max, x_min:x_max]
    if patch.size == 0:
        return np.array([])
    return patch.reshape(-1, 3)


def _classify_undertone_and_depth(rgb):
    r, g, b = rgb

    # Simple, explainable color-theory thresholds (not a trained model)
    # Warm undertone: red/yellow dominant over blue
    # Cool undertone: blue/pink dominant, less yellow
    yellow_warmth = (r + g) / 2 - b

    if yellow_warmth > 15:
        undertone = "warm"
    elif yellow_warmth < -5:
        undertone = "cool"
    else:
        undertone = "neutral"

    brightness = (r + g + b) / 3
    if brightness > 180:
        depth = "light"
    elif brightness > 110:
        depth = "medium"
    else:
        depth = "deep"

    return undertone, depth


def analyze_skin_tone(image_bgr):
    """
    image_bgr: a numpy array (OpenCV BGR image) of the selfie.
    Returns: { "undertone": ..., "depth": ... }
    """
    img_h, img_w = image_bgr.shape[:2]
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

    with mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True) as face_mesh:
        results = face_mesh.process(image_rgb)

        if not results.multi_face_landmarks:
            raise ValueError("No face detected in the selfie. Please upload a clearer, front-facing photo.")

        landmarks = results.multi_face_landmarks[0].landmark

        all_pixels = []
        for region in [CHEEK_LEFT_IDX, CHEEK_RIGHT_IDX, FOREHEAD_IDX]:
            pixels = _get_region_pixels(image_rgb, landmarks, region, img_w, img_h)
            if pixels.size > 0:
                all_pixels.append(pixels)

        if not all_pixels:
            raise ValueError("Could not sample skin regions from the photo. Please try a different photo.")

        all_pixels = np.vstack(all_pixels)

        # K-means clustering to find the dominant skin color
        n_clusters = min(3, len(all_pixels))
        kmeans = KMeans(n_clusters=n_clusters, n_init=10, random_state=42)
        kmeans.fit(all_pixels)

        # The largest cluster is treated as the dominant skin tone
        counts = np.bincount(kmeans.labels_)
        dominant_color = kmeans.cluster_centers_[np.argmax(counts)]

        undertone, depth = _classify_undertone_and_depth(dominant_color)

        return {"undertone": undertone, "depth": depth}
