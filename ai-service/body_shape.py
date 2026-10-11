"""
Body shape analysis: detects body landmarks with MediaPipe Pose,
computes shoulder/waist/hip width ratios, and classifies into a
standard styling body-shape category.
"""

import cv2
import numpy as np
import mediapipe as mp

mp_pose = mp.solutions.pose


def _distance(p1, p2):
    return np.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)


def analyze_body_shape(image_bgr):
    """
    image_bgr: a numpy array (OpenCV BGR image) of the full-body photo.
    Returns: { "bodyShape": ... }
    """
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

    with mp_pose.Pose(static_image_mode=True, model_complexity=1) as pose:
        results = pose.process(image_rgb)

        if not results.pose_landmarks:
            raise ValueError("No body detected in the photo. Please upload a clearer, full-body photo.")

        lm = results.pose_landmarks.landmark

        # Key landmarks (MediaPipe Pose indices)
        left_shoulder, right_shoulder = lm[11], lm[12]
        left_hip, right_hip = lm[23], lm[24]

        shoulder_width = _distance(left_shoulder, right_shoulder)
        hip_width = _distance(left_hip, right_hip)

        # Waist is approximated as the midpoint between shoulders and hips
        # (MediaPipe has no direct waist landmark)
        waist_width = (shoulder_width + hip_width) / 2 * 0.85

        shoulder_hip_ratio = shoulder_width / hip_width if hip_width else 1
        waist_hip_ratio = waist_width / hip_width if hip_width else 1
        waist_shoulder_ratio = waist_width / shoulder_width if shoulder_width else 1

        # Simple, explainable rule-based classification
        if 0.9 <= shoulder_hip_ratio <= 1.1 and waist_hip_ratio < 0.8:
            body_shape = "hourglass"
        elif shoulder_hip_ratio < 0.9:
            body_shape = "pear"
        elif shoulder_hip_ratio > 1.1:
            body_shape = "invertedTriangle"
        elif waist_hip_ratio > 0.85 and waist_shoulder_ratio > 0.85:
            body_shape = "apple"
        else:
            body_shape = "rectangle"

        return {"bodyShape": body_shape}
