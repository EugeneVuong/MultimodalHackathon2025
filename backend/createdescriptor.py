import json
from aperturedb import Connector
from aperturedb.CommonLibrary import create_connector
from apertureconnection import add_video_to_aperture, search_video_by_text # Assuming your function is in video_ingestion.py
import numpy as np
from GoogleGemini import generate_text_embedding

embedding = generate_text_embedding("This is a test video upload for ApertureDB.")
# Convert list to a numpy array with type float32
embedding_array = np.array(embedding, dtype='float32')
# Convert the numpy array to bytes
embedding_bytes = embedding_array.tobytes()

# Use your global client if desired; here we'll use the client for a one-off query.
db = Connector.Connector(host="eugenevuong-5t9xqiiq.farm0000.cloud.aperturedata.io",
                         user="admin",
                         password="!hackhayward2025!")
descriptor_set_name = "video_search"

# Build a query to add the descriptor set
descriptor_set_name = "video_search"

q = [{
    "AddDescriptorSet": {
        "name": descriptor_set_name,
        "dimensions": 768,  # Set this to match the dimension of your embedding vectors.
        "engine": "Flat",   # Or your preferred engine.
        "metric": "L2",
        "properties": {
            "source": "Video Captions",
            "model": "embed-english-v3.0",  # Update this if your model is different.
            "provider": "together"           # Indicates the embedding provider.
        }
    }
}]

responses, blobs = db.query(q)
db.print_last_response()


if __name__ == "__main__":
    query_text = "I expect a package delivery"
    responses, blobs = search_video_by_text(query_text, k_neighbors=5)
    print("Search Results:", responses)
