import requests

# Backend API endpoint
url = "http://localhost:3000/study/add-subject"

# Subject data
data = {
    "name": "Cloud Computing",
    "semester": 6,
    "branch": "Computer Science",
    "syllabus": [
        {"order": 1, "topic": "Scalable Computing Over the Internet"},
        {"order": 2, "topic": "Technologies for Network Based Systems"},
        {"order": 3, "topic": "System Models for Distributed and Cloud Computing"},
        {"order": 4, "topic": "Software Environments for Distributed Systems and Clouds Performance"},
        {"order": 5, "topic": "Security and Energy Efficiency"},
        {"order": 6, "topic": "Implementation Levels of Virtualization"},
        {"order": 7, "topic": "Virtualization Structure/Tools and Mechanisms"},
        {"order": 8, "topic": "Virtualization of CPU/Memory and I/O devices"},
        {"order": 9, "topic": "Virtual Clusters and Resource Management"},
        {"order": 10, "topic": "Virtualization for Data Center Automation"},
        {"order": 11, "topic": "Cloud Computing and Service Models"},
        {"order": 12, "topic": "Data Center Design and Interconnection Networks"},
        {"order": 13, "topic": "Architectural  GAE"},
        {"order": 14, "topic": "AWS and  Azure"},
        {"order": 15, "topic": "Inter-Cloud Resource Management"},
        {"order": 16, "topic": "Top concern for cloud users"},
        {"order": 17, "topic": "Risks"},
        {"order": 18, "topic": "Privacy Impact Assessment"},
        {"order": 19, "topic": "Cloud Data Encryption"},
        {"order": 20, "topic": "Security of Database Services"},
        {"order": 21, "topic": "OS security"},
        {"order": 22, "topic": "VM Security"},
        {"order": 23, "topic": "Security Risks Posed by Shared Images and Management OS"},
        {"order": 24, "topic": "XOAR"},
        {"order": 25, "topic": "A Trusted Hypervisor"},
        {"order": 26, "topic": "Mobile Devices and Cloud Security"},
        {"order": 27, "topic": "Cloud Security Defense Strategies"},
        {"order": 28, "topic": "Distributed Intrusion/Anomaly Detection"},
        {"order": 29, "topic": "Data and Software Protection Techniques"},
        {"order": 30, "topic": "Reputation-Guided Protection of Data Centers"},
        {"order": 31, "topic": "Features of Cloud and Grid Platforms"},
        {"order": 32, "topic": "Parallel and Distributed Computing Paradigms"},
        {"order": 33, "topic": "Programming Support for Google App Engine"},
        {"order": 34, "topic": "Programming on Amazon AWS and Microsoft"},
        {"order": 35, "topic": "Emerging Cloud Software Environments"},
    ],
}

# Send POST request
response = requests.post(url, json=data)

# Print response
if response.status_code == 201:
    print("Subject added successfully!")
else:
    print("Failed to add subject:", response.json())