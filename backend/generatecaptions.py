from video_captioning import generate_captions, agent

# Process a local test video
video_path = "testvid.mov"
captions = generate_captions(video_path)
print("Generated Captions:", captions)

# Use the agent to analyze the captions
response = agent.chat(f"What is occurring in the video? Here are the captions: {captions}")
print("Agent Response:", response)
