from flask import Flask, request, jsonify
from flask_cors import CORS
from detection_utils import load_model, detect_from_base64

app = Flask(__name__)
CORS(app)

@app.route('/detect', methods=['POST'])
def detect():
    try:
        # Load YOLOv4-tiny model and classes
        net, classes, output_layers = load_model()
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        base64_image = data['image']
        results = detect_from_base64(base64_image, net, output_layers, classes)

        return jsonify({"detections": results})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
