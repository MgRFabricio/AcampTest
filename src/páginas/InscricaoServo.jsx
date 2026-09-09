const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InscricaoShell from '@/components/inscricao/InscricaoShell';
import { CheckCircle2 } from 'lucide-react';

const CAMISETAS = ['PP', 'P', 'M', 'G', 'GG', 'EXG', 'EXGG', 'XGG'];

export default function InscricaoServo() {
  const [acampamentos, setAcampamentos] = useState([]);
  const [acampamentoId, setAcampamentoId] = useState('');
  const [form, setForm] = useState({ nome: '', sexo: '', telefone: '', camiseta: '', funcao: '', tribo: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    db.entities.Acampamento.list('-created_date', 50).then((list) => {
      setAcampamentos(list);
      if (list.length === 1) setAcampamentoId(list[0].id);
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await db.entities.Equipe.create({
        nome: form.nome,
        papel: 'Servo',
        sexo: form.sexo,
        telefone: form.telefone,
        camiseta: form.camiseta,
        funcao: form.funcao,
        tribo: form.tribo,
        acampamento_id: acampamentoId,
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <InscricaoShell title="Inscrição realizada!">
        <div className="text-center py-6">
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold mt-4">Serviço confirmado</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Sua inscrição como servo foi registrada. A coordenação entrará em contato com os detalhes da sua função.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setDone(false);
              setForm({ nome: '', sexo: '', telefone: '', camiseta: '', funcao: '', tribo: '' });
            }}
          >
            Nova inscrição
          </Button>
        </div>
      </InscricaoShell>
    );
  }

  return (
    <InscricaoShell title="Inscrição de Servo" subtitle="Quer servir no próximo acampamento? Inscreva-se aqui.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Acampamento</Label>
          <Select value={acampamentoId} onValueChange={setAcampamentoId} required>
            <SelectTrigger><SelectValue placeholder="Selecione o acampamento" /></SelectTrigger>
            <SelectContent>
              {acampamentos.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Nome completo</Label>
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Sexo</Label>
            <Select value={form.sexo} onValueChange={(v) => setForm({ ...form, sexo: v })} required>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="F">Feminino</SelectItem>
                <SelectItem value="M">Masculino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Camiseta</Label>
            <Select value={form.camiseta} onValueChange={(v) => setForm({ ...form, camiseta: v })} required>
              <SelectTrigger><SelectValue placeholder="Tamanho" /></SelectTrigger>
              <SelectContent>
                {CAMISETAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tribo (opcional)</Label>
            <Input value={form.tribo} onChange={(e) => setForm({ ...form, tribo: e.target.value })} placeholder="Geral" />
          </div>
        </div>
        <div>
          <Label>Função / área de interesse</Label>
          <Textarea
            value={form.funcao}
            onChange={(e) => setForm({ ...form, funcao: e.target.value })}
            rows={2}
            placeholder="Ex: Cozinha, Música, Intercessão, Limpeza..."
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting || !acampamentoId}>
          {submitting ? 'Enviando...' : 'Confirmar inscrição'}
        </Button>
      </form>
    </InscricaoShell>
  );
}