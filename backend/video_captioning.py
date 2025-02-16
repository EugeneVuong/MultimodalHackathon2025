# video_captioning.py

from dotenv import load_dotenv
from llama_index.llms.gemini import Gemini
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import FunctionTool
import os
import moviepy.editor as mp
import speech_recognition as sr

# Load environment variables
load_dotenv()

# Initialize Gemini LLM for agent usage
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
llm = Gemini(
    model="models/gemini-1.5-flash",  # Or the specific Gemini model you want
    temperature=0,                   # Adjust as needed
    api_key=GEMINI_API_KEY           # Your actual key
)

def extract_audio_from_video(video_path: str, audio_path: str):
    """Extract audio from video file."""
    video = mp.VideoFileClip(video_path)
    video.audio.write_audiofile(audio_path)

def generate_captions_from_audio(audio_path: str) -> str:
    """Generate captions from audio file using speech recognition."""
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_path) as source:
        audio_data = recognizer.record(source)
    captions = recognizer.recognize_google(audio_data)
    return captions

def generate_captions(video_path: str) -> str:
    """
    Generate captions for a given local video file by:
      1. Extracting the audio.
      2. Converting the audio to text.
    """
    audio_path = "temp_audio.wav"
    extract_audio_from_video(video_path, audio_path)
    captions = generate_captions_from_audio(audio_path)
    os.remove(audio_path)  # Clean up temporary audio file
    return captions

# Initialize an agent (if needed) with no additional tools.
agent = ReActAgent.from_tools([], llm=llm, verbose=True)

# The following functions can be imported and used in another file:
# - caption_video_with_gemini(video_uri: str, question: str = "What is in the video?")
#   (Note: This requires the video to be on GCS.)
# - generate_captions(video_path: str) for local files.
