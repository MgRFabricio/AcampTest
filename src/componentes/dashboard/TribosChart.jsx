export default function TribosChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.ocupacao));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.id} className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.cor || '#999' }}></span>
          <div className="w-44 text-xs truncate">{d.nome}</div>
          <div className="flex-1 h-5 bg-muted rounded-md overflow-hidden">
            <div
              className="h-full rounded-md min-w-[2px]"
              style={{ width: `${Math.max(2, (d.ocupacao / max) * 100)}%`, background: d.cor || '#999' }}
            ></div>
          </div>
          <div className="w-6 text-xs text-right text-muted-foreground">{d.ocupacao}</div>
        </div>
      ))}
    </div>
  );
}