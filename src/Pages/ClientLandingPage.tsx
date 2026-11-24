interface ClientLandingPageProps {
  onOpenSetup: () => void;
  onSignOut: () => Promise<void>;
  isSigningOut: boolean;
  signOutError: string;
}

export default function ClientLandingPage({
  onOpenSetup,
  onSignOut,
  isSigningOut,
  signOutError,
}: ClientLandingPageProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6f2] px-4 py-10 text-[#21342c]">
      <section
        aria-labelledby="welcome-heading"
        className="w-full max-w-[395px] rounded-[14px] border border-[#dce3dc] bg-white p-7"
      >
        <h1 id="welcome-heading" className="text-[28px] font-bold tracking-tight">
          Welcome to Weft
        </h1>

        <p className="mt-3 text-sm text-[#5f6b63]">
          Access your workspace and manage your products.
        </p>

        <button
          type="button"
          onClick={onOpenSetup}
          className="mt-6 min-h-[44px] w-full rounded-lg bg-[#245f49] px-5 py-2 text-sm font-semibold text-white hover:bg-[#173f32]"
        >
          Set up your platform
        </button>

        <button
          type="button"
          onClick={onSignOut}
          disabled={isSigningOut}
          className="mt-2 min-h-[44px] w-full rounded text-sm font-semibold text-[#245f49] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245f49] disabled:opacity-60"
        >
          {isSigningOut ? "Signing out…" : "Sign out"}
        </button>

        {signOutError && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {signOutError}
          </p>
        )}
      </section>
    </main>
  );
}