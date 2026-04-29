import type { Route } from "./+types/api.whep-proxy";

export async function action({ request, context }: Route.ActionArgs) {
  const { CF_ACCOUNT_ID, CF_API_TOKEN } = context.cloudflare.env;
  const url = new URL(request.url);
  const inputId = url.searchParams.get("inputId");

  if (!inputId) {
    return new Response("Missing inputId", { status: 400 });
  }

  // Pobierz WHEP URL dla tego live input z Cloudflare API
  const metaResp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/live_inputs/${inputId}`,
    {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    }
  );

  if (!metaResp.ok) {
    return new Response("Live input not found", { status: 404 });
  }

  const { result } = (await metaResp.json()) as {
    result: { webRTCPlayback: { url: string } };
  };

  const whepUrl = result.webRTCPlayback.url;

  // Przekaż żądanie SDP do WHEP endpoint Cloudflare
  const sdp = await request.text();
  const whepResp = await fetch(whepUrl, {
    method: "POST",
    headers: { "Content-Type": "application/sdp" },
    body: sdp,
  });

  const answerSdp = await whepResp.text();
  return new Response(answerSdp, {
    status: whepResp.status,
    headers: { "Content-Type": "application/sdp" },
  });
}
