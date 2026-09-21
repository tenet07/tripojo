interface Step {
  key: string;
  label: string;
}

export function Stepper({ steps, currentIndex }: { steps: Step[]; currentIndex: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "upcoming";
        return (
          <li key={step.key} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  state === "done"
                    ? "bg-primary-500 text-white"
                    : state === "active"
                    ? "bg-primary-100 text-primary-600 ring-2 ring-primary-500"
                    : "bg-ink-100 text-ink-500",
                ].join(" ")}
              >
                {state === "done" ? "✓" : i + 1}
              </span>
              <span
                className={[
                  "hidden text-sm font-medium sm:inline",
                  state === "upcoming" ? "text-ink-300" : "text-ink-900",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={["h-px flex-1", state === "done" ? "bg-primary-500" : "bg-ink-100"].join(" ")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
