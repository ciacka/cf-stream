import { data } from "react-router";
import type { Route } from "./+types/api.create-live-input";

export async function action({ context }: Route.ActionArgs) {
  const { CF_ACCOUNT_ID, CF_API_TOKEN } = context.cloudflare.env;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/live_inputs`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta: { name: `broadcast-${Date.now()}` },
        recording: { mode: "automatic" },
      }),
    }
  );

  if (!response.ok) {
    throw data({ error: "Błąd tworzenia live input" }, { status: 502 });
  }

  const { result } = (await response.json()) as {
    result: {
      uid: string;
      webRTC: { url: string };
      webRTCPlayback: { url: string };
    };
  };

  return data({
    inputId: result.uid,
    whipUrl: result.webRTC.url,
    whepUrl: result.webRTCPlayback.url,
  });
}
