import os
import json
from dotenv import load_dotenv
from aperturedb import Connector as Connector
from aperturedb.CommonLibrary import create_connector

# Load environment variables
load_dotenv()

# Parse the JSON configuration from the environment variable
aperturedb_json_str = os.getenv("APERTUREDB_JSON")
if aperturedb_json_str is None:
    raise ValueError("APERTUREDB_JSON environment variable is not set")

try:
    aperturedb_config = json.loads(aperturedb_json_str)
except json.JSONDecodeError as e:
    raise ValueError(f"Error parsing APERTUREDB_JSON: {e}")

# Print configuration for debugging
print("ApertureDB Configuration:", aperturedb_config)

# Create the connector for ApertureDB using the parsed configuration
client = create_connector(aperturedb_config)

# Example query to get the status of the database
query = [{
    "GetStatus": {}
}]

# Execute the query to get back a JSON response for GetStatus 
try:
    response, blobs = client.query(query)
    client.print_last_response()
except Exception as e:
    print("Error executing query:", e)