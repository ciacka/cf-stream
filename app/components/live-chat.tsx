import { useState } from "react";
import { useChatWs } from "../hooks/use-chat-ws";

const HOST_AUTHORS: ReadonlySet<string> = new Set(["piotr"]);

export function LiveChat({
  roomId,
  currentUser,
}: {
  roomId: string;
  currentUser?: string;
}) {
  const { messages, send } = useChatWs(roomId, currentUser);
  const [draft, setDraft] = useState("");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    send(text);
    setDraft("");
  };

  return (
    <aside className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden h-full min-h-[400px]">
      <header className="px-4 py-3 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-100">Czat na żywo</h2>
      </header>

      <ul className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => {
          const isHost = HOST_AUTHORS.has(msg.author);
          const isMine = currentUser !== undefined && msg.author === currentUser;

          if (isMine) {
            return (
              <li key={msg.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-indigo-600/20 border border-indigo-500/40 px-3 py-2 text-sm leading-relaxed">
                  {isHost && (
                    <span className="inline-block mr-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-500/20 text-amber-300 uppercase tracking-wide align-middle">
                      HOST
                    </span>
                  )}
                  <span className="text-neutral-100">{msg.text}</span>
                  <span className="ml-2 text-neutral-400 tabular-nums text-xs">
                    {msg.time}
                  </span>
                </div>
              </li>
            );
          }

          return (
            <li key={msg.id} className="text-sm leading-relaxed">
              <span className="text-neutral-500 mr-2 tabular-nums text-xs">
                {msg.time}
              </span>
              {isHost && (
                <span className="inline-block mr-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-500/20 text-amber-300 uppercase tracking-wide align-middle">
                  HOST
                </span>
              )}
              <span
                className={`font-medium mr-1 ${isHost ? "text-amber-300" : "text-indigo-400"}`}
              >
                {msg.author}
              </span>
              <span className="text-neutral-200">{msg.text}</span>
            </li>
          );
        })}
      </ul>

      <form
        className="flex gap-2 p-3 border-t border-neutral-800"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Napisz wiadomość…"
          className="flex-1 px-3 py-2 rounded-md bg-neutral-950 border border-neutral-800 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          Wyślij
        </button>
      </form>
    </aside>
  );
}
