import os
import base64
from moralis import evm_api

# Function to read a file and convert it to base64
def file_to_base64(filepath):
    with open(filepath, 'rb') as file:
        return base64.b64encode(file.read()).decode('utf-8')

# Your Moralis API key
api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjQ4NGY1Mzg0LWI3NzItNDY3MC04ZGZiLWE2MDE2YzJjZGY5YiIsIm9yZ0lkIjoiMzQ1MjI3IiwidXNlcklkIjoiMzU0ODg1IiwidHlwZUlkIjoiODgyOTlmZmUtNjAwZS00MzRiLWFiNTYtMjFiNWIwMGIzYzRhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODc2OTAzMzAsImV4cCI6NDg0MzQ1MDMzMH0.SDxu0azYfv7Zq1DNyxXHqM04kn3yGgMMDXjTR5ZiTAQ"

# The folder you want to upload
folder_path = "/build"

# Prepare the body
body = []

# Go through each file in the folder
for root, dirs, files in os.walk(folder_path):
    for file in files:
        file_path = os.path.join(root, file)
        # Get the file content in base64
        file_content = file_to_base64(file_path)
        # Get the path relative to the folder
        relative_path = os.path.relpath(file_path, folder_path)
        # Add the file to the body
        body.append({
            "path": relative_path,
            "content": file_content,
        })

# Upload the folder to IPFS
result = evm_api.ipfs.upload_folder(
    api_key=api_key,
    body=body,
)

# Print the result
print(result)
