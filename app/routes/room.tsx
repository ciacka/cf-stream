import type { Route } from "./+types/room";
import { LiveChat } from "../components/live-chat";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Pokój ${params.meetingId} — cf-stream` },
    { name: "description", content: "Pokój live streamingu" },
  ];
}

export default function Room({ params }: Route.ComponentProps) {
  const { meetingId } = params;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-4 lg:px-6 lg:py-6">
      <div className="mx-auto max-w-[1600px] grid gap-4 lg:gap-6 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-4">
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center border border-neutral-800">
            <div className="flex flex-col items-center gap-2 text-neutral-600">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-16 h-16"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-sm">Player</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold">Tytuł streamu</h1>
            <p className="text-sm text-neutral-400">
              <span className="inline-flex items-center gap-1.5 mr-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-medium text-red-400">LIVE</span>
              </span>
              <span>kod: {meetingId}</span>
            </p>
          </div>
        </section>

        <div className="lg:h-[calc(100vh-3rem)] lg:sticky lg:top-6">
          <LiveChat currentUser="kuba_dev" />
        </div>
      </div>
    </main>
  );
}
