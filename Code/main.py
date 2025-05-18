from flask import Flask, jsonify
import cv2
import dlib
from imutils import face_utils
from scipy.spatial import distance as dist
from gaze_tracking import GazeTracking
import time
import os

app = Flask(__name__)

def eye_aspect_ratio(eye):
    """Calculate the Eye Aspect Ratio (EAR)."""
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    ear = (A + B) / (2.0 * C)
    return ear

@app.route('/start_webcam', methods=['GET'])
def start_webcam():
    """
    Start the webcam, detect emotions in real-time, and save one image with the detected emotion.
    """
    # Thresholds and constants
    EYE_AR_THRESH = 0.3
    EYE_AR_CONSEC_FRAMES = 48
    COUNTER = 0

    # Initialize dlib's face detector and facial landmarks predictor
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor(r'c:\Users\Santosh\OneDrive\Desktop\CBC_F-05\Code\shape_predictor_68_face_landmarks.dat')
    (lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
    (rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

    # Initialize gaze tracking
    gaze = GazeTracking()

    # Start webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        return jsonify({"status": "error", "message": "Unable to access webcam."})

    print("Press 's' to save the current frame and 'q' to quit the webcam.")
    saved_image_path = "emotion_frame.jpg"  # Path to save the single image

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Resize and convert to grayscale
        frame = cv2.resize(frame, (640, 480))
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Detect faces
        rects = detector(gray, 0)

        for rect in rects:
            # Get facial landmarks
            shape = predictor(gray, rect)
            shape = face_utils.shape_to_np(shape)

            # Calculate EAR for both eyes
            leftEye = shape[lStart:lEnd]
            rightEye = shape[rStart:rEnd]
            leftEAR = eye_aspect_ratio(leftEye)
            rightEAR = eye_aspect_ratio(rightEye)
            ear = (leftEAR + rightEAR) / 2.0

            # Check for drowsiness
            emotion = None
            if ear < EYE_AR_THRESH:
                COUNTER += 1
                if COUNTER >= EYE_AR_CONSEC_FRAMES:
                    emotion = "Bored"
            else:
                COUNTER = 0

            # Gaze detection
            gaze.refresh(frame)
            if gaze.is_right():
                emotion = "Looking Away"
            elif gaze.is_left():
                emotion = "Looking Away"
            elif gaze.is_center():
                emotion = "Attentive"
            else:
                emotion = "Confused"

            # Write the detected emotion on the frame
            if emotion:
                cv2.putText(frame, f"Emotion: {emotion}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        # Display the frame
        cv2.imshow("Webcam", frame)

        # Save the frame with the detected emotion when 's' is pressed
        key = cv2.waitKey(1) & 0xFF
        if key == ord('s'):
            # Save the frame and replace the previous one
            cv2.imwrite(saved_image_path, frame)
            print(f"Emotion frame saved as: {saved_image_path}")

        # Break the loop if 'q' is pressed
        if key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return jsonify({"status": "success", "message": "Webcam stopped."})

@app.route('/')
def home():
    """
    Home route to verify the server is running.
    """
    return jsonify({"message": "Flask server is running!"})

if __name__ == '__main__':
    app.run(debug=True)