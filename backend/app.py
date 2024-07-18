import os, sys, cv2, io
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS


os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import firebase_admin
from firebase_admin import credentials, storage
from PIL import Image

os.environ['PYTHONIOENCODING'] = 'UTF-8'
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app)

@app.route('/')
def welcome():
    return 'Expressio - Facial Recognzier App'

# Load the model using the constructed absolute path
model = load_model('backend/expressio.keras')

# Initialize Firebase Admin SDK with service account key
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'expressio-fer.appspot.com'
})
bucket = storage.bucket()

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier('backend/haarcascade_frontalface_default.xml')

@app.route('/upload', methods=["POST"])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No file found in the request"}), 400
    
    file = request.files['image']
    blob = bucket.blob(file.filename)
    blob.upload_from_file(file)
    image_url = blob.public_url
    return jsonify({"image_url": image_url})

@app.route("/predict", methods=["GET"])
def predict_expression():
    blob = bucket.blob("image.jpeg")
    image_data = blob.download_as_bytes()
    
    img = Image.open(io.BytesIO(image_data))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Convert to OpenCV format
    open_cv_image = np.array(img)
    open_cv_image = open_cv_image[:, :, ::-1].copy()  # RGB to BGR
    
    # Detect faces in the image
    gray = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=2, minSize=(42, 42))
    
    if len(faces) == 0:
        return jsonify({"error": "No face detected"}), 400

    # Extract the first face found (assumes one face per image)
    x, y, w, h = faces[0]
    face = gray[y:y+h, x:x+w]  # Use the grayscale image

    # Resize the face image to 48x48
    target_size = (48, 48)
    if face.shape[:2] != target_size:
        face = cv2.resize(face, target_size)
    
    # Normalize and expand dimensions to match model input shape
    face = face.astype('float32') / 255.0
    face = np.expand_dims(face, axis=-1)  # Add channel dimension
    face = np.expand_dims(face, axis=0)   # Add batch dimension
    
    pred = model.predict(face)
    prediction = np.argmax(pred, axis=1)[0]
    
    labels = {0: "ANGRY", 1: "HAPPY", 2: "SAD", 3: "SURPRISE"}
    predicted_label = labels[prediction]
    
    return jsonify({"prediction": predicted_label, "predictionArr": pred.tolist()})

cv2.destroyAllWindows()

if __name__ == "__main__":
    app.run(debug=True)
