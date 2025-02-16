import requests
import json

def get_rooms():
    url = "https://api.videosdk.live/v2/rooms?page=1&perPage=20"
    headers = {
        'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIzNjE1MTIzNi0zZDRjLTQwZGQtYjYzYy04MjJmN2JlNjE4MTQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczOTY4Mzg2NywiZXhwIjoxODk3NDcxODY3fQ.iuMlIS-8c7eoh_0ZrtT50d-gSPg3AaZKSjOUa1I5wFY',
        'Content-Type': 'application/json'
    }
    response = requests.request("GET", url, headers=headers)
    return response.text

def get_participants(sessionId):
    url = f"https://api.videosdk.live/v2/sessions/{sessionId}/participants?page=1&perPage=20"
    headers = {
        'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIzNjE1MTIzNi0zZDRjLTQwZGQtYjYzYy04MjJmN2JlNjE4MTQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczOTY0OTUyOCwiZXhwIjoxODk3NDM3NTI4fQ.Tj27YZqz-bJHjlgWe0OpJD90Cw8CMmuKs1ZZHlXAaQM',
        'Content-Type': 'application/json'
    }
    response = requests.request("GET", url, headers=headers)
    return response.text


if __name__ == "__main__":
    rooms = get_rooms()
    print(json.dumps(json.loads(rooms), indent=2))
