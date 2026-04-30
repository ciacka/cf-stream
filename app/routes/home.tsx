import { Link } from "react-router";
import type { Route } from "./+types/home";

const PLACEHOLDER_MEETING_ID = "abc-defg-hij";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "cf-stream" },
    { name: "description", content: "Streamuj na żywo w sekundę" },
  ];
}

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-xl flex flex-col items-center text-center gap-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-semibold tracking-tight">cf-stream</h1>
          <p className="text-lg text-neutral-400">
            Streamuj na żywo w sekundę
          </p>
        </div>

        <Link
          to={`/${PLACEHOLDER_MEETING_ID}`}
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          Rozpocznij streaming
        </Link>

        <div className="w-full flex items-center gap-4 text-neutral-500 text-sm">
          <div className="flex-1 h-px bg-neutral-800" />
          <span>lub</span>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        <form
          className="w-full flex gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            placeholder="Wpisz kod spotkania"
            className="flex-1 px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-medium transition-colors"
          >
            Dołącz
          </button>
        </form>
      </div>
    </main>
  );
}
