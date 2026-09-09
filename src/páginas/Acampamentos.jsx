const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { formatPeriodo } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ArrowRight, Pencil } from 'lucide-react';

const STATUS_MAP = {
  em_andamento: { label: 'EM ANDAMENTO', cls: 'bg-green-50 text-green-700' },
  planejamento: { label: 'PLANEJAMENTO', cls: 'bg-amber-50 text-amber-700' },
};

export default function Acampamentos() {
  const { acampamentos, loading } = useAcampamento();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', lema: '', data_inicio: '', data_fim: '', capacidade: 100, status: 'planejamento' });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const criar = async (e) => {
    e.preventDefault();
    const novo = await db.entities.Acampamento.create({ ...form, capacidade: Number(form.capacidade) });
    setOpen(false);
    setForm({ nome: '', lema: '', data_inicio: '', data_fim: '', capacidade: 100, status: 'planejamento' });
    navigate(`/?acampamentoId=${novo.id}`);
  };

  const abrirEdicao = (a) => {
    setEditForm({ id: a.id, nome: a.nome || '', lema: a.lema || '', data_inicio: a.data_inicio || '', data_fim: a.data_fim || '', capacidade: a.capacidade || 0, status: a.status || 'planejamento' });
    setEditOpen(true);
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    await db.entities.Acampamento.update(editForm.id, { ...editForm, capacidade: Number(editForm.capacidade) });
    setEditOpen(false);
    setEditForm(null);
    window.location.reload();
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs tracking-[0.2em] text-muted-foreground">CENTRAL DE EVENTOS · 01</div>
          <h1 className="text-2xl font-bold mt-1">Acampamentos</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            Crie e alterne entre eventos. Cada acampamento abre a mesma central de campistas, tribos, equipes e logística.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" />Novo acampamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo acampamento</DialogTitle></DialogHeader>
            <form onSubmit={criar} className="space-y-3">
              <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
              <div><Label>Lema</Label><Input value={form.lema} onChange={(e) => setForm({ ...form, lema: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Início</Label><Input type="date" value={form.data_inicio} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} /></div>
                <div><Label>Fim</Label><Input type="date" value={form.data_fim} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} /></div>
              </div>
              <div><Label>Capacidade</Label><Input type="number" value={form.capacidade} onChange={(e) => setForm({ ...form, capacidade: e.target.value })} /></div>
              <Button type="submit" className="w-full">Criar acampamento</Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Editar acampamento</DialogTitle></DialogHeader>
            {editForm && (
              <form onSubmit={salvarEdicao} className="space-y-3">
                <div><Label>Nome</Label><Input value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} required /></div>
                <div><Label>Lema</Label><Input value={editForm.lema} onChange={(e) => setEditForm({ ...editForm, lema: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Início</Label><Input type="date" value={editForm.data_inicio} onChange={(e) => setEditForm({ ...editForm, data_inicio: e.target.value })} /></div>
                  <div><Label>Fim</Label><Input type="date" value={editForm.data_fim} onChange={(e) => setEditForm({ ...editForm, data_fim: e.target.value })} /></div>
                </div>
                <div><Label>Capacidade</Label><Input type="number" value={editForm.capacidade} onChange={(e) => setEditForm({ ...editForm, capacidade: e.target.value })} /></div>
                <Button type="submit" className="w-full">Salvar alterações</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {acampamentos.map((a) => {
            const s = STATUS_MAP[a.status] || STATUS_MAP.planejamento;
            return (
              <div key={a.id} className="bg-white rounded-xl border border-border p-5">
                <span className={`text-[10px] tracking-widest px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                <h3 className="font-semibold mt-3">{a.nome}</h3>
                {a.lema && <p className="text-sm text-muted-foreground mt-1 italic">{a.lema}</p>}
                <div className="text-xs text-muted-foreground mt-3">período</div>
                <div className="text-sm">{formatPeriodo(a.data_inicio, a.data_fim)}</div>
                <div className="text-xs text-muted-foreground mt-2">capacidade</div>
                <div className="text-sm">{a.capacidade || 0} vagas</div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => navigate(`/?acampamentoId=${a.id}`)}>
                    Abrir central <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => abrirEdicao(a)}><Pencil className="w-4 h-4" /></Button>
                </div>
              </div>
            );
          })}
          <div className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center text-center text-muted-foreground min-h-[240px]">
            <Plus className="w-6 h-6 mb-2" />
            <div className="text-sm font-medium">Adicionar outro evento</div>
            <div className="text-xs mt-1 max-w-xs">Comece uma nova edição sem alterar os dados dos acampamentos anteriores.</div>
          </div>
        </div>
      )}
    </div>
  );
}