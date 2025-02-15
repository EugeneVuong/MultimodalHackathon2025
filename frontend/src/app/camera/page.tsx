"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  MeetingProvider,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";

const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIzNjE1MTIzNi0zZDRjLTQwZGQtYjYzYy04MjJmN2JlNjE4MTQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczOTY0OTUyOCwiZXhwIjoxODk3NDM3NTI4fQ.Tj27YZqz-bJHjlgWe0OpJD90Cw8CMmuKs1ZZHlXAaQM"; // Replace with your actual token

// Creating the Stream
const createStream = async ({ token }) => {
  try {
    const res = await fetch("https://api.videosdk.live/v2/rooms", {
      method: "POST",
      headers: {
        authorization: `${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    return data.roomId;
  } catch (error) {
    console.error("Failed to create stream:", error);
    throw error;
  }
};

function StreamView({ streamId }) {
  const { participants } = useMeeting();

  return (
    <div>
      {[...participants.values()].map((p) => (
        <Participant participantId={p.id} key={p.id} streamId={streamId} />
      ))}
    </div>
  );
}

function Participant({ participantId, streamId }) {
  const { webcamStream, micStream, webcamOn, micOn, isLocal } =
    useParticipant(participantId);

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // Setup stream for audio/video elements
  const setupStream = (stream, ref, condition) => {
    if (ref.current && stream) {
      ref.current.srcObject = condition
        ? new MediaStream([stream.track])
        : null;
      condition && ref.current.play().catch(console.error);
    }
  };

  // Update mic stream when mic is on/off
  useEffect(() => setupStream(micStream, audioRef, micOn), [micStream, micOn]);
  // Update webcam stream when webcam is on/off
  useEffect(
    () => setupStream(webcamStream, videoRef, webcamOn),
    [webcamStream, webcamOn]
  );

  return (
    <div className="min-h-screen w-full">
      <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded">
        <p>Stream ID: {streamId}</p>
        <p>Mic: {micOn ? "ON" : "OFF"}</p>
        <p>Camera: {webcamOn ? "ON" : "OFF"}</p>
      </div>
      <LSControls />
      {micOn && <audio ref={audioRef} autoPlay muted={isLocal} />}
      {webcamOn && (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          className="w-full h-screen object-cover"
        />
      )}
    </div>
  );
}

function LSControls() {
  const { leave, toggleMic, toggleWebcam } = useMeeting();
  const router = useRouter();

  const handleToggleWebcam = async () => {
    try {
      await toggleWebcam();
    } catch (error) {
      console.error("Error toggling webcam:", error);
    }
  };

  const handleLeave = async () => {
    try {
      await leave();
      await router.push("/results");
    } catch (error) {
      console.error("Error toggling mic:", error);
    }
  };

  const handleToggleMic = async () => {
    try {
      await toggleMic();
    } catch (error) {
      console.error("Error toggling mic:", error);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-[10px] z-10">
      <button
        className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
        onClick={handleLeave}
      >
        Leave
      </button>
      <button
        className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
        onClick={handleToggleMic}
      >
        Toggle Mic
      </button>
      <button
        className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
        onClick={handleToggleWebcam}
      >
        Toggle Camera
      </button>
    </div>
  );
}

function LSContainer({ streamId, onLeave }) {
  const [joined, setJoined] = useState(false);

  const { join } = useMeeting({
    onMeetingJoined: () => setJoined(true),
    onMeetingLeft: onLeave,
    onError: (error) => alert(error.message),
  });

  return (
    <div className="">
      {joined ? (
        <StreamView streamId={streamId} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <button
            className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
            onClick={join}
          >
            Start Streaming
          </button>
        </div>
      )}
    </div>
  );
}

export default function LiveStreamer() {
  const [streamId, setStreamId] = useState(null);

  const initializeStream = async () => {
    try {
      const newStreamId = await createStream({ token: authToken });
      setStreamId(newStreamId);
    } catch (error) {
      console.error("Error initializing stream:", error);
    }
  };

  // Automatically initialize the stream when the component mounts
  useEffect(() => {
    initializeStream();
  }, []);

  const onStreamLeave = () => setStreamId(null);

  // Display a loader until the stream is created
  if (!streamId) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-screen gap-5 p-5rounded-lg shadow">
        <p>Creating live stream...</p>
      </div>
    );
  }

  return (
    <MeetingProvider
      config={{
        meetingId: streamId,
        micEnabled: true,
        webcamEnabled: true,
        name: "Live Streamer",
        mode: "SEND_AND_RECV",
        debugMode: false,
      }}
      token={authToken}
    >
      <LSContainer streamId={streamId} onLeave={onStreamLeave} />
    </MeetingProvider>
  );
}
