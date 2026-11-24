export type PaymentsStatus = "not_started" | "in_progress" | "submitted" | "active";

export type PaymentsWorkspace = {
  name: string;
  legalName?: string;
};

type WorkspaceHeaderProps = {
  workspaceName: string;
  onSignOut: () => Promise<void>;
  isSigningOut: boolean;
  signOutError: string;
};

type PaymentsSetupPageProps = WorkspaceHeaderProps & {
  legalName?: string;
  status: PaymentsStatus;
  allProductsHref: string;
  continueHref: string;
  demoMode?: boolean;
  onWhatsAppPreview?: () => void;
  whatsAppPreviewOpen?: boolean;
  whatsApp?: { href: string; qrImageSrc?: string };
  hasReusableCreditDocuments?: boolean;
};

const paymentsStatusLabels: Record<PaymentsStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  submitted: "With Weft for review",
  active: "Payments active",
};

export function PaymentsStatusLabel({ status }: { status: PaymentsStatus }) {
  return <>{paymentsStatusLabels[status]}</>;
}

const steps = [
  "Give onboarding consent",
  "Share company documents",
  "Fix any gaps",
  "Review and confirm",
];

export const paymentsPrimaryAction =
  "inline-flex min-h-[44px] items-center justify-center rounded-[7px] border border-[#245f49] bg-[#245f49] px-[15px] py-[9px] text-center text-[15px] font-semibold text-white hover:bg-[#173f32] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryAction =
  "inline-flex min-h-[44px] items-center justify-center rounded-[7px] border border-[#bccdc2] bg-white px-[15px] py-[9px] text-center text-[15px] font-semibold text-[#245f49] hover:bg-[#eaf2eb] disabled:cursor-not-allowed disabled:opacity-60";

export function PaymentsWorkspaceHeader({
  workspaceName,
  onSignOut,
  isSigningOut,
  signOutError,
}: WorkspaceHeaderProps) {
  const initial = Array.from(workspaceName.trim())[0]?.toUpperCase() || "?";

  return (
    <>
      <header className="border-b border-[#dce3dc] bg-white">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-2 px-4 py-[15px] min-[721px]:gap-3 min-[721px]:px-6 min-[721px]:py-[17px]">
          <span className="inline-flex shrink-0 items-center gap-[5px] text-[28px] font-bold leading-none tracking-[-0.07em] text-[#245f49] min-[721px]:text-[32px]">
            <svg
              aria-hidden="true"
              className="size-6 -rotate-[25deg] min-[721px]:size-[26px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
            >
              <path d="M3 7q4-4 8 0t10 0M3 12q4-4 8 0t10 0M3 17q4-4 8 0t10 0" />
            </svg>
            weft
          </span>
          <div className="flex min-w-0 items-center gap-2 min-[721px]:gap-3">
            <div className="flex min-w-0 items-center gap-[9px]">
              <span
                aria-hidden="true"
                className="grid size-[34px] shrink-0 place-items-center rounded-lg border border-[#dce3dc] bg-[#eaf2eb] text-[15px] font-semibold text-[#245f49]"
              >
                {initial}
              </span>
              <div className="min-w-0 leading-[1.3] [overflow-wrap:anywhere]">
                <p className="text-[15px] font-semibold">{workspaceName}</p>
                <p className="text-[13px] text-[#5f6b63]">Client workspace</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="min-h-[44px] shrink-0 rounded px-1 text-sm font-semibold whitespace-nowrap min-[721px]:px-2 text-[#245f49] hover:underline disabled:opacity-60"
            >
              {isSigningOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>
      {signOutError && (
        <p role="alert" className="mx-auto max-w-[1120px] px-4 pt-4 text-sm text-red-700">
          {signOutError}
        </p>
      )}
    </>
  );
}

// The wireframe uses a decorative pattern for the demo QR.
const previewQrCorners = [[1, 1], [14, 1], [1, 14]];
const previewQrCells = Array.from({ length: 21 * 21 }, (_, index) => ({
  x: index % 21,
  y: Math.floor(index / 21),
})).filter(({ x, y }) => {
  const isInPatternArea =
    (x > 9 && y > 9) || (x >= 9 && x <= 12) || (y >= 9 && y <= 12);
  return isInPatternArea && (x * 19 + y * 17 + x * y * 7) % 11 < 4;
});

function WhatsAppQr({
  whatsApp,
  showPreview,
}: {
  whatsApp?: PaymentsSetupPageProps["whatsApp"];
  showPreview: boolean;
}) {
  if (!whatsApp?.qrImageSrc && !showPreview) return null;

  const qrClass = "mb-[7px] size-[82px] rounded-[7px] border border-[#dce3dc] p-2";

  return (
    <div className="hidden justify-items-center border-l border-[#dce3dc] pl-4 text-center text-xs leading-[1.35] text-[#5f6b63] min-[721px]:grid">
      {whatsApp?.qrImageSrc ? (
        <img
          src={whatsApp.qrImageSrc}
          alt="QR code for this Payments setup in WhatsApp"
          className={`${qrClass} object-contain`}
        />
      ) : (
        <svg
          aria-hidden="true"
          viewBox="-.5 -.5 22 22"
          fill="currentColor"
          className={qrClass}
        >
          {previewQrCells.map(({ x, y }) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
          ))}
          {previewQrCorners.map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y} width="7" height="7" fill="none" stroke="currentColor" />
              <rect x={x + 2} y={y + 2} width="3" height="3" />
            </g>
          ))}
        </svg>
      )}
      <strong className="font-semibold">Scan to open WhatsApp</strong>
      {showPreview && <span>QR preview only</span>}
    </div>
  );
}

export default function PaymentsSetupPage({
  workspaceName,
  legalName,
  status,
  allProductsHref,
  continueHref,
  demoMode = false,
  onWhatsAppPreview,
  whatsAppPreviewOpen = false,
  whatsApp,
  hasReusableCreditDocuments = false,
  ...headerProps
}: PaymentsSetupPageProps) {
  const canContinue = status === "not_started" || status === "in_progress";
  const whatsAppLabel = status === "not_started" ? "Start on WhatsApp" : "Continue on WhatsApp";
  const showWhatsAppPreview = demoMode && !whatsApp;
  const showQr = showWhatsAppPreview || Boolean(whatsApp?.qrImageSrc);
  const entryClass = showQr
    ? "mt-4 grid items-center gap-4 min-[721px]:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]"
    : "mt-4";

  return (
    <div className="min-h-screen bg-[#f4f6f2] text-[#21342c]">
      <PaymentsWorkspaceHeader workspaceName={workspaceName} {...headerProps} />

      <main className="mx-auto max-w-[1120px] px-4 py-6 text-[15px] leading-[1.55] min-[721px]:px-6 min-[721px]:pb-8 min-[721px]:pt-11">
        <a
          href={allProductsHref}
          className="mb-3.5 inline-flex min-h-8 items-center gap-[5px] rounded text-sm font-semibold text-[#245f49] underline underline-offset-[3px]"
        >
          <span aria-hidden="true">←</span> All products
        </a>
        <h1 className="mb-2.5 text-[clamp(30px,4.5vw,43px)] font-bold leading-[1.12] tracking-[-0.05em]">
          Set up payments for your platform
        </h1>
        <p className="text-[#5f6b63]">
          Set up payments for the company that operates your platform.
        </p>

        <div className="mt-5 grid items-start gap-[18px] min-[721px]:mt-[26px] min-[721px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <section
            aria-labelledby="company-onboarding"
            className="rounded-[14px] border border-[#dce3dc] bg-white p-[17px] min-[721px]:p-6"
          >
            <h2 id="company-onboarding" className="text-[22px] font-bold leading-[1.2] tracking-[-0.025em]">
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
              <PaymentsStatusLabel status={status} />
            </p>
            {legalName && (
              <p className="text-[#5f6b63] [overflow-wrap:anywhere]">
                {legalName}
              </p>
            )}

            {canContinue ? (
              <>
                <p className="mt-2.5">
                  Have ready your company registration document (or NPO registration for nonprofits), directors’ and shareholders’ IDs, proof of address, a recent bank letter, your tax compliance PIN and website.
                  {hasReusableCreditDocuments && " Documents already on file are reused."}
                </p>
                <div className={entryClass}>
                  <div className="grid min-w-0 content-start gap-[9px]">
                    <a href={continueHref} className={paymentsPrimaryAction}>
                      Continue here
                    </a>
                    {whatsApp ? (
                      <a href={whatsApp.href} className={secondaryAction}>
                        {whatsAppLabel}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={showWhatsAppPreview ? onWhatsAppPreview : undefined}
                        disabled={!showWhatsAppPreview || !onWhatsAppPreview}
                        className={secondaryAction}
                      >
                        {whatsAppLabel}
                      </button>
                    )}
                  </div>
                  <WhatsAppQr whatsApp={whatsApp} showPreview={showWhatsAppPreview} />
                </div>
                {!whatsApp && !showWhatsAppPreview && (
                  <p className="mt-2 text-sm text-[#5f6b63]">
                    WhatsApp setup is currently unavailable.
                  </p>
                )}
                {showWhatsAppPreview && whatsAppPreviewOpen && (
                  <p role="status" className="mt-3 text-sm text-[#5f6b63]">
                    This workspace is a preview. Continue here to try Payments onboarding.
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-[#5f6b63]">
                {status === "submitted"
                  ? "Weft’s team will check your pack before sending it to the partner."
                  : "Your payments setup is active."}
              </p>
            )}
          </section>

          <section
            aria-labelledby="payments-steps"
            className="rounded-[14px] border border-[#dce3dc] bg-white p-[17px] min-[721px]:p-6"
          >
            <h2 id="payments-steps" className="text-[22px] font-bold leading-[1.2] tracking-[-0.025em]">
              What you’ll do
            </h2>
            <ol role="list" className="mt-[17px] grid gap-3">
              {steps.map((step, index) => (
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