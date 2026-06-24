export const UserManagementSkeleton = () => {
  const pulseBg = "bg-slate-200/60";
  const containerBg = "bg-white";
  const borderColor = "border-slate-200";

  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* 1. Statistics Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`h-28 rounded-xl border-2 ${borderColor} ${containerBg} p-5 flex items-center gap-4 relative overflow-hidden`}
          >
            {/* Sidebar Accent Placeholder */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100" />
            <div className={`h-12 w-12 rounded-xl ${pulseBg}`} />
            <div className="space-y-2">
              <div className={`h-2.5 w-20 rounded ${pulseBg} opacity-60`} />
              <div className={`h-7 w-12 rounded-lg ${pulseBg}`} />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Professional Toolbar Skeleton */}
      <div className="bg-white p-3 rounded-lg border-2 border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-1/3 h-11 rounded-lg bg-slate-50 border-2 border-slate-200 p-2">
          <div className={`h-full w-full rounded-md ${pulseBg} opacity-40`} />
        </div>
        <div className={`h-10 w-40 rounded-lg ${pulseBg}`} />
      </div>

      {/* 3. Main Data Table Skeleton */}
      <div className={`bg-white rounded-lg border-2 ${borderColor} overflow-hidden shadow-sm`}>
        {/* Table Header Placeholder */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
          <div className={`h-3 w-32 rounded ${pulseBg} opacity-50`} />
          <div className={`h-5 w-40 rounded-full ${pulseBg} opacity-30`} />
        </div>

        {/* Table Body Rows */}
        <div className="divide-y divide-slate-50">
          {[...Array(6)].map((_, row) => (
            <div key={row} className="px-6 py-4 flex items-center justify-between gap-8">
              {/* Identity Column */}
              <div className="w-[350px] flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${pulseBg}`} />
                <div className="space-y-2">
                  <div className={`h-3 w-32 rounded ${pulseBg}`} />
                  <div className={`h-2.5 w-24 rounded ${pulseBg} opacity-50`} />
                </div>
              </div>

              {/* Role Column */}
              <div className="hidden md:block flex-1">
                <div className={`h-6 w-20 rounded-full ${pulseBg} opacity-60`} />
              </div>

              {/* Contact Column */}
              <div className="hidden lg:block w-48 space-y-2">
                <div className={`h-3 w-full rounded ${pulseBg} opacity-40`} />
                <div className={`h-3 w-3/4 rounded ${pulseBg} opacity-40`} />
              </div>

              {/* Actions Column */}
              <div className="w-32 flex justify-end gap-2">
                <div className={`h-8 w-8 rounded-full ${pulseBg}`} />
                <div className={`h-8 w-8 rounded-full ${pulseBg}`} />
                <div className={`h-8 w-8 rounded-full ${pulseBg}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};