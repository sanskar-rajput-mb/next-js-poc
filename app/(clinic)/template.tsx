// template.tsx is like a layout that re-mounts on every navigation instead of
// persisting. That makes it the place for per-page effects — here, a short
// entrance animation each time a new page opens.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
