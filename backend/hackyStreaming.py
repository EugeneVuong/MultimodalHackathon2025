
import asyncio
import base64
import cv2
import numpy as np
import time
from collections import deque
from playwright.async_api import async_playwright  # Ensure you have playwright installed




async def run_screencast(url: str, window_name: str, playwright_instance):
    """
    Launches a browser, navigates to `url`, starts a CDP screencast, and displays
    the live frames in an OpenCV window named `window_name`. It also checks for
    significant movement in the frame and displays "Motion Detected" when large movement is found.
    
    When motion is detected, it saves a video clip that includes the last 5 seconds of video
    (stored in a rolling buffer) and the next 15 seconds of frames after the detection.
    """
    browser = await playwright_instance.chromium.launch(headless=True)
    context = await browser.new_context()
    page = await context.new_page()
    await page.goto(url)

    # Create a CDP session and start the screencast
    session = await context.new_cdp_session(page)
    await session.send("Page.startScreencast", {"format": "png", "quality": 100})

    previous_frame = None  # For motion detection

    # Rolling buffer to hold the last 5 seconds of frames.
    frame_buffer = deque()  # Each element: (timestamp, frame)
    
    # Variables for saving the motion clip.
    recording_mode = False
    recording_start_time = None  # Timestamp when motion was first detected
    clip_frames = []  # Will hold the last 5 sec + next 15 sec (total 20 sec)

    async def handle_screencast_frame(frame):
        nonlocal previous_frame, recording_mode, recording_start_time, clip_frames
        data = frame.get("data")
        session_id = frame.get("sessionId")
        # Acknowledge receipt of the frame
        await session.send("Page.screencastFrameAck", {"sessionId": session_id})
        
        if data:
            # Decode the base64 image data
            img_bytes = base64.b64decode(data)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if frame_img is None:
                return

            # Convert to grayscale and blur for motion detection.
            gray = cv2.cvtColor(frame_img, cv2.COLOR_BGR2GRAY)
            gray = cv2.GaussianBlur(gray, (21, 21), 0)
            
            current_time = time.time()
            # Add the current frame to the rolling buffer.
            frame_buffer.append((current_time, frame_img.copy()))
            # Remove any frames older than 5 seconds.
            while frame_buffer and (current_time - frame_buffer[0][0] > 5):
                frame_buffer.popleft()

            if previous_frame is None:
                previous_frame = gray
            else:
                # Compute the absolute difference between the current frame and previous frame.
                frame_delta = cv2.absdiff(previous_frame, gray)
                # Use a higher threshold (50) to ignore small differences.
                thresh = cv2.threshold(frame_delta, 50, 255, cv2.THRESH_BINARY)[1]
                thresh = cv2.dilate(thresh, None, iterations=2)
                contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                movement_detected = False

                for contour in contours:
                    # Ignore small contours (area threshold increased to 1500).
                    if cv2.contourArea(contour) < 1500:
                        continue
                    movement_detected = True
                    # Draw a bounding box around the region with motion.
                    (x, y, w, h) = cv2.boundingRect(contour)
                    cv2.rectangle(frame_img, (x, y), (x+w, y+h), (0, 255, 0), 2)

                if movement_detected:
                    cv2.putText(frame_img, "Motion Detected", (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    # If not already recording, start recording.
                    if not recording_mode:
                        recording_mode = True
                        recording_start_time = current_time
                        # Preload the clip with the last 5 seconds from the buffer.
                        clip_frames = [f for ts, f in frame_buffer]

                previous_frame = gray

            # If we are recording, append the current frame.
            if recording_mode:
                clip_frames.append(frame_img.copy())
                # Check if 15 seconds have passed since motion detection.
                if current_time - recording_start_time >= 15:
                    # Total clip = 5 sec (pre-motion) + 15 sec (post-motion) = 20 sec.
                    # Save the clip to a video file.
                    out_filename = f"tempVideo/motion_clip_{int(current_time)}.mp4"
                    height, width, _ = frame_img.shape
                    fps = 20.0  # You can adjust FPS based on your actual frame rate.
                    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                    out = cv2.VideoWriter(out_filename, fourcc, fps, (width, height))
                    for clip_frame in clip_frames:
                        out.write(clip_frame)
                    out.release()
                    print(f"Saved motion clip to {out_filename}")
                    # Reset the recording variables.
                    recording_mode = False
                    clip_frames = []

            # Display the frame.
            cv2.imshow(window_name, frame_img)
            # Check if 'q' is pressed to exit.
            if cv2.waitKey(1) & 0xFF == ord("q"):
                await session.send("Page.stopScreencast")
                await browser.close()
                cv2.destroyWindow(window_name)
                raise asyncio.CancelledError()

    # Register the event handler for screencast frames.
    session.on("Page.screencastFrame", handle_screencast_frame)
    # Keep the task running indefinitely.
    await asyncio.Future()  # This future never completes

async def run_two_browsers():
    """
    Runs three browser screencasts concurrently using different URLs and window names.
    If one task stops (e.g. by pressing 'q'), all tasks will be cancelled.
    """
    async with async_playwright() as p:
        tasks = [
            asyncio.create_task(run_screencast("https://example.com", "Browser 1", p)),
            asyncio.create_task(run_screencast("https://www.testufo.com", "Browser 2", p)),
            asyncio.create_task(run_screencast("https://www.testufo.com", "Browser 3", p))
        ]
        done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_EXCEPTION)
        for task in pending:
            task.cancel()

if __name__ == "__main__":
    asyncio.run(run_two_browsers())
