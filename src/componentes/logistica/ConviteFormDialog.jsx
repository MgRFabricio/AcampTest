const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function ConviteFormDialog({ open, onOpenChange, acampamentoId, convite, onSaved }) {
  const [form, setForm] = useState({ numero: '', casal_contato: '', telefones: '', status: 'Pendente', notas: '' });
  const isEdit = Boolean(convite?.id);

  useEffect(() => {
    if (convite) {
      setForm({ numero: convite.numero ?? '', casal_contato: convite.casal_contato || '', telefones: convite.telefones || '', status: convite.status || 'Pendente', notas: convite.notas || '' });
    } else {
      setForm({ numero: '', casal_contato: '', telefones: '', status: 'Pendente', notas: '' });
    }
  }, [convite, open]);

  const salvar = async (e) => {
    e.preventDefault();
    const payload = { ...form, numero: form.numero ? Number(form.numero) : undefined, acampamento_id: acampamentoId };
    if (isEdit) await db.entities.Convite.update(convite.id, payload);
    else await db.entities.Convite.create(payload);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isEdit ? 'Editar convite' : 'Novo convite'}</DialogTitle></DialogHeader>
        <form onSubmit={salvar} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Número</Label><Input type="number" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Pendente">Pendente</SelectItem><SelectItem value="Pago">Pago</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Casal / contato</Label><Input value={form.casal_contato} onChange={(e) => setForm({ ...form, casal_contato: e.target.value })} required /></div>
          <div><Label>Telefones</Label><Input value={form.telefones} onChange={(e) => setForm({ ...form, telefones: e.target.value })} /></div>
          <div><Label>Notas</Label><Textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} rows={2} /></div>
          <Button type="submit" className="w-full">{isEdit ? 'Salvar alterações' : 'Criar convite'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}