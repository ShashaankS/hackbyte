from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import os
from functools import wraps
from datetime import datetime, timedelta
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)
# CORS(app, resources={r"/api/*": {"origins": os.environ.get(" http://127.0.0.1:3000", "http://localhost:3000")}})
CORS(app)

# Load YOLO model
net = cv2.dnn.readNet("v4 tiny custom/yolov4-tiny-custom_best.weights",
                      "v4 tiny custom/yolov4-tiny-custom.cfg")
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
net.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA)

# Load class names
with open("v4 tiny custom/obj.names", "r") as f:
    classes = [line.strip() for line in f.readlines()]

# Get output layers
layer_names = net.getLayerNames()
output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers().flatten()]


def detect_objects(frame):
    height, width = frame.shape[:2]

    blob = cv2.dnn.blobFromImage(frame, 1 / 255.0, (416, 416), swapRB=True, crop=False)
    net.setInput(blob)
    outs = net.forward(output_layers)

    class_ids = []
    confidences = []
    boxes = []

    for out in outs:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > 0.5:
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)

                boxes.append([x, y, w, h])
                confidences.append(float(confidence))
                class_ids.append(class_id)

    indices = cv2.dnn.NMSBoxes(boxes, confidences, 0.3, 0.4)

    results = []
    if len(indices) > 0:
        for i in indices.flatten():
            x, y, w, h = boxes[i]
            results.append({
                "label": classes[class_ids[i]],
                "confidence": round(confidences[i], 2),
                "box": {"x": x, "y": y, "width": w, "height": h}
            })

    return results


# @app.route("/detect", methods=["POST"])
# def detect():
#     if "image" not in request.files:
#         return jsonify({"error": "No image file provided"}), 400

#     file = request.files["image"]
#     npimg = np.frombuffer(file.read(), np.uint8)
#     frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

#     results = detect_objects(frame)
#     return jsonify({"detections": results})

@app.route('/detect', methods=['POST'])
def detect():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        # Get and clean base64 string
        base64_image = data['image']
        if base64_image.startswith('data:image'):
            base64_image = base64_image.split(',')[1]

        # Decode base64 to bytes
        image_bytes = base64.b64decode(base64_image)

        # Convert to NumPy array via PIL
        pil_image = Image.open(BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(pil_image)

        # Optional: Convert RGB to BGR for OpenCV (if needed)
        image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        # Example detection placeholder
        height, width = image_bgr.shape[:2]
        
        results = detect_objects(image_bgr)
        return jsonify({"detections": results})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
