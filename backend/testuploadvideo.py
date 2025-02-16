#!/usr/bin/env python3
import os
from aperturedb import Connector as Connector
from aperturedb.CommonLibrary import create_connector
from apertureconnection import add_video_to_aperture  # Assuming your function is in video_ingestion.py

def main():
    # Instantiate your ApertureDB client.
    # This assumes your configuration is stored in a config file (e.g., ~/.adbconfig)
    # or that the client is otherwise configured with your API key/endpoint.
    
    client = create_connector()
    
    # Alternatively, if you use environment variables:
    # client = Client(api_key=os.getenv("APERTUREDB_API_KEY"), endpoint=os.getenv("APERTUREDB_ENDPOINT"))
    
    # Define minimal video properties.
    video_properties = {
        "name": "testvid.mov",
        "id": 1,  # Replace with a unique identifier for your video.
        "category": "test",
        "caption": "This is a test video upload for ApertureDB."
    }
    
    # Path to your test video file.
    file_path = "/Users/nicholasferreira/Documents/Projects/MultimodalHackathon2025/backend/testvid.mov"
    
    # Upload the video using your helper function.
    response, blobs = add_video_to_aperture(file_path, video_properties)
    print("Upload Response:", response)
    print("Blob Info:", blobs)

if __name__ == "__main__":
    main()
