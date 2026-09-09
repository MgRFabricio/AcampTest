const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InscricaoShell from '@/components/inscricao/InscricaoShell';
import { CheckCircle2 } from 'lucide-react';

const CAMISETAS = ['PP', 'P', 'M', 'G', 'GG', 'EXG', 'EXGG', 'XGG'];

export default function InscricaoCampista() {
  const [acampamentos, setAcampamentos] = useState([]);
  const [acampamentoId, setAcampamentoId] = useState('');
  const [form, setForm] = useState({ nome: '', sexo: '', camiseta: '', cidade: '', idade: '', peso: '' });
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
      const exist = await db.entities.Campista.filter({ acampamento_id: acampamentoId }, '-created_date', 500);
      const ficha = String(exist.length + 1).padStart(3, '0');
      await db.entities.Campista.create({
        nome: form.nome,
        sexo: form.sexo,
        camiseta: form.camiseta,
        cidade: form.cidade,
        idade: form.idade ? Number(form.idade) : undefined,
        peso: form.peso ? Number(form.peso) : undefined,
        ficha,
        pagamento: 'Pendente',
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
          <h2 className="text-xl font-bold mt-4">Inscrição confirmada</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Sua inscrição foi registrada com sucesso. Em breve a equipe entrará em contato com os próximos passos.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setDone(false);
              setForm({ nome: '', sexo: '', camiseta: '', cidade: '', idade: '', peso: '' });
            }}
          >
            Nova inscrição
          </Button>
        </div>
      </InscricaoShell>
    );
  }

  return (
    <InscricaoShell title="Inscrição de Campista">
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
            <Label>Idade</Label>
            <Input type="number" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })} />
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
            <Label>Peso (kg)</Label>
            <Input type="number" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Cidade</Label>
          <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
        </div>
        <Button type="submit" className="w-full" disabled={submitting || !acampamentoId}>
          {submitting ? 'Enviando...' : 'Confirmar inscrição'}
        </Button>
      </form>
    </InscricaoShell>
  );
}