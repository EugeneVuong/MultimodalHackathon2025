#!/usr/bin/env python3
import os
from apertureconnection import add_video_to_aperture  # Import your helper function that uses the global db

def main():
    # Define the video metadata.
    video_properties = {
        "name": "delivery.mov",
        "category": "test",
        "id": "",
    }
    
    # Specify the path to your test video file.
    file_path = "/Users/nicholasferreira/Documents/Projects/MultimodalHackathon2025/backend/testdelivery.mov"
    
    # Use the global function to upload the video.
    response, blobs = add_video_to_aperture(file_path, video_properties)
    
    print("Upload Response:", response)
    print("Blob Info:", blobs)

if __name__ == "__main__":
    main()
