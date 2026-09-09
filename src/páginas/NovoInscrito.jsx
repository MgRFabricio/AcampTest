const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Section, Grid, Field, TextField, SelectField, RadioChoice, TextareaField } from '@/components/inscrito/FormFields';
import { maskCPF, maskPhone, maskCEP, maskRG, validateCPF, validateEmail } from '@/lib/masks';
import { Save, Plus, X, Eraser } from 'lucide-react';

const SEXO = [{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Feminino' }];
const ESTADO_CIVIL = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'Outro'].map((v) => ({ value: v, label: v }));
const CAMISETAS = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG', 'Outro'].map((v) => ({ value: v, label: v }));
const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map((v) => ({ value: v, label: v }));
const SIM_NAO = [{ value: 'Sim', label: 'Sim' }, { value: 'Não', label: 'Não' }];
const SIM_NAO_NA = [{ value: 'Sim', label: 'Sim' }, { value: 'Não', label: 'Não' }, { value: 'Não se aplica', label: 'Não se aplica' }];
const MORA_COM = ['Pai', 'Mãe', 'Esposa(o)', 'Filho', 'Filha', 'Outros'];
const TERMO_STATUS = ['Entregue', 'Não entregue', 'Pendente'].map((v) => ({ value: v, label: v }));
const STATUS_INSC = ['Pré-inscrição', 'Inscrito', 'Documentação pendente', 'Confirmado', 'Cancelado'].map((v) => ({ value: v, label: v }));

export default function NovoInscrito() {
  const navigate = useNavigate();
  const { acampamentoId, loading } = useAcampamento();
  const { toast } = useToast();
  const [f, setF] = useState({});
  const [errors, setErrors] = useState({});
  const [codigo, setCodigo] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      const list = await db.entities.Inscrito.list('-created_date', 9999);
      setCodigo('INS-' + String(list.length + 1).padStart(4, '0'));
    })();
  }, []);

  const gerarCodigo = async () => {
    const list = await db.entities.Inscrito.list('-created_date', 9999);
    setCodigo('INS-' + String(list.length + 1).padStart(4, '0'));
  };

  const buscarCEP = async (cep) => {
    const digits = (cep || '').replace(/\D/g, '');
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setF((p) => ({ ...p, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf }));
      }
    } catch { /* ignore */ }
  };

  const toggleMoraCom = (opt) => {
    setF((p) => {
      const arr = p.mora_com || [];
      return { ...p, mora_com: arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt] };
    });
  };

  const validate = async () => {
    const e = {};
    if (!f.nome?.trim()) e.nome = 'Nome completo é obrigatório';
    if (!f.data_nascimento) e.data_nascimento = 'Data de nascimento é obrigatória';
    if (!f.cpf) e.cpf = 'CPF é obrigatório';
    else if (!validateCPF(f.cpf)) e.cpf = 'CPF inválido';
    else {
      const dup = await db.entities.Inscrito.filter({ cpf: f.cpf });
      if (dup.length) e.cpf = 'CPF já cadastrado';
    }
    if (!f.celular) e.celular = 'Celular é obrigatório';
    if (f.email && !validateEmail(f.email)) e.email = 'E-mail inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const salvar = async (e, novo) => {
    e.preventDefault();
    if (!(await validate())) {
      toast({ title: 'Verifique os campos destacados', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const record = await db.entities.Inscrito.create({ ...f, codigo });
      if (acampamentoId) {
        await db.entities.Inscricao.create({
          inscrito_id: record.id,
          acampamento_id: acampamentoId,
          status: f.status_inscricao || 'Pré-inscrição',
          observacoes: f.obs_gerais,
        });
      }
      toast({ title: 'Inscrito cadastrado com sucesso.' });
      if (novo) {
        setF({});
        setErrors({});
        await gerarCodigo();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/inscricao-site');
      }
    } finally {
      setSaving(false);
    }
  };

  const limpar = () => {
    if (confirm('Deseja limpar todos os campos do formulário?')) {
      setF({});
      setErrors({});
    }
  };

  const cancelar = () => {
    if (confirm('Cancelar o cadastro? As alterações não salvas serão perdidas.')) navigate('/inscricao-site');
  };

  if (loading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <form onSubmit={(e) => salvar(e, false)} className="space-y-5 max-w-5xl pb-28">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs tracking-[0.2em] text-muted-foreground">CADASTRO</div>
          <h1 className="text-2xl font-bold mt-1">Novo Inscrito</h1>
          <p className="text-sm text-muted-foreground mt-1">Preencha a ficha completa do campista. Campos com * são obrigatórios.</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Código</div>
          <div className="text-lg font-bold text-hero">{codigo || '...'}</div>
        </div>
      </div>

      {/* 01 — Dados Pessoais */}
      <Section num="01" title="Dados Pessoais">
        <Grid>
          <TextField label="Nome completo" required value={f.nome} onChange={(v) => set('nome', v)} error={errors.nome} full />
          <Field label="Data de nascimento" required error={errors.data_nascimento}>
            <Input type="date" value={f.data_nascimento || ''} onChange={(e) => set('data_nascimento', e.target.value)} />
          </Field>
          <SelectField label="Sexo" value={f.sexo} onChange={(v) => set('sexo', v)} options={SEXO} />
          <Field label="CPF" required error={errors.cpf} hint="Máscara automática">
            <Input value={f.cpf || ''} onChange={(e) => set('cpf', maskCPF(e.target.value))} placeholder="000.000.000-00" />
          </Field>
          <Field label="RG">
            <Input value={f.rg || ''} onChange={(e) => set('rg', maskRG(e.target.value))} />
          </Field>
          <SelectField label="Estado civil" value={f.estado_civil} onChange={(v) => set('estado_civil', v)} options={ESTADO_CIVIL} />
          <TextField label="Profissão" value={f.profissao} onChange={(v) => set('profissao', v)} />
        </Grid>
      </Section>

      {/* 02 — Contato e Endereço */}
      <Section num="02" title="Contato e Endereço">
        <Grid>
          <Field label="Telefone fixo">
            <Input value={f.telefone_fixo || ''} onChange={(e) => set('telefone_fixo', maskPhone(e.target.value))} placeholder="(00) 0000-0000" />
          </Field>
          <Field label="Celular" required error={errors.celular}>
            <Input value={f.celular || ''} onChange={(e) => set('celular', maskPhone(e.target.value))} placeholder="(00) 00000-0000" />
          </Field>
          <Field label="E-mail" error={errors.email}>
            <Input type="email" value={f.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="exemplo@email.com" />
          </Field>
          <Field label="CEP" hint="Preenche o endereço automaticamente">
            <Input value={f.cep || ''} onChange={(e) => set('cep', maskCEP(e.target.value))} onBlur={(e) => buscarCEP(e.target.value)} placeholder="00000-000" />
          </Field>
          <TextField label="Endereço / Logradouro" value={f.logradouro} onChange={(v) => set('logradouro', v)} />
          <TextField label="Número" value={f.numero} onChange={(v) => set('numero', v)} />
          <TextField label="Complemento" value={f.complemento} onChange={(v) => set('complemento', v)} />
          <TextField label="Bairro" value={f.bairro} onChange={(v) => set('bairro', v)} />
          <TextField label="Cidade" value={f.cidade} onChange={(v) => set('cidade', v)} />
          <SelectField label="Estado / UF" value={f.uf} onChange={(v) => set('uf', v)} options={UFS} />
          <TextField label="Ponto de referência" value={f.ponto_referencia} onChange={(v) => set('ponto_referencia', v)} full />
        </Grid>
      </Section>

      {/* 03 — Dados Físicos */}
      <Section num="03" title="Dados Físicos">
        <Grid>
          <Field label="Peso (kg)">
            <Input type="number" value={f.peso || ''} onChange={(e) => set('peso', e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label="Altura (cm)">
            <Input type="number" value={f.altura || ''} onChange={(e) => set('altura', e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <SelectField label="Tamanho da camiseta" value={f.camiseta} onChange={(v) => set('camiseta', v)} options={CAMISETAS} />
        </Grid>
      </Section>

      {/* 04 — Família */}
      <Section num="04" title="Família">
        <Field label="Mora com quem?">
          <div className="flex gap-2 flex-wrap">
            {MORA_COM.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => toggleMoraCom(opt)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${(f.mora_com || []).includes(opt) ? 'bg-primary text-primary-foreground border-primary' : 'bg-white hover:bg-accent border-input'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </Field>
        {(f.mora_com || []).includes('Outros') && (
          <TextField label="Outros — especificar" value={f.mora_com_outros} onChange={(v) => set('mora_com_outros', v)} />
        )}
        <Grid>
          <RadioChoice label="Seus pais moram em Curvelândia?" value={f.pais_moram_curvelandia} onChange={(v) => set('pais_moram_curvelandia', v)} options={SIM_NAO_NA} full />
          <TextField label="Nome do pai" value={f.nome_pai} onChange={(v) => set('nome_pai', v)} />
          <Field label="Telefone do pai">
            <Input value={f.telefone_pai || ''} onChange={(e) => set('telefone_pai', maskPhone(e.target.value))} />
          </Field>
          <TextField label="Nome da mãe" value={f.nome_mae} onChange={(v) => set('nome_mae', v)} />
          <Field label="Telefone da mãe">
            <Input value={f.telefone_mae || ''} onChange={(e) => set('telefone_mae', maskPhone(e.target.value))} />
          </Field>
          <TextField label="Nome do cônjuge" value={f.nome_conjuge} onChange={(v) => set('nome_conjuge', v)} />
          <Field label="Telefone do cônjuge">
            <Input value={f.telefone_conjuge || ''} onChange={(e) => set('telefone_conjuge', maskPhone(e.target.value))} />
          </Field>
        </Grid>
      </Section>

      {/* 05 — Vida Cristã / GO */}
      <Section num="05" title="Vida Cristã e Grupo de Oração">
        <Grid>
          <RadioChoice label="Participa de GO?" value={f.participa_go} onChange={(v) => set('participa_go', v)} options={SIM_NAO} />
          <TextField label="Qual GO?" value={f.qual_go} onChange={(v) => set('qual_go', v)} />
          <TextField label="Frequenta qual GO?" value={f.frequenta_go} onChange={(v) => set('frequenta_go', v)} />
          <RadioChoice label="Já participou de algum retiro de oração?" value={f.participou_retiro} onChange={(v) => set('participou_retiro', v)} options={SIM_NAO} />
          {f.participou_retiro === 'Sim' && (
            <TextField label="Qual retiro?" value={f.qual_retiro} onChange={(v) => set('qual_retiro', v)} full />
          )}
          <TextareaField label="Vida cristã" value={f.vida_crista} onChange={(v) => set('vida_crista', v)} full rows={3} />
          <TextField label="Se possui outra religião, qual?" value={f.outra_religiao} onChange={(v) => set('outra_religiao', v)} />
          <RadioChoice label="Se casado, é casado na igreja?" value={f.casado_igreja} onChange={(v) => set('casado_igreja', v)} options={SIM_NAO_NA} />
        </Grid>
      </Section>

      {/* 06 — Saúde */}
      <Section num="06" title="Saúde e Cuidados Especiais" className="border-amber-200">
        <Grid>
          <RadioChoice label="Possui algum problema de saúde?" value={f.problema_saude} onChange={(v) => set('problema_saude', v)} options={SIM_NAO} full />
          {f.problema_saude === 'Sim' && (
            <>
              <TextField label="Qual problema de saúde?" value={f.qual_problema_saude} onChange={(v) => set('qual_problema_saude', v)} />
              <TextField label="Como deve ser tratado/observado?" value={f.tratamento_saude} onChange={(v) => set('tratamento_saude', v)} />
            </>
          )}
          <RadioChoice label="Possui alergia ou deficiência?" value={f.alergia_deficiencia} onChange={(v) => set('alergia_deficiencia', v)} options={SIM_NAO} full />
          {f.alergia_deficiencia === 'Sim' && (
            <TextField label="Qual alergia ou deficiência?" value={f.qual_alergia_deficiencia} onChange={(v) => set('qual_alergia_deficiencia', v)} full />
          )}
          <RadioChoice label="Toma algum tipo de medicamento?" value={f.toma_medicamento} onChange={(v) => set('toma_medicamento', v)} options={SIM_NAO} full />
          {f.toma_medicamento === 'Sim' && (
            <>
              <TextField label="Nome do medicamento" value={f.nome_medicamento} onChange={(v) => set('nome_medicamento', v)} />
              <TextField label="Dosagem" value={f.dosagem} onChange={(v) => set('dosagem', v)} />
              <TextField label="Horário / frequência" value={f.horario_medicamento} onChange={(v) => set('horario_medicamento', v)} />
              <TextareaField label="Observações" value={f.obs_medicamento} onChange={(v) => set('obs_medicamento', v)} full rows={2} />
            </>
          )}
        </Grid>
        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mt-2">⚠️ Informações sensíveis — acesso restrito à administração/secretaria.</p>
      </Section>

      {/* 07 — Amigos e Conhecidos */}
      <Section num="07" title="Amigos e Conhecidos">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3 rounded-lg bg-muted/40 p-3">
            <div className="text-xs font-semibold text-muted-foreground">Amigo 1</div>
            <TextField label="Nome" value={f.amigo1_nome} onChange={(v) => set('amigo1_nome', v)} />
            <Field label="Telefone">
              <Input value={f.amigo1_telefone || ''} onChange={(e) => set('amigo1_telefone', maskPhone(e.target.value))} />
            </Field>
          </div>
          <div className="space-y-3 rounded-lg bg-muted/40 p-3">
            <div className="text-xs font-semibold text-muted-foreground">Amigo 2</div>
            <TextField label="Nome" value={f.amigo2_nome} onChange={(v) => set('amigo2_nome', v)} />
            <Field label="Telefone">
              <Input value={f.amigo2_telefone || ''} onChange={(e) => set('amigo2_telefone', maskPhone(e.target.value))} />
            </Field>
          </div>
        </div>
        <div className="pt-2">
          <RadioChoice label="Possui familiar, amigo ou conhecido que participará do acampamento?" value={f.tem_conhecido_participante} onChange={(v) => set('tem_conhecido_participante', v)} options={SIM_NAO} full />
        </div>
        {f.tem_conhecido_participante === 'Sim' && (
          <Grid>
            <TextField label="Nome da pessoa" value={f.conhecido_nome} onChange={(v) => set('conhecido_nome', v)} />
            <Field label="Documento / CPF">
              <Input value={f.conhecido_documento || ''} onChange={(e) => set('conhecido_documento', maskCPF(e.target.value))} />
            </Field>
            <TextField label="Grau de relacionamento" value={f.conhecido_grau} onChange={(v) => set('conhecido_grau', v)} />
            <TextField label="Observação" value={f.conhecido_obs} onChange={(v) => set('conhecido_obs', v)} />
          </Grid>
        )}
      </Section>

      {/* 08 — Documentação */}
      <Section num="08" title="Documentação e Responsabilidade">
        <Grid>
          <SelectField label="Termo de Responsabilidade e Ciência de Risco" value={f.termo_status} onChange={(v) => set('termo_status', v)} options={TERMO_STATUS} />
          <Field label="Data de entrega">
            <Input type="date" value={f.termo_data_entrega || ''} onChange={(e) => set('termo_data_entrega', e.target.value)} />
          </Field>
          <TextField label="Responsável pelo recebimento" value={f.termo_responsavel} onChange={(v) => set('termo_responsavel', v)} />
          <TextField label="Anexo do termo (URL)" value={f.termo_arquivo} onChange={(v) => set('termo_arquivo', v)} hint="Anexe posteriormente o termo digitalizado" full />
          <TextareaField label="Observações" value={f.termo_obs} onChange={(v) => set('termo_obs', v)} full rows={2} />
        </Grid>
      </Section>

      {/* 09 — Controle da Inscrição */}
      <Section num="09" title="Controle da Inscrição">
        <Grid>
          <SelectField label="Status da inscrição" value={f.status_inscricao} onChange={(v) => set('status_inscricao', v)} options={STATUS_INSC} />
          <Field label="Data do cadastro" hint="Registrada automaticamente">
            <Input value={new Date().toLocaleDateString('pt-BR')} disabled />
          </Field>
          <TextareaField label="Observações gerais" value={f.obs_gerais} onChange={(v) => set('obs_gerais', v)} full rows={3} />
        </Grid>
      </Section>

      {/* Ações */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-border z-20 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={limpar}><Eraser className="w-4 h-4 mr-1" /> Limpar</Button>
          <Button type="button" variant="outline" onClick={cancelar}><X className="w-4 h-4 mr-1" /> Cancelar</Button>
          <Button type="button" variant="secondary" disabled={saving} onClick={(e) => salvar(e, true)}><Plus className="w-4 h-4 mr-1" /> Salvar e Novo</Button>
          <Button type="submit" disabled={saving}><Save className="w-4 h-4 mr-1" /> {saving ? 'Salvando...' : 'Salvar Inscrito'}</Button>
        </div>
      </div>
    </form>
  );
}