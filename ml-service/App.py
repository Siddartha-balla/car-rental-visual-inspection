from flask import Flask, request, jsonify
from inference_sdk import InferenceHTTPClient
import cv2
import tempfile

app = Flask(__name__)

# ==================================================
# ROBOFLOW CLIENT
# ==================================================
CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="1OLUxevLAhoute2s2B8r"
)

MODEL_ID = "car-damage-detection-t0g92/3"

# ==================================================
# THRESHOLDS
# ==================================================
MODEL_CONF_THRESHOLD = 0.7
CONF_DIFF_THRESHOLD = 0.15
IOU_THRESHOLD = 0.5


# ==================================================
# IoU FUNCTION
# ==================================================
def box_iou(box1, box2):

    x1, y1, w1, h1 = box1
    x2, y2, w2, h2 = box2

    ax1 = x1 - w1 / 2
    ay1 = y1 - h1 / 2
    ax2 = x1 + w1 / 2
    ay2 = y1 + h1 / 2

    bx1 = x2 - w2 / 2
    by1 = y2 - h2 / 2
    bx2 = x2 + w2 / 2
    by2 = y2 + h2 / 2

    inter_x1 = max(ax1, bx1)
    inter_y1 = max(ay1, by1)
    inter_x2 = min(ax2, bx2)
    inter_y2 = min(ay2, by2)

    inter_area = max(0, inter_x2 - inter_x1) * max(0, inter_y2 - inter_y1)

    area_a = (ax2 - ax1) * (ay2 - ay1)
    area_b = (bx2 - bx1) * (by2 - by1)

    union = area_a + area_b - inter_area

    if union == 0:
        return 0

    return inter_area / union


# ==================================================
# HOME
# ==================================================
@app.route("/")
def home():
    return "Car Damage Detection API Running"


# ==================================================
# DAMAGE PREDICTION
# ==================================================
@app.route("/predict", methods=["POST"])
def predict():

    before_file = request.files["before"]
    after_file = request.files["after"]

    before_path = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg").name
    after_path = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg").name

    before_file.save(before_path)
    after_file.save(after_path)

    # ----------------------------------------------
    # RUN INFERENCE
    # ----------------------------------------------
    before = CLIENT.infer(before_path, model_id=MODEL_ID)
    after = CLIENT.infer(after_path, model_id=MODEL_ID)

    print("Before predictions:", before["predictions"])
    print("After predictions:", after["predictions"])

    # ----------------------------------------------
    # FILTER LOW CONFIDENCE
    # ----------------------------------------------
    before_preds = [
        p for p in before["predictions"]
        if p["confidence"] >= MODEL_CONF_THRESHOLD
    ]

    after_preds = [
        p for p in after["predictions"]
        if p["confidence"] >= MODEL_CONF_THRESHOLD
    ]

    # ----------------------------------------------
    # DETECT NEW DAMAGE
    # ----------------------------------------------
    new_damages = []

    for after_box in after_preds:

        is_new = True

        for before_box in before_preds:

            iou = box_iou(
                (after_box["x"], after_box["y"], after_box["width"], after_box["height"]),
                (before_box["x"], before_box["y"], before_box["width"], before_box["height"])
            )

            if iou > IOU_THRESHOLD:

                if after_box["class"] == before_box["class"]:

                    conf_diff = abs(
                        after_box["confidence"] - before_box["confidence"]
                    )

                    if conf_diff < CONF_DIFF_THRESHOLD:
                        is_new = False
                        break

        if is_new:
            new_damages.append(after_box)

    damage_flag = len(new_damages) > 0

    # ----------------------------------------------
    # DRAW DAMAGE ON IMAGE
    # ----------------------------------------------
    img = cv2.imread(after_path)

    for p in new_damages:

        x = int(p["x"])
        y = int(p["y"])
        w = int(p["width"])
        h = int(p["height"])

        x1 = int(x - w / 2)
        y1 = int(y - h / 2)
        x2 = int(x + w / 2)
        y2 = int(y + h / 2)

        label = p["class"]

        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 3)

        cv2.putText(
            img,
            label,
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 0, 255),
            2
        )

    # ----------------------------------------------
    # RESPONSE
    # ----------------------------------------------
    return jsonify({
        "damage": damage_flag,
        "new_damage_classes": [d["class"] for d in new_damages]
    })


# ==================================================
# RUN SERVER
# ==================================================
if __name__ == "__main__":
    app.run(port=5000, debug=False)
