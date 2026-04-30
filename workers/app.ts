import { Hono } from "hono";
import { createRequestHandler } from "react-router";
export { ChatRoom } from './do/chat-room';

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const reactRequestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

const app = new Hono<{Bindings: Env}>();

app.get("/ws/chat/:roomId", async (c) => {
  if (c.req.header("upgrade") !== "websocket") {
    return c.text("Not a websocket request", 426);
  }

  const { roomId } = c.req.param();

  return c.env.CHAT_ROOM.getByName(roomId).fetch(c.req.raw);
});

app.all("*", async (c) => {
  return reactRequestHandler(c.req.raw, {
    cloudflare: { env: c.env, ctx: c.executionCtx },
  });
});

export default app;
