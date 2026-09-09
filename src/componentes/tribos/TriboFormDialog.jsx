const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TriboFormDialog({ open, onOpenChange, acampamentoId, tribo, onSaved }) {
  const [form, setForm] = useState({ nome: '', nucleo: '', cor: '#f1c40f', responsavel: '', anjo: '', ativa: true });
  const isEdit = Boolean(tribo?.id);

  useEffect(() => {
    if (tribo) {
      setForm({ nome: tribo.nome || '', nucleo: tribo.nucleo || '', cor: tribo.cor || '#f1c40f', responsavel: tribo.responsavel || '', anjo: tribo.anjo || '', ativa: tribo.ativa !== false });
    } else {
      setForm({ nome: '', nucleo: '', cor: '#f1c40f', responsavel: '', anjo: '', ativa: true });
    }
  }, [tribo, open]);

  const salvar = async (e) => {
    e.preventDefault();
    const payload = { ...form, nucleo: Number(form.nucleo) || 0, acampamento_id: acampamentoId };
    if (isEdit) await db.entities.Tribo.update(tribo.id, payload);
    else await db.entities.Tribo.create(payload);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isEdit ? 'Editar tribo' : 'Nova tribo'}</DialogTitle></DialogHeader>
        <form onSubmit={salvar} className="space-y-3">
          <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Núcleo</Label><Input type="number" value={form.nucleo} onChange={(e) => setForm({ ...form, nucleo: e.target.value })} /></div>
            <div>
              <Label>Cor</Label>
              <input type="color" value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} className="w-full h-9 rounded-md border border-input bg-white" />
            </div>
          </div>
          <div><Label>Responsável</Label><Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} /></div>
          <div><Label>Anjo</Label><Input value={form.anjo} onChange={(e) => setForm({ ...form, anjo: e.target.value })} /></div>
          <Button type="submit" className="w-full">{isEdit ? 'Salvar alterações' : 'Criar tribo'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}