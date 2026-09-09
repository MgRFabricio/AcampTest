const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { Button } from '@/components/ui/button';
import { Shuffle, Trophy, CheckCircle2, UserPlus, Users } from 'lucide-react';

export default function InscricaoSite() {
  const { acampamentoId, loading } = useAcampamento();
  const [inscritos, setInscritos] = useState([]);
  const [sorteando, setSorteando] = useState(false);
  const [vencedor, setVencedor] = useState(null);
  const [confirmado, setConfirmado] = useState(false);
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const load = async () => {
    if (!acampamentoId) return;
    const list = await db.entities.InscricaoSite.filter({ acampamento_id: acampamentoId }, '-created_date', 500);
    setInscritos(list);
  };

  useEffect(() => { load(); }, [acampamentoId]);
  useEffect(() => () => clearInterval(intervalRef.current), []);

  const pool = inscritos.filter((i) => i.status === 'Inscrito');

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
        setSorteando(false);
        db.entities.InscricaoSite.update(final.id, { status: 'Sorteado' }).then(load);
      }
    }, 80);
  };

  const confirmarPresenca = async () => {
    if (!vencedor || confirmado) return;
    const exist = await db.entities.Campista.filter({ acampamento_id: acampamentoId }, '-created_date', 500);
    const ficha = String(exist.length + 1).padStart(3, '0');
    await db.entities.Campista.create({
      nome: vencedor.nome,
      sexo: vencedor.sexo,
      camiseta: vencedor.camiseta,
      cidade: vencedor.cidade,
      idade: vencedor.idade,
      peso: vencedor.peso,
      ficha,
      pagamento: 'Pendente',
      acampamento_id: acampamentoId,
    });
    await db.entities.InscricaoSite.update(vencedor.id, { status: 'Confirmado' });
    setConfirmado(true);
    load();
  };

  if (loading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs tracking-[0.2em] text-muted-foreground">EVENTO · 08</div>
          <h1 className="text-2xl font-bold mt-1">Inscrição Site</h1>
          <p className="text-sm text-muted-foreground mt-1">Sorteie os campistas entre os inscritos do site e confirme a presença.</p>
        </div>
        <Button size="sm" onClick={() => navigate('/novo-inscrito')}>
          <UserPlus className="w-4 h-4 mr-1" /> Novo inscrito
        </Button>
      </div>

      <div className="bg-gradient-to-br from-hero to-sidebar rounded-2xl p-8 text-white text-center min-h-[260px] flex flex-col items-center justify-center">
        {vencedor ? (
          <>
            <Trophy className={`w-12 h-12 mb-3 ${sorteando ? 'animate-bounce' : 'text-sidebar-ring'}`} />
            <div className="text-xs tracking-[0.2em] text-white/60">
              {sorteando ? 'SORTEANDO...' : 'INSCRITO SORTEADO'}
            </div>
            <div className="text-2xl font-bold mt-2">{vencedor.nome}</div>
            <div className="text-sm text-white/70 mt-1">
              {vencedor.cidade || '—'} · {vencedor.sexo === 'F' ? 'Feminino' : 'Masculino'} · {vencedor.camiseta || '—'}
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
                {confirmado ? 'Presença confirmada · virou campista' : 'Confirmar presença'}
              </Button>
            )}
          </>
        ) : (
          <>
            <Shuffle className="w-12 h-12 mb-3 text-white/40" />
            <div className="text-sm text-white/60">
              {pool.length ? `Pronto para sortear entre ${pool.length} inscritos` : 'Nenhum inscrito disponível'}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={sortear} disabled={sorteando || !pool.length}>
          <Shuffle className="w-4 h-4 mr-2" />
          {sorteando ? 'Sorteando...' : 'Sortear inscrito'}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" /> Inscritos do site
          <span className="ml-auto text-xs text-muted-foreground font-normal">{inscritos.length}</span>
        </h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {inscritos.map((c) => (
            <div key={c.id} className="flex items-center gap-3 text-sm">
              <div className="flex-1 min-w-0">
                <div className="truncate">{c.nome}</div>
                <div className="text-xs text-muted-foreground">
                  {c.cidade || '—'} · {c.sexo === 'F' ? 'F' : 'M'} · {c.camiseta || '—'}
                </div>
              </div>
              <StatusBadge status={c.status} />
            </div>
          ))}
          {inscritos.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum inscrito ainda. Adicione com "Novo inscrito".</p>
          )}
        </div>
      </div>

    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Inscrito: 'bg-muted text-muted-foreground',
    Sorteado: 'bg-amber-100 text-amber-700',
    Confirmado: 'bg-green-100 text-green-700',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || styles.Inscrito}`}>{status}</span>;
}