const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback } from 'react';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { Button } from '@/components/ui/button';
import TriboFormDialog from '@/components/tribos/TriboFormDialog';
import { Crown, UserCircle, Pencil, Trash2, Plus } from 'lucide-react';

export default function Tribos() {
  const { acampamentoId, loading } = useAcampamento();
  const [tribos, setTribos] = useState([]);
  const [campistas, setCampistas] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const load = useCallback(() => {
    if (!acampamentoId) return;
    db.entities.Tribo.filter({ acampamento_id: acampamentoId }).then(setTribos);
    db.entities.Campista.filter({ acampamento_id: acampamentoId }, '-created_date', 500).then(setCampistas);
  }, [acampamentoId]);

  useEffect(load, [load]);

  const abrirNovo = () => { setEditando(null); setDialogOpen(true); };
  const abrirEdicao = (t) => { setEditando(t); setDialogOpen(true); };
  const excluir = async (t) => {
    if (!confirm(`Excluir a tribo "${t.nome}"?`)) return;
    await db.entities.Tribo.delete(t.id);
    load();
  };

  if (loading) return <div className="text-muted-foreground">Carregando...</div>;

  const alocados = campistas.filter((c) => c.tribo).length;
  const completos = tribos.filter((t) => campistas.filter((c) => c.tribo === t.nome).length >= 13).length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs tracking-[0.2em] text-muted-foreground">ESTRUTURA · 03</div>
          <h1 className="text-2xl font-bold mt-1">Tribos</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe a ocupação e os responsáveis por cada núcleo de convivência.</p>
        </div>
        <Button onClick={abrirNovo}><Plus className="w-4 h-4 mr-1" />Nova tribo</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard label="Tribos ativas" value={tribos.length} />
        <SummaryCard label="Campistas alocados" value={alocados} />
        <SummaryCard label="Núcleos completos" value={completos} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tribos.map((t) => {
          const ocupacao = campistas.filter((c) => c.tribo === t.nome).length;
          const pct = Math.min(100, (ocupacao / 13) * 100);
          return (
            <div key={t.id} className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="h-1.5" style={{ background: t.cor || '#999' }}></div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{t.nome}</h3>
                    <div className="text-xs text-muted-foreground mt-0.5">núcleo {String(t.nucleo || 0).padStart(2, '0')}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] tracking-widest px-2 py-1 rounded-full bg-green-50 text-green-700">ATIVA</span>
                    <button onClick={() => abrirEdicao(t)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => excluir(t)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Ocupação</span>
                    <span className="font-medium">{ocupacao} / 13</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: t.cor || '#999' }}></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-muted-foreground" />
                    <div><div className="text-xs text-muted-foreground">Responsável</div><div className="font-medium">{t.responsavel || '—'}</div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    <div><div className="text-xs text-muted-foreground">Anjo</div><div className="font-medium">{t.anjo || '—'}</div></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {tribos.length === 0 && (
          <div className="col-span-3 text-center text-muted-foreground py-12">Nenhuma tribo cadastrada para este acampamento.</div>
        )}
      </div>

      <TriboFormDialog open={dialogOpen} onOpenChange={setDialogOpen} acampamentoId={acampamentoId} tribo={editando} onSaved={load} />
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}