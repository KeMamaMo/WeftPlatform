import { useId } from "react";

const stages = [
  { id: "onboarding", label: "Onboarding", milestone: "Collect", color: "#dcebd3" },
  { id: "in_review", label: "In review", milestone: "Review", color: "#b5d1a6" },
  { id: "approved", label: "Approved", milestone: "Approve", color: "#93bfa1" },
  { id: "activated", label: "Activated", milestone: "Activate", color: "#86b495" },
] as const;

type Stage = (typeof stages)[number]["id"];

type Business = {
  id: string;
  name: string;
  legalForm?: string;
  stage?: Stage;
  status: string;
  nextAction?: string;
  nextActor?: { name: string; role?: string };
  actionRequired?: boolean;
  pendingApproval?: boolean;
};

type PageProps = {
  businesses?: readonly Business[];
  workspaceName?: string;
  region?: string;
  sandbox?: boolean;
};

const icons = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  folder: "M3 6h7l2 2h9v11H3z",
  shield: "M12 3l8 3v5c0 5-4 8-8 10-4-2-8-5-8-10V6z M9 12l2 2 4-4",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2",
  code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 14",
  book: "M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1zm0 0v14",
  external: "M7 17 17 7M7 7h10v10",
  plus: "M12 5v14M5 12h14",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M15 15l5 5",
  chevron: "m9 6 6 6-6 6",
};

type IconName = keyof typeof icons;

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name]} />
    </svg>
  );
}

function PipelineChart({ businesses }: { businesses: readonly Business[] }) {
  const dotPatternId = useId();
  const chartBusinesses = businesses.filter((business) =>
    stages.some((stage) => stage.id === business.stage)
  );

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 640 145"
      className="h-auto w-full min-w-0"
    >
      <defs>
        <pattern id={dotPatternId} width="13" height="13" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".7" fill="#93b49e" opacity=".35" />
        </pattern>
      </defs>

      <rect width="640" height="125" fill={`url(#${dotPatternId})`} />

      {stages.map((stage, index) => {
        const x = 145 + index * 145;

        return (
          <g key={stage.id}>
            <path d={`M${x} 10V120`} stroke="#86b495" strokeDasharray="2 5" opacity=".5" />
            <text x={x} y="140" fill="#dcebd3" textAnchor="middle" className="font-mono text-[10px]">
              {stage.milestone}
            </text>
          </g>
        );
      })}

      {chartBusinesses.map((business, index) => {
        const stageIndex = stages.findIndex((stage) => stage.id === business.stage);
        const endX = 145 + stageIndex * 145;
        const spread = 62 / Math.max(chartBusinesses.length - 1, 1);
        const startY = 35 + index * spread;
        const endY = 40 + ((index * 17 + stageIndex * 9) % 65);
        const color = stages[stageIndex].color;

        return (
          <g key={business.id}>
            <path
              d={`M0 ${startY} C${endX * 0.38} ${startY}, ${endX * 0.6} ${endY}, ${endX} ${endY}`}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
            />
            <circle cx={endX} cy={endY} r="3" fill={color} stroke="#173f32" />
          </g>
        );
      })}
    </svg>
  );
}

type NavItem = {
  label: string;
  icon: IconName;
  active?: boolean;
  count?: number;
};

function SidebarItem({ label, icon, active, count }: NavItem) {
  return (
    <li
      aria-current={active ? "page" : undefined}
      className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm ${
        active ? "bg-[#eaf2eb] font-semibold text-[#245f49]" : "text-[#45564c]"
      }`}
    >
      <Icon name={icon} />
      <span>{label}</span>
      {count !== undefined && (
        <span className="ml-auto rounded bg-[#f0f3ef] px-1.5 font-mono text-xs text-[#245f49]">
          {count}
        </span>
      )}
    </li>
  );
}

export default function PaymentActivationPage({
  businesses = [],
  workspaceName = "Platform workspace",
  region,
  sandbox = false,
}: PageProps) {
  const stageCounts = stages.map((stage) =>
    businesses.filter((business) => business.stage === stage.id).length
  );
  const pipelineTotal = stageCounts.reduce((total, count) => total + count, 0);
  const actionCount = businesses.filter((business) => business.actionRequired).length;
  const approvalCount = businesses.filter((business) => business.pendingApproval).length;
  const workspaceContext = [region, sandbox ? "Sandbox" : null].filter(Boolean).join(" · ");

  const workspaceNav: NavItem[] = [
    { label: "Payment activation", icon: "grid", active: true },
    { label: "Businesses", icon: "folder", count: businesses.length },
    { label: "Approvals", icon: "shield", count: approvalCount },
    { label: "Activity log", icon: "clock" },
  ];

  const buildNav: NavItem[] = [
    { label: "Developer tools", icon: "code" },
    { label: "Approval rules", icon: "book" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f2] text-[#21342c] md:grid md:grid-cols-[190px_minmax(0,1fr)]">
      <aside className="border-b border-[#dce3dc] bg-white px-3 py-5 md:sticky md:top-0 md:flex md:min-h-screen md:self-start md:flex-col md:border-b-0 md:border-r md:py-8">
        <div className="flex items-center gap-1 px-3 text-[36px] font-bold leading-none tracking-[-0.07em] text-[#245f49]">
          <svg
            aria-hidden="true"
            className="h-6 w-6 -rotate-[25deg]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          >
            <path d="M3 7q4-4 8 0t10 0M3 12q4-4 8 0t10 0M3 17q4-4 8 0t10 0" />
          </svg>
          weft
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-lg border border-[#dce3dc] p-3 md:mt-9">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#eaf2eb] text-[#245f49]">
            <Icon name="grid" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">{workspaceName}</p>
            {workspaceContext && (
              <p className="mt-1 text-xs text-[#5f6b63]">{workspaceContext}</p>
            )}
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 md:block">
          <div>
            <p className="mb-2 px-3 font-mono text-[11px] uppercase tracking-widest text-[#5f6b63]">
              Workspace
            </p>
            <ul>
              {workspaceNav.map((item) => <SidebarItem key={item.label} {...item} />)}
            </ul>
          </div>
          <div className="md:mt-8">
            <p className="mb-2 px-3 font-mono text-[11px] uppercase tracking-widest text-[#5f6b63]">
              Build
            </p>
            <ul>
              {buildNav.map((item) => <SidebarItem key={item.label} {...item} />)}
            </ul>
          </div>
        </div>

        <div className="hidden pt-8 md:mt-auto md:flex md:items-center md:gap-3 md:px-3 md:text-sm md:text-[#45564c]">
          <Icon name="external" />
          Weft website
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#dce3dc] bg-white px-5 py-3 sm:px-8">
          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <span className="text-[#5f6b63]">{workspaceName}</span>
            <span aria-hidden="true" className="text-[#819087]">/</span>
            <span className="font-semibold">Payment activation</span>
          </div>

          {sandbox && (
            <span className="flex items-center gap-2 rounded-full border border-[#dce3dc] bg-[#f4f6f2] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-[#54896f]" />
              Sandbox demo
            </span>
          )}
        </header>

        <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.05em] sm:text-[40px]">
                Payment activation
              </h1>
              <p className="mt-1 text-sm text-[#5f6b63] sm:text-[15px]">
                Track each business from its first invitation to its first settled payment.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#245f49] px-4 text-sm font-semibold text-white"
            >
              <Icon name="plus" />
              Add business
            </button>
          </div>

          <section
            aria-labelledby="pipeline-heading"
            className="mt-7 overflow-hidden rounded-[14px] border border-[#dce3dc] bg-white"
          >
            <div className="grid items-center gap-4 bg-[#173f32] px-7 py-5 text-white lg:grid-cols-[minmax(170px,1fr)_3fr]">
              <div>
                <h2 id="pipeline-heading" className="font-mono text-xs uppercase tracking-widest text-[#dcebd3]">
                  Activation pipeline
                </h2>
                <p className="mt-2 text-[52px] font-semibold leading-none tabular-nums">
                  {pipelineTotal}
                </p>
                <p className="mt-2 text-sm text-[#dcebd3]">Businesses in the pipeline</p>
              </div>
              <PipelineChart businesses={businesses} />
            </div>

            <dl className="grid grid-cols-2 gap-px bg-[#dce3dc] lg:grid-cols-4">
              {stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center justify-between gap-2 bg-white px-4 py-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0 rounded-full border border-[#719383]"
                      style={{ backgroundColor: stage.color }}
                    />
                    {stage.label}
                  </dt>
                  <dd className="text-xl font-semibold tabular-nums">{stageCounts[index]}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="queue-heading" className="mt-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="queue-heading" className="text-[22px] font-semibold tracking-tight">
                Activation queue
              </h2>
              <label className="flex min-h-9 w-full items-center gap-2 rounded-lg border border-[#dce3dc] bg-white px-3 text-[#5f6b63] sm:w-56">
                <Icon name="search" />
                <input
                  aria-label="Search businesses"
                  type="search"
                  placeholder="Search businesses"
                  disabled
                  className="w-full bg-transparent text-sm placeholder:text-[#5f6b63]"
                />
              </label>
            </div>

            <div className="overflow-hidden rounded-[14px] border border-[#dce3dc] bg-white">
              <div className="flex flex-wrap gap-5 border-b border-[#dce3dc] px-5 text-sm">
                <span className="py-3 text-[#5f6b63]">Action required {actionCount}</span>
                <span className="border-b-2 border-[#245f49] py-3 font-semibold text-[#245f49]">
                  All businesses {businesses.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead className="border-b border-[#dce3dc] bg-[#f7f9f6] font-mono text-[11px] uppercase tracking-wide text-[#5f6b63]">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Business</th>
                      <th scope="col" className="px-4 py-3 font-medium">Case status</th>
                      <th scope="col" className="px-4 py-3 font-medium">Next action</th>
                      <th scope="col" className="px-4 py-3 font-medium">Who acts next</th>
                      <th scope="col" className="w-10"><span className="sr-only">Case details</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dce3dc]">
                    {businesses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-[#5f6b63]">
                          No businesses to display yet.
                        </td>
                      </tr>
                    ) : (
                      businesses.map((business) => (
                        <tr key={business.id}>
                          <th scope="row" className="px-4 py-3 font-normal">
                            <div className="flex items-center gap-2.5">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#eaf2eb] text-[#245f49]">
                                <Icon name="folder" />
                              </span>
                              <div>
                                <div className="font-semibold">{business.name}</div>
                                {business.legalForm && (
                                  <div className="text-xs text-[#5f6b63]">{business.legalForm}</div>
                                )}
                              </div>
                            </div>
                          </th>
                          <td className="px-4 py-3">
                            <span className="rounded border border-[#dce3dc] bg-[#f4f6f2] px-2 py-1 text-xs">
                              {business.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">{business.nextAction ?? "—"}</td>
                          <td className="px-4 py-3">
                            <div>{business.nextActor?.name ?? "—"}</div>
                            {business.nextActor?.role && (
                              <div className="text-xs text-[#5f6b63]">{business.nextActor.role}</div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-[#5f6b63]"><Icon name="chevron" /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}