# import requests
# import json
# import re
# import time

# # Gemini API configuration
# GEMINI_API_KEY = "AIzaSyDN91XIzuHfgmh9Y8HviEUezJDxes7Fhuc"
# GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

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
#         'Content-Type': 'application/json'
#     }

#     data = {
#         "contents": [{
#             "parts": [{"text": prompt}]
#         }]
#     }

#     try:
#         response = requests.post(
#             f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
#             headers=headers,
#             json=data
#         )
        
#         if response.status_code == 200:
#             result = response.json()
#             # Extract the generated text from Gemini's response
#             quiz_text = result['candidates'][0]['content']['parts'][0]['text']
#             return quiz_text
#         else:
#             print(f"Error: {response.status_code}")
#             print(response.text)
#             return None

#     except Exception as e:
#         print(f"Error generating quiz: {str(e)}")
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

# def conduct_quiz(questions):
#     """Conduct the interactive quiz"""
#     score = 0
#     total_questions = len(questions)
    
#     print("\n🎮 Let's start the quiz!")
#     print("=" * 50)
    
#     for i, q in enumerate(questions, 1):
#         print(f"\nQuestion {i} of {total_questions}:")
#         print(q['question'])
        
#         if q['type'] == 'mcq':
#             for option in q['options']:
#                 print(option)
            
#             while True:
#                 answer = input("\nYour answer (1-4): ").strip()
#                 if answer in ['1', '2', '3', '4']:
#                     break
#                 print("Please enter a valid option (1-4)")
            
#             is_correct = answer == q['correct']
#         else:  # short answer
#             print("(Short answer question)")
#             answer = input("\nYour answer: ").strip()
#             # For short answers, check if key terms from correct answer are present
#             key_terms = set(q['correct'].lower().split())
#             answer_terms = set(answer.lower().split())
#             is_correct = len(key_terms.intersection(answer_terms)) >= len(key_terms) // 2
        
#         if is_correct:
#             print("✅ Correct!")
#             score += 1
#         else:
#             print("❌ Incorrect!")
#             print(f"Correct answer: {q['correct']}")
        
#         time.sleep(1)  # Brief pause between questions
    
#     return score, total_questions

# def main():
#     print("\n📚 VTU Quiz Generator using Google Gemini\n")
#     topic = input("Enter topic for the quiz: ").strip()
    
#     print("\n⌛ Generating quiz...")
#     quiz_text = generate_quiz(topic)
    
#     if quiz_text:
#         questions = parse_quiz(quiz_text)
#         score, total = conduct_quiz(questions)
        
#         # Show results
#         print("\n" + "=" * 50)
#         print(f"Quiz completed! Your score: {score}/{total}")
#         percentage = (score / total) * 100
#         print(f"Percentage: {percentage:.1f}%")
        
#         # Grade based on percentage
#         if percentage >= 90:
#             grade = "Outstanding! 🏆"
#         elif percentage >= 80:
#             grade = "Excellent! 🌟"
#         elif percentage >= 70:
#             grade = "Very Good! 👍"
#         elif percentage >= 60:
#             grade = "Good! 👋"
#         else:
#             grade = "Need improvement 📚"
#         print(f"Grade: {grade}")
        
#         # Ask if user wants to save the quiz
#         save_quiz = input("\nDo you want to save the quiz and answers? (y/n): ").strip().lower()
#         if save_quiz == 'y':
#             try:
#                 with open("quiz_output.txt", "w", encoding='utf-8') as f:
#                     f.write(f"Quiz on: {topic.upper()}\n")
#                     f.write(f"Score: {score}/{total} ({percentage:.1f}%)\n")
#                     f.write(f"Grade: {grade}\n")
#                     f.write("-" * 50 + "\n\n")
#                     f.write(quiz_text)
#                 print("\n📁 Quiz saved to 'quiz_output.txt'")
#             except Exception as e:
#                 print(f"\n❌ Error saving quiz: {str(e)}")
#     else:
#         print("\n❌ Failed to generate quiz. Please try again.")

# if __name__ == "__main__":
#     main()


# import requests
# import json
# import re
# import time
# import os

# # Gemini API configuration
# GEMINI_API_KEY = "AIzaSyDN91XIzuHfgmh9Y8HviEUezJDxes7Fhuc"
# GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

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
#         'Content-Type': 'application/json'
#     }

#     data = {
#         "contents": [{
#             "parts": [{"text": prompt}]
#         }]
#     }

#     try:
#         response = requests.post(
#             f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
#             headers=headers,
#             json=data
#         )
        
#         if response.status_code == 200:
#             result = response.json()
#             # Extract the generated text from Gemini's response
#             quiz_text = result['candidates'][0]['content']['parts'][0]['text']
#             return quiz_text
#         else:
#             print(f"Error: {response.status_code}")
#             print(response.text)
#             return None

#     except Exception as e:
#         print(f"Error generating quiz: {str(e)}")
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

# def conduct_quiz(questions):
#     """Conduct the interactive quiz"""
#     score = 0
#     total_questions = len(questions)
    
#     print("\n🎮 Let's start the quiz!")
#     print("=" * 50)
    
#     for i, q in enumerate(questions, 1):
#         print(f"\nQuestion {i} of {total_questions}:")
#         print(q['question'])
        
#         if q['type'] == 'mcq':
#             for option in q['options']:
#                 print(option)
            
#             while True:
#                 answer = input("\nYour answer (1-4): ").strip()
#                 if answer in ['1', '2', '3', '4']:
#                     break
#                 print("Please enter a valid option (1-4)")
            
#             is_correct = answer == q['correct']
#         else:  # short answer
#             print("(Short answer question)")
#             answer = input("\nYour answer: ").strip()
#             # For short answers, check if key terms from correct answer are present
#             key_terms = set(q['correct'].lower().split())
#             answer_terms = set(answer.lower().split())
#             is_correct = len(key_terms.intersection(answer_terms)) >= len(key_terms) // 2
        
#         if is_correct:
#             print("✅ Correct!")
#             score += 1
#         else:
#             print("❌ Incorrect!")
#             print(f"Correct answer: {q['correct']}")
        
#         time.sleep(1)  # Brief pause between questions
    
#     return score, total_questions

# def main():
#     print("\n📚 VTU Quiz Generator using Google Gemini\n")
#     topic = input("Enter topic for the quiz: ").strip()
    
#     print("\n⌛ Generating quiz...")
#     quiz_text = generate_quiz(topic)
    
#     if quiz_text:
#         questions = parse_quiz(quiz_text)
#         score, total = conduct_quiz(questions)
        
#         # Show results
#         print("\n" + "=" * 50)
#         print(f"Quiz completed! Your score: {score}/{total}")
#         percentage = (score / total) * 100
#         print(f"Percentage: {percentage:.1f}%")
        
#         # Grade based on percentage
#         if percentage >= 90:
#             grade = "Outstanding! 🏆"
#         elif percentage >= 80:
#             grade = "Excellent! 🌟"
#         elif percentage >= 70:
#             grade = "Very Good! 👍"
#         elif percentage >= 60:
#             grade = "Good! 👋"
#         else:
#             grade = "Need improvement 📚"
#         print(f"Grade: {grade}")
        
#         # Ask if user wants to save the quiz
#         save_quiz = input("\nDo you want to save the quiz and answers? (y/n): ").strip().lower()
#         if save_quiz == 'y':
#             try:
#                 with open("quiz_output.txt", "w", encoding='utf-8') as f:
#                     f.write(f"Quiz on: {topic.upper()}\n")
#                     f.write(f"Score: {score}/{total} ({percentage:.1f}%)\n")
#                     f.write(f"Grade: {grade}\n")
#                     f.write("-" * 50 + "\n\n")
#                     f.write(quiz_text)
#                 print("\n📁 Quiz saved to 'quiz_output.txt'")
#             except Exception as e:
#                 print(f"\n❌ Error saving quiz: {str(e)}")
#     else:
#         print("\n❌ Failed to generate quiz. Please try again.")

# def get_subjects_from_txt():
#     """Get list of subjects from txt files in vtu_pdfs folder"""
#     subjects = {}
#     try:
#         for file in os.listdir("vtu_pdfs"):
#             if file.endswith("topics.txt"):
#                 with open(os.path.join("vtu_pdfs", file), 'r', encoding='utf-8') as f:
#                     content = f.read()
#                     # Extract subject names (text between **)
#                     subject_matches = re.findall(r'\*\*(.*?)\*\*', content)
#                     for subject in subject_matches:
#                         if '(' in subject:  # Get subject code if available
#                             name, code = subject.split('(')
#                             code = code.rstrip(')')
#                             subjects[code] = name.strip()
#     except Exception as e:
#         print(f"[!] Error reading subjects: {e}")
#     return subjects

# def get_modules_for_subject(subject_code):
#     """Get modules for a specific subject from txt files"""
#     modules = []
#     try:
#         for file in os.listdir("vtu_pdfs"):
#             if file.endswith("topics.txt"):
#                 with open(os.path.join("vtu_pdfs", file), 'r', encoding='utf-8') as f:
#                     content = f.read()
#                     if subject_code in content:
#                         # Find the section for this subject
#                         subject_pattern = f"\\*\\*.*?{subject_code}\\*\\*(.*?)(?=\\*\\*|$)"
#                         subject_match = re.search(subject_pattern, content, re.DOTALL)
                        
#                         if subject_match:
#                             subject_content = subject_match.group(1)
#                             # Extract each module's content
#                             module_pattern = r'\*MODULE-\d+\*(.*?)(?=\*MODULE|\Z)'
#                             modules = re.findall(module_pattern, subject_content, re.DOTALL)
#                             # Clean up the modules
#                             modules = [module.strip() for module in modules if module.strip()]
#                             return modules
#     except Exception as e:
#         print(f"[!] Error reading modules: {e}")
#     return modules

# def display_subjects(subjects):
#     """Display available subjects with codes"""
#     print("\n📚 Available Subjects:")
#     print("=" * 60)
#     for code, name in subjects.items():
#         print(f"{code:<8} : {name}")
#     print("=" * 60)

# def display_modules(modules):
#     """Display modules and their topics"""
#     print("\n📑 Module Topics:")
#     print("=" * 60)
#     for i, module in enumerate(modules, 1):
#         print(f"\nModule {i}:")
#         print("-" * 30)
#         for line in module.split('\n'):
#             if line.strip():
#                 print(line.strip())
#     print("=" * 60)

# def main():
#     # Get available subjects
#     subjects = get_subjects_from_txt()
#     if not subjects:
#         print("[!] No subjects found in vtu_pdfs folder")
#         return

#     # Display subjects
#     display_subjects(subjects)

#     # Get user choice
#     while True:
#         subject_code = input("\nEnter subject code (e.g., BCS501): ").strip().upper()
#         if subject_code in subjects:
#             break
#         print("[!] Invalid subject code. Please try again.")

#     # Get and display modules for selected subject
#     print(f"\n[*] Getting modules for {subjects[subject_code]}...")
#     modules = get_modules_for_subject(subject_code)
    
#     if modules:
#         display_modules(modules)
        
#         # Ask if user wants to generate quiz
#         quiz_choice = input("\nWould you like to generate a quiz for this subject? (y/n): ").lower()
#         if quiz_choice == 'y':
#             topic = input("Enter specific topic from the modules above: ").strip()
#             quiz_text = generate_quiz(topic)
#             if quiz_text:
#                 questions = parse_quiz(quiz_text)
#                 conduct_quiz(questions)
#     else:
#         print("[!] No modules found for this subject")

# if __name__ == "__main__":
#     main()



import requests
import json
import re
import time
import os

# Gemini API configuration
GEMINI_API_KEY = "AIzaSyDN91XIzuHfgmh9Y8HviEUezJDxes7Fhuc"
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
            quiz_text = result['candidates'][0]['content']['parts'][0]['text']
            return quiz_text
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return None

    except Exception as e:
        print(f"Error generating quiz: {str(e)}")
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
            # For short answers, check if key terms from correct answer are present
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

def main():
    print("\n📚 VTU Quiz Generator using Google Gemini\n")
    topic = input("Enter topic for the quiz: ").strip()
    
    print("\n⌛ Generating quiz...")
    quiz_text = generate_quiz(topic)
    
    if quiz_text:
        questions = parse_quiz(quiz_text)
        score, total = conduct_quiz(questions)
        
        # Show results
        print("\n" + "=" * 50)
        print(f"Quiz completed! Your score: {score}/{total}")
        percentage = (score / total) * 100
        print(f"Percentage: {percentage:.1f}%")
        
        # Grade based on percentage
        if percentage >= 90:
            grade = "Outstanding! 🏆"
        elif percentage >= 80:
            grade = "Excellent! 🌟"
        elif percentage >= 70:
            grade = "Very Good! 👍"
        elif percentage >= 60:
            grade = "Good! 👋"
        else:
            grade = "Need improvement 📚"
        print(f"Grade: {grade}")
        
        # Ask if user wants to save the quiz
        save_quiz = input("\nDo you want to save the quiz and answers? (y/n): ").strip().lower()
        if save_quiz == 'y':
            try:
                with open("quiz_output.txt", "w", encoding='utf-8') as f:
                    f.write(f"Quiz on: {topic.upper()}\n")
                    f.write(f"Score: {score}/{total} ({percentage:.1f}%)\n")
                    f.write(f"Grade: {grade}\n")
                    f.write("-" * 50 + "\n\n")
                    f.write(quiz_text)
                print("\n📁 Quiz saved to 'quiz_output.txt'")
            except Exception as e:
                print(f"\n❌ Error saving quiz: {str(e)}")
    else:
        print("\n❌ Failed to generate quiz. Please try again.")

def get_subjects_from_txt():
    """Get list of subjects from txt files in vtu_pdfs folder"""
    subjects = {}
    try:
        for file in os.listdir("vtu_pdfs"):
            if file.endswith("topics.txt"):
                with open(os.path.join("vtu_pdfs", file), 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Extract subject names (text between **)
                    subject_matches = re.findall(r'\*\*(.*?)\*\*', content)
                    for subject in subject_matches:
                        if '(' in subject:  # Get subject code if available
                            name, code = subject.split('(')
                            code = code.rstrip(')')
                            subjects[code] = name.strip()
    except Exception as e:
        print(f"[!] Error reading subjects: {e}")
    return subjects

def get_modules_for_subject(subject_code):
    """Get modules for a specific subject from txt files"""
    modules = []
    try:
        for file in os.listdir("vtu_pdfs"):
            if file.endswith("topics.txt"):
                with open(os.path.join("vtu_pdfs", file), 'r', encoding='utf-8') as f:
                    content = f.read()
                    if subject_code in content:
                        # Find the section between subject and next subject
                        pattern = rf"\*\*.*?\({subject_code}\).*?\*\*(.*?)(?=\*\*|$)"
                        subject_match = re.search(pattern, content, re.DOTALL)
                        
                        if subject_match:
                            subject_content = subject_match.group(1)
                            # Extract content between MODULE-X headers
                            module_sections = re.split(r'\*MODULE-\d+\*', subject_content)
                            # Remove empty sections and clean up
                            modules = [
                                section.strip() 
                                for section in module_sections[1:]  # Skip the first empty split
                                if section.strip()
                            ]
                            
                            # Format the topics as bullet points
                            formatted_modules = []
                            for module in modules:
                                topics = [
                                    line.strip() 
                                    for line in module.split('\n') 
                                    if line.strip() and line.strip().startswith('*')
                                ]
                                formatted_modules.append('\n'.join(topics))
                            
                            return formatted_modules
    except Exception as e:
        print(f"[!] Error reading modules: {e}")
    return modules

def display_subjects(subjects):
    """Display available subjects with codes"""
    print("\n📚 Available Subjects:")
    print("=" * 60)
    for code, name in subjects.items():
        print(f"{code:<8} : {name}")
    print("=" * 60)

def display_modules(modules):
    """Display modules and their topics"""
    print("\n📑 Module Topics:")
    print("=" * 60)
    for i, module in enumerate(modules, 1):
        print(f"\nModule {i}:")
        print("-" * 30)
        for line in module.split('\n'):
            if line.strip():
                print(line.strip())
    print("=" * 60)

def main():
    # Get available subjects
    subjects = get_subjects_from_txt()
    if not subjects:
        print("[!] No subjects found in vtu_pdfs folder")
        return

    # Display subjects
    display_subjects(subjects)

    # Get user choice
    while True:
        subject_code = input("\nEnter subject code (e.g., BCS501): ").strip().upper()
        if subject_code in subjects:
            break
        print("[!] Invalid subject code. Please try again.")

    # Get and display modules for selected subject
    print(f"\n[*] Getting modules for {subjects[subject_code]}...")
    modules = get_modules_for_subject(subject_code)
    
    if modules:
        display_modules(modules)
        
        # Ask if user wants to generate quiz
        quiz_choice = input("\nWould you like to generate a quiz for this subject? (y/n): ").lower()
        if quiz_choice == 'y':
            topic = input("Enter specific topic from the modules above: ").strip()
            quiz_text = generate_quiz(topic)
            if quiz_text:
                questions = parse_quiz(quiz_text)
                conduct_quiz(questions)
    else:
        print("[!] No modules found for this subject")

if __name__ == "__main__":
    main()