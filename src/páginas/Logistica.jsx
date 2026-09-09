const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback } from 'react';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { Button } from '@/components/ui/button';
import ConviteFormDialog from '@/components/logistica/ConviteFormDialog';
import EscalaFormDialog from '@/components/logistica/EscalaFormDialog';
import { UtensilsCrossed, Droplets, Shirt, Tent, Bus, Tag, Pencil, Trash2, Plus } from 'lucide-react';

const CATEGORIA_ICON = {
  almoço: UtensilsCrossed, banho: Droplets, louça: UtensilsCrossed, ônibus: Bus,
  camisetas: Shirt, barracas: Tent,
};

export default function Logistica() {
  const { acampamentoId, loading } = useAcampamento();
  const [convites, setConvites] = useState([]);
  const [escalas, setEscalas] = useState([]);
  const [conviteDialog, setConviteDialog] = useState(false);
  const [escalaDialog, setEscalaDialog] = useState(false);
  const [editConvite, setEditConvite] = useState(null);
  const [editEscala, setEditEscala] = useState(null);

  const load = useCallback(() => {
    if (!acampamentoId) return;
    db.entities.Convite.filter({ acampamento_id: acampamentoId }, '-created_date', 200).then(setConvites);
    db.entities.Escala.filter({ acampamento_id: acampamentoId }).then(setEscalas);
  }, [acampamentoId]);
  useEffect(load, [load]);

  const excluirConvite = async (c) => {
    if (!confirm(`Excluir convite #${c.numero}?`)) return;
    await db.entities.Convite.delete(c.id);
    load();
  };
  const excluirEscala = async (e) => {
    if (!confirm(`Excluir escala "${e.titulo}"?`)) return;
    await db.entities.Escala.delete(e.id);
    load();
  };

  if (loading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <div className="text-xs tracking-[0.2em] text-muted-foreground">OPERAÇÃO · 05</div>
        <h1 className="text-2xl font-bold mt-1">Logística</h1>
        <p className="text-sm text-muted-foreground mt-1">Convites e escalas práticas para o acampamento acontecer sem ruído.</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Controle de convites</h2>
          <Button size="sm" onClick={() => { setEditConvite(null); setConviteDialog(true); }}><Plus className="w-4 h-4 mr-1" />Novo convite</Button>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Número</th>
              <th className="text-left px-4 py-3 font-medium">Casal / contato</th>
              <th className="text-left px-4 py-3 font-medium">Telefones</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Notas</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {convites.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">#{String(c.numero || '').padStart(3, '0')}</td>
                <td className="px-4 py-3 font-medium">{c.casal_contato}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.telefones || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'Pago' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {c.status || 'Pendente'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.notas || '—'}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => { setEditConvite(c); setConviteDialog(true); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground mr-1"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => excluirConvite(c)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
            {convites.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum convite registrado.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Escalas operacionais <span className="text-muted-foreground font-normal">· {escalas.length} atividades</span></h2>
          <Button size="sm" onClick={() => { setEditEscala(null); setEscalaDialog(true); }}><Plus className="w-4 h-4 mr-1" />Nova escala</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {escalas.map((e) => {
            const Icon = CATEGORIA_ICON[e.categoria] || Tag;
            return (
              <div key={e.id} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] tracking-widest px-2 py-1 rounded-full ${e.status === 'pronto' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {e.status || 'planejado'}
                    </span>
                    <button onClick={() => { setEditEscala(e); setEscalaDialog(true); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => excluirEscala(e)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-3">{e.categoria}</div>
                <h3 className="font-semibold text-sm mt-0.5">{e.titulo}</h3>
                <p className="text-xs text-muted-foreground mt-1">{e.descricao}</p>
                <div className="text-xs text-muted-foreground mt-3">{e.periodo || '—'}</div>
              </div>
            );
          })}
          {escalas.length === 0 && <div className="col-span-3 text-center text-muted-foreground py-8">Nenhuma escala cadastrada.</div>}
        </div>
      </div>

      <ConviteFormDialog open={conviteDialog} onOpenChange={setConviteDialog} acampamentoId={acampamentoId} convite={editConvite} onSaved={load} />
      <EscalaFormDialog open={escalaDialog} onOpenChange={setEscalaDialog} acampamentoId={acampamentoId} escala={editEscala} onSaved={load} />
    </div>
  );
}