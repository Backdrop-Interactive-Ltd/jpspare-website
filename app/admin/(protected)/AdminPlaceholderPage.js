export default function AdminPlaceholderPage({ title, description, endpoint }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ef3338]">Phase 2.1</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111827]">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667085]">{description}</p>
      </div>

      <div className="rounded-2xl border border-dashed border-[#d0d5dd] bg-white p-8 text-center">
        <p className="text-lg font-black text-[#111827]">CRUD UI coming in a later phase</p>
        <p className="mt-2 text-sm text-[#667085]">The API foundation is ready for this module.</p>
        {endpoint ? <p className="mx-auto mt-5 max-w-md rounded-xl bg-[#f3f4f6] px-4 py-3 font-mono text-xs text-[#4b5563]">{endpoint}</p> : null}
      </div>
    </div>
  );
}
