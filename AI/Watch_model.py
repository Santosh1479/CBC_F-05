import torch
import torch.nn as nn
from torchvision import models, transforms
import cv2
import numpy as np
from PIL import Image



EMOTION_LABELS = ['Attentive', 'Bored', 'Confused']


GAZE_LABELS = ['Attentive', 'Looking Away']

DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


efficientnet = models.efficientnet_b0(weights="IMAGENET1K_V1")
efficientnet.classifier[1] = nn.Linear(efficientnet.classifier[1].in_features, 3)  # 3 classes
efficientnet = efficientnet.to(DEVICE)

mobilenet = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
mobilenet.classifier = nn.Sequential(
    nn.Dropout(0.4),
    nn.Linear(mobilenet.last_channel, 3)
)
mobilenet = mobilenet.to(DEVICE)

efficientnet_checkpoint_path = r'C:\\Users\\user\\OneDrive\\Desktop\\CBC_F-05_origin\\vin\\AI\\best_attention_model_efficientnet.pth'
mobilenet_checkpoint_path = r'C:\\Users\\user\\OneDrive\\Desktop\\CBC_F-05_origin\\vin\\AI\\best_attention_modelmobilenet' \
'.pth'

if torch.cuda.is_available():
    efficientnet_checkpoint = torch.load(efficientnet_checkpoint_path)
    mobilenet_checkpoint = torch.load(mobilenet_checkpoint_path)
else:
    efficientnet_checkpoint = torch.load(efficientnet_checkpoint_path, map_location=DEVICE)
    mobilenet_checkpoint = torch.load(mobilenet_checkpoint_path, map_location=DEVICE)

efficientnet.load_state_dict(efficientnet_checkpoint['model_state_dict'])
mobilenet.load_state_dict(mobilenet_checkpoint['model_state_dict'])

efficientnet.eval()
mobilenet.eval()


gaze_model = models.mobilenet_v2(pretrained=True)
gaze_model.classifier[1] = nn.Linear(gaze_model.last_channel, 3)  
gaze_model = gaze_model.to(DEVICE)

gaze_model_checkpoint_path = r'C:\\Users\\user\\OneDrive\\Desktop\\CBC_F-05_origin\\AI\\head_pose_best_model.pt'
gaze_model.load_state_dict(torch.load(gaze_model_checkpoint_path, map_location=DEVICE))
gaze_model.eval()



emotion_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])

gaze_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])



def classify_attention(pitch, yaw, roll):
    """
    Classifies attention based on head pose angles.
    Returns either 'Attentive' or 'Looking Away'.
    """
    if abs(pitch) < 20 and abs(yaw) < 29 and abs(roll) < 25:
        return GAZE_LABELS[0]
    else:
        return GAZE_LABELS[1]



cap = cv2.VideoCapture(0)
print(" Starting webcam... Press 'q' to quit.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

  
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    img_pil_emotion = Image.fromarray(gray_frame)
    img_tensor_emotion = emotion_transform(img_pil_emotion).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        efficientnet_output = efficientnet(img_tensor_emotion)
        mobilenet_output = mobilenet(img_tensor_emotion)

        avg_output = (0.005 * efficientnet_output + 0.995 * mobilenet_output)
        emotion_predicted_idx = torch.argmax(avg_output, dim=1).item()
        emotion_predicted_label = EMOTION_LABELS[emotion_predicted_idx]


    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img_pil_gaze = Image.fromarray(img_rgb)
    img_tensor_gaze = gaze_transform(img_pil_gaze).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        gaze_output = gaze_model(img_tensor_gaze)
        pitch, yaw, roll = gaze_output[0].tolist()

    gaze_attention = classify_attention(pitch, yaw, roll)


    if gaze_attention == 'Looking Away':
        final_output = 'Looking Away'
    elif emotion_predicted_label == 'Attentive':
        final_output = 'Attentive'
    else:
        final_output = emotion_predicted_label

    display_text = f'Final Output: {final_output}'
    cv2.putText(frame, display_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                1.0, (0, 255, 0), 2, cv2.LINE_AA)

    cv2.imshow("Watch Model Output", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()