import numpy as np
from aperturedb import Connector as Connector
from aperturedb.CommonLibrary import create_connector
from GoogleGemini import generate_video_caption  # Function to generate caption from video
from GoogleGemini import generate_text_embedding   # Function to generate text embeddings
import time


# Global ApertureDB connection (adjust parameters as needed)
db = Connector.Connector(host="eugenevuong-5t9xqiiq.farm0000.cloud.aperturedata.io",
                         user="admin",
                         password="!hackhayward2025!")

# (Assume your global client used for other queries is set up elsewhere if needed.)

def add_video_to_aperture(file_path: str, video_properties: dict):
    """
    Upload a video file to ApertureDB.
    If a caption is not provided, generate one using the video file.
    Then compute a text embedding for the caption and add both to the video properties.
    Finally, upload the video.
    """

    if "id" not in video_properties or not video_properties["id"]:
        video_properties["id"] = str(generate_numeric_id())

    # Generate a caption if needed.
    if "caption" not in video_properties or not video_properties["caption"]:
        print("Generating caption from video...")
        try:
            generated_caption = generate_video_caption(file_path)
            video_properties["caption"] = generated_caption
            print("Caption generated:", generated_caption)
        except Exception as e:
            print("Error generating video caption:", e)
            video_properties["caption"] = ""
    
    # Compute the embedding for the caption.
    if video_properties.get("caption"):
        try:
            embedding = generate_text_embedding(video_properties["caption"])
            # Convert the embedding to a numpy array of type float32 and then to bytes.
            embedding_bytes = np.array(embedding, dtype='float32').tobytes()
            # Optionally store the raw embedding for reference.
            video_properties["caption_embedding"] = embedding
        except Exception as e:
            print("Error generating caption embedding:", e)
            embedding_bytes = b""
    else:
        embedding_bytes = b""
    
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
    
    # Execute the query to add the video.
    response, blobs = db.query(query, array)
    db.print_last_response()
    
    # Now, add the descriptor for the video's caption to the descriptor set.
    add_video_descriptor(video_properties.get("id"), video_properties["caption"], embedding_bytes)
    
    return response, blobs

def add_video_descriptor(video_id: int, caption: str, embedding_bytes: bytes, descriptor_set: str = "video_search"):
    """
    Adds a descriptor (embedding) for the video caption to the descriptor set,
    so that you can later perform similarity searches using natural language.
    """
    # Build a query to add the descriptor.
    query = [{
        "AddDescriptor": {
            "set": descriptor_set,
            "label": "video_caption",
            "properties": {
                "id": video_id,
                "caption": caption
            },
            "if_not_found": {
                "id": ["==", video_id]
            }
        }
    }]
    
    responses, blobs = db.query(query, [embedding_bytes])
    print("Descriptor add response:", db.get_last_response_str())
    return responses, blobs


def search_video_by_text(query_text: str, k_neighbors: int = 5, descriptor_set: str = "video_search"):
    """
    Searches for videos by performing a similarity search on the caption embeddings.
    """
    # Compute the embedding for the query text.
    query_embedding = generate_text_embedding(query_text)
    query_embedding_bytes = np.array(query_embedding, dtype='float32').tobytes()
    
    # Build a query to find similar descriptors.
    q = [{
        "FindDescriptor": {
            "set": descriptor_set,
            "k_neighbors": k_neighbors,
            "distances": True,
            "labels": True,
            "blobs": True,
            "results": {
                "all_properties": True
            }
        }
    }]
    
    responses, blobs = db.query(q, [query_embedding_bytes])
    print("Descriptor search response:", db.get_last_response_str())
    return responses, blobs

# Example usage:
# search_video_by_text("person dropping off a package")

def generate_numeric_id():
    return int(time.time() * 1000) # milliseconds since epoch
