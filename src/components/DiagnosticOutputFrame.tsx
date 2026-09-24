export default function DiagnosticOutputFrame({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
      <img src={imageUrl} alt="Diagnostic Output" className="w-full block" />
      {/* Scan lines overlay for aesthetic */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
        }}
      />
    </div>
  )
}
