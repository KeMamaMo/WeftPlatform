import { QRCodeSVG } from "qrcode.react";
import {
  PaymentsWorkspaceHeader,
  paymentsPrimaryAction,
} from "./PaymentsSetupPage";

export type CreditStatus = "not_started" | "in_progress" | "submitted";

type WorkspaceProps = {
  workspaceName: string;
  legalName?: string;
  onSignOut: () => Promise<void>;
  isSigningOut: boolean;
  signOutError: string;
};

type CreditSetupPageProps = WorkspaceProps & {
  status: CreditStatus;
  allProductsHref: string;
  continueHref: string;
  whatsAppHref: string;
};

type CreditOnboardingPlaceholderProps = WorkspaceProps & {
  creditSetupHref: string;
};

const statusLabels: Record<CreditStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  submitted: "With Weft for review",
};

const creditSteps = [
  "Give onboarding consent",
  "Share company documents",
  "Fix any gaps",
  "Give credit consent",
  "Add bank statements",
  "Review and confirm",
];

const backLinkClass =
  "mb-3.5 inline-flex min-h-8 items-center gap-[5px] rounded text-sm font-semibold text-[#245f49] underline underline-offset-[3px]";

const cardClass =
  "rounded-[14px] border border-[#dce3dc] bg-white p-[17px] min-[721px]:p-6";

const cardHeadingClass =
  "text-[22px] font-bold leading-[1.2] tracking-[-0.025em]";

const whatsAppActionClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-[7px] border border-[#bccdc2] bg-white px-[15px] py-[9px] text-center text-[15px] font-semibold text-[#245f49] hover:bg-[#eaf2eb]";

export function CreditStatusLabel({ status }: { status: CreditStatus }) {
  return <>{statusLabels[status]}</>;
}

export default function CreditSetupPage({
  legalName,
  status,
  allProductsHref,
  continueHref,
  whatsAppHref,
  ...headerProps
}: CreditSetupPageProps) {
  const whatsAppLabel =
    status === "not_started" ? "Start on WhatsApp" : "Continue on WhatsApp";

  return (
    <div className="min-h-screen bg-[#f4f6f2] text-[#21342c]">
      <PaymentsWorkspaceHeader {...headerProps} />

      <main className="mx-auto max-w-[1120px] px-4 py-6 text-[15px] leading-[1.55] min-[721px]:px-6 min-[721px]:pb-8 min-[721px]:pt-11">
        <a href={allProductsHref} className={backLinkClass}>
          <span aria-hidden="true">←</span> All products
        </a>

        <h1 className="mb-2.5 text-[clamp(30px,4.5vw,43px)] font-bold leading-[1.12] tracking-[-0.05em]">
          Set up credit for your platform
        </h1>
        <p className="text-[#5f6b63]">
          Apply for credit for the company that operates your platform.
        </p>

        <div className="mt-5 grid items-start gap-[18px] min-[721px]:mt-[26px] min-[721px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <section aria-labelledby="credit-company" className={cardClass}>
            <h2 id="credit-company" className={cardHeadingClass}>
              Company onboarding
            </h2>
            <p
              className={`my-[11px] inline-flex items-center gap-1.5 rounded-full border border-[#dce3dc] px-[9px] py-[3px] text-xs font-semibold ${
                status === "not_started"
                  ? "bg-[#f4f6f2] text-[#5f6b63]"
                  : "bg-[#eaf2eb] text-[#245f49]"
              }`}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
              <CreditStatusLabel status={status} />
            </p>

            {legalName && (
              <p className="text-[#5f6b63] [overflow-wrap:anywhere]">{legalName}</p>
            )}

            {status === "submitted" ? (
              <p className="mt-2.5 text-[#5f6b63]">
                Weft’s team will check your pack before sending it to the partner.
              </p>
            ) : (
              <>
                <p className="mt-2.5">
                  Have ready your company registration document (or NPO
                  registration for nonprofits), directors’ and shareholders’ IDs,
                  proof of address and bank statements.
                </p>

                <div className="mt-4 grid items-center gap-4 min-[721px]:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                  <div className="grid min-w-0 content-start gap-[9px]">
                    <a href={continueHref} className={paymentsPrimaryAction}>
                      Continue here
                    </a>
                    <a href={whatsAppHref} className={whatsAppActionClass}>
                      {whatsAppLabel}
                    </a>
                  </div>

                  <div className="hidden justify-items-center border-l border-[#dce3dc] pl-4 text-center text-xs leading-[1.35] text-[#5f6b63] min-[721px]:grid">
                    <QRCodeSVG
                      value={whatsAppHref}
                      size={104}
                      level="M"
                      marginSize={4}
                      title="QR code to open Weft Credit setup in WhatsApp"
                      className="mb-[7px] rounded-[7px] border border-[#dce3dc] bg-white"
                    />
                    <strong className="font-semibold">Scan to open WhatsApp</strong>
                  </div>
                </div>
              </>
            )}
          </section>

          <section aria-labelledby="credit-steps" className={cardClass}>
            <h2 id="credit-steps" className={cardHeadingClass}>
              What you’ll do
            </h2>
            <ol role="list" className="mt-[17px] grid gap-3">
              {creditSteps.map((step, index) => (
                <li key={step} className="flex items-center gap-[9px] text-[#5f6b63]">
                  <span
                    aria-hidden="true"
                    className="grid size-[25px] shrink-0 place-items-center rounded-full border border-[#dce3dc] bg-[#eaf2eb] text-xs font-semibold text-[#245f49]"
                  >
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}

export function CreditOnboardingPlaceholder({
  legalName,
  creditSetupHref,
  ...headerProps
}: CreditOnboardingPlaceholderProps) {
  return (
    <div className="min-h-screen bg-[#f4f6f2] text-[#21342c]">
      <PaymentsWorkspaceHeader {...headerProps} />

      <main className="mx-auto max-w-[720px] px-4 py-8 min-[721px]:px-6">
        <a href={creditSetupHref} className={backLinkClass}>
          <span aria-hidden="true">←</span> Back to Credit setup
        </a>

        <section aria-labelledby="credit-onboarding-heading" className={cardClass}>
          <h1 id="credit-onboarding-heading" className="text-3xl font-bold tracking-tight">
            Credit onboarding
          </h1>

          {legalName && (
            <p className="mt-2 text-sm text-[#5f6b63] [overflow-wrap:anywhere]">
              {legalName}
            </p>
          )}

          <p className="mt-4 text-[15px] leading-relaxed text-[#5f6b63]">
            This is where you’ll give onboarding consent, share company documents,
            fix any gaps, give consent for credit checks, add bank statements,
            and review and confirm your application.
          </p>
        </section>
      </main>
    </div>
  );
}