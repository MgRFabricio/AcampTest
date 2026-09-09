const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { formatPeriodo, formatDataCurta } from '@/lib/format';
import CamisetasChart from '@/components/dashboard/CamisetasChart';
import TribosChart from '@/components/dashboard/TribosChart';
import { Users, Scale, Shirt, UserCheck, ArrowUpRight } from 'lucide-react';

const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', 'EXG', 'EXGG', 'XGG'];

export default function Home() {
  const { acampamento, acampamentoId, loading } = useAcampamento();
  const [campistas, setCampistas] = useState([]);
  const [tribos, setTribos] = useState([]);

  useEffect(() => {
    if (!acampamentoId) return;
    db.entities.Campista.filter({ acampamento_id: acampamentoId }, '-created_date', 500).then(setCampistas);
    db.entities.Tribo.filter({ acampamento_id: acampamentoId }).then(setTribos);
  }, [acampamentoId]);

  if (loading) return <div className="text-muted-foreground">Carregando...</div>;
  if (!acampamento)
    return (
      <div className="text-muted-foreground">
        Nenhum acampamento encontrado. Crie um em{' '}
        <Link to="/acampamentos" className="text-primary underline">Acampamentos</Link>.
      </div>
    );

  const ocupacao = campistas.length;
  const capacidade = acampamento.capacidade || 0;
  const vagas = Math.max(0, capacidade - ocupacao);
  const mulheres = campistas.filter((c) => c.sexo === 'F').length;
  const homens = campistas.filter((c) => c.sexo === 'M').length;
  const idades = campistas.map((c) => c.idade).filter(Boolean);
  const mediaIdade = idades.length ? (idades.reduce((a, b) => a + b, 0) / idades.length).toFixed(1) : '—';

  const camisetas = TAMANHOS.map((t) => ({ tamanho: t, total: campistas.filter((c) => c.camiseta === t).length }));
  const tribosData = tribos.map((t) => ({ ...t, ocupacao: campistas.filter((c) => c.tribo === t.nome).length }));
  const recentes = [...campistas].slice(0, 6);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs tracking-[0.2em] text-muted-foreground">PAINEL OPERACIONAL · 01</div>
          <h1 className="text-2xl font-bold mt-1">Bom trabalho, equipe.</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {acampamento.nome} · {formatPeriodo(acampamento.data_inicio, acampamento.data_fim)}
          </p>
        </div>
        <Link to={`/campistas?acampamentoId=${acampamento.id}`} className="text-sm text-primary flex items-center gap-1 hover:underline">
          Abrir campistas <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="rounded-2xl bg-hero text-white p-6">
        {acampamento.lema && <p className="text-sm italic max-w-xl">{acampamento.lema}</p>}
        <p className="text-xs text-white/60 mt-2 max-w-md">
          Uma central clara para cuidar de cada pessoa, equipe e detalhe antes de abrir as portas.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
          <HeroStat label="OCUPAÇÃO" value={`${ocupacao} / ${capacidade}`} />
          <HeroStat label="VAGAS ABERTAS" value={vagas} />
          <HeroStat label="MÉDIA DE IDADE" value={mediaIdade !== '—' ? `${mediaIdade} anos` : '—'} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="Campistas inscritos" value={ocupacao} sub={`${ocupacao} confirmações`} />
        <MetricCard icon={UserCheck} label="Distribuição" value={`${mulheres}/${homens}`} sub="mulheres / homens" />
        <MetricCard icon={Scale} label="Peso médio" value="—" sub="aguardando dados" />
        <MetricCard icon={Shirt} label="Camisetas" value={ocupacao} sub="8 tamanhos em controle" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold">Camisetas</h3>
          <p className="text-xs text-muted-foreground mb-4">tamanho · total</p>
          <CamisetasChart data={camisetas} />
          <p className="text-[10px] text-muted-foreground mt-4">Distribuição atualizada a cada novo cadastro</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold">Tribos</h3>
          <p className="text-xs text-muted-foreground mb-4">ocupação por grupo</p>
          <TribosChart data={tribosData} />
          <Link to={`/tribos?acampamentoId=${acampamento.id}`} className="text-xs text-primary mt-4 inline-block hover:underline">
            Ver composição das tribos →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-3">Atividade recente</h3>
          <div className="space-y-2">
            {recentes.map((c) => (
              <div key={c.id} className="flex items-center gap-3 text-sm">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {c.sexo || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{c.nome || 'Sem nome informado'}</div>
                  <div className="text-xs text-muted-foreground">ficha {c.ficha} · {c.tribo || '—'}</div>
                </div>
                <span className="text-xs text-muted-foreground">{c.camiseta || '—'}</span>
              </div>
            ))}
            {recentes.length === 0 && <p className="text-sm text-muted-foreground">Nenhum registro ainda.</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-3">Agenda essencial</h3>
          <div className="space-y-3 text-sm">
            <AgendaItem title="Abertura do acampamento" desc={`${formatDataCurta(acampamento.data_inicio)} · recepção dos campistas`} />
            <AgendaItem title="Conferência das tribos" desc="Responsáveis e anjos em alinhamento" />
            <AgendaItem title="Escalas de apoio" desc="Almoço, banho, louça e ônibus" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] tracking-widest text-white/60">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function AgendaItem({ title, desc }) {
  return (
    <div className="border-l-2 border-primary/30 pl-3">
      <div className="font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}