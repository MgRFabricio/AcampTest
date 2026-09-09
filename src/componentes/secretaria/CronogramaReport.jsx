const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from 'react';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { Button } from '@/components/ui/button';
import { FileDown, CalendarDays, Clock } from 'lucide-react';
import { exportElementToPdf } from '@/lib/exportPdf';

const fmtDate = (d) => {
  if (!d || d === 'Sem data') return 'Sem data';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return d;
  }
};

export default function CronogramaReport() {
  const { acampamentoId } = useAcampamento();
  const [escalas, setEscalas] = useState([]);
  const ref = useRef(null);

  const load = async () => {
    if (!acampamentoId) return;
    const list = await db.entities.Escala.filter({ acampamento_id: acampamentoId }, 'data', 999);
    setEscalas(list);
  };
  useEffect(() => { load(); }, [acampamentoId]);

  const dias = {};
  escalas.forEach((e) => {
    const key = e.data || 'Sem data';
    (dias[key] = dias[key] || []).push(e);
  });
  const diaKeys = Object.keys(dias).sort();

  const exportar = async () => {
    if (ref.current) await exportElementToPdf(ref.current, 'cronograma.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={exportar}><FileDown className="w-4 h-4 mr-1" /> Exportar PDF</Button>
      </div>
      <div ref={ref} className="bg-white p-5 rounded-xl border border-border space-y-5">
        <h3 className="text-lg font-bold flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Cronograma de Atividades</h3>
        {diaKeys.map((dia) => (
          <div key={dia}>
            <div className="text-sm font-semibold text-hero border-b border-border pb-1 mb-2">{fmtDate(dia)}</div>
            <div className="space-y-2">
              {dias[dia].map((e) => (
                <div key={e.id} className="flex gap-3 items-start text-sm border-l-2 pl-3" style={{ borderColor: e.status === 'pronto' ? '#16a34a' : '#d97706' }}>
                  <div className="flex-1">
                    <div className="font-medium">{e.titulo}</div>
                    {e.descricao && <div className="text-muted-foreground text-xs mt-0.5">{e.descricao}</div>}
                  </div>
                  {e.horario && <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap"><Clock className="w-3 h-3" />{e.horario}</div>}
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${e.status === 'pronto' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{e.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {escalas.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Nenhuma atividade cadastrada.</p>}
      </div>
    </div>
  );
}