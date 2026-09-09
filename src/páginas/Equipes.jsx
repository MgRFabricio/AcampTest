const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback } from 'react';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { Button } from '@/components/ui/button';
import EquipeFormDialog from '@/components/equipes/EquipeFormDialog';
import { Pencil, Trash2, Plus } from 'lucide-react';

const ORDEM_FUNCOES = [
  'Coordenadores Líderes', 'Líderes', 'Coordenação Geral', 'Coordenação', 'Coordenação Líderes',
  'Cozinha', 'Limpeza', 'Infraestrutura', 'Intercessão', 'João Batista', 'Casa do Pai',
  'Anjo da Mata', 'Música', 'Bem Estar', 'Pregação',
];

export default function Equipes() {
  const { acampamentoId, loading } = useAcampamento();
  const [equipe, setEquipe] = useState([]);
  const [filtro, setFiltro] = useState('Todas');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const load = useCallback(() => {
    if (!acampamentoId) return;
    db.entities.Equipe.filter({ acampamento_id: acampamentoId }, '-created_date', 500).then(setEquipe);
  }, [acampamentoId]);
  useEffect(load, [load]);

  const abrirNovo = () => { setEditando(null); setDialogOpen(true); };
  const abrirEdicao = (m) => { setEditando(m); setDialogOpen(true); };
  const excluir = async (m) => {
    if (!confirm(`Excluir "${m.nome}"?`)) return;
    await db.entities.Equipe.delete(m.id);
    load();
  };

  if (loading) return <div className="text-muted-foreground">Carregando...</div>;

  const funcoes = ['Todas', ...ORDEM_FUNCOES.filter((f) => equipe.some((e) => e.funcao === f))];
  const grupos = ORDEM_FUNCOES
    .filter((f) => equipe.some((e) => e.funcao === f) && (filtro === 'Todas' || f === filtro))
    .map((f) => ({ funcao: f, membros: equipe.filter((e) => e.funcao === f) }));

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs tracking-[0.2em] text-muted-foreground">PESSOAS · 04</div>
          <h1 className="text-2xl font-bold mt-1">Equipes</h1>
          <p className="text-sm text-muted-foreground mt-1">Líderes, anjos e servos organizados para cada frente de cuidado.</p>
        </div>
        <Button onClick={abrirNovo}><Plus className="w-4 h-4 mr-1" />Novo membro</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {funcoes.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filtro === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-white border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {grupos.map((g) => (
          <div key={g.funcao}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold">{g.funcao}</h2>
              <span className="text-xs text-muted-foreground">{g.membros.length} {g.membros.length === 1 ? 'pessoa' : 'pessoas'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {g.membros.map((m) => (
                <div key={m.id} className="bg-white rounded-xl border border-border p-4 relative">
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button onClick={() => abrirEdicao(m)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => excluir(m)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="font-medium text-sm pr-16">{m.nome}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.papel}{m.sexo ? ` · ${m.sexo}` : ''}</div>
                  <div className="mt-3 space-y-1 text-xs">
                    {m.tribo && <div><span className="text-muted-foreground">Tribo: </span>{m.tribo}</div>}
                    <div><span className="text-muted-foreground">Camiseta: </span>{m.camiseta || '—'}</div>
                    {m.telefone && <div><span className="text-muted-foreground">Tel: </span>{m.telefone}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {grupos.length === 0 && <p className="text-sm text-muted-foreground">Nenhum membro de equipe cadastrado.</p>}
      </div>

      <EquipeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} acampamentoId={acampamentoId} membro={editando} onSaved={load} />
    </div>
  );
}