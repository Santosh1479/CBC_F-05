from flask import Flask, Response, jsonify
from flask_cors import CORS  # Import CORS
import cv2
import torch
import torchvision.transforms as transforms
from PIL import Image
from torchvision import models

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Labels
gaze_emotion_labels = ['Attentive', 'Looking Away', 'Bored', 'Confused']

# Define the MobileNetV2-based model architecture
def create_mobilenet_model(num_classes):
    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = torch.nn.Linear(model.last_channel, num_classes)
    return model

# Load the gaze emotion model
gaze_emotion_model = create_mobilenet_model(3)  # Temporarily set to 3 classes to match the checkpoint
gaze_emotion_model.load_state_dict(torch.load(r'C:\\Users\\Santosh\\OneDrive\\Desktop\\CBC_F-05\\AI\\head_pose_best_model.pt', map_location=torch.device('cpu')))

# Reinitialize the classifier for the desired number of classes (4)
gaze_emotion_model.classifier[1] = torch.nn.Linear(gaze_emotion_model.last_channel, len(gaze_emotion_labels))
gaze_emotion_model.eval()

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

# Webcam initialization
cap = cv2.VideoCapture(0)

def predict_emotion(frame):
    img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    img_tensor = transform(img_pil)
    with torch.no_grad():
        outputs = gaze_emotion_model(img_tensor.unsqueeze(0))
        _, predicted = torch.max(outputs, 1)
        return gaze_emotion_labels[predicted.item()]

@app.route('/monitor', methods=['GET'])
def monitor():
    ret, frame = cap.read()
    if not ret:
        return jsonify({"error": "Failed to capture frame"}), 500

    emotion = predict_emotion(frame)
    return jsonify({"emotion": emotion})

@app.route('/shutdown', methods=['POST'])
def shutdown():
    cap.release()
    cv2.destroyAllWindows()
    return jsonify({"message": "Webcam released and server shutting down."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)