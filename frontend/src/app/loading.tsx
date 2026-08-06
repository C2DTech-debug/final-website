const LOADER_CSS = `
  .c2d-line {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    opacity: 0;
    clip-path: inset(0 100% 0 0);
    animation: c2d-type 0.45s steps(24, end) forwards;
  }
  @keyframes c2d-type {
    to { opacity: 1; clip-path: inset(0 0 0 0); }
  }
  .c2d-caret {
    display: inline-block;
    width: 0.55em;
    color: #22d3ee;
    animation: c2d-blink 1s steps(1, end) infinite;
  }
  @keyframes c2d-blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .c2d-bar {
    height: 2px;
    border-radius: 9999px;
    background: linear-gradient(90deg, #8b5cf6, #d946ef, #22d3ee);
    animation: c2d-progress 1.9s ease-in-out infinite;
  }
  @keyframes c2d-progress {
    0% { width: 0%; }
    55% { width: 100%; }
    100% { width: 100%; }
  }
`;

const LINES = [
  { text: "$ next build --prod", className: "text-slate-300", delay: "0s" },
  { text: "> Compiling C2D Tech website...", className: "text-slate-400", delay: "0.35s" },
  { text: "[ok] Fetching content from cloud", className: "text-emerald-400", delay: "0.7s" },
  { text: "[ok] Rendering page components", className: "text-emerald-400", delay: "1.05s" },
  { text: "[ok] Generating static output", className: "text-emerald-400", delay: "1.4s" },
  { text: "-> Page ready", className: "text-cyan-300", delay: "1.75s" },
];

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16" role="status" aria-live="polite">
      <style>{LOADER_CSS}</style>
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-3 font-mono text-xs text-slate-500">c2d-tech -- deploy</span>
        </div>
        <div className="space-y-2 px-4 py-5 font-mono text-sm">
          {LINES.map((line) => (
            <span key={line.text} className={`c2d-line ${line.className}`} style={{ animationDelay: line.delay }}>
              {line.text}
            </span>
          ))}
          <span className="c2d-line text-cyan-300" style={{ animationDelay: "2.1s" }}>
            <span className="c2d-caret">_</span>
          </span>
        </div>
        <div className="px-4 pb-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="c2d-bar" />
          </div>
        </div>
      </div>
      <span className="sr-only">Rendering page, please wait.</span>
    </div>
  );
}
