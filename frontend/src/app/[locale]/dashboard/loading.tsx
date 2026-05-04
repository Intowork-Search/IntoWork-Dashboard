export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex flex-col w-64 bg-base-100 border-r border-base-300 p-4 gap-4">
        <div className="skeleton h-10 w-40 mb-4" />
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-8 w-3/4" />
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-8 w-5/6" />
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-10 w-10 rounded-full" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-sm">
              <div className="card-body p-4 gap-2">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-8 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Content cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-sm">
              <div className="card-body gap-3">
                <div className="skeleton h-5 w-32" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
