// // "use client";

// // import React, { useEffect, useRef, useState } from "react";
// // import {
// //   MeetingProvider,
// //   useMeeting,
// //   useParticipant,
// //   Constants,
// // } from "@videosdk.live/react-sdk";

// // const authToken =
// //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIzNjE1MTIzNi0zZDRjLTQwZGQtYjYzYy04MjJmN2JlNjE4MTQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczOTY0OTUyOCwiZXhwIjoxODk3NDM3NTI4fQ.Tj27YZqz-bJHjlgWe0OpJD90Cw8CMmuKs1ZZHlXAaQM"; // Token from VideoSDK dashboard

// // // API call to create meeting
// // const createStream = async ({ token }: { token: string }) => {
// //   try {
// //     const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
// //       method: "POST",
// //       headers: {
// //         authorization: `${token}`,
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify({}),
// //     });
// //     const data = await res.json();
// //     return data.roomId;
// //   } catch (error) {
// //     console.error("Failed to create stream:", error);
// //     throw error;
// //   }
// // };

// // // Join Screen - Handles joining or creating a stream
// // function JoinView({ initializeStream, setMode }) {
// //   const [streamId, setStreamId] = useState("");

// //   const handleAction = async (mode) => {
// //     setMode(mode);
// //     await initializeStream(streamId);
// //   };

// //   return (
// //     <div className="flex flex-col items-center justify-center text-center h-screen gap-5 p-5 bg-white rounded-lg shadow">
// //       <button
// //         className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
// //         onClick={() => handleAction(Constants.modes.SEND_AND_RECV)}
// //       >
// //         Create Live Stream as Host
// //       </button>
// //       <input
// //         type="text"
// //         placeholder="Enter Stream Id"
// //         className="w-3/5 p-2.5 border border-gray-300 rounded-md"
// //         onChange={(e) => setStreamId(e.target.value)}
// //       />
// //       <button
// //         className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
// //         onClick={() => handleAction(Constants.modes.SEND_AND_RECV)}
// //       >
// //         Join as Host
// //       </button>
// //       <button
// //         className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
// //         onClick={() => handleAction(Constants.modes.RECV_ONLY)}
// //       >
// //         Join as Audience
// //       </button>
// //     </div>
// //   );
// // }

// // // Component to manage live stream container and session joining
// // function LSContainer({ streamId, onLeave }) {
// //   const [joined, setJoined] = useState(false);

// //   const { join } = useMeeting({
// //     onMeetingJoined: () => setJoined(true),
// //     onMeetingLeft: onLeave,
// //     onError: (error) => alert(error.message),
// //   });

// //   return (
// //     <div className="flex flex-col items-center justify-center text-center h-screen gap-5 p-5 bg-white rounded-lg shadow">
// //       <h3>Stream Id: {streamId}</h3>
// //       {joined ? (
// //         <StreamView />
// //       ) : (
// //         <button
// //           className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
// //           onClick={join}
// //         >
// //           Join Stream
// //         </button>
// //       )}
// //     </div>
// //   );
// // }

// // // Component to display the live stream view
// // function StreamView() {
// //   const { participants } = useMeeting();

// //   return (
// //     <div>
// //       <LSControls />
// //       {[...participants.values()]
// //         .filter((p) => p.mode === Constants.modes.SEND_AND_RECV)
// //         .map((p) => (
// //           <Participant participantId={p.id} key={p.id} />
// //         ))}
// //     </div>
// //   );
// // }

// // // Component to render audio and video streams for a participant
// // function Participant({ participantId }) {
// //   const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
// //     useParticipant(participantId);

// //   const audioRef = useRef(null);
// //   const videoRef = useRef(null);

// //   // Function to attach or clear the stream
// //   const setupStream = (stream, ref, condition) => {
// //     if (ref.current && stream) {
// //       ref.current.srcObject = condition
// //         ? new MediaStream([stream.track])
// //         : null;
// //       condition && ref.current.play().catch(console.error);
// //     }
// //   };

// //   useEffect(() => setupStream(micStream, audioRef, micOn), [micStream, micOn]);
// //   useEffect(
// //     () => setupStream(webcamStream, videoRef, webcamOn),
// //     [webcamStream, webcamOn]
// //   );

// //   return (
// //     <div>
// //       <p>
// //         {displayName} | Webcam: {webcamOn ? "ON" : "OFF"} | Mic:{" "}
// //         {micOn ? "ON" : "OFF"}
// //       </p>
// //       <audio
// //         ref={audioRef}
// //         autoPlay
// //         muted={isLocal}
// //         className="my-2.5 rounded-lg"
// //       />
// //       {webcamOn && (
// //         <video
// //           ref={videoRef}
// //           autoPlay
// //           muted={isLocal}
// //           height="200"
// //           width="300"
// //           className="my-2.5 rounded-lg"
// //         />
// //       )}
// //     </div>
// //   );
// // }

// // // Component for managing stream controls
// // function LSControls() {
// //   const { leave, toggleMic, toggleWebcam, changeMode, meeting } = useMeeting();
// //   const currentMode = meeting.localParticipant.mode;

// //   return (
// //     <div className="flex gap-[10px]">
// //       <button
// //         className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
// //         onClick={leave}
// //       >
// //         Leave
// //       </button>
// //       {currentMode === Constants.modes.SEND_AND_RECV && (
// //         <>
// //           <button
// //             className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
// //             onClick={toggleMic}
// //           >
// //             Toggle Mic
// //           </button>
// //           <button
// //             className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
// //             onClick={toggleWebcam}
// //           >
// //             Toggle Camera
// //           </button>
// //         </>
// //       )}
// //       <button
// //         className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
// //         onClick={() =>
// //           changeMode(
// //             currentMode === Constants.modes.SEND_AND_RECV
// //               ? Constants.modes.RECV_ONLY
// //               : Constants.modes.SEND_AND_RECV
// //           )
// //         }
// //       >
// //         {currentMode === Constants.modes.SEND_AND_RECV
// //           ? "Switch to Audience Mode"
// //           : "Switch to Host Mode"}
// //       </button>
// //     </div>
// //   );
// // }

// // // Main App Component - Handles the app flow and live stream lifecycle
// // function App() {
// //   const [streamId, setStreamId] = useState(null);
// //   const [mode, setMode] = useState(Constants.modes.SEND_AND_RECV);

// //   const initializeStream = async (id) => {
// //     const newStreamId = id || (await createStream({ token: authToken }));
// //     setStreamId(newStreamId);
// //   };

// //   const onStreamLeave = () => setStreamId(null);

// //   return authToken && streamId ? (
// //     <MeetingProvider
// //       config={{
// //         meetingId: streamId,
// //         micEnabled: true,
// //         webcamEnabled: true,
// //         name: "John Doe",
// //         mode,
// //       }}
// //       token={authToken}
// //     >
// //       <LSContainer streamId={streamId} onLeave={onStreamLeave} />
// //     </MeetingProvider>
// //   ) : (
// //     <JoinView initializeStream={initializeStream} setMode={setMode} />
// //   );
// // }

// // export default App;

// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import {
//   MeetingProvider,
//   useMeeting,
//   useParticipant,
//   Constants,
// } from "@videosdk.live/react-sdk";

// const authToken = "YOUR_AUTH_TOKEN_HERE"; // Replace with your auth token

// // API call to create a meeting (stream)
// const createStream = async ({ token }) => {
//   try {
//     const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
//       method: "POST",
//       headers: {
//         authorization: token,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({}),
//     });
//     const data = await res.json();
//     return data.roomId;
//   } catch (error) {
//     console.error("Failed to create stream:", error);
//     throw error;
//   }
// };

// // --- Join Screen for Live Streamer ---
// function StreamerJoinView({ initializeStream }) {
//   const [streamId, setStreamId] = useState("");

//   const handleJoin = async () => {
//     // Use SEND_AND_RECV mode for live streaming.
//     await initializeStream(streamId);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center text-center h-screen gap-5 p-5 bg-white rounded-lg shadow">
//       <button
//         className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
//         onClick={handleJoin}
//       >
//         Create/Join Live Stream as Host
//       </button>
//       <input
//         type="text"
//         placeholder="Enter Stream Id (optional)"
//         className="w-3/5 p-2.5 border border-gray-300 rounded-md"
//         onChange={(e) => setStreamId(e.target.value)}
//       />
//     </div>
//   );
// }

// // --- Container to manage joining and leaving the live stream ---
// function LSContainer({ streamId, onLeave }) {
//   const [joined, setJoined] = useState(false);
//   const { join } = useMeeting({
//     onMeetingJoined: () => setJoined(true),
//     onMeetingLeft: onLeave,
//     onError: (error) => alert(error.message),
//   });

//   return (
//     <div className="flex flex-col items-center justify-center text-center h-screen gap-5 p-5 bg-white rounded-lg shadow">
//       <h3>Stream Id: {streamId}</h3>
//       {joined ? (
//         <StreamView />
//       ) : (
//         <button
//           className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
//           onClick={join}
//         >
//           Join Stream as Host
//         </button>
//       )}
//     </div>
//   );
// }

// // --- Main view for the live stream ---
// function StreamView() {
//   const { participants } = useMeeting();

//   return (
//     <div>
//       <StreamerControls />
//       {[...participants.values()]
//         .filter((p) => p.mode === Constants.modes.SEND_AND_RECV)
//         .map((p) => (
//           <Participant key={p.id} participantId={p.id} />
//         ))}
//     </div>
//   );
// }

// // --- Component to render a participant’s audio and video ---
// function Participant({ participantId }) {
//   const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
//     useParticipant(participantId);

//   const audioRef = useRef(null);
//   const videoRef = useRef(null);

//   // Attach or detach the stream based on its availability
//   const setupStream = (stream, ref, condition) => {
//     if (ref.current && stream) {
//       ref.current.srcObject = condition
//         ? new MediaStream([stream.track])
//         : null;
//       condition && ref.current.play().catch(console.error);
//     }
//   };

//   useEffect(() => setupStream(micStream, audioRef, micOn), [micStream, micOn]);
//   useEffect(
//     () => setupStream(webcamStream, videoRef, webcamOn),
//     [webcamStream, webcamOn]
//   );

//   return (
//     <div>
//       <p>
//         {displayName} | Webcam: {webcamOn ? "ON" : "OFF"} | Mic:{" "}
//         {micOn ? "ON" : "OFF"}
//       </p>
//       <audio
//         ref={audioRef}
//         autoPlay
//         muted={isLocal}
//         className="my-2.5 rounded-lg"
//       />
//       {webcamOn && (
//         <video
//           ref={videoRef}
//           autoPlay
//           muted={isLocal}
//           height="200"
//           width="300"
//           className="my-2.5 rounded-lg"
//         />
//       )}
//     </div>
//   );
// }

// // --- Controls for the live streamer (host) ---
// function StreamerControls() {
//   const { leave, toggleMic, toggleWebcam, changeMode, meeting } = useMeeting();
//   const currentMode = meeting.localParticipant.mode;

//   return (
//     <div className="flex gap-2">
//       <button
//         className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer hover:bg-[#0056b3]"
//         onClick={leave}
//       >
//         Leave
//       </button>
//       <button
//         className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer hover:bg-[#0056b3]"
//         onClick={toggleMic}
//       >
//         Toggle Mic
//       </button>
//       <button
//         className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer hover:bg-[#0056b3]"
//         onClick={toggleWebcam}
//       >
//         Toggle Camera
//       </button>
//       <button
//         className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer hover:bg-[#0056b3]"
//         onClick={() =>
//           changeMode(
//             currentMode === Constants.modes.SEND_AND_RECV
//               ? Constants.modes.RECV_ONLY
//               : Constants.modes.SEND_AND_RECV
//           )
//         }
//       >
//         {currentMode === Constants.modes.SEND_AND_RECV
//           ? "Switch to Audience Mode"
//           : "Switch to Host Mode"}
//       </button>
//     </div>
//   );
// }

// // --- Main App Component for Live Streaming ---
// function LiveStreamerApp() {
//   const [streamId, setStreamId] = useState(null);

//   const initializeStream = async (id) => {
//     const newStreamId = id || (await createStream({ token: authToken }));
//     setStreamId(newStreamId);
//   };

//   const onStreamLeave = () => setStreamId(null);

//   return streamId ? (
//     <MeetingProvider
//       config={{
//         meetingId: streamId,
//         micEnabled: true,
//         webcamEnabled: true,
//         name: "Live Streamer",
//         mode: Constants.modes.SEND_AND_RECV,
//       }}
//       token={authToken}
//     >
//       <LSContainer streamId={streamId} onLeave={onStreamLeave} />
//     </MeetingProvider>
//   ) : (
//     <StreamerJoinView initializeStream={initializeStream} />
//   );
// }

// export default LiveStreamerApp;

"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  Constants,
} from "@videosdk.live/react-sdk";

const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIzNjE1MTIzNi0zZDRjLTQwZGQtYjYzYy04MjJmN2JlNjE4MTQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczOTY0OTUyOCwiZXhwIjoxODk3NDM3NTI4fQ.Tj27YZqz-bJHjlgWe0OpJD90Cw8CMmuKs1ZZHlXAaQM"; // Replace with your actual token

const createStream = async ({ token }: { token: string }) => {
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

function Participant({ participantId }) {
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
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
      <audio
        ref={audioRef}
        autoPlay
        muted={isLocal}
        className="my-2.5 rounded-lg"
      />
      {webcamOn && (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          height="200"
          width="300"
          className="my-2.5 rounded-lg"
        />
      )}
    </div>
  );
}

function LSControls() {
  const { leave, toggleMic, toggleWebcam } = useMeeting();

  return (
    <div className="flex gap-[10px]">
      <button
        className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
        onClick={leave}
      >
        Leave
      </button>
      <button
        className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
        onClick={toggleMic}
      >
        Toggle Mic
      </button>
      <button
        className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
        onClick={toggleWebcam}
      >
        Toggle Camera
      </button>
    </div>
  );
}

function StreamView() {
  const { participants } = useMeeting();

  return (
    <div>
      <LSControls />
      {[...participants.values()].map((p) => (
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
      <h3>Stream Id: {streamId}</h3>
      {joined ? (
        <StreamView />
      ) : (
        <button
          className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
          onClick={join}
        >
          Start Streaming
        </button>
      )}
    </div>
  );
}

export default function LiveStreamer() {
  const [streamId, setStreamId] = useState(null);

  const initializeStream = async () => {
    const newStreamId = await createStream({ token: authToken });
    setStreamId(newStreamId);
  };

  const onStreamLeave = () => setStreamId(null);

  return streamId ? (
    <MeetingProvider
      config={{
        meetingId: streamId,
        micEnabled: true,
        webcamEnabled: true,
        name: "Live Streamer",
        mode: Constants.modes.SEND_AND_RECV,
      }}
      token={authToken}
    >
      <LSContainer streamId={streamId} onLeave={onStreamLeave} />
    </MeetingProvider>
  ) : (
    <div className="flex flex-col items-center justify-center text-center h-screen gap-5 p-5 bg-white rounded-lg shadow">
      <button
        className="bg-[#007bff] text-white py-2.5 px-4 rounded-md cursor-pointer transition duration-300 hover:bg-[#0056b3]"
        onClick={initializeStream}
      >
        Create Live Stream
      </button>
    </div>
  );
}
