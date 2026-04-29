import { useEffect, useRef, useState } from "react";

type Status = "idle" | "loading" | "active" | "error";

export default function Broadcast() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      setErrorMessage("Twoja przeglądarka nie obsługuje dostępu do kamery.");
      setStatus("error");
      return;
    }

    setStatus("loading");

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
        setStatus("active");
      })
      .catch((err: Error) => {
        console.error("getUserMedia error", err.name, err.message, err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage("Brak dostępu do kamery lub mikrofonu. Zezwól na dostęp w ustawieniach przeglądarki.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setErrorMessage("Nie znaleziono kamery lub mikrofonu. Sprawdź czy urządzenie jest podłączone i nie jest używane przez inną aplikację.");
        } else {
          setErrorMessage(`Błąd: ${err.message}`);
        }
        setStatus("error");
      });

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

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

        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <p className="text-gray-400">Uzyskiwanie dostępu do kamery...</p>
          </div>
        )}

        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <p className="text-gray-500">Inicjalizacja...</p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6">
            <p className="text-red-400 text-center">{errorMessage}</p>
          </div>
        )}

        {status === "active" && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-medium">LIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
