import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import {
  PaymentsWorkspaceHeader,
  paymentsPrimaryAction,
} from "./PaymentsSetupPage";

type Props = ComponentProps<typeof PaymentsWorkspaceHeader> & {
  legalName?: string;
  creditSetupHref: string;
};

const companyDocuments = [
  { id: "registration", label: "Company registration (or NPO registration for nonprofits)" },
  { id: "directors", label: "Directors’ IDs" },
  { id: "shareholders", label: "Shareholders’ IDs" },
  { id: "address", label: "Proof of address" },
] as const;

const statements = { id: "statements", label: "Bank statements" } as const;
const reviewItems = [...companyDocuments, statements];

const steps = [
  "Give onboarding consent",
  "Share company documents",
  "Fix any gaps",
  "Give credit consent",
  "Add bank statements",
  "Review and confirm",
] as const;

const nextLabels = [
  "Agree and continue",
  "Continue to fix gaps",
  "Continue to credit consent",
  "Agree and continue",
  "Continue to review",
];

type Requirement = (typeof reviewItems)[number];
type ItemId = Requirement["id"];
type Attachment = { id: number; file: File };

const card = "rounded-[14px] border border-[#dce3dc] bg-white p-4 sm:p-6";
const secondary =
  "inline-flex min-h-11 cursor-pointer items-center rounded-[7px] border border-[#bccdc2] px-3 py-2 text-sm font-semibold text-[#245f49] hover:bg-[#eaf2eb]";
const muted = "mt-2 text-sm text-[#5f6b63]";
const accepts = ".pdf,.jpg,.jpeg,.png,.heic,.heif";

export default function CreditOnboardingPage({
  legalName,
  creditSetupHref,
  ...headerProps
}: Props) {
  const [step, setStep] = useState(0);
  const [onboardingConsent, setOnboardingConsent] = useState(false);
  const [creditConsent, setCreditConsent] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [files, setFiles] = useState<Partial<Record<ItemId, Attachment[]>>>({});
  const [errors, setErrors] = useState<Partial<Record<ItemId, string>>>({});
  const nextId = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  function attach(id: ItemId, input: HTMLInputElement) {
    const selected = Array.from(input.files ?? []);
    input.value = "";
    if (!selected.length) return;

    const accepted = selected.filter(
      (file) =>
        /\.(pdf|jpe?g|png|heic|heif)$/i.test(file.name) &&
        file.size > 0 &&
        file.size <= 10 * 1024 * 1024
    );
    const additions = accepted.map((file) => ({ id: nextId.current++, file }));

    setErrors((current) => ({
      ...current,
      [id]: accepted.length === selected.length
        ? ""
        : "Some files couldn’t be attached. Choose a PDF, JPG, PNG or HEIC/HEIF file up to 10 MB.",
    }));
    setFiles((current) => ({
      ...current,
      [id]: [...(current[id] ?? []), ...additions],
    }));
  }

  function declineCreditConsent() {
    setCreditConsent(false);
    setDeclined(true);
    setFiles((current) => ({ ...current, statements: [] }));
    setErrors((current) => ({ ...current, statements: "" }));
  }

  function renderDocument({ id, label }: Requirement) {
    const attached = files[id] ?? [];

    return (
      <li key={id} className="rounded-lg border border-[#dce3dc] p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-bold">{label}</h3>
            <p className="text-sm text-[#5f6b63]">
              {attached.length ? `${attached.length} attached` : "Missing"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="rounded focus-within:outline-2">
              <span className={secondary}>Upload file</span>
              <input
                type="file"
                className="sr-only"
                aria-label={`Upload file for ${label}`}
                accept={accepts}
                multiple={id === "directors" || id === "shareholders" || id === "statements"}
                onChange={(event) => attach(id, event.currentTarget)}
              />
            </label>

            <label className="hidden rounded focus-within:outline-2 [@media(pointer:coarse)]:block">
              <span className={secondary}>Take photo</span>
              <input
                type="file"
                className="sr-only"
                aria-label={`Take photo for ${label}`}
                accept="image/*"
                capture="environment"
                onChange={(event) => attach(id, event.currentTarget)}
              />
            </label>
          </div>
        </div>

        {attached.map((attachment) => (
          <div
            key={attachment.id}
            className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm"
          >
            <span className="[overflow-wrap:anywhere]">{attachment.file.name}</span>
            <button
              type="button"
              aria-label={`Remove ${attachment.file.name}`}
              className="min-h-11 text-[#245f49] underline"
              onClick={() =>
                setFiles((current) => ({
                  ...current,
                  [id]: (current[id] ?? []).filter((item) => item.id !== attachment.id),
                }))
              }
            >
              Remove
            </button>
          </div>
        ))}

        {errors[id] && (
          <p role="alert" className="mt-2 text-sm text-red-700">{errors[id]}</p>
        )}
      </li>
    );
  }

  const missingDocuments = companyDocuments.filter(
    ({ id }) => !files[id]?.length || errors[id]
  );

  return (
    <div className="min-h-screen bg-[#f4f6f2] text-[#21342c]">
      <PaymentsWorkspaceHeader {...headerProps} />

      <main className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6 sm:py-11">
        <a
          href={creditSetupHref}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-[#245f49] underline"
        >
          ← Back to Credit setup
        </a>
        <h1 className="text-[clamp(30px,4.5vw,43px)] font-bold tracking-tight">
          Credit setup
        </h1>
        <p className="text-[#5f6b63]">{legalName || headerProps.workspaceName}</p>

        <div className="mt-6 grid items-start gap-[18px] min-[721px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <section className={card} aria-labelledby="credit-current-step">
            <h2
              ref={heading}
              id="credit-current-step"
              tabIndex={-1}
              className="text-[22px] font-bold tracking-tight"
            >
              {steps[step]}
            </h2>
            <p className={muted}>Use sample documents. Attachments clear when you leave or refresh.</p>

            {step === 0 && (
              <label className="mt-4 flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 accent-[#245f49]"
                  checked={onboardingConsent}
                  onChange={(event) => setOnboardingConsent(event.currentTarget.checked)}
                />
                I’m authorised to add sample company documents for this Credit preview.
              </label>
            )}

            {step === 1 && (
              <>
                <p className={muted}>
                  Attach what you have. PDF, JPG, PNG and HEIC/HEIF files up to 10 MB each.
                </p>
                <ul className="mt-4 grid gap-2">{companyDocuments.map(renderDocument)}</ul>
              </>
            )}

            {step === 2 && (
              missingDocuments.length > 0 ? (
                <>
                  <p className={muted}>You can add missing documents here or continue to credit consent.</p>
                  <ul className="mt-4 grid gap-2">{missingDocuments.map(renderDocument)}</ul>
                </>
              ) : (
                <p className={muted}>All company document categories have an attachment.</p>
              )
            )}

            {step === 3 && (
              <>
                <p className={muted}>
                  This preview uses sample bank statements and does not authorise a real credit check.
                </p>
                <label className="mt-4 flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0 accent-[#245f49]"
                    checked={creditConsent}
                    onChange={(event) => {
                      setCreditConsent(event.currentTarget.checked);
                      setDeclined(false);
                    }}
                  />
                  I’m authorised to provide sample bank statements for this Credit preview.
                </label>
                {declined && (
                  <p role="status" className={muted}>
                    Credit consent declined. You can agree later or go back to your company documents.
                  </p>
                )}
              </>
            )}

            {step === 4 && (
              <>
                <p className={muted}>
                  For this preview, use sample statements covering the last three months.
                  You can continue without statements.
                </p>
                <ul className="mt-4">{renderDocument(statements)}</ul>
              </>
            )}

            {step === 5 && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
                {reviewItems.map(({ id, label }) => {
                  const count = files[id]?.length ?? 0;
                  return <li key={id}>{label} · {count ? `${count} attached` : "Missing"}</li>;
                })}
              </ul>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {step > 0 && (
                <button type="button" className={secondary} onClick={() => setStep(step - 1)}>
                  Back
                </button>
              )}
              {step === 3 && (
                <button type="button" className={secondary} onClick={declineCreditConsent}>
                  Decline credit consent
                </button>
              )}
              {step === 5 ? (
                <a className={paymentsPrimaryAction} href={creditSetupHref}>Finish preview</a>
              ) : (
                <button
                  type="button"
                  className={paymentsPrimaryAction}
                  disabled={(step === 0 && !onboardingConsent) || (step === 3 && !creditConsent)}
                  onClick={() => setStep(step + 1)}
                >
                  {nextLabels[step]}
                </button>
              )}
            </div>
          </section>

          <aside className={card} aria-label="Credit setup steps">
            <h2 className="text-[22px] font-bold tracking-tight">What you’ll do</h2>
            <ol className="mt-4 grid gap-3">
              {steps.map((label, index) => (
                <li
                  key={label}
                  aria-current={step === index ? "step" : undefined}
                  className="flex items-center gap-2 text-[#5f6b63] aria-[current=step]:font-bold aria-[current=step]:text-[#245f49]"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-[#eaf2eb] text-xs font-semibold text-[#245f49]"
                  >
                    {index + 1}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </main>
    </div>
  );
}