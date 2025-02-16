"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Camera,
  AlertCircle,
  MessageSquare,
  Grid,
  Wifi,
  WifiOff,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat-interface";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  Constants,
} from "@videosdk.live/react-sdk";

interface Stream {
  id: string;
  name: string;
  thumbnail?: string;
}

const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIzNjE1MTIzNi0zZDRjLTQwZGQtYjYzYy04MjJmN2JlNjE4MTQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczOTY4Mzg2NywiZXhwIjoxODk3NDcxODY3fQ.iuMlIS-8c7eoh_0ZrtT50d-gSPg3AaZKSjOUa1I5wFY";

const formatMeetingId = (id: string) => {
  return id.toLowerCase().replace(/[^a-z0-9-]/g, "");
};

// Helper functions inserted here
function LSContainer({
  streamId,
  onLeave,
  onSnapshot,
}: {
  streamId: string;
  onLeave: () => void;
  onSnapshot: (streamId: string, dataUrl: string) => void;
}) {
  const { join, meeting } = useMeeting({
    onMeetingJoined: () => console.log("Joined meeting:", streamId),
    onMeetingLeft: onLeave,
    onError: (error) => console.error("Meeting error:", error),
  });

  useEffect(() => {
    if (!meeting) {
      join();
    }
  }, [join, meeting]);

  return meeting ? (
    <StreamView streamId={streamId} onSnapshot={onSnapshot} />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
      <p>Initializing connection...</p>
    </div>
  );
}

function Participant({
  participantId,
  streamId,
  onSnapshot,
}: {
  participantId: string;
  streamId: string;
  onSnapshot: (streamId: string, dataUrl: string) => void;
}) {
  const { webcamStream, micStream, webcamOn, micOn, displayName } =
    useParticipant(participantId);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && webcamStream && webcamOn) {
      videoRef.current.srcObject = new MediaStream([webcamStream.track]);
      videoRef.current.play().catch(console.error);
      const snapshotTimer = setTimeout(() => {
        captureSnapshot();
      }, 2000);
      return () => clearTimeout(snapshotTimer);
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (audioRef.current && micStream && micOn) {
      audioRef.current.srcObject = new MediaStream([micStream.track]);
      audioRef.current.play().catch(console.error);
    }
  }, [micStream, micOn]);

  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      onSnapshot(streamId, canvas.toDataURL("image/jpeg", 0.8));
    }
  };

  return (
    <div className="relative w-full h-full min-h-[300px] bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
      <audio ref={audioRef} autoPlay />
      {webcamOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          data-participant={participantId}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-neutral-500">Camera Off</p>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white">
        <p className="text-sm">
          {displayName} {micOn && "🎤"}
        </p>
      </div>
    </div>
  );
}

function StreamView({
  streamId,
  onSnapshot,
}: {
  streamId: string;
  onSnapshot: (streamId: string, dataUrl: string) => void;
}) {
  const { participants } = useMeeting();
  const participantArray = Array.from(participants.values());
  const snapshotInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    snapshotInterval.current = setInterval(() => {
      const firstParticipant = participantArray[0];
      if (firstParticipant) {
        const videoElement = document.querySelector<HTMLVideoElement>(
          `video[data-participant="${firstParticipant.id}"]`
        );
        if (videoElement) {
          const canvas = document.createElement("canvas");
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          canvas.getContext("2d")?.drawImage(videoElement, 0, 0);
          onSnapshot(streamId, canvas.toDataURL("image/jpeg", 0.8));
        }
      }
    }, 10000);
    return () => {
      if (snapshotInterval.current) {
        clearInterval(snapshotInterval.current);
      }
    };
  }, [participantArray, onSnapshot, streamId]);

  if (participantArray.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
        <div className="text-neutral-500 text-center p-4">
          <p>Waiting for stream to start...</p>
          <p className="text-sm mt-2">No active participants in the stream</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-1 gap-4 p-4">
      {participantArray
        .filter((p) => p.mode === Constants.modes.SEND_AND_RECV)
        .map((p) => (
          <Participant
            key={p.id}
            participantId={p.id}
            streamId={streamId}
            onSnapshot={onSnapshot}
          />
        ))}
    </div>
  );
}

// End of helper functions block

export default function SecurityDashboard() {
  const [selectedStreams, setSelectedStreams] = useState<Stream[]>([]);
  const [streamInput, setStreamInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [availableStreams, setAvailableStreams] = useState<Stream[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const [alerts, setAlerts] = useState([
    { id: 1, message: "Movement detected in Zone A", time: "2 mins ago" },
    { id: 2, message: "Person jumping in Zone B", time: "5 mins ago" },
  ]);

  // NEW STATE FOR ACTIONS
  const [actionInput, setActionInput] = useState("");
  const [actions, setActions] = useState<{ id: number; description: string }[]>(
    []
  );

  const addAction = () => {
    if (!actionInput.trim()) return;
    const newAction = { id: Date.now(), description: actionInput.trim() };
    setActions((prev) => [...prev, newAction]);
    setActionInput("");
  };

  const removeAction = (id: number) => {
    setActions((prev) => prev.filter((action) => action.id !== id));
  };

  const connectToStream = () => {
    if (!streamInput.trim()) {
      alert("Please enter a stream ID");
      return;
    }

    const formattedId = formatMeetingId(streamInput);

    if (selectedStreams.some((s) => s.id === formattedId)) {
      alert("This stream is already connected");
      return;
    }

    const existingStream = availableStreams.find((s) => s.id === formattedId);
    const stream = existingStream || {
      id: formattedId,
      name: `Stream ${formattedId}`,
    };

    setSelectedStreams((prev) => [...prev, stream]);

    if (!existingStream) {
      setAvailableStreams((prev) => [...prev, stream]);
    }
  };

  const disconnectStream = (streamId: string) => {
    setSelectedStreams((prev) => prev.filter((s) => s.id !== streamId));
  };

  const addNewStream = () => {
    const newStreamId = `stream${availableStreams.length + 1}`;
    const newStream: Stream = {
      id: newStreamId,
      name: `New Stream ${availableStreams.length + 1}`,
    };
    setAvailableStreams((prev) => [...prev, newStream]);
  };

  const onStreamLeave = () => {
    setIsConnected(false);
    setSelectedStreams([]);
  };

  const updateThumbnail = (streamId: string, dataUrl: string) => {
    setAvailableStreams((prev) =>
      prev.map((stream) =>
        stream.id === streamId ? { ...stream, thumbnail: dataUrl } : stream
      )
    );
  };

  return (
    <div className="flex h-screen bg-white dark:bg-neutral-950">
      {/* Main Content */}
      <div className="flex flex-col flex-1 p-6 gap-6">
        {/* Stream Connection */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Enter stream ID"
                value={streamInput}
                onChange={(e) => setStreamInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={connectToStream}>Connect</Button>
              <Badge
                variant={selectedStreams.length > 0 ? "default" : "secondary"}
                className="gap-1"
              >
                {selectedStreams.length > 0 ? (
                  <>{selectedStreams.length} streams connected</>
                ) : (
                  <>No streams connected</>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Primary Camera View */}
        <Card className="flex-1">
          <CardHeader className="bg-red-500 text-neutral-50 dark:bg-red-900 dark:text-neutral-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Active Streams ({selectedStreams.length})
              </CardTitle>
              <Badge variant="secondary">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 relative h-[calc(100%-4rem)]">
            {selectedStreams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full overflow-y-auto">
                {selectedStreams.map((stream) => (
                  <Card key={stream.id} className="relative h-64">
                    <MeetingProvider
                      config={{
                        meetingId: stream.id,
                        micEnabled: false,
                        webcamEnabled: false,
                        name: `${stream.name} Viewer`,
                        mode: Constants.modes.RECV_ONLY as "RECV_ONLY",
                        debugMode: true,
                      }}
                      token={authToken}
                    >
                      <LSContainer
                        streamId={stream.id}
                        onLeave={() => disconnectStream(stream.id)}
                        onSnapshot={updateThumbnail}
                      />
                    </MeetingProvider>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => disconnectStream(stream.id)}
                    >
                      Disconnect
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center dark:bg-neutral-800">
                <div className="text-neutral-500 dark:text-neutral-400">
                  No active streams
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Action Input */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              <Input
                placeholder="What should I look at? (e.g. 'Alert me if someone jumps')"
                className="pl-10 mb-2"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && actionInput.trim() !== "") {
                    e.preventDefault();
                    addAction();
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
              <Button onClick={addAction} className="mb-2">
                Add Action
              </Button>
              {actions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary">
                      Actions ({actions.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {actions.map((action) => (
                      <DropdownMenuItem
                        key={action.id}
                        onSelect={() => removeAction(action.id)}
                      >
                        <span>{action.description}</span>
                        <Trash2 className="ml-auto h-4 w-4 text-red-500" />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <Card className="w-96 border-l rounded-none">
        <Tabs defaultValue="monitoring" className="h-full flex flex-col">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monitoring">
                <Grid className="h-4 w-4 mr-2" />
                Monitoring
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="alerts">
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <TabsContent value="monitoring" className="h-full">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Available Streams</h3>
                <div className="grid grid-cols-2 gap-2">
                  {availableStreams.map((stream) => (
                    <button
                      key={stream.id}
                      onClick={() => {
                        if (selectedStreams.some((s) => s.id === stream.id)) {
                          alert("This stream is already connected");
                          return;
                        }
                        setSelectedStreams((prev) => [...prev, stream]);
                        setStreamInput(stream.id);
                      }}
                      className={`relative aspect-video bg-muted rounded-lg overflow-hidden hover:ring-2 hover:ring-ring ${
                        selectedStreams.some((s) => s.id === stream.id)
                          ? "ring-2 ring-neutral-900 dark:ring-neutral-50"
                          : ""
                      }`}
                    >
                      <img
                        src={
                          stream.thumbnail ||
                          `/placeholder.svg?height=120&width=160&text=${stream.name}`
                        }
                        alt={`${stream.name} Thumbnail`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 text-xs bg-white/80 px-2 py-1 rounded dark:bg-neutral-950/80">
                        {stream.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="chat" className="h-full border-0 m-0 p-0">
              <ChatInterface />
            </TabsContent>
            <TabsContent value="alerts" className="h-full">
              <div className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-900" />
                  Recent Alerts
                </h3>
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="mb-4 pb-4 border-b last:border-b-0"
                    >
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {alert.time}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
