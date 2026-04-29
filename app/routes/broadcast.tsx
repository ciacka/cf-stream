import { useEffect, useRef, useState } from "react";

async function startWhipStream(
  whipUrl: string,
  mediaStream: MediaStream
): Promise<RTCPeerConnection> {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
  });

  mediaStream.getTracks().forEach((track) => pc.addTrack(track, mediaStream));

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // Vanilla ICE: czekamy na kompletne SDP z kandydatami przed wysłaniem do WHIP
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("ICE gathering timeout")),
      10_000
    );
    if (pc.iceGatheringState === "complete") {
      clearTimeout(timeout);
      resolve();
      return;
    }
    pc.addEventListener("icegatheringstatechange", () => {
      if (pc.iceGatheringState === "complete") {
        clearTimeout(timeout);
        resolve();
      }
    });
  });

  const resp = await fetch(whipUrl, {
    method: "POST",
    headers: { "Content-Type": "application/sdp" },
    body: pc.localDescription!.sdp,
  });

  if (!resp.ok) {
    pc.close();
    throw new Error(`WHIP negotiation failed: ${resp.status}`);
  }

  const answerSdp = await resp.text();
  await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
  return pc;
}

type CameraStatus = "idle" | "loading" | "active" | "error";
type StreamStatus = "off" | "connecting" | "live" | "error";

export default function Broadcast() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [cameraError, setCameraError] = useState<string>("");
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("off");
  const [streamError, setStreamError] = useState<string>("");
  const [inputId, setInputId] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      setCameraError("Twoja przeglądarka nie obsługuje dostępu do kamery.");
      setCameraStatus("error");
      return;
    }

    setCameraStatus("loading");

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const hasVideo = devices.some((d) => d.kind === "videoinput");
        const hasAudio = devices.some((d) => d.kind === "audioinput");
        return navigator.mediaDevices.getUserMedia({
          video: hasVideo,
          audio: hasAudio,
        });
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraStatus("active");
      })
      .catch((err: Error) => {
        console.error("getUserMedia error", err.name, err.message, err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError(
            "Brak dostępu do kamery lub mikrofonu. Zezwól na dostęp w ustawieniach przeglądarki."
          );
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setCameraError(
            "Nie znaleziono kamery lub mikrofonu. Sprawdź czy urządzenie jest podłączone i nie jest używane przez inną aplikację."
          );
        } else {
          setCameraError(`Błąd: ${err.message}`);
        }
        setCameraStatus("error");
      });

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, []);

  async function handleGoLive() {
    if (!streamRef.current) return;
    setStreamStatus("connecting");
    setStreamError("");
    try {
      const resp = await fetch("/api/create-live-input", {
        method: "POST",
      });
      if (!resp.ok) throw new Error("Błąd serwera przy tworzeniu live input");
      const { whipUrl, inputId: id } = (await resp.json()) as {
        whipUrl: string;
        whepUrl: string;
        inputId: string;
      };
      setInputId(id);
      const pc = await startWhipStream(whipUrl, streamRef.current);
      pcRef.current = pc;
      pc.addEventListener("connectionstatechange", () => {
        if (pc.connectionState === "connected") setStreamStatus("live");
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          setStreamStatus("error");
          setStreamError("Połączenie WHIP zerwane.");
        }
      });
      if (pc.connectionState === "connected") setStreamStatus("live");
    } catch (err) {
      setStreamError(err instanceof Error ? err.message : "Nieznany błąd");
      setStreamStatus("error");
    }
  }

  function handleStopStream() {
    pcRef.current?.close();
    pcRef.current = null;
    setStreamStatus("off");
    setInputId("");
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <h1 className="text-white text-2xl font-semibold mb-6">Broadcast</h1>

      <div className="w-full max-w-2xl aspect-video bg-gray-900 rounded-2xl overflow-hidden relative flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {cameraStatus === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <p className="text-gray-400">Uzyskiwanie dostępu do kamery...</p>
          </div>
        )}

        {cameraStatus === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <p className="text-gray-500">Inicjalizacja...</p>
          </div>
        )}

        {cameraStatus === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6">
            <p className="text-red-400 text-center">{cameraError}</p>
          </div>
        )}

        {cameraStatus === "active" && streamStatus === "live" && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-medium">LIVE</span>
          </div>
        )}
      </div>

      {cameraStatus === "active" && (
        <div className="mt-4 flex flex-col items-center gap-3 w-full max-w-2xl">
          {streamStatus === "off" && (
            <button
              onClick={handleGoLive}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Idź na żywo
            </button>
          )}

          {streamStatus === "connecting" && (
            <p className="text-gray-400 animate-pulse">
              Nawiązywanie połączenia...
            </p>
          )}

          {streamStatus === "live" && (
            <>
              <button
                onClick={handleStopStream}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                Zatrzymaj stream
              </button>
              {inputId && (
                <div className="w-full bg-gray-900 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Link dla widzów:</p>
                  <a
                    href={`/live/${inputId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all font-mono underline"
                  >
                    {typeof window !== "undefined" ? `${window.location.origin}/live/${inputId}` : `/live/${inputId}`}
                  </a>
                </div>
              )}
            </>
          )}

          {streamStatus === "error" && (
            <>
              <p className="text-red-400 text-sm">{streamError}</p>
              <button
                onClick={() => setStreamStatus("off")}
                className="px-4 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Spróbuj ponownie
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
