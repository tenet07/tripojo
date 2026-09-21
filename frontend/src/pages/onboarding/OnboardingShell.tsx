import { ReactNode } from "react";
import { NavBar } from "../../design-system/NavBar";
import { Stepper } from "../../design-system/Stepper";
import { Card } from "../../design-system/Card";

interface Step {
  key: string;
  label: string;
}

export function OnboardingShell({
  eyebrow,
  title,
  subtitle,
  steps,
  currentIndex,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  steps: Step[];
  currentIndex: number;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">{eyebrow}</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-500">{subtitle}</p>

        <div className="mt-8">
          <Stepper steps={steps} currentIndex={currentIndex} />
        </div>

        <Card className="mt-6">{children}</Card>
      </div>
    </div>
  );
}
