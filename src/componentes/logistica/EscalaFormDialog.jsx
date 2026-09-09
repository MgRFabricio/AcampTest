const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const CATEGORIAS = ['almoço', 'banho', 'louça', 'ônibus', 'camisetas', 'barracas', 'outro'];

export default function EscalaFormDialog({ open, onOpenChange, acampamentoId, escala, onSaved }) {
  const [form, setForm] = useState({ titulo: '', categoria: 'almoço', descricao: '', status: 'planejado', periodo: '', data: '', horario: '' });
  const isEdit = Boolean(escala?.id);

  useEffect(() => {
    if (escala) {
      setForm({ titulo: escala.titulo || '', categoria: escala.categoria || 'almoço', descricao: escala.descricao || '', status: escala.status || 'planejado', periodo: escala.periodo || '', data: escala.data || '', horario: escala.horario || '' });
    } else {
      setForm({ titulo: '', categoria: 'almoço', descricao: '', status: 'planejado', periodo: '', data: '', horario: '' });
    }
  }, [escala, open]);

  const salvar = async (e) => {
    e.preventDefault();
    const payload = { ...form, acampamento_id: acampamentoId };
    if (isEdit) await db.entities.Escala.update(escala.id, payload);
    else await db.entities.Escala.create(payload);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isEdit ? 'Editar escala' : 'Nova escala'}</DialogTitle></DialogHeader>
        <form onSubmit={salvar} className="space-y-3">
          <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="planejado">planejado</SelectItem><SelectItem value="pronto">pronto</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Descrição</Label><Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={2} /></div>
          <div><Label>Período</Label><Input value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })} placeholder="Ex: 18 a 21 abr" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Data</Label><Input type="date" value={form.data || ''} onChange={(e) => setForm({ ...form, data: e.target.value })} /></div>
            <div><Label>Horário</Label><Input value={form.horario || ''} onChange={(e) => setForm({ ...form, horario: e.target.value })} placeholder="Ex: 14:00" /></div>
          </div>
          <Button type="submit" className="w-full">{isEdit ? 'Salvar alterações' : 'Criar escala'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}