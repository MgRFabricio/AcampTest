import { Tent } from 'lucide-react';

export default function InscricaoShell({ title, subtitle = 'Preencha seus dados para participar.', children }) {
  return (
    <div className="min-h-screen bg-[#f4f7f9] py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-10 h-10 rounded-full bg-sidebar flex items-center justify-center">
            <Tent className="w-5 h-5 text-sidebar-ring" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold">Acampamento</div>
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground">GESTÃO · EVENTOS</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h1 className="text-lg font-bold mb-1">{title}</h1>
          <p className="text-xs text-muted-foreground mb-5">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}