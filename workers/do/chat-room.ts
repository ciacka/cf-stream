import { DurableObject } from "cloudflare:workers";

export class ChatRoom extends DurableObject {
    sessions: Map<WebSocket, Record<string, string>>;

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        this.sessions = new Map();

        this.ctx.getWebSockets().forEach((ws) => {
          let wsState = ws.deserializeAttachment() ?? {};
          this.sessions.set(ws, wsState);
        });

        this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
    }

    async fetch(request: Request): Promise<Response> {
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);

        this.ctx.acceptWebSocket(server);
        this.sessions.set(server, {});

        return new Response(null, { status: 101, webSocket: client });
    }

    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
        this.sessions.forEach((state, session) => {
            if (session == ws) return;
            session.send(message);
        });
    }

    async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
        console.error("WebSocket error:", error);
    }

    async webSocketClose(ws: WebSocket): Promise<void> {
      this.sessions.delete(ws);
    }    
}