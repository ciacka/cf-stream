import { useCallback, useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  author: string;
  text: string;
  time: string;
};

const PING_INTERVAL_MS = 30_000;

export function useChatWs(roomId: string, currentUser?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(
      `${proto}//${window.location.host}/ws/chat/${roomId}`,
    );
    wsRef.current = ws;

    const pingId = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send("ping");
    }, PING_INTERVAL_MS);

    ws.addEventListener("message", (e) => {
      if (typeof e.data !== "string" || e.data === "pong") return;
      try {
        const msg = JSON.parse(e.data) as ChatMessage;
        setMessages((prev) => [...prev, msg]);
      } catch {
        // ignore non-JSON payloads
      }
    });

    return () => {
      clearInterval(pingId);
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const send = useCallback(
    (text: string) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !currentUser) return;
      const msg: ChatMessage = {
        id: crypto.randomUUID(),
        author: currentUser,
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      ws.send(JSON.stringify(msg));
      setMessages((prev) => [...prev, msg]);
    },
    [currentUser],
  );

  return { messages, send };
}
