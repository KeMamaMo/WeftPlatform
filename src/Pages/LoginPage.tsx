import { useState } from "react";

const inputClass =
  "min-h-[46px] w-full rounded-[7px] border border-[#cbd6cc] bg-white px-3.5 py-2.5 text-base text-[#21342c] placeholder:text-[#5f6b63] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245f49]";

const buttonFocusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245f49]";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6f2] text-[#21342c]">
      <header className="px-6 py-6 sm:px-10">
        <div className="inline-flex items-center gap-1.5 text-[37px] font-bold leading-none tracking-[-0.07em] text-[#245f49]">
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
          <span>weft</span>
        </div>
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

          <form className="mt-7" onSubmit={(event) => event.preventDefault()}>
            <div>
              <label htmlFor="work-email" className="mb-2 block text-sm font-semibold">
                Work email
              </label>
              <input
                id="work-email"
                type="email"
                placeholder="you@company.com"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                className={inputClass}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-controls="password"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className={`absolute bottom-px right-px top-px grid w-11 place-items-center rounded-md text-[#5f6b63] hover:bg-[#f4f6f2] ${buttonFocusClass}`}
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
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className={`min-h-[44px] rounded text-sm font-semibold text-[#245f49] hover:underline ${buttonFocusClass}`}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className={`min-h-[44px] w-full rounded-[7px] bg-[#245f49] px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-[#173f32] ${buttonFocusClass}`}
            >
              Sign in
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}