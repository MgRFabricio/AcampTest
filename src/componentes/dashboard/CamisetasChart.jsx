export default function CamisetasChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.tamanho} className="flex items-center gap-3">
          <div className="w-10 text-xs font-medium text-muted-foreground">{d.tamanho}</div>
          <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
            <div
              className="h-full bg-primary/80 rounded-md flex items-center justify-end pr-2 min-w-[2px]"
              style={{ width: `${Math.max(2, (d.total / max) * 100)}%` }}
            >
              {d.total > 0 && <span className="text-[10px] text-white font-medium">{d.total}</span>}
            </div>
          </div>
          <div className="w-6 text-xs text-right text-muted-foreground">{d.total}</div>
        </div>
      ))}
    </div>
  );
}