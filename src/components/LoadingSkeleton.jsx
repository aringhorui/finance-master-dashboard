function S({ className }) {
  return <div className={`skeleton ${className}`} />;
}

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="h-[2px] bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />
      <div className="border-b border-white/[0.06] px-3 sm:px-6 py-3.5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <S className="h-10 w-10 !rounded-xl" />
            <div>
              <S className="h-5 w-36 mb-1.5" />
              <S className="h-3 w-48" />
            </div>
          </div>
          <div className="flex gap-3">
            <S className="h-9 w-56 hidden sm:block" />
            <S className="h-9 w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-6 space-y-4">
        <S className="h-12 w-full !rounded-2xl" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 sm:p-5">
              <S className="h-3 w-20 mb-3" />
              <S className="h-7 w-28 mb-1.5" />
              <S className="h-3 w-24" />
            </div>
          ))}
        </div>

        <div className="card p-4 sm:p-6">
          <S className="h-4 w-32 mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}><S className="h-3 w-14 mb-1.5" /><S className="h-6 w-20" /></div>
            ))}
          </div>
          <S className="h-3 w-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="card p-4 sm:p-6">
              <S className="h-4 w-28 mb-4" />
              <S className="h-52 sm:h-64 w-full" />
            </div>
          ))}
        </div>

        <div className="card p-4 sm:p-6">
          <S className="h-4 w-24 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <S key={i} className="h-10 w-full mb-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
