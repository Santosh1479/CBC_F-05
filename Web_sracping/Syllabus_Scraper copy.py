import os
import requests
import fitz  # PyMuPDF

def construct_url(sem, branch):
    return f"https://vtu.ac.in/pdf/2022_3to8/{sem}{branch.lower()}syll.pdf"

def download_pdf(url, path):
    if os.path.exists(path):
        return path
    r = requests.get(url)
    if r.status_code == 200:
        with open(path, 'wb') as f:
            f.write(r.content)
        return path
    return None

def extract_text_from_pdf(path):
    doc = fitz.open(path)
    text = "\n".join([page.get_text() for page in doc])
    doc.close()
    return text

def filter_and_format(text):
    lines = text.splitlines()
    filtered = []
    exclude_keywords = ['yoga', 'nss', 'environmental']
    for line in lines:
        if not any(keyword in line.lower() for keyword in exclude_keywords):
            filtered.append(line)
    return "\n".join(filtered)

def main():
    sem = input("Enter semester (3-8): ").strip()
    branch = input("Enter branch (e.g., CSE, ECE): ").strip().lower()
    url = construct_url(sem, branch)
    filename = f"{sem}{branch}syll.pdf"
    path = os.path.join("vtu_pdfs", filename)
    os.makedirs("vtu_pdfs", exist_ok=True)
    
    if download_pdf(url, path):
        print("[✓] PDF downloaded.")
        raw_text = extract_text_from_pdf(path)
        clean_text = filter_and_format(raw_text)
        print("\n--- Extracted Syllabus ---\n")
        print(clean_text)
    else:
        print("[✗] Failed to download PDF.")

if __name__ == "__main__":
    main()
