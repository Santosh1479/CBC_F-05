# from flask import Flask, jsonify, request
# from flask_cors import CORS
# import requests

# app = Flask(__name__)
# CORS(app)

# # Gemini API configuration
# GEMINI_API_KEY = "AAIzaSyA76vnLWU85EJ7rezv9fDLIqXrqpwGcXok"
# GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText"

# def generate_quiz(topic):
#     """Generate a quiz using Google's Gemini API"""
#     prompt = f"""You are an expert VTU engineering professor. Create a quiz on the topic: "{topic}".

# The quiz should contain:
# - 8 multiple choice questions (with 4 options each and one correct answer)
# - 2 short answer questions
# - Difficulty: mix of easy, medium, and 1 hard question

# Format:
# Q1. <question>
# 1) Option 1
# 2) Option 2
# 3) Option 3
# 4) Option 4
# Answer: <correct option number>

# Q9. <short answer question>
# Answer: <sample answer>

# Only output the quiz. Do not explain anything."""

#     headers = {
#         'Content-Type': 'application/json',
#         'Authorization': f'Bearer {GEMINI_API_KEY}'
#     }

#     data = {
#         "messages": [
#             {
#                 "author": "user",
#                 "content": prompt
#             }
#         ],
#         "temperature": 0.7,
#         "candidateCount": 1
#     }

#     try:
#         response = requests.post(
#             GEMINI_API_URL,
#             headers=headers,
#             json=data
#         )
        
#         if response.status_code == 200:
#             result = response.json()
#             quiz_text = result['candidates'][0]['content']
#             return quiz_text
#         else:
#             print(f"Error: {response.status_code}")
#             print(response.text)
#             return None

#     except Exception as e:
#         print(f"Error generating quiz: {str(e)}")
#         return None

# def generate_content(topic):
#     """Generate content using Google's Gemini API"""
#     prompt = f"""You are an expert VTU engineering professor. Write detailed content on the topic: "{topic}".
    
# The content should be around 500 words and should be informative, well-structured, and easy to understand. Avoid unnecessary jargon and keep the tone professional."""

#     headers = {
#         'Content-Type': 'application/json',
#         'Authorization': f'Bearer {GEMINI_API_KEY}'
#     }

#     data = {
#         "messages": [
#             {
#                 "author": "user",
#                 "content": prompt
#             }
#         ],
#         "temperature": 0.7,
#         "candidateCount": 1
#     }

#     try:
#         response = requests.post(
#             GEMINI_API_URL,
#             headers=headers,
#             json=data
#         )
        
#         if response.status_code == 200:
#             result = response.json()
#             content_text = result['candidates'][0]['content']
#             return content_text
#         else:
#             print(f"Error: {response.status_code}")
#             print(response.text)
#             return None

#     except Exception as e:
#         print(f"Error generating content: {str(e)}")
#         return None

# def parse_quiz(quiz_text):
#     """Parse quiz text into questions, options, and answers"""
#     questions = []
#     current_question = {}
    
#     lines = quiz_text.strip().split('\n')
#     for line in lines:
#         line = line.strip()
#         if not line:
#             continue
            
#         if line.startswith('Q'):
#             if current_question:
#                 questions.append(current_question)
#             current_question = {'options': [], 'type': 'mcq' if len(questions) < 8 else 'short'}
#             current_question['question'] = line.split('. ', 1)[1]
#         elif line.startswith(('1)', '2)', '3)', '4)')):
#             current_question['options'].append(line)
#         elif line.startswith('Answer:'):
#             current_question['correct'] = line.split('Answer: ')[1].strip()
    
#     if current_question:
#         questions.append(current_question)
    
#     return questions

# @app.route('/generate/<string:topic>', methods=['POST'])
# def generate(topic):
#     """Endpoint to generate either a quiz or content based on user choice"""
#     data = request.json
#     choice = data.get('choice', '').lower()

#     if choice == 'quiz':
#         print(f"Generating quiz for topic: {topic}")
#         quiz_text = generate_quiz(topic)
#         if quiz_text:
#             questions = parse_quiz(quiz_text)
#             return jsonify({"topic": topic, "questions": questions}), 200
#         else:
#             return jsonify({"error": "Failed to generate quiz. Please check the server logs for details."}), 500
#     elif choice == 'content':
#         print(f"Generating content for topic: {topic}")
#         content_text = generate_content(topic)
#         if content_text:
#             return jsonify({"topic": topic, "content": content_text}), 200
#         else:
#             return jsonify({"error": "Failed to generate content. Please check the server logs for details."}), 500
#     else:
#         return jsonify({"error": "Invalid choice. Please specify 'quiz' or 'content'."}), 400

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)
import os
from flask import Flask, jsonify, request, send_from_directory
import requests
import time
import json

# Flask app setup
app = Flask(__name__)

# Output folder for storing JSON files
OUTPUT_FOLDER = "output"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Gemini API configuration
GEMINI_API_KEY = "AIzaSyAhjr73Uw64RBkAiLz7BX1O-rIJ9s7Unfs"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

def generate_quiz(topic):
    """Generate a quiz using Google's Gemini API"""
    prompt = f"""You are an expert VTU engineering professor. Create a quiz on the topic: "{topic}".

The quiz should contain:
- 8 multiple choice questions (with 4 options each and one correct answer)
- 2 short answer questions
- Difficulty: mix of easy, medium, and 1 hard question

Format:
Q1. <question>
1) Option 1
2) Option 2
3) Option 3
4) Option 4
Answer: <correct option number>

Q9. <short answer question>
Answer: <sample answer>

Only output the quiz. Do not explain anything."""

    headers = {
        'Content-Type': 'application/json',
      
    }

    data = {
        "messages": [
            {
                "author": "user",
                "content": prompt
            }
        ]
    }

    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=data)
        if response.status_code == 200:
            result = response.json()
            quiz_text = result['candidates'][0]['content']
            return quiz_text
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Error generating quiz: {str(e)}")
        return None

def generate_content(topic):
    """Generate content using Google's Gemini API"""
    prompt = f"""You are an expert VTU engineering professor. Write detailed content on the topic: "{topic}".

The content should be around 500 words and should be informative, well-structured, and easy to understand. Avoid unnecessary jargon and keep the tone professional."""

    headers = {
        'Content-Type': 'application/json'
    }

    data = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            # Extract the generated text from Gemini's response
            content_text = result['candidates'][0]['content']['parts'][0]['text']
            return content_text
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Error generating content: {str(e)}")
        return None

def parse_quiz(quiz_text):
    """Parse quiz text into questions, options, and answers"""
    questions = []
    current_question = {}
    
    lines = quiz_text.strip().split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith('Q'):
            if current_question:
                questions.append(current_question)
            current_question = {'options': [], 'type': 'mcq' if len(questions) < 8 else 'short'}
            current_question['question'] = line.split('. ', 1)[1]
        elif line.startswith(('1)', '2)', '3)', '4)')):
            current_question['options'].append(line)
        elif line.startswith('Answer:'):
            current_question['correct'] = line.split('Answer: ')[1].strip()
    
    if current_question:
        questions.append(current_question)
    
    return questions

def conduct_quiz(questions):
    """Conduct the interactive quiz"""
    score = 0
    total_questions = len(questions)
    
    print("\n🎮 Let's start the quiz!")
    print("=" * 50)
    
    for i, q in enumerate(questions, 1):
        print(f"\nQuestion {i} of {total_questions}:")
        print(q['question'])
        
        if q['type'] == 'mcq':
            for option in q['options']:
                print(option)
            
            while True:
                answer = input("\nYour answer (1-4): ").strip()
                if answer in ['1', '2', '3', '4']:
                    break
                print("Please enter a valid option (1-4)")
            
            is_correct = answer == q['correct']
        else:  # short answer
            print("(Short answer question)")
            answer = input("\nYour answer: ").strip()
            key_terms = set(q['correct'].lower().split())
            answer_terms = set(answer.lower().split())
            is_correct = len(key_terms.intersection(answer_terms)) >= len(key_terms) // 2
        
        if is_correct:
            print("✅ Correct!")
            score += 1
        else:
            print("❌ Incorrect!")
            print(f"Correct answer: {q['correct']}")
        
        time.sleep(1)  # Brief pause between questions
    
    return score, total_questions

@app.route('/generate/<string:topic>', methods=['POST'])
def generate(topic):
    """Endpoint to generate either a quiz or content based on user choice"""
    data = request.json
    choice = data.get('choice', '').lower()

    if choice == 'quiz':
        print(f"Generating quiz for topic: {topic}")
        quiz_text = generate_quiz(topic)
        if quiz_text:
            questions = parse_quiz(quiz_text)
            # Save the quiz to a JSON file
            output_file = os.path.join(OUTPUT_FOLDER, f"{topic}_quiz.json")
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump({"topic": topic, "questions": questions}, f, indent=4)
            return jsonify({"message": f"Quiz saved to {output_file}", "filename": f"{topic}_quiz.json"}), 200
        else:
            return jsonify({"error": "Failed to generate quiz. Please check the server logs for details."}), 500

    elif choice == 'content':
        print(f"Generating content for topic: {topic}")
        content_text = generate_content(topic)
        if content_text:
            # Save the content to a JSON file
            output_file = os.path.join(OUTPUT_FOLDER, f"{topic}_content.json")
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump({"topic": topic, "content": content_text}, f, indent=4)
            return jsonify({"message": f"Content saved to {output_file}", "filename": f"{topic}_content.json"}), 200
        else:
            return jsonify({"error": "Failed to generate content. Please check the server logs for details."}), 500

    else:
        return jsonify({"error": "Invalid choice. Please specify 'quiz' or 'content'."}), 400

@app.route('/get-file/<string:filename>', methods=['GET'])
def get_file(filename):
    """Endpoint to serve JSON files to the frontend"""
    try:
        return send_from_directory(OUTPUT_FOLDER, filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)