from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from torchvision import transforms
from torchvision.models import resnet18
from PIL import Image
import io
import torch.nn as nn

app = Flask(__name__)
CORS(app)

# Load a plain resnet18 and adjust the final layer
model = resnet18()
model.fc = nn.Linear(model.fc.in_features, 7)
model.load_state_dict(torch.load(
    r'C:\Users\Santosh\OneDrive\Desktop\CBC_F-05\AI\best_fer_model.pt',
    map_location='cpu'
, weights_only=True))
model.eval()

# Preprocessing for ResNet18 (expects 3-channel 224x224 images)
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),  # Convert to 3 channels
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

EMOTION_CLASSES = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

@app.route('/predict-emotion', methods=['POST'])
def predict_emotion():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    img_bytes = file.read()
    img = Image.open(io.BytesIO(img_bytes)).convert('L')

    input_tensor = preprocess(img).unsqueeze(0)

    with torch.no_grad():
        outputs = model(input_tensor)
        _, predicted = torch.max(outputs, 1)
        emotion = EMOTION_CLASSES[predicted.item()]

    return jsonify({'emotion': emotion})

if __name__ == '__main__':
    app.run(debug=True)