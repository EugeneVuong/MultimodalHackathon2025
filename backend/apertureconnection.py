from aperturedb import Connector as Connector
from aperturedb.CommonLibrary import create_connector

# # Create the connector for ApertureDB
client = create_connector()
query = [{
    "GetStatus": {
    }
}]

# Execute the query to get back a JSON response for GetStatus 
response, blobs = client.query(query)

client.print_last_response()

# db = Connector.Connector(host="ai-agent-event-bl3gp0gk.farm0000.cloud.aperturedata.io",
#                          user="admin",
#                          password="Calstateeastbay25!")

# query = [{ "GetStatus": {}}]


# response, _ = db.query(query)

# db.print_last_response()


def add_video_to_aperture(file_path: str, video_properties: dict):
    """
    Upload a video file to ApertureDB using a JSON query.

    Parameters:
        client: The ApertureDB client instance.
        file_path (str): Local path to the video file.
        video_properties (dict): A dictionary containing video metadata. Example:
            {
                "name": "crepe_flambe",
                "id": 45,
                "category": "dessert",
                "cuisine": "French",
                "location": "Brittany",
                "caption": "Special Brittany flambe crepe"
            }
    
    Returns:
        response, blobs: The response from ApertureDB and any binary data processed.
    """
    # Build the JSON query dynamically
    query = [{
        "AddVideo": {
            "properties": video_properties,
            "if_not_found": {
                "id": ["==", video_properties.get("id")]
            }
        }
    }]

    # Read the video file as a binary blob
    with open(file_path, 'rb') as fd:
        video_blob = fd.read()

    array = [video_blob]

    # Execute the query
    response, blobs = client.query(query, array)
    client.print_last_response()
    return response, blobs
