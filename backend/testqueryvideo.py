import json
import os
from aperturedb import Connector as Connector
from aperturedb.CommonLibrary import create_connector
from dotenv import load_dotenv
from apertureconnection import add_video_to_aperture, search_videos_by_caption, search_video_by_id  # Assuming your function is in video_ingestion.py


user_search = "test"
results = search_videos_by_caption(user_search)
print("Search Results:", results)

# search_by_id = 1
# result = search_video_by_id(search_by_id)
# print("Search Results:", result)

