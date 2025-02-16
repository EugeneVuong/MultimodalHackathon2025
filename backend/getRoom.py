import requests

def get_rooms():
    url = "https://api.videosdk.live/v2/rooms?page=1&perPage=20"
    headers = {
        'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIzNjE1MTIzNi0zZDRjLTQwZGQtYjYzYy04MjJmN2JlNjE4MTQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczOTY0OTUyOCwiZXhwIjoxODk3NDM3NTI4fQ.Tj27YZqz-bJHjlgWe0OpJD90Cw8CMmuKs1ZZHlXAaQM',
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
    # print(get_rooms())
    print(get_participants("sw7c-v3za-mhu7"))