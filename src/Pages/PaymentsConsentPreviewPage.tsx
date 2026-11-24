import { useState } from "react";
import type { FormEvent } from "react";
import {
  PaymentsWorkspaceHeader,
  paymentsPrimaryAction,
} from "./PaymentsSetupPage";
import type { PaymentsWorkspace } from "./PaymentsSetupPage";

type PaymentsConsentPreviewPageProps = {
  workspace: PaymentsWorkspace;
  paymentsSetupHref: string;
  hasStarted: boolean;
  onStart: () => void;
  onSignOut: () => Promise<void>;
  isSigningOut: boolean;
  signOutError: string;
};

export default function PaymentsConsentPreviewPage({
  workspace,
  paymentsSetupHref,
  hasStarted,
  onStart,
  ...headerProps
}: PaymentsConsentPreviewPageProps) {
  const [checked, setChecked] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checked) onStart();
  }

  return (
    <div className="min-h-screen bg-[#f4f6f2] text-[#21342c]">
      <PaymentsWorkspaceHeader workspaceName={workspace.name} {...headerProps} />

      <main className="mx-auto max-w-[720px] px-4 py-8 min-[721px]:px-6">
        <a
          href={paymentsSetupHref}
          className="inline-flex min-h-[44px] items-center gap-2 rounded text-sm font-semibold text-[#245f49] hover:underline"
        >
          <span aria-hidden="true">←</span> Payments setup
        </a>
        <section
          aria-labelledby="consent-heading"
          className="mt-3 rounded-[14px] border border-[#dce3dc] bg-white p-5 min-[721px]:p-6"
        >
          <p className="text-sm font-semibold text-[#245f49]">Demo preview</p>
          <h1 id="consent-heading" className="mt-2 text-3xl font-bold tracking-tight">
            {hasStarted ? "Share company documents" : "Give onboarding consent"}
          </h1>
          {workspace.legalName && (
            <p className="mt-2 text-sm text-[#5f6b63] [overflow-wrap:anywhere]">
              {workspace.legalName}
            </p>
          )}
          {hasStarted ? (
            <p role="status" className="mt-4 text-sm leading-relaxed text-[#5f6b63]">
              Payments onboarding is in progress in this demo. Document upload is the next step.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4">
              <p className="text-sm leading-relaxed text-[#5f6b63]">
                In the live flow, you’ll review the consent wording for sharing business information before providing company documents. This preview does not record consent.
              </p>
              <label className="mt-5 flex items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  required
                  onChange={(event) => setChecked(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[#245f49]"
                />
                I’m ready to continue in the demo.
              </label>
              <button
                type="submit"
                disabled={!checked}
                className={`mt-5 ${paymentsPrimaryAction}`}
              >
                Continue
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}