import os
import base64
import numpy as np
from flask import Flask, render_template, request, jsonify
from tensorflow.keras.models import load_model
from PIL import Image, ImageOps
import io

app = Flask(__name__)

# Load the model
MODEL_PATH = 'mnist_cnn_model.keras'
model = None

def load_my_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = load_model(MODEL_PATH)
            print(f"Model loaded from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Model file not found at {MODEL_PATH}")

load_my_model()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    data = request.json
    if 'image' not in data:
        return jsonify({'error': 'No image data provided'}), 400

    # Decode the base64 image
    image_data = data['image'].split(',')[1]
    image_bytes = base64.b64decode(image_data)
    
    try:
        # Open image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Preprocess the image
        # 1. Resize to 28x28
        img = img.resize((28, 28))
        
        # 2. Convert to grayscale (L)
        img = img.convert('L')
        
        # 3. Invert colors if necessary? 
        # Usually canvas is white background, black text -> MNIST is black background, white text.
        # But wait, if user draws black on white, we need to invert.
        # Let's assume user draws black on white canvas.
        # MNIST is white digits on black background.
        # So we need to invert.
        # However, let's handle this in frontend or here. 
        # Let's assume frontend sends black-on-white.
        img = ImageOps.invert(img)
        
        # 4. Normalize to 0-1
        img_array = np.array(img) / 255.0
        
        # 5. Reshape for model (1, 28, 28, 1)
        img_array = img_array.reshape(1, 28, 28, 1)
        
        # Predict
        prediction = model.predict(img_array)
        predicted_digit = int(np.argmax(prediction))
        confidence = float(np.max(prediction))
        
        return jsonify({'digit': predicted_digit, 'confidence': confidence})
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
