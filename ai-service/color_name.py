"""
Garment colour detection: finds the dominant colour in the middle of a photo
(to skip the background) and names it with the closest entry in a table of
fashion colour names. The names match the ones the outfit engine understands.
"""

import cv2
import numpy as np
from sklearn.cluster import KMeans

NAMED_COLORS = {
    "white": (245, 245, 245), "black": (25, 25, 25), "grey": (128, 128, 128),
    "charcoal": (60, 60, 62), "silver": (185, 188, 196), "beige": (222, 205, 175),
    "cream": (240, 232, 210), "taupe": (168, 156, 142), "navy": (31, 42, 68),
    "blue": (50, 100, 200), "sapphire": (30, 60, 140), "sky blue": (135, 190, 230),
    "teal": (30, 120, 120), "emerald": (31, 111, 92), "green": (60, 150, 70),
    "olive": (110, 127, 82), "mustard": (198, 154, 61), "yellow": (235, 205, 60),
    "gold": (212, 175, 55), "orange": (225, 130, 40), "rust": (140, 59, 46),
    "terracotta": (179, 87, 58), "coral": (240, 128, 110), "peach": (245, 190, 160),
    "red": (200, 35, 40), "maroon": (122, 46, 46), "berry": (138, 45, 82),
    "pink": (230, 150, 180), "dusty rose": (199, 154, 154), "purple": (110, 60, 150),
    "plum": (90, 40, 80), "lavender": (142, 136, 194), "brown": (110, 75, 50),
    "camel": (181, 139, 90), "tan": (210, 180, 140),
}

_NAMES = list(NAMED_COLORS)
_LAB = cv2.cvtColor(np.array([[NAMED_COLORS[n] for n in _NAMES]], dtype=np.uint8), cv2.COLOR_RGB2LAB)[0].astype(float)


def nearest_color_name(rgb):
    lab = cv2.cvtColor(np.array([[rgb]], dtype=np.uint8), cv2.COLOR_RGB2LAB)[0][0].astype(float)
    distances = np.linalg.norm(_LAB - lab, axis=1)  # LAB distance matches how people see colour
    return _NAMES[int(np.argmin(distances))]


def name_dominant_color(image_bgr):
    h, w = image_bgr.shape[:2]
    centre = image_bgr[h // 4: 3 * h // 4, w // 4: 3 * w // 4]
    centre = cv2.resize(centre, (64, 64), interpolation=cv2.INTER_AREA)
    pixels = cv2.cvtColor(centre, cv2.COLOR_BGR2RGB).reshape(-1, 3).astype(float)

    km = KMeans(n_clusters=3, n_init=5, random_state=42).fit(pixels)
    counts = np.bincount(km.labels_)
    dominant = km.cluster_centers_[int(np.argmax(counts))]
    return nearest_color_name(tuple(int(round(v)) for v in dominant))
