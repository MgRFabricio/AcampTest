const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from 'react';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { Button } from '@/components/ui/button';
import { FileDown, CreditCard } from 'lucide-react';
import { exportElementToPdf } from '@/lib/exportPdf';

export default function PagamentoReport() {
  const { acampamentoId } = useAcampamento();
  const [campistas, setCampistas] = useState([]);
  const ref = useRef(null);

  const load = async () => {
    if (!acampamentoId) return;
    const list = await db.entities.Campista.filter({ acampamento_id: acampamentoId }, 'nome', 999);
    setCampistas(list);
  };
  useEffect(() => { load(); }, [acampamentoId]);

  const pagos = campistas.filter((c) => c.pagamento === 'Pago');
  const pendentes = campistas.filter((c) => c.pagamento !== 'Pago');

  const exportar = async () => {
    if (ref.current) await exportElementToPdf(ref.current, 'pagamento.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={exportar}><FileDown className="w-4 h-4 mr-1" /> Exportar PDF</Button>
      </div>
      <div ref={ref} className="bg-white p-5 rounded-xl border border-border space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2"><CreditCard className="w-5 h-5" /> Relatório de Pagamento</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center"><div className="text-2xl font-bold">{campistas.length}</div><div className="text-xs text-muted-foreground">Total</div></div>
          <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-green-700">{pagos.length}</div><div className="text-xs text-muted-foreground">Pagos</div></div>
          <div className="bg-amber-50 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-amber-700">{pendentes.length}</div><div className="text-xs text-muted-foreground">Pendentes</div></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">Nome</th><th>Ficha</th><th>Tribo</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campistas.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2">{c.nome}</td>
                  <td>{c.ficha || '—'}</td>
                  <td>{c.tribo || '—'}</td>
                  <td><span className={`text-xs px-2 py-0.5 rounded-full ${c.pagamento === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{c.pagamento || 'Pendente'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}