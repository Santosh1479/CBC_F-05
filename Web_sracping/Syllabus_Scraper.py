
import os
import requests
import fitz
import random
import time
import urllib3
from bs4 import BeautifulSoup
from requests.exceptions import RequestException
import concurrent.futures
import re

# Gemini API config
GEMINI_API_KEY = "AIzaSyDN91XIzuHfgmh9Y8HviEUezJDxes7Fhuc"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

VTU_BRANCHES = {
    'CSE': 'Computer Science and Engineering',
    'ISE': 'Information Science and Engineering',
    'ECE': 'Electronics and Communication Engineering',
    'EEE': 'Electrical and Electronics Engineering',
    'ME': 'Mechanical Engineering',
    'CV': 'Civil Engineering',
    'BT': 'Biotechnology',
    'CHE': 'Chemical Engineering',
    'AE': 'Aerospace Engineering',
    'IEM': 'Industrial Engineering and Management',
    'EIE': 'Electronics and Instrumentation Engineering',
    'TCE': 'Telecommunication Engineering',
    'AI&ML': 'Artificial Intelligence and Machine Learning',
    'DS': 'Data Science'
}

PROXIES = []

def get_ssl_proxies():
    proxies = []
    try:
        url = 'https://www.sslproxies.org/'
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        proxy_table = soup.find('table', id='proxylisttable')
        if not proxy_table:
            return proxies
        for row in proxy_table.tbody.find_all('tr'):
            cols = row.find_all('td')
            if len(cols) >= 7 and cols[6].text.strip() == 'yes':
                ip = cols[0].text.strip()
                port = cols[1].text.strip()
                proxies.append({"http": f"http://{ip}:{port}", "https": f"https://{ip}:{port}"})
    except:
        pass
    return proxies

def verify_proxy(proxy):
    try:
        response = requests.get('https://www.google.com', proxies=proxy, timeout=5, verify=True)
        return response.status_code == 200
    except:
        return False

def verify_proxies(proxies, max_workers=10):
    working_proxies = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(verify_proxy, p): p for p in proxies}
        for future in concurrent.futures.as_completed(futures):
            if future.result():
                working_proxies.append(futures[future])
    return working_proxies

def get_free_proxies():
    proxies = get_ssl_proxies()
    return verify_proxies(proxies)

def get_random_proxy():
    global PROXIES
    if not PROXIES:
        PROXIES = get_free_proxies()
    return random.choice(PROXIES) if PROXIES else None

def construct_url(sem, branch):
    return f"https://vtu.ac.in/pdf/2022_3to8/{sem}{branch.lower()}syll.pdf"

def download_pdf(url, path, max_retries=5):
    if os.path.exists(path):
        print("[✓] PDF already exists.")
        return path
    session = requests.Session()
    session.verify = True
    headers = {'User-Agent': 'Mozilla/5.0'}
    for attempt in range(max_retries):
        proxy = get_random_proxy()
        session.proxies = proxy if proxy else {}
        try:
            response = session.get(url, headers=headers, timeout=15)
            if response.status_code == 200 and response.content.startswith(b'%PDF'):
                with open(path, 'wb') as f:
                    f.write(response.content)
                print(f"[✓] Downloaded successfully to {path}")
                return path
        except Exception as e:
            print(f"[!] Attempt {attempt+1} failed: {e}")
            time.sleep(2 ** attempt)
    return None

def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        return "".join([page.get_text() for page in doc])
    except Exception as e:
        print(f"[!] Error reading PDF: {e}")
        return None

def call_gemini_api(prompt, input_text):
    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_API_KEY}
    payload = {
        "contents": [{"parts": [{"text": f"{prompt}\n\n{input_text}"}]}]
    }
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, params=params, json=payload)
        response.raise_for_status()
        return response.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"[!] Gemini API Error: {e}")
        return None

def save_to_file(text, path):
    try:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"[✓] Cleaned topics saved to {path}")
    except Exception as e:
        print(f"[!] Error saving file: {e}")

def show_branches():
    print("\nAvailable Branches:")
    for code, name in VTU_BRANCHES.items():
        print(f"{code:<6} : {name}")

def main():
    show_branches()
    sem = input("Enter semester (3-8): ").strip()
    branch = input("Enter branch code (e.g., CSE): ").strip().upper()

    if branch not in VTU_BRANCHES:
        print("[!] Invalid branch code!")
        return

    url = construct_url(sem, branch)
    filename = f"{sem}{branch}syll.pdf"
    out_dir = "vtu_pdfs"
    os.makedirs(out_dir, exist_ok=True)
    pdf_path = os.path.join(out_dir, filename)

    if download_pdf(url, pdf_path):
        raw_text = extract_text_from_pdf(pdf_path)
        if raw_text:
            print("[*] Sending raw text to Gemini...")
            prompt = (
                "You are given the raw text of a VTU syllabus PDF. "
                "Please extract and list only the actual subject topic names from each module or unit. "
                "Remove all unwanted data like scheme info, credits, outcomes, references, duration, marks, etc. "
                "Format each topic as a bullet point under its module heading."
            )
            cleaned_topics = call_gemini_api(prompt, raw_text)
            if cleaned_topics:
                output_path = os.path.splitext(pdf_path)[0] + "_topics.txt"
                print("\n🎯 CLEANED TOPIC LIST\n" + "="*50)
                print(cleaned_topics)
                save_to_file(cleaned_topics, output_path)
            else:
                print("[!] Failed to clean topics using Gemini API.")
        else:
            print("[!] Could not extract text from PDF.")
    else:
        print("[!] Failed to download syllabus PDF.")

if __name__ == "__main__":
    main()
