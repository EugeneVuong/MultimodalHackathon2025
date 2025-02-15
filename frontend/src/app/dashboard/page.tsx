"use client";

import { useEffect, useRef, useState } from "react";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  Constants,
} from "@videosdk.live/react-sdk";

const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIzNjE1MTIzNi0zZDRjLTQwZGQtYjYzYy04MjJmN2JlNjE4MTQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczOTY0OTUyOCwiZXhwIjoxODk3NDM3NTI4fQ.Tj27YZqz-bJHjlgWe0OpJD90Cw8CMmuKs1ZZHlXAaQM"; // Replace with your actual token

function Participant({ participantId }) {
  const { webcamStream, micStream, webcamOn, micOn, displayName } =
    useParticipant(participantId);

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const setupStream = (stream, ref, condition) => {
    if (ref.current && stream) {
      ref.current.srcObject = condition
        ? new MediaStream([stream.track])
        : null;
      condition && ref.current.play().catch(console.error);
    }
  };

  useEffect(() => setupStream(micStream, audioRef, micOn), [micStream, micOn]);
  useEffect(
    () => setupStream(webcamStream, videoRef, webcamOn),
    [webcamStream, webcamOn]
  );

  return (
    <div>
      <p>
        {displayName} | Webcam: {webcamOn ? "ON" : "OFF"} | Mic:{" "}
        {micOn ? "ON" : "OFF"}
      </p>
      <audio ref={audioRef} autoPlay className="my-2.5 rounded-lg" />
      {webcamOn && (
        <video
          ref={videoRef}
          autoPlay
          height="200"
          width="300"
          className="my-2.5 rounded-lg"
        />
      )}
    </div>
  );
}

function StreamView() {
  const { participants } = useMeeting();

  return (
    <div>
      {[...participants.values()]
        .filter((p) => p.mode === Constants.modes.SEND_AND_RECV)
        .map((p) => (
          <Participant participantId={p.id} key={p.id} />
        ))}
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
    <div className="flex flex-col items-center justify-center text-center h-screen gap-5 p-5 bg-white rounded-lg shadow">
      <h3>Viewing Stream: {streamId}</h3>
      {joined ? (
        <StreamView />
      ) : (
        <button
          className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
          onClick={join}
        >
          Join Stream
        </button>
      )}
    </div>
  );
}

export default function Viewer() {
  const [streamId, setStreamId] = useState("");

  const joinStream = () => {
    if (streamId) {
      setStreamId(streamId);
    } else {
      alert("Please enter a valid Stream ID");
    }
  };

  const onStreamLeave = () => setStreamId("");

  return streamId ? (
    <MeetingProvider
      config={{
        meetingId: streamId,
        micEnabled: false,
        webcamEnabled: false,
        name: "Viewer",
        mode: Constants.modes.RECV_ONLY,
      }}
      token={authToken}
    >
      <LSContainer streamId={streamId} onLeave={onStreamLeave} />
    </MeetingProvider>
  ) : (
    <div className="flex flex-col items-center justify-center text-center h-screen gap-5 p-5 bg-white rounded-lg shadow">
      <input
        type="text"
        placeholder="Enter Stream Id"
        className="w-3/5 p-2.5 border border-gray-300 rounded-md"
        onChange={(e) => setStreamId(e.target.value)}
      />
      <button
        className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
        onClick={joinStream}
      >
        Join as Viewer
      </button>
    </div>
  );
}
