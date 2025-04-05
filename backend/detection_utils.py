import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image

model_dir = "v4 tiny custom"
model_weights = "yolov4-tiny-custom_best.weights"
model_cfg = "yolov4-tiny-custom.cfg"

def load_model():
    net = cv2.dnn.readNet("v4 tiny custom/yolov4-tiny-custom_best.weights",
                          "v4 tiny custom/yolov4-tiny-custom.cfg")
    net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
    net.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA)

    with open("v4 tiny custom/obj.names", "r") as f:
        classes = [line.strip() for line in f.readlines()]

    layer_names = net.getLayerNames()
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers().flatten()]

    return net, classes, output_layers


def detect_objects(frame, net, output_layers, classes):
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


def detect_from_base64(base64_image: str, net, output_layers, classes):
    if base64_image.startswith('data:image'):
        base64_image = base64_image.split(',')[1]

    image_bytes = base64.b64decode(base64_image)
    pil_image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(pil_image)
    image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

    return detect_objects(image_bgr, net, output_layers, classes)