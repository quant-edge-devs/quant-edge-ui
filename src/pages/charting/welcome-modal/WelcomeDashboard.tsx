export default function WelcomeDashboard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center border border-white bg-black/60">
      <div className="relative w-full max-w-md rounded-2xl border border-white bg-[#181425] p-8 shadow-2xl">
        <button
          className="absolute top-4 right-4 cursor-pointer text-xl text-purple-200 hover:text-fuchsia-400"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="mb-2 text-2xl font-bold text-white">
          Welcome to Your Dashboard!
        </h2>
        <div className="mb-6 text-purple-200">
          Here you can create and customize financial charts to visualize your
          favorite stocks and metrics.
        </div>
        <button
          className="w-full cursor-pointer rounded-lg bg-fuchsia-600 px-6 py-2 font-semibold text-white transition hover:bg-fuchsia-700"
          onClick={onClose}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
