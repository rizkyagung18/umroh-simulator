import id from '@/i18n/id.json';

export default function ControlsHint() {
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 max-w-xs rounded-lg bg-black/55 px-4 py-3 text-sm text-white/90 backdrop-blur-sm">
      <div className="mb-1 font-semibold">{id.fase0.title}</div>
      <div className="text-white/80">{id.fase0.controlsHint}</div>
      <div className="mt-1 text-xs text-white/60">{id.fase0.noJumpNote}</div>
    </div>
  );
}
