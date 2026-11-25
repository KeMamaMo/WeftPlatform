import { useEffect, useRef, useState } from "react";
import {
  PaymentsWorkspaceHeader,
  paymentsPrimaryAction,
} from "./PaymentsSetupPage";
import type { PaymentsWorkspace } from "./PaymentsSetupPage";

type Props = {
  uid: string;
  workspace: PaymentsWorkspace;
  paymentsSetupHref: string;
  onSignOut: () => Promise<void>;
  isSigningOut: boolean;
  signOutError: string;
};

const documents = [
  { id: "registration", label: "Company registration (or NPO registration for nonprofits)" },
  { id: "directors", label: "Directors’ IDs" },
  { id: "shareholders", label: "Shareholders’ IDs" },
  { id: "address", label: "Proof of address" },
  { id: "bankLetter", label: "Recent bank letter" },
] as const;

const detailFields = [
  { id: "taxPin", label: "Tax compliance PIN", maxLength: 80 },
  { id: "website", label: "Company website", maxLength: 300 },
] as const;

const steps = [
  "Give onboarding consent",
  "Share company documents",
  "Fix any gaps",
  "Review and confirm",
] as const;

type DocumentId = (typeof documents)[number]["id"];
type Step = 0 | 1 | 2 | 3;
type Attachment = { key: number; file: File };

const accepts = ".pdf,.jpg,.jpeg,.png,.heic,.heif";
const allowedFile = /\.(pdf|jpe?g|png|heic|heif)$/i;
const maxBytes = 10 * 1024 * 1024;

const card = "rounded-[14px] border border-[#dce3dc] bg-white p-4 sm:p-6";
const secondary =
  "inline-flex min-h-11 cursor-pointer items-center rounded-[7px] border border-[#bccdc2] px-3 py-2 text-sm font-semibold text-[#245f49] hover:bg-[#eaf2eb]";

export default function PaymentsConsentPreviewPage({
  workspace,
  paymentsSetupHref,
  onSignOut,
  isSigningOut,
  signOutError,
}: Props) {
  const [step, setStep] = useState<Step>(0);
  const [agreed, setAgreed] = useState(false);
  const [files, setFiles] = useState<Partial<Record<DocumentId, Attachment[]>>>({});
  const [errors, setErrors] = useState<Partial<Record<DocumentId, string>>>({});
  const [details, setDetails] = useState({ taxPin: "", website: "" });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextAttachmentId = useRef(0);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  function chooseFiles(id: DocumentId, input: HTMLInputElement) {
    const selected = Array.from(input.files ?? []);
    input.value = "";
    if (!selected.length) return;

    const valid = selected.filter(
      (file) => allowedFile.test(file.name) && file.size > 0 && file.size <= maxBytes
    );

    setErrors((current) => ({
      ...current,
      [id]: valid.length === selected.length
        ? ""
        : "Some files weren’t added. Choose a PDF, JPG, PNG or HEIC/HEIF file up to 10 MB.",
    }));

    if (valid.length) {
      const attachments = valid.map((file) => ({
        key: nextAttachmentId.current++,
        file,
      }));
      setFiles((current) => ({ ...current, [id]: [...(current[id] ?? []), ...attachments] }));
    }
  }

  function renderDocument({ id, label }: (typeof documents)[number]) {
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
            <label className="focus-within:outline-2">
              <span className={secondary}>Upload file</span>
              <input
                type="file"
                className="sr-only"
                aria-label={`Upload file for ${label}`}
                accept={accepts}
                multiple={id === "directors" || id === "shareholders"}
                onChange={(event) => chooseFiles(id, event.currentTarget)}
              />
            </label>

            <label className="hidden focus-within:outline-2 [@media(pointer:coarse)]:block">
              <span className={secondary}>Take photo</span>
              <input
                type="file"
                className="sr-only"
                aria-label={`Take photo for ${label}`}
                accept="image/*"
                capture="environment"
                onChange={(event) => chooseFiles(id, event.currentTarget)}
              />
            </label>
          </div>
        </div>

        {attached.map(({ key, file }) => (
          <div key={key} className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="[overflow-wrap:anywhere]">{file.name}</span>
            <button
              type="button"
              className="min-h-11 text-[#245f49] underline"
              aria-label={`Remove ${file.name}`}
              onClick={() => {
                setFiles((current) => ({
                  ...current,
                  [id]: (current[id] ?? []).filter((attachment) => attachment.key !== key),
                }));
              }}
            >
              Remove
            </button>
          </div>
        ))}

        {errors[id] && <p role="alert" className="mt-2 text-sm text-red-700">{errors[id]}</p>}
      </li>
    );
  }

  const shownDocuments = step === 2
    ? documents.filter(({ id }) => !files[id]?.length || errors[id])
    : documents;

  return (
    <div className="min-h-screen bg-[#f4f6f2] text-[#21342c]">
      <PaymentsWorkspaceHeader
        workspaceName={workspace.name}
        onSignOut={onSignOut}
        isSigningOut={isSigningOut}
        signOutError={signOutError}
      />

      <main className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6 sm:py-11">
        <a
          href={paymentsSetupHref}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-[#245f49] underline"
        >
          ← Back to Payments setup
        </a>
        <h1 className="text-[clamp(30px,4.5vw,43px)] font-bold tracking-tight">
          Payments setup
        </h1>
        <p className="text-[#5f6b63]">{workspace.legalName || workspace.name}</p>

        <div className="mt-6 grid items-start gap-[18px] min-[721px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <section aria-labelledby="payments-step" className={card}>
            <h2
              ref={headingRef}
              id="payments-step"
              tabIndex={-1}
              className="text-[22px] font-bold tracking-tight"
            >
              {steps[step]}
            </h2>
            <p className="mt-2 text-sm text-[#5f6b63]">
              Use sample documents. Attachments stay on this page until you leave or refresh.
            </p>

            {step === 0 ? (
              <form onSubmit={(event) => {
                event.preventDefault();
                if (agreed) setStep(1);
              }}>
                <label className="mt-4 flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={agreed}
                    required
                    className="mt-1 size-4 shrink-0 accent-[#245f49]"
                    onChange={(event) => setAgreed(event.currentTarget.checked)}
                  />
                  I’m authorised to add sample company documents to this Payments preview.
                </label>
                <button type="submit" className={`mt-5 ${paymentsPrimaryAction}`} disabled={!agreed}>
                  Agree and continue
                </button>
              </form>
            ) : step === 3 ? (
              <>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
                  {documents.map(({ id, label }) => {
                    const count = files[id]?.length ?? 0;
                    return <li key={id}>{label} · {count ? `${count} attached` : "Missing"}</li>;
                  })}
                  {detailFields.map(({ id, label }) => (
                    <li key={id}>{label} · {details[id].trim() ? "Provided" : "Missing"}</li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button className={secondary} type="button" onClick={() => setStep(2)}>
                    Back
                  </button>
                  <a className={paymentsPrimaryAction} href={paymentsSetupHref}>
                    Finish preview
                  </a>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-[#5f6b63]">
                  {step === 1
                    ? "Add what you have. PDF, JPG, PNG or HEIC/HEIF files up to 10 MB each."
                    : "Add any missing items you have, or continue to review."}
                </p>

                {shownDocuments.length > 0 && (
                  <ul className="mt-4 grid gap-2">{shownDocuments.map(renderDocument)}</ul>
                )}

                {detailFields.map(({ id, label, maxLength }) => (
                  <label key={id} className="mt-4 block text-sm font-semibold">
                    {label}
                    <input
                      className="mt-2 w-full rounded-[7px] border border-[#bccdc2] px-3 py-2"
                      value={details[id]}
                      maxLength={maxLength}
                      autoComplete="off"
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        setDetails((current) => ({ ...current, [id]: value }));
                      }}
                    />
                  </label>
                ))}

                <div className="mt-5 flex flex-wrap gap-2">
                  {step === 2 && (
                    <button className={secondary} type="button" onClick={() => setStep(1)}>
                      Back
                    </button>
                  )}
                  <button
                    className={paymentsPrimaryAction}
                    type="button"
                    onClick={() => setStep(step === 1 ? 2 : 3)}
                  >
                    {step === 1 ? "Continue to fix gaps" : "Continue to review"}
                  </button>
                </div>
              </>
            )}
          </section>

          <aside className={card} aria-label="Payments setup steps">
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