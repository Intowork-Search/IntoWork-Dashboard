export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-48" />

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card bg-base-100 shadow-sm">
            <div className="card-body flex-row items-center gap-4 p-4">
              <div className="skeleton h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-5 w-1/3" />
                <div className="skeleton h-4 w-1/4" />
              </div>
              <div className="skeleton h-6 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
