export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Cockpit panel top accent handled via html border-top in globals.css */}

      <main className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-sm font-mono tracking-widest text-[#22d3ee] uppercase opacity-80">
            IFR Study Tool
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#e2e8f0]">
            IFR Companion
          </h1>
          <p className="text-[#94a3b8] text-base leading-relaxed max-w-sm mx-auto">
            Your instrument-rated study partner. Study regulations, quiz
            yourself, and pass your theory exams.
          </p>
        </div>

        {/* Example cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card rounded-xl border border-[#1e3050] bg-[#131d2e] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#22d3ee] shadow-[0_0_6px_#22d3ee]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#94a3b8]">
                Today&apos;s Study
              </span>
            </div>
            <h2 className="text-lg font-semibold text-[#e2e8f0]">
              IFR Meteorology
            </h2>
            <p className="text-sm text-[#94a3b8]">
              Cloud bases, visibility minima, and alternate requirements under{" "}
              <span className="reg-ref">CAR 1988 r.258</span>
            </p>
            <div className="h-1.5 w-full rounded-full bg-[#1a2740] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: "62%",
                  background: "linear-gradient(90deg, #22d3ee, #60a5fa)",
                  boxShadow: "0 0 8px rgba(34,211,238,0.4)",
                }}
              />
            </div>
            <p className="text-xs text-[#64748b]">62% complete</p>
          </div>

          <div className="card rounded-xl border border-[#1e3050] bg-[#131d2e] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_6px_#34d399]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#94a3b8]">
                Last Quiz
              </span>
            </div>
            <h2 className="text-lg font-semibold text-[#e2e8f0]">
              Approach Procedures
            </h2>
            <p className="text-sm text-[#94a3b8]">
              ILS, VOR, and NDB approaches. Missed approach at{" "}
              <span className="altitude">MDA/DH</span> per{" "}
              <span className="reg-ref">AIP ENR 1.5</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-[#34d399]">8/10</span>
              <span className="text-xs text-[#64748b]">correct</span>
            </div>
          </div>
        </div>

        {/* Quiz example */}
        <div className="rounded-xl border border-[#1e3050] bg-[#131d2e] p-5 space-y-4">
          <p className="text-xs font-mono uppercase tracking-wider text-[#94a3b8]">
            Sample Question
          </p>
          <p className="text-[#e2e8f0] font-medium leading-relaxed">
            The minimum IFR cruising altitude in a designated mountainous area
            is 2000 ft above the highest obstacle within{" "}
            <span className="altitude">5 NM</span> of track. Under{" "}
            <span className="reg-ref">CAR 1988 r.175</span>, what is the
            MOCA in non-mountainous areas?
          </p>
          <div className="space-y-2">
            {[
              { label: "A. 1000 ft", correct: false, selected: true },
              { label: "B. 1500 ft AMSL", correct: true, selected: false },
              { label: "C. 2000 ft AGL", correct: false, selected: false },
              { label: "D. 500 ft above obstacles", correct: false, selected: false },
            ].map((opt) => (
              <div
                key={opt.label}
                className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all cursor-default
                  ${opt.correct ? "correct-answer" : ""}
                  ${opt.selected && !opt.correct ? "incorrect-answer" : ""}
                  ${!opt.correct && !opt.selected ? "border-[#1e3050] text-[#94a3b8]" : ""}
                `}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>

        {/* Aviation refs row */}
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="reg-ref">CAR 1988</span>
          <span className="reg-ref">CASR Part 61</span>
          <span className="reg-ref">AIP ENR 1.1</span>
          <span className="frequency">118.100 MHz</span>
          <span className="altitude">FL180</span>
          <span className="altitude">3500 AMSL</span>
        </div>

        <p className="text-center text-xs text-[#64748b] font-mono">
          IFR COMPANION · PWA · OFFLINE READY
        </p>
      </main>
    </div>
  );
}
