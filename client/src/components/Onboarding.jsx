export default function Onboarding({ onStart }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="relative h-[65vh] overflow-hidden bg-brand">
        {/* ring, top-right */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border-[12px] border-white/10" />
        {/* zigzags */}
        <Zigzag className="absolute left-0 top-[24%] w-[47%]" />
        <Zigzag className="absolute bottom-[10%] right-0 w-[52%]" />
      </div>

      <div className="flex flex-1 flex-col px-6 pb-10 pt-8">
        <h1 className="text-[28px] font-bold leading-tight text-black">Manage What To Do</h1>
        <p className="mt-3 max-w-[280px] text-[13px] leading-relaxed text-slate-500">
          The best way to manage what you have to do, don't forget your plans
        </p>
        <button
          onClick={onStart}
          className="mt-auto h-14 rounded-sm bg-brand text-base font-medium text-white hover:bg-brand-dark"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

function Zigzag({ className }) {
  return (
    <svg className={className} viewBox="0 0 200 120" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="11">
      <path d="M0 60 L40 20 L80 60 L120 20 L160 60 L200 20" />
      <path d="M0 90 L40 50 L80 90 L120 50 L160 90 L200 50" />
      <path d="M0 120 L40 80 L80 120 L120 80 L160 120 L200 80" />
    </svg>
  );
}
