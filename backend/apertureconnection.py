from aperturedb import Connector as Connector
from aperturedb.CommonLibrary import create_connector

# # Create the connector for ApertureDB
client = create_connector()
# query = [{
#     "GetStatus": {
#     }
# }]

# # Execute the query to get back a JSON response for GetStatus 
# response, blobs = client.query(query)

client.print_last_response()

db = Connector.Connector(host="ai-agent-event-bl3gp0gk.farm0000.cloud.aperturedata.io",
                          user="admin",
                          password="Calstateeastbay25!")

query = [{ "GetStatus": {}}]


response, _ = db.query(query)

db.print_last_response()

def add_video_to_aperture(file_path: str, video_properties: dict):
    query = [{
        "AddVideo": {
            "properties": video_properties,
            "if_not_found": {
                "id": ["==", video_properties.get("id")]
            }
        }
    }]
    
    with open(file_path, 'rb') as fd:
        video_blob = fd.read()
    
    array = [video_blob]
    
    # Use the global db instance
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
