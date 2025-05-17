from flask import Flask, request, jsonify
import combined  # Import the combined functionality

app = Flask(__name__)

@app.route('/process_video', methods=['POST'])
def process_video():
    """
    Endpoint to process a video file and detect drowsiness and gaze.
    """
    if 'video' not in request.files:
        return jsonify({"status": "error", "message": "No video file provided."})

    video = request.files['video']
    video_path = f"./uploaded_videos/{video.filename}"
    video.save(video_path)

    # Process the video
    result = combined.process_video(video_path)
    return jsonify(result)

@app.route('/')
def home():
    """
    Home route to verify the server is running.
    """
    return jsonify({"message": "Flask server is running!"})

if __name__ == '__main__':
    app.run(debug=True)