type ChatMessage = {
  id: string;
  author: string;
  text: string;
  time: string;
};

const MOCK_MESSAGES: ChatMessage[] = [
  { id: "1", author: "anna", text: "Cześć wszystkim 👋", time: "20:01" },
  { id: "2", author: "kuba_dev", text: "Słychać i widać dobrze", time: "20:02" },
  { id: "3", author: "marta", text: "Skąd dziś transmisja?", time: "20:02" },
  { id: "4", author: "piotr", text: "Z biura w Warszawie", time: "20:03" },
  { id: "5", author: "ola", text: "Świetna jakość obrazu!", time: "20:03" },
  { id: "6", author: "tomek", text: "Czy będzie nagranie?", time: "20:04" },
  { id: "7", author: "kasia", text: "Pozdrawiam z Krakowa", time: "20:04" },
  { id: "8", author: "michal", text: "Pierwszy raz oglądam, fajne!", time: "20:05" },
  { id: "9", author: "ewa", text: "Można podbić dźwięk?", time: "20:05" },
  { id: "10", author: "rafal", text: "U mnie OK", time: "20:06" },
  { id: "11", author: "natalia", text: "🔥🔥🔥", time: "20:06" },
  { id: "12", author: "bartek", text: "Powodzenia!", time: "20:07" },
];

export function LiveChat() {
  return (
    <aside className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden h-full min-h-[400px]">
      <header className="px-4 py-3 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-100">Czat na żywo</h2>
      </header>

      <ul className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {MOCK_MESSAGES.map((msg) => (
          <li key={msg.id} className="text-sm leading-relaxed">
            <span className="text-neutral-500 mr-2 tabular-nums text-xs">
              {msg.time}
            </span>
            <span className="font-medium text-indigo-400 mr-1">
              {msg.author}
            </span>
            <span className="text-neutral-200">{msg.text}</span>
          </li>
        ))}
      </ul>

      <form
        className="flex gap-2 p-3 border-t border-neutral-800"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="text"
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
