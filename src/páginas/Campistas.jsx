const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback } from 'react';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

const CAMISETAS = ['PP', 'P', 'M', 'G', 'GG', 'EXG', 'EXGG', 'XGG'];

export default function Campistas() {
  const { acampamentoId, acampamento } = useAcampamento();
  const [campistas, setCampistas] = useState([]);
  const [tribos, setTribos] = useState([]);
  const [filtroSexo, setFiltroSexo] = useState('todos');
  const [filtroCamiseta, setFiltroCamiseta] = useState('todas');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', sexo: 'F', camiseta: 'M', tribo: '', pagamento: 'Pendente', cidade: '', idade: '' });

  const load = useCallback(() => {
    if (!acampamentoId) return;
    db.entities.Campista.filter({ acampamento_id: acampamentoId }, '-created_date', 500).then(setCampistas);
    db.entities.Tribo.filter({ acampamento_id: acampamentoId }).then(setTribos);
  }, [acampamentoId]);

  useEffect(load, [load]);

  const filtrados = campistas.filter(
    (c) => (filtroSexo === 'todos' || c.sexo === filtroSexo) && (filtroCamiseta === 'todas' || c.camiseta === filtroCamiseta)
  );
  const emDia = campistas.filter((c) => c.pagamento === 'Pago').length;
  const comTribo = campistas.filter((c) => c.tribo).length;

  const criar = async (e) => {
    e.preventDefault();
    const ficha = String(campistas.length + 1).padStart(3, '0');
    await db.entities.Campista.create({
      ...form,
      idade: form.idade ? Number(form.idade) : undefined,
      ficha,
      acampamento_id: acampamentoId,
    });
    setOpen(false);
    setForm({ nome: '', sexo: 'F', camiseta: 'M', tribo: '', pagamento: 'Pendente', cidade: '', idade: '' });
    load();
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs tracking-[0.2em] text-muted-foreground">CADASTRO · 02</div>
          <h1 className="text-2xl font-bold mt-1">Campistas</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe inscrições, informações e o lugar de cada pessoa no acampamento.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" />Novo campista</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo campista</DialogTitle></DialogHeader>
            <form onSubmit={criar} className="space-y-3">
              <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sexo</Label>
                  <Select value={form.sexo} onValueChange={(v) => setForm({ ...form, sexo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="F">Feminino</SelectItem><SelectItem value="M">Masculino</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Camiseta</Label>
                  <Select value={form.camiseta} onValueChange={(v) => setForm({ ...form, camiseta: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CAMISETAS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Tribo</Label>
                <Select value={form.tribo} onValueChange={(v) => setForm({ ...form, tribo: v })}>
                  <SelectTrigger><SelectValue placeholder="Sem tribo" /></SelectTrigger>
                  <SelectContent>{tribos.map((t) => <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Pagamento</Label>
                  <Select value={form.pagamento} onValueChange={(v) => setForm({ ...form, pagamento: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Pendente">Pendente</SelectItem><SelectItem value="Pago">Pago</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Idade</Label><Input type="number" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })} /></div>
              </div>
              <div><Label>Cidade</Label><Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></div>
              <Button type="submit" className="w-full">Cadastrar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-6 text-sm">
        <div><span className="text-2xl font-bold">{filtrados.length}</span><span className="text-muted-foreground ml-2">resultado(s) filtrado(s)</span></div>
        <div><span className="text-2xl font-bold text-green-600">{emDia}</span><span className="text-muted-foreground ml-2">pagamento confirmado</span></div>
        <div><span className="text-2xl font-bold">{comTribo}</span><span className="text-muted-foreground ml-2">alocação realizada</span></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={filtroSexo} onValueChange={setFiltroSexo}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os sexos</SelectItem><SelectItem value="F">Feminino</SelectItem><SelectItem value="M">Masculino</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroCamiseta} onValueChange={setFiltroCamiseta}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Camiseta</SelectItem>{CAMISETAS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Campista</th>
              <th className="text-left px-4 py-3 font-medium">Ficha</th>
              <th className="text-left px-4 py-3 font-medium">Perfil</th>
              <th className="text-left px-4 py-3 font-medium">Tribo</th>
              <th className="text-left px-4 py-3 font-medium">Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">{c.nome || 'Sem nome informado'}</div>
                  <div className="text-xs text-muted-foreground">{c.cidade || '—'}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">#{c.ficha}</td>
                <td className="px-4 py-3">{c.sexo}{c.camiseta && ` · ${c.camiseta}`}</td>
                <td className="px-4 py-3">{c.tribo || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${c.pagamento === 'Pago' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {c.pagamento || 'Pendente'}
                  </span>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum campista encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}