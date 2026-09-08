export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-4 w-24 animate-pulse rounded bg-warm-100" />
      <div className="h-8 w-40 animate-pulse rounded bg-warm-100" />
      <div className="mt-4 flex flex-col gap-2">
        <div className="h-16 animate-pulse rounded-2xl bg-warm-100" />
        <div className="h-16 animate-pulse rounded-2xl bg-warm-100" />
        <div className="h-16 animate-pulse rounded-2xl bg-warm-100" />
      </div>
    </div>
  );
}
