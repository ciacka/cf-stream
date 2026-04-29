import { useParams } from "react-router";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/live";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { CF_ACCOUNT_ID, CF_API_TOKEN } = context.cloudflare.env;
  const { inputId } = params;

  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/live_inputs/${inputId}`,
    { headers: { Authorization: `Bearer ${CF_API_TOKEN}` } }
  );

  if (!resp.ok) {
    throw new Response("Live input not found", { status: 404 });
  }

  const { result } = (await resp.json()) as {
    result: { uid: string; webRTCPlayback: { url: string } };
  };

  // Wyciągnij customer code z domeny: customer-<CODE>.cloudflarestream.com
  const match = result.webRTCPlayback.url.match(
    /customer-([a-z0-9]+)\.cloudflarestream\.com/
  );
  const customerCode = match?.[1] ?? "";

  return { inputId: result.uid, customerCode };
}

export default function Live() {
  const { inputId, customerCode } = useLoaderData<typeof loader>();
  const { inputId: paramInputId } = useParams();

  const id = inputId || paramInputId || "";
  const iframeSrc = customerCode
    ? `https://customer-${customerCode}.cloudflarestream.com/${id}/iframe`
    : null;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <h1 className="text-white text-2xl font-semibold mb-6">Na żywo</h1>

      <div className="w-full max-w-2xl" style={{ paddingTop: "56.25%", position: "relative" }}>
        {iframeSrc ? (
          <iframe
            src={iframeSrc}
            style={{
              border: "none",
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "100%",
              borderRadius: "1rem",
            }}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="bg-gray-900 rounded-2xl"
          >
            <p className="text-red-400">Nie udało się załadować playera.</p>
          </div>
        )}
      </div>
    </div>
  );
}
