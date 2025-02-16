from aperturedb import Connector as Connector
from aperturedb.CommonLibrary import create_connector
from GoogleGemini import generate_video_caption  # Function to generate caption from video
from GoogleGemini import generate_text_embedding   # Function to generate text embeddings

# Create the global ApertureDB client using create_connector() if needed.
client = create_connector()

query = [{
    "GetStatus": {
    }
}]

# Execute the query to get back a JSON response for GetStatus 
response, blobs = client.query(query)

client.print_last_response()
def add_video_to_aperture(file_path: str, video_properties: dict):
    """
    Upload a video file to ApertureDB using a JSON query.
    This function will generate a caption using the video file if one is not provided,
    compute an embedding for the caption, and then include them in the video properties.

    Parameters:
        file_path (str): Local path to the video file.
        video_properties (dict): A dictionary containing video metadata. For example:
            {
                "name": "testvid.mov",
                "id": 1,
                "category": "test"
            }
    
    Returns:
        response, blobs: The response from ApertureDB and any binary data processed.
    """
    # Generate a caption if one isn't provided in video_properties.
    if "caption" not in video_properties or not video_properties["caption"]:
        print("Generating caption from video...")
        try:
            # This call will generate a caption from the video file.
            generated_caption = generate_video_caption(file_path)
            video_properties["caption"] = generated_caption
            print("Caption generated:", generated_caption)
        except Exception as e:
            print("Error generating video caption:", e)
            video_properties["caption"] = ""

    # Compute the embedding for the caption and add it to the properties.
    if "caption" in video_properties and video_properties["caption"]:
        try:
            embedding = generate_text_embedding(video_properties["caption"])
            video_properties["caption_embedding"] = embedding
        except Exception as e:
            print("Error generating caption embedding:", e)
            video_properties["caption_embedding"] = []

    # Build the JSON query to add the video.
    query = [{
        "AddVideo": {
            "properties": video_properties,
            "if_not_found": {
                "id": ["==", video_properties.get("id")]
            }
        }
    }]

    # Read the video file as a binary blob.
    with open(file_path, 'rb') as fd:
        video_blob = fd.read()

    array = [video_blob]

    # Execute the query using the global db instance.
    response, blobs = db.query(query, array)
    db.print_last_response()
    return response, blobs
  
def search_videos_by_caption(caption_search: str):
    # Retrieve a broader set of videos without filtering on caption.
    query = [{
        "FindVideo": {
            "results": {
                "limit": 100,
                "all_properties": True
            }
        }
    }]
    
    response, _ = db.query(query, [])
    videos = response[0].get("entities", [])
    
    # Now filter locally for videos whose caption contains the search term (case-insensitive)
    filtered = [
        video for video in videos 
        if caption_search.lower() in video.get("caption", "").lower()
    ]
    return filtered


def search_video_by_id(video_id: int):
    """
    Searches for a video in ApertureDB based on its id.
    
    Parameters:
        video_id (int): The id of the video to search for.
    
    Returns:
        dict: The query response from ApertureDB containing the matching video(s).
    """
    query = [{
        "FindVideo": {
            "constraints": {
                "id": ["==", video_id]
            },
            "results": {
                "all_properties": True,
                "limit": 10
            }
        }
    }]
    
    response, _ = db.query(query, [])
    return response
