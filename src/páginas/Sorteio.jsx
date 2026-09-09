const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from 'react';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Shuffle, Trophy, Gift, CheckCircle2 } from 'lucide-react';

export default function Sorteio() {
  const { acampamentoId, loading } = useAcampamento();
  const [campistas, setCampistas] = useState([]);
  const [soPagos, setSoPagos] = useState(false);
  const [sorteando, setSorteando] = useState(false);
  const [vencedor, setVencedor] = useState(null);
  const [confirmado, setConfirmado] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [confirmados, setConfirmados] = useState([]);
  const [proximoSexo, setProximoSexo] = useState('F');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!acampamentoId) return;
    db.entities.Campista.filter({ acampamento_id: acampamentoId }, '-created_date', 500).then(setCampistas);
  }, [acampamentoId]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const basePool = soPagos ? campistas.filter((c) => c.pagamento === 'Pago') : campistas;
  const pool = basePool.filter((c) => c.sexo === proximoSexo);

  const sortear = () => {
    if (!pool.length || sorteando) return;
    setVencedor(null);
    setConfirmado(false);
    setSorteando(true);
    let cycles = 0;
    intervalRef.current = setInterval(() => {
      const r = pool[Math.floor(Math.random() * pool.length)];
      setVencedor(r);
      cycles++;
      if (cycles > 18) {
        clearInterval(intervalRef.current);
        const final = pool[Math.floor(Math.random() * pool.length)];
        setVencedor(final);
        setHistorico((h) => [final, ...h].slice(0, 20));
        setProximoSexo((s) => (s === 'F' ? 'M' : 'F'));
        setSorteando(false);
      }
    }, 80);
  };

  const confirmarPresenca = () => {
    if (!vencedor || confirmado) return;
    setConfirmados((c) => [vencedor, ...c].slice(0, 20));
    setConfirmado(true);
  };

  if (loading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="text-xs tracking-[0.2em] text-muted-foreground">EVENTO · 07</div>
        <h1 className="text-2xl font-bold mt-1">Sorteio do Campista</h1>
        <p className="text-sm text-muted-foreground mt-1">Sorteio alternado entre mulheres e homens, com confirmação de presença.</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Apenas inscritos pagos</div>
            <div className="text-xs text-muted-foreground">{basePool.length} campistas no total</div>
          </div>
          <Switch checked={soPagos} onCheckedChange={setSoPagos} />
        </div>
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-3 h-3 rounded-full ${proximoSexo === 'F' ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
            <span>Próximo sorteio: <strong>{proximoSexo === 'F' ? 'Feminino' : 'Masculino'}</strong></span>
          </div>
          <div className="text-xs text-muted-foreground">{pool.length} elegíveis</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-hero to-sidebar rounded-2xl p-8 text-white text-center min-h-[260px] flex flex-col items-center justify-center">
        {vencedor ? (
          <>
            <Trophy className={`w-12 h-12 mb-3 ${sorteando ? 'animate-bounce' : 'text-sidebar-ring'}`} />
            <div className="text-xs tracking-[0.2em] text-white/60">
              {sorteando ? 'SORTEANDO...' : 'CAMPISTA SORTEADO'}
            </div>
            <div className="text-2xl font-bold mt-2">{vencedor.nome || 'Sem nome'}</div>
            <div className="text-sm text-white/70 mt-1">
              ficha {vencedor.ficha || '—'} · {vencedor.cidade || '—'} · {vencedor.sexo === 'F' ? 'Feminino' : 'Masculino'}
            </div>
            {!sorteando && (
              <Button
                size="sm"
                variant={confirmado ? 'secondary' : 'default'}
                className="mt-4"
                onClick={confirmarPresenca}
                disabled={confirmado}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {confirmado ? 'Presença confirmada' : 'Confirmar presença'}
              </Button>
            )}
          </>
        ) : (
          <>
            <Shuffle className="w-12 h-12 mb-3 text-white/40" />
            <div className="text-sm text-white/60">
              {pool.length
                ? `Pronto para sortear entre ${pool.length} campistas`
                : `Nenhum campista ${proximoSexo === 'F' ? 'feminino' : 'masculino'} elegível`}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={sortear} disabled={sorteando || !pool.length}>
          <Shuffle className="w-4 h-4 mr-2" />
          {sorteando ? 'Sorteando...' : 'Sortear campista'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <HistoricoCard title="Sorteados confirmados" icon={CheckCircle2} items={confirmados} empty="Nenhum confirmado ainda." highlight />
        <HistoricoCard title="Todos os sorteados" icon={Gift} items={historico} empty="Nenhum sorteio ainda." />
      </div>
    </div>
  );
}

function HistoricoCard({ title, icon: Icon, items, empty, highlight }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" /> {title}
        <span className="ml-auto text-xs text-muted-foreground font-normal">{items.length}</span>
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((c, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="truncate">{c.nome || 'Sem nome'}</div>
              <div className="text-xs text-muted-foreground">ficha {c.ficha || '—'} · {c.sexo === 'F' ? 'F' : 'M'}</div>
            </div>
            {highlight && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{empty}</p>}
      </div>
    </div>
  );
}