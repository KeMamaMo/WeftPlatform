type ProductStatus = "not_started" | "in_progress" | "submitted";

interface ClientSetupPageProps {
  workspaceName: string;
  creditStatus: ProductStatus;
  paymentsStatus: ProductStatus;
  onStartCredit: () => void;
  onStartPayments: () => void;
  onResumeCredit: () => void;
  onResumePayments: () => void;
  onViewCredit: () => void;
  onViewPayments: () => void;
  onSignOut: () => Promise<void>;
  isSigningOut: boolean;
  signOutError: string;
}

function ProductCard({
  title,
  description,
  status,
  onClick,
}: {
  title: string;
  description: string;
  status: ProductStatus;
  onClick: () => void;
}) {
  return (
    <section className="rounded-xl border border-[#dce3dc] bg-white p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[#5f6b63]">{description}</p>

      <p className="mt-5 text-sm text-[#5f6b63]">
        Status: {status.replace("_", " ")}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-4 min-h-[44px] rounded-lg bg-[#245f49] px-5 py-2 text-sm font-semibold text-white hover:bg-[#173f32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245f49]"
      >
        {status === "not_started"
          ? "Get started"
          : status === "in_progress"
            ? "Continue setup"
            : "View submission"}
      </button>
    </section>
  );
}

export default function ClientSetupPage({
  workspaceName,
  creditStatus,
  paymentsStatus,
  onStartCredit,
  onStartPayments,
  onResumeCredit,
  onResumePayments,
  onViewCredit,
  onViewPayments,
  onSignOut,
  isSigningOut,
  signOutError,
}: ClientSetupPageProps) {
  const initial = workspaceName.trim().charAt(0).toUpperCase() || "?";

  return (
    <main className="min-h-screen bg-[#f4f6f2] text-[#21342c]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce3dc] bg-white px-6 py-5 sm:px-10">
        <span className="text-3xl font-bold tracking-tight text-[#245f49]">
          weft
        </span>

        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="min-w-0 text-sm font-medium [overflow-wrap:anywhere]">
            {workspaceName}
          </span>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#dcebd3] font-semibold text-[#245f49]">
            {initial}
          </span>
          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="min-h-[44px] shrink-0 rounded px-2 text-sm font-semibold text-[#245f49] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245f49] disabled:opacity-60"
          >
            {isSigningOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </header>

      {signOutError && (
        <p
          role="alert"
          className="mx-auto max-w-5xl px-6 pt-4 text-sm text-red-700"
        >
          {signOutError}
        </p>
      )}

      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#245f49]">
          Welcome to Weft
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Set up your platform
        </h1>

        <p className="mt-3 max-w-2xl text-[#5f6b63]">
          Choose the products you want to set up. You can complete each one
          independently and return to your progress whenever you need to.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <ProductCard
            title="Payments"
            description="Set up your Payments product and manage your application."
            status={paymentsStatus}
            onClick={
              paymentsStatus === "not_started"
                ? onStartPayments
                : paymentsStatus === "in_progress"
                  ? onResumePayments
                  : onViewPayments
            }
          />

          <ProductCard
            title="Credit"
            description="Set up your Credit product and manage your application."
            status={creditStatus}
            onClick={
              creditStatus === "not_started"
                ? onStartCredit
                : creditStatus === "in_progress"
                  ? onResumeCredit
                  : onViewCredit
            }
          />
        </div>
      </div>
    </main>
  );
}