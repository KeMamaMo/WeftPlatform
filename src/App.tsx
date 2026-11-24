import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { FirebaseError } from "firebase/app";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import ClientSetupPage from "./Pages/ClientSetupPage";
import ClientLandingPage from "./Pages/ClientLandingPage";
import PaymentsSetupPage from "./Pages/PaymentsSetupPage";
import type { PaymentsStatus, PaymentsWorkspace } from "./Pages/PaymentsSetupPage";
import PaymentsConsentPreviewPage from "./Pages/PaymentsConsentPreviewPage";
import CreditSetupPage, { CreditOnboardingPlaceholder } from "./Pages/CreditSetupPage";
import type { CreditStatus } from "./Pages/CreditSetupPage";

type PasswordResetStatus = "idle" | "sending" | "sent" | "error";
type Landing = "team" | "client";

type Product = "credit" | "payments";
type ProductStatuses = { credit: CreditStatus; payments: PaymentsStatus };

const allProductsHref = "#/setup";
const paymentsSetupHref = "#/payments/setup";
const paymentsConsentHref = "#/payments/consent";
const creditSetupHref = "#/credit/setup";
const creditOnboardingHref = "#/credit/onboarding";

const clientSetupRoutes = [
  allProductsHref,
  paymentsSetupHref,
  paymentsConsentHref,
  creditSetupHref,
  creditOnboardingHref,
];

const weftWhatsAppNumber = "27766795396";
const paymentsWhatsAppHref = `https://wa.me/${weftWhatsAppNumber}?text=${encodeURIComponent(
  "Hi Weft, I'd like to set up Payments."
)}`;
const creditWhatsAppHref = `https://wa.me/${weftWhatsAppNumber}?text=${encodeURIComponent(
  "Hi Weft, I'd like to apply for credit."
)}`;

const initialStatuses: ProductStatuses = {
  credit: "not_started",
  payments: "not_started",
};

const focusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245f49]";

const inputClass = `min-h-[46px] w-full rounded-[7px] border border-[#cbd6cc] bg-white py-2.5 pl-3.5 text-base placeholder:text-[#5f6b63] ${focusClass}`;

const demoWorkspace: PaymentsWorkspace & { id: string } = {
  id: "sample-company",
  name: "Sample Company",
  legalName: "Sample Company (Pty) Ltd.",
};

function onboardingStorageKey(uid: string) {
  return `weft-demo-client-onboarding-${demoWorkspace.id}-${uid}`;
}

function readProductStatuses(uid: string): ProductStatuses {
  try {
    const saved = JSON.parse(localStorage.getItem(onboardingStorageKey(uid)) ?? "{}");

    const readStatus = (product: Product): CreditStatus => {
      const status: unknown = saved?.[product];
      return status === "not_started" || status === "in_progress" || status === "submitted"
        ? status
        : "not_started";
    };

    return {
      credit: readStatus("credit"),
      payments: saved?.payments === "active" ? "active" : readStatus("payments"),
    };
  } catch {
    return initialStatuses;
  }
}

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [landing, setLanding] = useState<Landing | null>(null);
  const [showClientSetup, setShowClientSetup] = useState(false);
  const [clientLocation, setClientLocation] = useState(() => window.location.hash);
  const [signInError, setSignInError] = useState("");
  const [signOutError, setSignOutError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetStatus, setResetStatus] = useState<PasswordResetStatus>("idle");
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [clientOnboarding, setClientOnboarding] = useState<{
    uid: string;
    statuses: ProductStatuses;
  } | null>(null);

  useEffect(() => {
    let authRevision = 0;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const revision = ++authRevision;
      setLanding(null);
      setShowPassword(false);
      setShowPasswordReset(false);
      setResetStatus("idle");
      setShowClientSetup(false);
      setSignOutError("");
      setClientOnboarding(null);

      if (!user) {
        setIsCheckingSession(false);
        setIsSigningIn(false);
        return;
      }

      setIsCheckingSession(true);

      const isCurrentSession = () =>
        revision === authRevision && auth.currentUser === user;

      let role: unknown;
      let accessError =
        "Your account does not have access to a Weft workspace yet.";

      try {
        const { claims } = await user.getIdTokenResult();
        role = claims.weftRole;
      } catch {
        accessError =
          "We couldn’t verify your workspace access. Please sign in again.";
      }

      if (!isCurrentSession()) return;

      if (role !== "team" && role !== "client") {
        setSignInError(accessError);

        try {
          await signOut(auth);
        } catch {
          if (revision === authRevision) {
            setIsCheckingSession(false);
            setIsSigningIn(false);
          }
        }

        return;
      }

      if (role === "client") {
        setClientOnboarding({
          uid: user.uid,
          statuses: readProductStatuses(user.uid),
        });
        setShowClientSetup(true);
      }

      setSignInError("");
      setLanding(role);
      setIsCheckingSession(false);
      setIsSigningIn(false);
    });

    return () => {
      authRevision += 1;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleLocationChange() {
      setClientLocation(window.location.hash);
    }

    window.addEventListener("hashchange", handleLocationChange);
    return () => window.removeEventListener("hashchange", handleLocationChange);
  }, []);

  useEffect(() => {
    if (!clientOnboarding || auth.currentUser?.uid !== clientOnboarding.uid) return;

    try {
      localStorage.setItem(
        onboardingStorageKey(clientOnboarding.uid),
        JSON.stringify(clientOnboarding.statuses)
      );
    } catch {
      // Keep demo progress usable in memory when browser storage is unavailable.
    }
  }, [clientOnboarding]);

  function startProduct(product: Product) {
    setClientOnboarding((current) => {
      if (!current || current.statuses[product] !== "not_started") return current;

      return {
        ...current,
        statuses: { ...current.statuses, [product]: "in_progress" },
      };
    });
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSigningIn) return;

    const fields = new FormData(event.currentTarget);
    const email = String(fields.get("email") ?? "").trim();
    const password = String(fields.get("password") ?? "");

    setSignInError("");
    setIsSigningIn(true);

    try {
      // The same observer handles a fresh sign-in and a restored session.
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setSignInError(
        "We couldn’t sign you in. Check your email and password and try again."
      );
      setIsSigningIn(false);
    }
  }

  function switchAuthForm(showReset: boolean) {
    setSignInError("");
    setShowPassword(false);
    setResetStatus("idle");
    setShowPasswordReset(showReset);
    emailInputRef.current?.focus();
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (resetStatus === "sending") return;

    const fields = new FormData(event.currentTarget);
    const email = String(fields.get("email") ?? "").trim();

    setResetStatus("sending");

    try {
      await sendPasswordResetEmail(auth, email);
      setResetStatus("sent");
    } catch (error) {
      const hideAccountStatus =
        error instanceof FirebaseError &&
        (error.code === "auth/user-not-found" ||
          error.code === "auth/user-disabled");

      setResetStatus(hideAccountStatus ? "sent" : "error");
    }
  }

  async function handleSignOut() {
    if (isSigningOut) return;

    setSignOutError("");
    setIsSigningOut(true);

    try {
      await signOut(auth);
      if (clientSetupRoutes.includes(window.location.hash)) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        setClientLocation("");
      }
    } catch {
      setSignOutError("We couldn’t sign you out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  function openPaymentsSetup() {
    window.location.hash = paymentsSetupHref;
  }

  function openCreditSetup() {
    window.location.hash = creditSetupHref;
  }

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f6f2] px-4 text-[#21342c]">
        <p role="status">Checking your Weft session…</p>
      </main>
    );
  }

  if (
    landing === "client" &&
    clientOnboarding &&
    (clientLocation === paymentsSetupHref || clientLocation === paymentsConsentHref)
  ) {
    const status = clientOnboarding.statuses.payments;
    const canContinue = status === "not_started" || status === "in_progress";

    if (clientLocation === paymentsConsentHref && canContinue) {
      return (
        <PaymentsConsentPreviewPage
          workspace={demoWorkspace}
          paymentsSetupHref={paymentsSetupHref}
          hasStarted={status === "in_progress"}
          onStart={() => startProduct("payments")}
          onSignOut={handleSignOut}
          isSigningOut={isSigningOut}
          signOutError={signOutError}
        />
      );
    }

    return (
      <PaymentsSetupPage
        workspaceName={demoWorkspace.name}
        legalName={demoWorkspace.legalName}
        status={status}
        allProductsHref={allProductsHref}
        continueHref={paymentsConsentHref}
        whatsAppHref={paymentsWhatsAppHref}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
        signOutError={signOutError}
      />
    );
  }

  if (
    landing === "client" &&
    clientOnboarding &&
    (clientLocation === creditSetupHref || clientLocation === creditOnboardingHref)
  ) {
    const status = clientOnboarding.statuses.credit;
    const creditWorkspaceProps = {
      workspaceName: demoWorkspace.name,
      legalName: demoWorkspace.legalName,
      onSignOut: handleSignOut,
      isSigningOut,
      signOutError,
    };

    if (clientLocation === creditOnboardingHref && status !== "submitted") {
      return (
        <CreditOnboardingPlaceholder
          {...creditWorkspaceProps}
          creditSetupHref={creditSetupHref}
        />
      );
    }

    return (
      <CreditSetupPage
        {...creditWorkspaceProps}
        status={status}
        allProductsHref={allProductsHref}
        continueHref={creditOnboardingHref}
        whatsAppHref={creditWhatsAppHref}
      />
    );
  }

  if (
    landing === "client" &&
    clientOnboarding &&
    (showClientSetup || clientLocation === allProductsHref)
  ) {
    return (
      <ClientSetupPage
        workspaceName={demoWorkspace.name}
        creditStatus={clientOnboarding.statuses.credit}
        paymentsStatus={clientOnboarding.statuses.payments}
        onStartCredit={openCreditSetup}
        onStartPayments={openPaymentsSetup}
        onResumeCredit={openCreditSetup}
        onResumePayments={openPaymentsSetup}
        onViewCredit={openCreditSetup}
        onViewPayments={openPaymentsSetup}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
        signOutError={signOutError}
      />
    );
  }

  if (landing === "client") {
    return (
      <ClientLandingPage
        onOpenSetup={() => setShowClientSetup(true)}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
        signOutError={signOutError}
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
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={`mt-4 min-h-[44px] rounded text-sm font-semibold text-[#245f49] hover:underline disabled:opacity-60 ${focusClass}`}
          >
            {isSigningOut ? "Signing out…" : "Sign out"}
          </button>

          {signOutError && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {signOutError}
            </p>
          )}
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
            {showPasswordReset ? "Reset your password" : "Sign in to Weft"}
          </h1>
          <p className="mt-2 text-[15px] text-[#5f6b63]">
            {showPasswordReset
              ? "Enter your work email to request a reset link."
              : "Access your workspace."}
          </p>

          <form
            className="mt-7"
            onSubmit={showPasswordReset ? handlePasswordReset : handleSignIn}
            aria-busy={showPasswordReset ? resetStatus === "sending" : isSigningIn}
          >
            <label htmlFor="work-email" className="mb-2 block text-sm font-semibold">
              Work email
            </label>
            <input
              ref={emailInputRef}
              id="work-email"
              name="email"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@company.com"
              required
              readOnly={showPasswordReset && resetStatus === "sending"}
              onChange={() => {
                if (showPasswordReset) setResetStatus("idle");
              }}
              className={`${inputClass} pr-3.5`}
            />

            {showPasswordReset ? (
              <>
                <button
                  type="submit"
                  disabled={resetStatus === "sending"}
                  className={`mt-4 min-h-[44px] w-full rounded-[7px] bg-[#245f49] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#173f32] disabled:opacity-60 ${focusClass}`}
                >
                  {resetStatus === "sending" ? "Sending reset link…" : "Send reset link"}
                </button>
                <button
                  type="button"
                  disabled={resetStatus === "sending"}
                  onClick={() => switchAuthForm(false)}
                  className={`mt-2 min-h-[44px] w-full rounded text-sm font-semibold text-[#245f49] hover:underline disabled:opacity-60 ${focusClass}`}
                >
                  Back to sign in
                </button>
              </>
            ) : (
              <>
                <label htmlFor="password" className="mb-2 mt-4 block text-sm font-semibold">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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
                    onClick={() => switchAuthForm(true)}
                    disabled={isSigningIn}
                    className={`min-h-[44px] rounded text-sm font-semibold text-[#245f49] hover:underline disabled:opacity-60 ${focusClass}`}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className={`mt-4 min-h-[44px] w-full rounded-[7px] bg-[#245f49] px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-[#173f32] disabled:opacity-60 ${focusClass}`}
                >
                  {isSigningIn ? "Signing in…" : "Sign in"}
                </button>

                {signInError && (
                  <p role="alert" className="mt-3 text-sm text-red-700">
                    {signInError}
                  </p>
                )}
              </>
            )}
          </form>

          {showPasswordReset && (
            <>
              <p role="status" className="empty:sr-only mt-3 text-sm text-[#245f49]">
                {resetStatus === "sending" && "Sending your request…"}
                {resetStatus === "sent" &&
                  "If an account exists for this email, you’ll receive a password reset link."}
              </p>

              {resetStatus === "error" && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  We couldn’t send your request. Please try again.
                </p>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}