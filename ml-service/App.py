import torch
from flask import Flask, request, jsonify
from PIL import Image
from torchvision import transforms
import torchvision.models as models
import torch.nn as nn
import torch.nn.functional as F

# ==================================================
# 🔹 FLASK APP
# ==================================================
app = Flask(__name__)
device = torch.device("cpu")

# ==================================================
# 🔹 CAR VALIDATION MODEL (ImageNet – CAR CHECK ONLY)
# ==================================================
from torchvision.models import resnet18, ResNet18_Weights

val_model = resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)
val_model.eval()

IMAGENET_LABELS = ResNet18_Weights.IMAGENET1K_V1.meta["categories"]

CAR_KEYWORDS = [
    "car", "sports car", "pickup", "jeep",
    "taxi", "minivan", "limousine", "convertible"
]

# ==================================================
# 🔹 DAMAGE DETECTION MODEL (SIAMESE + CBAM)
# ==================================================
class CBAM(nn.Module):
    def __init__(self, channels, reduction=16):
        super().__init__()

        self.avg = nn.AdaptiveAvgPool2d(1)
        self.max = nn.AdaptiveMaxPool2d(1)

        self.fc = nn.Sequential(
            nn.Conv2d(channels, channels // reduction, 1, bias=False),
            nn.ReLU(),
            nn.Conv2d(channels // reduction, channels, 1, bias=False)
        )

        self.sigmoid = nn.Sigmoid()

        self.spatial = nn.Sequential(
            nn.Conv2d(2, 1, kernel_size=7, padding=3, bias=False),
            nn.Sigmoid()
        )

    def forward(self, x):
        avg = self.fc(self.avg(x))
        max_ = self.fc(self.max(x))
        x = x * self.sigmoid(avg + max_)

        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out, _ = torch.max(x, dim=1, keepdim=True)
        x = x * self.spatial(torch.cat([avg_out, max_out], dim=1))

        return x


class SiameseResNetCBAM(nn.Module):
    def __init__(self):
        super().__init__()

        resnet = models.resnet18(weights=None)
        self.encoder = nn.Sequential(*list(resnet.children())[:-2])

        self.cbam = CBAM(512)
        self.gap = nn.AdaptiveAvgPool2d(1)

        self.classifier = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, 1)
        )

        self.regressor = nn.Sequential(
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Linear(128, 1)
        )

    def forward(self, img1, img2):
        f1 = self.encoder(img1)
        f2 = self.encoder(img2)

        diff = torch.abs(f1 - f2)
        diff = self.cbam(diff)

        diff = self.gap(diff)
        diff = diff.view(diff.size(0), -1)

        damage = self.classifier(diff)
        severity = self.regressor(diff)

        return damage, severity


# ==================================================
# 🔹 LOAD TRAINED DAMAGE MODEL
# ==================================================
damage_model = SiameseResNetCBAM().to(device)
damage_model.load_state_dict(
    torch.load("car_damage_siamese_cbam.pth", map_location=device)
)
damage_model.eval()

# ==================================================
# 🔹 IMAGE TRANSFORM (SHARED)
# ==================================================
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ==================================================
# 🔹 ROUTES
# ==================================================
@app.route("/")
def home():
    return "Car Inspection API running on port 5000"


# --------------------------------------------------
# ✅ IMAGE VALIDATION (HARD = CAR ONLY, SIDE = SOFT)
# --------------------------------------------------
@app.route("/validate-image", methods=["POST"])
def validate_image():
    image = Image.open(request.files["image"]).convert("RGB")
    side = request.form.get("side", "").lower()

    x = transform(image).unsqueeze(0)

    with torch.no_grad():
        logits = val_model(x)
        probs = F.softmax(logits, dim=1)
        top5 = torch.topk(probs, 5)

    labels = [IMAGENET_LABELS[i] for i in top5.indices[0]]

    # 🔴 HARD CHECK: MUST BE CAR
    if not any(
        any(k in label.lower() for k in CAR_KEYWORDS)
        for label in labels
    ):
        return jsonify({
            "valid": False,
            "message": "Please upload image of a car"
        }), 400

    # 🟡 SOFT CHECK: SIDE (NO REJECTION)
    return jsonify({
        "valid": True,
        "side": side,
        "detected_labels": labels
    })


# --------------------------------------------------
# ✅ DAMAGE PREDICTION
# --------------------------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    before = Image.open(request.files["before"]).convert("RGB")
    after = Image.open(request.files["after"]).convert("RGB")

    b = transform(before).unsqueeze(0)
    a = transform(after).unsqueeze(0)

    with torch.no_grad():
        dmg, sev = damage_model(b, a)
        damage_prob = torch.sigmoid(dmg).item()
        severity = sev.item()

    return jsonify({
        "damage": damage_prob > 0.5,
        "damage_probability": round(damage_prob, 3),
        "severity": round(severity, 1)
    })


# ==================================================
# 🔹 RUN SERVER
# ==================================================
if __name__ == "__main__":
    app.run(port=5000, debug=False)
