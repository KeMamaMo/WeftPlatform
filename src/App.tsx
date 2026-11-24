import { useEffect, useState } from "react";
import ClientSetupPage from "./Pages/ClientSetupPage";
import ClientLandingPage from "./Pages/ClientLandingPage";

type Landing = "team" | "client";
type ProductStatus = "not_started" | "in_progress" | "submitted";

const focusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245f49]";

const inputClass = `min-h-[46px] w-full rounded-[7px] border border-[#cbd6cc] bg-white py-2.5 pl-3.5 text-base placeholder:text-[#5f6b63] ${focusClass}`;

const demoWorkspace = {
  id: "sample-company",
  name: "Sample Company",
};

const STORAGE_KEY = `weft-demo-client-onboarding-${demoWorkspace.id}`;

function getSavedStatus(product: "credit" | "payments"): ProductStatus {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    const status = saved[product];

    return ["not_started", "in_progress", "submitted"].includes(status)
      ? status
      : "not_started";
  } catch {
    return "not_started";
  }
}

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [landing, setLanding] = useState<Landing | null>(null);
  const [showClientSetup, setShowClientSetup] = useState(false);
  const [showPaymentsSetup, setShowPaymentsSetup] = useState(false);
  
  const [creditStatus, setCreditStatus] =
  useState<ProductStatus>(() => getSavedStatus("credit"));

const [paymentsStatus, setPaymentsStatus] =
  useState<ProductStatus>(() => getSavedStatus("payments"));

  useEffect(() => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      credit: creditStatus,
      payments: paymentsStatus,
    })
  );
}, [creditStatus, paymentsStatus]);

if (landing === "client" && showPaymentsSetup) {
  return (
    <main className="min-h-screen bg-[#f4f6f2] p-6 text-[#21342c]">
      <div className="mx-auto max-w-2xl rounded-xl border border-[#dce3dc] bg-white p-8">
        <h1 className="text-3xl font-bold">Set up Payments</h1>

        <p className="mt-3 text-[#5f6b63]">
          Start your Payments onboarding when you are ready.
        </p>

        <button
          type="button"
          onClick={() => setShowPaymentsSetup(false)}
          className="mt-6 mr-3 rounded-lg border border-[#dce3dc] px-5 py-3"
        >
          Back
        </button>

        <button
          type="button"
          onClick={() => {
            setPaymentsStatus("in_progress");
            setShowPaymentsSetup(false);
          }}
          className="rounded-lg bg-[#245f49] px-5 py-3 font-semibold text-white"
        >
          Start Payments onboarding
        </button>
      </div>
    </main>
  );
}

  if (landing === "client" && showClientSetup) {
  return (
    <ClientSetupPage
      workspaceName={demoWorkspace.name}
      creditStatus={creditStatus}
      paymentsStatus={paymentsStatus}
      onStartCredit={() => setCreditStatus("in_progress")}
      onStartPayments={() => setShowPaymentsSetup(true)}
      onResumeCredit={() => setCreditStatus("in_progress")}
      onResumePayments={() => setPaymentsStatus("in_progress")}
      onViewCredit={() => alert("Credit submission")}
      onViewPayments={() => alert("Payments submission")}
    />
  );
}

if (landing === "client") {
  return (
    <ClientLandingPage
      onOpenSetup={() => setShowClientSetup(true)}
    />
  );
}

  if (landing === "team") {
    return (
      <main className="min-h-screen bg-[#f4f6f2] px-6 py-10 text-[#21342c]">
        <div className="mx-auto max-w-[395px]">
          <section className="rounded-xl border border-[#dce3dc] bg-white p-6">
            <h1 className="text-2xl font-semibold">Weft internal workspace</h1>
            <p className="mt-2 text-sm text-[#5f6b63]">
              The internal workspace is still being designed.
            </p>
          </section>

          <button
            type="button"
            onClick={() => setLanding(null)}
            className={`mt-4 min-h-[44px] rounded text-sm font-semibold text-[#245f49] hover:underline ${focusClass}`}
          >
            Back to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6f2] text-[#21342c]">
      <header className="px-6 py-6 sm:px-10">
        <span className="inline-flex items-center gap-1.5 text-[37px] font-bold leading-none tracking-[-0.07em] text-[#245f49]">
          <svg
            aria-hidden="true"
            className="h-[30px] w-[30px] -rotate-[25deg]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          >
            <path d="M3 7q4-4 8 0t10 0M3 12q4-4 8 0t10 0M3 17q4-4 8 0t10 0" />
          </svg>
          weft
        </span>
      </header>

      <main className="grid flex-1 place-items-center px-4 pb-16 pt-8 sm:pb-24">
        <section
          aria-labelledby="login-heading"
          className="w-full max-w-[395px] rounded-[14px] border border-[#dce3dc] bg-white px-5 pb-6 pt-7 sm:px-7"
        >
          <h1
            id="login-heading"
            className="text-[28px] font-bold leading-tight tracking-[-0.04em]"
          >
            Sign in to Weft
          </h1>
          <p className="mt-2 text-[15px] text-[#5f6b63]">
            Access your workspace.
          </p>

          <form
            className="mt-7"
            aria-describedby="preview-note"
            onSubmit={(event) => {
              event.preventDefault();

              const email = new FormData(event.currentTarget).get("email");
              if (typeof email !== "string") return;

              const normalizedEmail = email.toLowerCase().trim();
              const domain = normalizedEmail.slice(normalizedEmail.lastIndexOf("@") + 1);

              setShowPassword(false);
              setShowClientSetup(true);
              const isDemoClient = normalizedEmail === "rea+client-test@weft.cash";

             setLanding(
             isDemoClient ? "client" : domain === "weft.cash" ? "team" : "client"
             );
            }}
          >
            <label htmlFor="work-email" className="mb-2 block text-sm font-semibold">
              Work email
            </label>
            <input
              id="work-email"
              name="email"
              type="email"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@company.com"
              required
              className={`${inputClass} pr-3.5`}
            />

            <label htmlFor="password" className="mb-2 mt-4 block text-sm font-semibold">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                placeholder="Enter your password"
                required
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-controls="password"
                onClick={() => setShowPassword((visible) => !visible)}
                className={`absolute inset-y-px right-px grid w-11 place-items-center rounded-md text-[#5f6b63] hover:bg-[#f4f6f2] ${focusClass}`}
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="2.5" />
                  {showPassword && <path d="m4 4 16 16" />}
                </svg>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className={`min-h-[44px] rounded text-sm font-semibold text-[#245f49] hover:underline ${focusClass}`}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className={`min-h-[44px] w-full rounded-[7px] bg-[#245f49] px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-[#173f32] ${focusClass}`}
            >
              Sign in
            </button>

            <p id="preview-note" className="mt-3 text-center text-xs text-[#5f6b63]">
              Demo preview. Use sample details.
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}