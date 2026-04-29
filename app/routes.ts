import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("broadcast", "routes/broadcast.tsx"),
  route("live/:inputId", "routes/live.tsx"),
  route("api/create-live-input", "routes/api.create-live-input.ts"),
  route("api/whep-proxy", "routes/api.whep-proxy.ts"),
] satisfies RouteConfig;
