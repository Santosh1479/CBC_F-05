# import cv2
# import torch
# import torchvision.transforms as transforms
# from PIL import Image
# from torchvision import models
# import time
# import os
# from datetime import datetime
# import glob

# # Labels - adjust as per training
# gaze_emotion_labels = ['Attentive', 'Looking Away', 'Bored', 'Confused']
# head_pose_labels = ['Pitch', 'Yaw', 'Roll']  # These match the training outputs

# # Define the MobileNetV2-based model architecture
# def create_mobilenet_model(num_classes, checkpoint_classes=None):
#     model = models.mobilenet_v2(weights=None)  # Use weights=None to avoid warnings
#     if checkpoint_classes:
#         # Temporarily set the classifier to match the checkpoint
#         model.classifier[1] = torch.nn.Linear(model.last_channel, checkpoint_classes)
#     else:
#         model.classifier[1] = torch.nn.Linear(model.last_channel, num_classes)
#     return model

# # Create model instance with temporary classifier for checkpoint
# gaze_emotion_model = create_mobilenet_model(len(gaze_emotion_labels), checkpoint_classes=3)

# # Load state dictionary
# gaze_emotion_model.load_state_dict(torch.load(r'C:\\Users\\Santosh\\OneDrive\\Desktop\\CBC_F-05\\AI\\head_pose_best_model.pt', map_location=torch.device('cpu')))

# # Reinitialize the classifier for the desired number of classes
# gaze_emotion_model.classifier[1] = torch.nn.Linear(gaze_emotion_model.last_channel, len(gaze_emotion_labels))

# # Set model to evaluation mode
# gaze_emotion_model.eval()

# # Create model instance for head pose with correct number of outputs
# head_pose_model = create_mobilenet_model(len(head_pose_labels))  # Now uses 3 outputs

# # Load state dictionary for head pose model
# head_pose_model.load_state_dict(torch.load(r'C:\\Users\\Santosh\\OneDrive\\Desktop\\CBC_F-05\\AI\\head_pose_best_model.pt', map_location=torch.device('cpu')))

# # Set head pose model to evaluation mode
# head_pose_model.eval()

# # Preprocessing
# transform = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])  # Normalize as per training
# ])

# def predict(model, image_tensor, labels):
#     with torch.no_grad():
#         outputs = model(image_tensor.unsqueeze(0))
#         # For head pose, return the actual angles
#         if len(labels) == 3:  # Head pose model
#             return f"Pitch: {outputs[0][0]:.1f}°, Yaw: {outputs[0][1]:.1f}°, Roll: {outputs[0][2]:.1f}°"
#         else:  # Gaze emotion model
#             _, predicted = torch.max(outputs, 1)
#             return labels[predicted.item()]

# def save_snapshot(frame, gaze_result, pose_result):
#     """Save the current frame with results as an image"""
#     snapshot_dir = os.path.join(os.path.dirname(__file__), 'snapshots')
#     os.makedirs(snapshot_dir, exist_ok=True)
    
#     # Delete previous snapshots
#     previous_snapshots = glob.glob(os.path.join(snapshot_dir, '*.jpg'))
#     for snapshot in previous_snapshots:
#         os.remove(snapshot)
    
#     # Save new snapshot with timestamp
#     timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
#     filename = os.path.join(snapshot_dir, f'snapshot_{timestamp}.jpg')
    
#     # Add text to frame
#     frame_copy = frame.copy()
#     cv2.putText(frame_copy, f'Emotion/Gaze: {gaze_result}', (10, 30), 
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
#     cv2.putText(frame_copy, f'Head Pose: {pose_result}', (10, 60), 
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    
#     # Save the frame
#     cv2.imwrite(filename, frame_copy)
#     print(f"[INFO] Snapshot saved: {filename}")

# # Check if OpenCV GUI is supported
# def is_cv2_gui_supported():
#     try:
#         cv2.namedWindow("Test")
#         cv2.destroyWindow("Test")
#         return True
#     except cv2.error:
#         return False

# # Webcam Init
# cap = cv2.VideoCapture(0)
# print("[INFO] Starting webcam... Press 'q' to quit.")

# has_gui = is_cv2_gui_supported()
# if not has_gui:
#     print("[WARNING] OpenCV GUI not supported. Will print results to console.")

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("[ERROR] Failed to grab frame")
#         break

#     # Convert and preprocess
#     img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
#     img_tensor = transform(img_pil)

#     # Predictions
#     gaze_emotion_result = predict(gaze_emotion_model, img_tensor, gaze_emotion_labels)
#     head_pose_result = predict(head_pose_model, img_tensor, head_pose_labels)

#     # Save snapshot
#     save_snapshot(frame, gaze_emotion_result, head_pose_result)

#     if has_gui:
#         # Display results on frame
#         cv2.putText(frame, f'Emotion/Gaze: {gaze_emotion_result}', (10, 30), 
#                     cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
#         cv2.putText(frame, f'Head Pose: {head_pose_result}', (10, 60), 
#                     cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
#         cv2.imshow('AI Classroom Assistant', frame)
#     else:
#         # Print results to console
#         print("\033[H\033[J")  # Clear console
#         print("-" * 50)
#         print(f"Emotion/Gaze: {gaze_emotion_result}")
#         print(f"Head Pose: {head_pose_result}")
#         print("-" * 50)

#     # Handle quit condition
#     if has_gui:
#         if cv2.waitKey(2000) & 0xFF == ord('q'):
#             break
#     else:
#         time.sleep(2)  # Wait 2 seconds between updates
#         if input("Press 'q' to quit or any other key to continue: ").lower() == 'q':
#             break

# cap.release()
# if has_gui:
#     cv2.destroyAllWindows()


import cv2
import torch
import torchvision.transforms as transforms
from PIL import Image
from torchvision import models
from flask import Flask, jsonify
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Labels - adjust as per training
gaze_emotion_labels = ['Attentive', 'Looking Away', 'Bored', 'Confused']
head_pose_labels = ['Pitch', 'Yaw', 'Roll']

# Define the MobileNetV2-based model architecture
def create_mobilenet_model(num_classes, checkpoint_classes=None):
    model = models.mobilenet_v2(weights=None)
    if checkpoint_classes:
        model.classifier[1] = torch.nn.Linear(model.last_channel, checkpoint_classes)
    else:
        model.classifier[1] = torch.nn.Linear(model.last_channel, num_classes)
    return model

# Load gaze emotion model
gaze_emotion_model = create_mobilenet_model(len(gaze_emotion_labels), checkpoint_classes=3)
gaze_emotion_model.load_state_dict(torch.load(r'C:\\Users\\Santosh\\OneDrive\\Desktop\\CBC_F-05\\AI\\head_pose_best_model.pt', map_location=torch.device('cpu')))
gaze_emotion_model.classifier[1] = torch.nn.Linear(gaze_emotion_model.last_channel, len(gaze_emotion_labels))
gaze_emotion_model.eval()

# Load head pose model
head_pose_model = create_mobilenet_model(len(head_pose_labels))
head_pose_model.load_state_dict(torch.load(r'C:\\Users\\Santosh\\OneDrive\\Desktop\\CBC_F-05\\AI\\head_pose_best_model.pt', map_location=torch.device('cpu')))
head_pose_model.eval()

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

# Webcam initialization
cap = cv2.VideoCapture(0)

def predict_emotion(frame):
    """Predict the emotion from the given frame."""
    img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    img_tensor = transform(img_pil)
    with torch.no_grad():
        outputs = gaze_emotion_model(img_tensor.unsqueeze(0))
        _, predicted = torch.max(outputs, 1)
        return gaze_emotion_labels[predicted.item()]

def predict_head_pose(frame):
    """Predict the head pose from the given frame."""
    img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    img_tensor = transform(img_pil)
    with torch.no_grad():
        outputs = head_pose_model(img_tensor.unsqueeze(0))
        pitch, yaw, roll = outputs[0].tolist()
        return {"Pitch": round(pitch, 1), "Yaw": round(yaw, 1), "Roll": round(roll, 1)}

@app.route('/monitor', methods=['GET'])
def monitor():
    """API endpoint to monitor emotions and head pose."""
    # Capture a fresh frame from the webcam
    ret, frame = cap.read()
    if not ret:
        return jsonify({"error": "Failed to capture frame"}), 500

    try:
        # Predict emotion and head pose for the current frame
        emotion = predict_emotion(frame)
        head_pose = predict_head_pose(frame)

        # Log predictions for debugging
        print(f"[DEBUG] Emotion: {emotion}, Head Pose: {head_pose}")

        # Return predictions as JSON
        return jsonify({"emotion": emotion, "head_pose": head_pose}), 200
    except Exception as e:
        # Handle any prediction errors
        print(f"[ERROR] Prediction failed: {str(e)}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500 

@app.route('/shutdown', methods=['POST'])
def shutdown():
    """API endpoint to release the webcam and shut down the server."""
    cap.release()
    cv2.destroyAllWindows()
    return jsonify({"message": "Webcam released and server shutting down."})

if __name__ == '__main__':
    print("[INFO] Starting Flask server...")
    app.run(host='0.0.0.0', port=5000)