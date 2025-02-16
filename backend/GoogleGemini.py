from google import genai
import time
import requests

def generate_video_caption(video_path, api_key="AIzaSyA5NlH0GOSjAJKfmeCohq8tTNkES5_6uMU"):
    """
    Generate a detailed caption for a video file using Google's Gemini API.
    
    Args:
        video_path (str): Path to the video file
        api_key (str): Google Gemini API key
    
    Returns:
        str: Generated caption for the video
    """
    client = genai.Client(api_key=api_key)

    print("Uploading video...")
    video_file = client.files.upload(file=video_path)
    print(f"Completed upload: {video_file.uri}")

    # Wait for video processing
    while video_file.state.name == "PROCESSING":
        print('.', end='')
        time.sleep(1)
        video_file = client.files.get(name=video_file.name)

    if video_file.state.name == "FAILED":
        raise ValueError(f"Video processing failed: {video_file.state.name}")

    # Enhanced prompt for better description
    prompt = """
    Analyze this video in detail and describe:
    1. The main action or event
    2. The setting and environment
    3. Any notable movements or changes
    4. Key details about the subjects involved
    Please provide a natural, flowing description.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash-lite-preview-02-05",
        contents=[video_file, prompt]
    )

    # Cleanup
    client.files.delete(name=video_file.name)
    
    return response.text



def generate_text_embedding(text, api_key="257203c442a94c07ff6f1776f8cfbc6ea6a291cd9404e6fe70ad467cb9342762"):
    """
    Generate text embeddings using Together AI API.
    
    Args:
        text (str): Input text to generate embedding for
        api_key (str): Together AI API key
    
    Returns:
        list: Vector embedding of the input text
    """
    url = "https://api.together.xyz/v1/embeddings"
    
    payload = {
        "model": "togethercomputer/m2-bert-80M-8k-retrieval",
        "input": text
    }
    
    headers = {
        "accept": "application/json",
        "content-type": "application/json", 
        "Authorization": f"Bearer {api_key}"
    }

    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        return response.json()['data'][0]['embedding']
    else:
        raise Exception(f"API request failed with status {response.status_code}")


if __name__ == "__main__":
    video_path = "./tempVideo/motion_clip_1739670526.mp4"
    caption = generate_video_caption(video_path)
    embedding = generate_text_embedding(caption)
    print("\nVideo Caption:")
    print(caption)
    print(embedding)