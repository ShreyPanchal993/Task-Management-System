import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowRight,
  LuBadgeCheck,
  LuChartColumnIncreasing,
  LuClipboardList,
  LuLayoutDashboard,
  LuUsers,
} from "react-icons/lu";
import { UserContext } from "../../context/userContext";

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const dashboardPath = user?.role === "admin" || user?.role === "super_admin" ? "/admin/dashboard" : "/user/dashboard";

  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-30 border-b backdrop-blur-xl" style={{ background: "rgba(247, 241, 231, 0.76)", borderColor: "rgba(148, 163, 184, 0.14)" }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900">
              TRACKORA
            </h1>
          </div>

            <div className="flex items-center gap-3">
            <Link to="/login" className="hidden md:inline-flex btn-secondary w-auto min-w-[136px] justify-center px-5">
              Sign In
            </Link>
            <Link to={user ? dashboardPath : "/signUp"} className="inline-flex btn-primary w-auto min-w-[136px] justify-center px-5">
              {user ? "Open Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-[-4rem] top-14 h-72 w-72 rounded-full blur-3xl opacity-40" style={{ background: "rgba(40, 80, 217, 0.18)" }} />
            <div className="absolute right-[-3rem] top-28 h-80 w-80 rounded-full blur-3xl opacity-35" style={{ background: "rgba(217, 119, 87, 0.18)" }} />
            <div className="absolute bottom-8 left-1/3 h-52 w-52 rounded-full blur-3xl opacity-30" style={{ background: "rgba(20, 184, 166, 0.14)" }} />
          </div>

          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-slate-600" style={{ background: "rgba(255,255,255,0.55)", borderColor: "rgba(148, 163, 184, 0.14)" }}>
                <LuBadgeCheck className="text-primary" />
                Modern workspace for tasks, teams, and delivery
              </div>

              <h2 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                Manage work with a UI that feels clear, premium, and fast.
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Trackora helps teams assign work, track progress, manage members, and stay aligned without the clutter of a basic dashboard.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={user ? dashboardPath : "/signUp"} className="inline-flex btn-primary w-auto items-center justify-center gap-2 px-6">
                  {user ? "Go To Dashboard" : "Create Account"} <LuArrowRight />
                </Link>
                <Link to="/login" className="inline-flex btn-secondary w-auto items-center justify-center gap-2 px-6">
                  Sign In
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <MetricCard label="Task clarity" value="100%" text="Status, priority, and ownership visible at a glance." />
                <MetricCard label="Team ready" value="Built-in" text="Admins and members work from the same shared flow." />
                <MetricCard label="Reporting" value="Live" text="Dashboards and exports keep execution measurable." />
              </div>
            </div>

            <div className="relative z-10">
              <div className="card p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="soft-label">Preview</p>
                    <h3 className="mt-2 text-2xl font-semibold">Execution overview</h3>
                  </div>
                  <div className="rounded-2xl border px-4 py-2 text-sm text-slate-600" style={{ background: "rgba(255,255,255,0.65)", borderColor: "var(--border-soft)" }}>
                    Today
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <PreviewStat accent="from-blue-500 to-blue-700" title="All Tasks" value="128" subtext="Across active teams" />
                  <PreviewStat accent="from-amber-500 to-orange-600" title="In Progress" value="42" subtext="Currently moving" />
                  <PreviewStat accent="from-emerald-500 to-teal-600" title="Completed" value="73" subtext="Delivered on track" />
                  <PreviewStat accent="from-slate-700 to-slate-900" title="Team Members" value="16" subtext="Active collaborators" />
                </div>

                <div className="mt-6 rounded-[24px] border p-4" style={{ background: "rgba(255,255,255,0.62)", borderColor: "var(--border-soft)" }}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">Recent workflow</h4>
                    <span className="text-xs text-slate-400">Updated now</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <PreviewRow icon={LuClipboardList} title="Product launch checklist" meta="High priority" status="In Progress" />
                    <PreviewRow icon={LuUsers} title="Team onboarding docs" meta="Assigned to 4 people" status="Pending" />
                    <PreviewRow icon={LuChartColumnIncreasing} title="Monthly performance report" meta="Export ready" status="Completed" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
          <div className="page-header">
            <div>
              <p className="soft-label">Why It Works</p>
              <h3 className="page-title mt-2">Built for daily execution, not just pretty screenshots</h3>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              The product is structured around the pages teams actually use every day: dashboards, task boards, people management, and progress tracking.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard icon={LuLayoutDashboard} title="Focused dashboards" text="Admin and user dashboards surface the right numbers, recent work, and trends without overwhelming the screen." />
            <FeatureCard icon={LuClipboardList} title="Task-first workflow" text="Create, assign, update, and inspect tasks with cleaner forms, stronger hierarchy, and clearer status treatment." />
            <FeatureCard icon={LuUsers} title="Team visibility" text="See who owns what, where work is blocked, and how much has been completed from one shared interface." />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
          <div className="card">
            <div className="page-header mb-8">
              <div>
                <p className="soft-label">Workflow</p>
                <h3 className="page-title mt-2">Three simple steps</h3>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StepCard number="01" title="Create and assign" text="Capture title, description, due date, checklist, attachments, and ownership in one flow." />
              <StepCard number="02" title="Track progress" text="Monitor task status, priority mix, and recent work through cleaner cards and charts." />
              <StepCard number="03" title="Review and export" text="Use dashboards and downloadable reports to keep team execution visible." />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <div className="rounded-[32px] border px-6 py-10 text-center md:px-10" style={{ background: "linear-gradient(135deg, #243a9c 0%, #2850d9 46%, #d97757 120%)", borderColor: "rgba(255,255,255,0.14)", boxShadow: "0 24px 60px rgba(37, 56, 130, 0.22)" }}>
            <p className="soft-label !text-white/70">Start Now</p>
            <h3 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              Bring your workflow into a cleaner, more modern Trackora workspace.
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 md:text-base">
              Create an account, invite your team, and move from a basic utility UI to a product experience that feels intentional.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={user ? dashboardPath : "/signUp"} className="inline-flex w-auto items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900">
                {user ? "Open Dashboard" : "Create Account"} <LuArrowRight />
              </Link>
              <Link to="/login" className="inline-flex w-auto items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="border-t mt-8"
        style={{ background: "rgba(255, 255, 255, 0.38)", borderColor: "rgba(148, 163, 184, 0.14)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="font-semibold text-slate-900">Trackora</p>
            <p className="mt-1">Modern task tracking for teams and focused execution.</p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/signUp" className="hover:text-slate-900 transition-colors">Create Account</Link>
          </div>
        </div>

        <div
          className="border-t"
          style={{ borderColor: "rgba(148, 163, 184, 0.12)" }}
        >
          <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-slate-500 md:px-8">
            {`Copyright © ${new Date().getFullYear()} Trackora. All rights reserved.`}
          </div>
        </div>
      </footer>
    </div>
  );
};

const MetricCard = ({ label, value, text }) => (
  <div className="rounded-[24px] border p-4" style={{ background: "rgba(255,255,255,0.52)", borderColor: "rgba(148, 163, 184, 0.14)" }}>
    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
  </div>
);

const PreviewStat = ({ accent, title, value, subtext }) => (
  <div className="rounded-[22px] border p-4" style={{ background: "rgba(255,255,255,0.58)", borderColor: "var(--border-soft)" }}>
    <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${accent}`} />
    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
    <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-sm text-slate-600">{subtext}</p>
  </div>
);

const PreviewRow = ({ icon: Icon, title, meta, status }) => (
  <div className="flex items-center justify-between gap-3 rounded-[20px] border p-3" style={{ background: "rgba(255,255,255,0.5)", borderColor: "var(--border-soft)" }}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "rgba(40, 80, 217, 0.1)", color: "var(--primary)" }}>
        <Icon />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{meta}</p>
      </div>
    </div>
    <span className="rounded-full border px-3 py-1 text-[11px] font-semibold text-slate-700" style={{ background: "rgba(248,244,236,0.8)", borderColor: "var(--border-soft)" }}>
      {status}
    </span>
  </div>
);

const FeatureCard = ({ icon: Icon, title, text }) => (
  <div className="card">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(40, 80, 217, 0.1)", color: "var(--primary)" }}>
      <Icon className="text-xl" />
    </div>
    <h4 className="mt-5 text-xl font-semibold text-slate-900">{title}</h4>
    <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
  </div>
);

const StepCard = ({ number, title, text }) => (
  <div className="rounded-[24px] border p-5" style={{ background: "rgba(255,255,255,0.56)", borderColor: "var(--border-soft)" }}>
    <p className="text-sm font-semibold text-primary">{number}</p>
    <h4 className="mt-3 text-lg font-semibold text-slate-900">{title}</h4>
    <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
  </div>
);

export default LandingPage;


