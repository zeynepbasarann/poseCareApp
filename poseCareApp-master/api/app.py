import json
import os
from flask import Flask, request, jsonify
from ultralytics import YOLO
import base64
import io
from PIL import Image
import numpy as np
from datetime import datetime

LOG_FILE = "logs.json"

# JSON dosyasından logları oku/yaz
def load_logs():
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_logs(log_list):
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(log_list, f, ensure_ascii=False, indent=4)

# Global log listesi
logs = load_logs()

# Flask ve model başlat
app = Flask(__name__)
model = YOLO("yolo11n-pose.pt")




@app.before_request
def log_request_info():
    print(f"📩 Flask: API'ye istek geldi! Route: {request.path}")

# Eşik değerleri
DOWN_THRESHOLD = 150.0
UP_THRESHOLD = 165.0

class Session:
    def __init__(self):
        self.correct = 0
        self.incorrect = 0
        self.temp_squat_angles = []
        self.last_status = ""
        self.wrong_angles = []  # yeni eklendi




squat_session = Session()
bridge_session = Session()

print("❗ Tip kontrol:", type(squat_session))



def calculate_angle(p1, p2, p3):
    a, b, c = map(np.array, (p1, p2, p3))
    ba, bc = a - b, c - b
    nb, nc = np.linalg.norm(ba), np.linalg.norm(bc)
    if nb == 0 or nc == 0:
        return 180.0
    cos = np.dot(ba, bc) / (nb * nc)
    cos = np.clip(cos, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos)))

import time  # en üste ekle

def analyze_squat(kpts, session: Session):
    right_angle = calculate_angle(kpts[11], kpts[13], kpts[15])
    left_angle = calculate_angle(kpts[12], kpts[14], kpts[16])
    angle = min(right_angle, left_angle)

    status = None

    if angle < 140:
        session.temp_squat_angles.append(angle)

    elif angle > 165:
        if session.temp_squat_angles:
            if any(95 <= a <= 120 for a in session.temp_squat_angles):
                session.correct += 1
                status = "✔ Doğru squat"
            else:
                session.incorrect += 1
                session.wrong_angles.extend(session.temp_squat_angles)
                status = "❌ Yanlış squat"
            session.temp_squat_angles.clear()  # Temizleme bu blokta, hem doğru hem yanlışta

    return angle, status
 

def analyze_bridge(kpts, session: Session):
    angle = calculate_angle(kpts[6], kpts[12], kpts[14])
    if angle > 150:
        session.correct += 1
        session.last_status = "✔ Doğru bridge"
    else:
        session.incorrect += 1
        session.wrong_angles.append(angle)  # hatalı açı kaydı eklendi
        session.last_status = "❌ Yanlış bridge"
    return angle, session.last_status


@app.route('/pose', methods=['POST'])
def pose():
    data = request.get_json(force=True)
    exercise = data.get("exercise", "squat")  # default squat

    if not data or 'image' not in data:
        return jsonify({"angle": None, "status": "Görsel alınamadı", "correct": 0, "incorrect": 0})

    try:
        img = Image.open(io.BytesIO(base64.b64decode(data['image']))).convert("RGB")
        frame = np.array(img)
        res = model.predict(source=frame, save=False, conf=0.3)[0]
        kp = res.keypoints

        if kp is None or not hasattr(kp, 'xy') or len(kp.xy) == 0:
            return jsonify({"angle": None, "status": "Kişi tespit edilemedi", "correct": 0, "incorrect": 0})

        persons = [x for x in kp.xy if x.shape[0] >= 16]
        if not persons:
            return jsonify({"angle": None, "status": "Kişi bulunamadı", "correct": 0, "incorrect": 0})

        kpts = max(persons, key=lambda t: t[:,1].max() - t[:,1].min()).cpu().numpy()

        if exercise == "bridge":
            angle, status = analyze_bridge(kpts, bridge_session)
            return jsonify({
        "angle": angle,
        "status": status or "",
        "correct": bridge_session.correct,
        "incorrect": bridge_session.incorrect,
        "wrong_angles": bridge_session.wrong_angles[-5:]  # bridge için son 5 yanlış açı
    })
        else:
            angle, status = analyze_squat(kpts, squat_session)
            return jsonify({
        "angle": angle,
        "status": status or "",
        "correct": squat_session.correct,
        "incorrect": squat_session.incorrect,
        "wrong_angles": squat_session.wrong_angles[-5:]  # squat için son 5 yanlış açı
    })



    except Exception as e:
        return jsonify({"angle": None, "status": f"Hata: {str(e)}", "correct": 0, "incorrect": 0})
"""
@app.route('/reset_session', methods=['POST'])
def reset_session():
    global squat_session, bridge_session
    squat_session = Session()
    bridge_session = Session()
    return jsonify({"message": "Sessionlar sıfırlandı."})
"""





@app.route("/get_logs")
def get_logs():
    return jsonify(logs)

@app.route('/reset_session', methods=['POST'])
def reset_session():

    global squat_session, bridge_session, logs
    print("✅ reset_session çağrıldı")


    now = datetime.now().isoformat()

    # Squat hareketi varsa logla
    if squat_session.correct + squat_session.incorrect > 0:
        accuracy = round(
            squat_session.correct / max(1, (squat_session.correct + squat_session.incorrect)) * 100, 2
        )
        logs.append({
            "date": now,
            "move": "squat",
            "correct": squat_session.correct,
            "incorrect": squat_session.incorrect,
            "accuracy": accuracy
        })

    # Bridge hareketi varsa logla
    if bridge_session.correct + bridge_session.incorrect > 0:
        accuracy = round(
            bridge_session.correct / max(1, (bridge_session.correct + bridge_session.incorrect)) * 100, 2
        )
        logs.append({
            "date": now,
            "move": "bridge",
            "correct": bridge_session.correct,
            "incorrect": bridge_session.incorrect,
            "accuracy": accuracy
        })
        print(f"Squat → ✅ {squat_session.correct}, ❌ {squat_session.incorrect}")
        print(f"Bridge → ✅ {bridge_session.correct}, ❌ {bridge_session.incorrect}")

    save_logs(logs)  # <-- eklenen satır

    squat_session = Session()
    bridge_session = Session()

    return jsonify({"message": "Sessionlar sıfırlandı."})



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)