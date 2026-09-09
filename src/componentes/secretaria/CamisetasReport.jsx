const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef, useMemo } from 'react';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Shirt, Filter } from 'lucide-react';
import { exportElementToPdf } from '@/lib/exportPdf';

const SEXOS = [{ value: 'F', label: 'Feminino' }, { value: 'M', label: 'Masculino' }];

export default function CamisetasReport() {
  const { acampamentoId } = useAcampamento();
  const [campistas, setCampistas] = useState([]);
  const [servos, setServos] = useState([]);
  const [tribos, setTribos] = useState([]);
  const [filtros, setFiltros] = useState({ nome: '', tamanho: '', cor: '', equipe: '', sexo: '' });
  const refCamp = useRef(null);
  const refServ = useRef(null);
  const refGeral = useRef(null);

  const load = async () => {
    if (!acampamentoId) return;
    const [c, s, t] = await Promise.all([
      db.entities.Campista.filter({ acampamento_id: acampamentoId }, 'nome', 999),
      db.entities.Equipe.filter({ acampamento_id: acampamentoId }, 'nome', 999),
      db.entities.Tribo.filter({ acampamento_id: acampamentoId }, 'nome', 999),
    ]);
    setCampistas(c);
    setServos(s);
    setTribos(t);
  };
  useEffect(() => { load(); }, [acampamentoId]);

  const corTribo = (nome) => tribos.find((t) => t.nome === nome)?.cor || '—';

  const tamanhos = useMemo(() => {
    const set = new Set();
    [...campistas, ...servos].forEach((p) => p.camiseta && set.add(p.camiseta));
    return [...set].sort();
  }, [campistas, servos]);

  const cores = useMemo(() => {
    const set = new Set();
    tribos.forEach((t) => t.cor && set.add(t.cor));
    return [...set].sort();
  }, [tribos]);

  const equipes = useMemo(() => {
    const set = new Set();
    servos.forEach((s) => s.funcao && set.add(s.funcao));
    return [...set].sort();
  }, [servos]);

  const matchNome = (nome) => !filtros.nome || nome.toLowerCase().includes(filtros.nome.toLowerCase());

  const campFiltrados = campistas.filter((c) =>
    matchNome(c.nome) &&
    (!filtros.tamanho || c.camiseta === filtros.tamanho) &&
    (!filtros.cor || corTribo(c.tribo) === filtros.cor) &&
    (!filtros.sexo || c.sexo === filtros.sexo)
  );

  const servFiltrados = servos.filter((s) =>
    matchNome(s.nome) &&
    (!filtros.tamanho || s.camiseta === filtros.tamanho) &&
    (!filtros.equipe || s.funcao === filtros.equipe) &&
    (!filtros.sexo || s.sexo === filtros.sexo)
  );

  const limpar = () => setFiltros({ nome: '', tamanho: '', cor: '', equipe: '', sexo: '' });

  const exportar = async (ref, nome) => {
    if (ref.current) await exportElementToPdf(ref.current, nome);
  };

  const TabelaCampistas = () => (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-muted-foreground">
          <th className="py-2">Nome</th><th>Tamanho</th><th>Tribo</th><th>Cor</th><th>Sexo</th>
        </tr>
      </thead>
      <tbody>
        {campFiltrados.map((c) => (
          <tr key={c.id} className="border-b">
            <td className="py-2">{c.nome}</td>
            <td>{c.camiseta || '—'}</td>
            <td>{c.tribo || '—'}</td>
            <td><span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded-full border border-border" style={{ background: corTribo(c.tribo) }} />{corTribo(c.tribo)}</span></td>
            <td>{c.sexo === 'F' ? 'Feminino' : 'Masculino'}</td>
          </tr>
        ))}
        {campFiltrados.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">Nenhum resultado.</td></tr>}
      </tbody>
    </table>
  );

  const TabelaServos = () => (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-muted-foreground">
          <th className="py-2">Nome</th><th>Tamanho</th><th>Equipe</th><th>Sexo</th>
        </tr>
      </thead>
      <tbody>
        {servFiltrados.map((s) => (
          <tr key={s.id} className="border-b">
            <td className="py-2">{s.nome}</td>
            <td>{s.camiseta || '—'}</td>
            <td>{s.funcao || '—'}</td>
            <td>{s.sexo === 'F' ? 'Feminino' : 'Masculino'}</td>
          </tr>
        ))}
        {servFiltrados.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">Nenhum resultado.</td></tr>}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold"><Filter className="w-4 h-4" /> Filtros</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Input placeholder="Buscar por nome" value={filtros.nome} onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })} />
          <Select value={filtros.tamanho} onValueChange={(v) => setFiltros({ ...filtros, tamanho: v === 'all' ? '' : v })}>
            <SelectTrigger><SelectValue placeholder="Tamanho" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {tamanhos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filtros.cor} onValueChange={(v) => setFiltros({ ...filtros, cor: v === 'all' ? '' : v })}>
            <SelectTrigger><SelectValue placeholder="Cor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {cores.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filtros.equipe} onValueChange={(v) => setFiltros({ ...filtros, equipe: v === 'all' ? '' : v })}>
            <SelectTrigger><SelectValue placeholder="Equipe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {equipes.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filtros.sexo} onValueChange={(v) => setFiltros({ ...filtros, sexo: v === 'all' ? '' : v })}>
            <SelectTrigger><SelectValue placeholder="Sexo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {SEXOS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={limpar}>Limpar filtros</Button>
        </div>
      </div>

      {/* Botões de PDF */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={() => exportar(refCamp, 'camisetas-campistas.pdf')}><FileDown className="w-4 h-4 mr-1" /> PDF Campistas</Button>
        <Button size="sm" variant="outline" onClick={() => exportar(refServ, 'camisetas-servos.pdf')}><FileDown className="w-4 h-4 mr-1" /> PDF Servos</Button>
        <Button size="sm" variant="outline" onClick={() => exportar(refGeral, 'camisetas-geral.pdf')}><FileDown className="w-4 h-4 mr-1" /> PDF Geral</Button>
      </div>

      {/* Tabelas */}
      <div ref={refGeral} className="space-y-6 bg-white p-5 rounded-xl border border-border">
        <h3 className="text-lg font-bold flex items-center gap-2"><Shirt className="w-5 h-5" /> Relatório de Camisetas</h3>

        <div ref={refCamp}>
          <h4 className="text-sm font-semibold mb-2">Campistas ({campFiltrados.length})</h4>
          <div className="overflow-x-auto"><TabelaCampistas /></div>
        </div>

        <div ref={refServ}>
          <h4 className="text-sm font-semibold mb-2">Servos ({servFiltrados.length})</h4>
          <div className="overflow-x-auto"><TabelaServos /></div>
        </div>
      </div>
    </div>
  );
}