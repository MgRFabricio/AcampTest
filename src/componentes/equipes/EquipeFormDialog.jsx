const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PAPEIS = ['Coordenador', 'Líder', 'Servo'];
const SEXOS = ['F', 'M'];
const CAMISETAS = ['PP', 'P', 'M', 'G', 'GG', 'EXG', 'EXGG', 'XGG'];

export default function EquipeFormDialog({ open, onOpenChange, acampamentoId, membro, onSaved }) {
  const [form, setForm] = useState({ nome: '', papel: 'Servo', funcao: '', tribo: '', camiseta: '', telefone: '', sexo: '' });
  const isEdit = Boolean(membro?.id);

  useEffect(() => {
    if (membro) {
      setForm({ nome: membro.nome || '', papel: membro.papel || 'Servo', funcao: membro.funcao || '', tribo: membro.tribo || '', camiseta: membro.camiseta || '', telefone: membro.telefone || '', sexo: membro.sexo || '' });
    } else {
      setForm({ nome: '', papel: 'Servo', funcao: '', tribo: '', camiseta: '', telefone: '', sexo: '' });
    }
  }, [membro, open]);

  const salvar = async (e) => {
    e.preventDefault();
    const payload = { ...form, acampamento_id: acampamentoId };
    if (isEdit) await db.entities.Equipe.update(membro.id, payload);
    else await db.entities.Equipe.create(payload);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isEdit ? 'Editar membro' : 'Novo membro'}</DialogTitle></DialogHeader>
        <form onSubmit={salvar} className="space-y-3">
          <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Papel</Label>
              <Select value={form.papel} onValueChange={(v) => setForm({ ...form, papel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAPEIS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sexo</Label>
              <Select value={form.sexo} onValueChange={(v) => setForm({ ...form, sexo: v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{SEXOS.map((s) => <SelectItem key={s} value={s}>{s === 'F' ? 'Feminino' : 'Masculino'}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Função / equipe</Label><Input value={form.funcao} onChange={(e) => setForm({ ...form, funcao: e.target.value })} placeholder="Ex: Cozinha, Líderes, Música..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Tribo</Label><Input value={form.tribo} onChange={(e) => setForm({ ...form, tribo: e.target.value })} placeholder="Geral ou nome da tribo" /></div>
            <div>
              <Label>Camiseta</Label>
              <Select value={form.camiseta || 'none'} onValueChange={(v) => setForm({ ...form, camiseta: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {CAMISETAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Telefone</Label><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
          <Button type="submit" className="w-full">{isEdit ? 'Salvar alterações' : 'Adicionar membro'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}