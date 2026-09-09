const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from 'react';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Music, Mail, User, BookOpen, Upload, Download, Trash2 } from 'lucide-react';

const PASTAS = [
  { tipo: 'Musicas', label: 'Músicas', icon: Music },
  { tipo: 'Carta Coordenador', label: 'Carta do Coordenador', icon: Mail },
  { tipo: 'Carta Campista', label: 'Carta do Campista', icon: User },
  { tipo: 'Carta Pregador', label: 'Carta do Pregador', icon: BookOpen },
];

export default function PastasSection() {
  const { acampamentoId } = useAcampamento();
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [titulo, setTitulo] = useState({});
  const fileRefs = useRef({});

  const load = async () => {
    if (!acampamentoId) return;
    const list = await db.entities.Documento.filter({ acampamento_id: acampamentoId }, '-created_date', 999);
    setDocs(list);
  };
  useEffect(() => { load(); }, [acampamentoId]);

  const handleFile = async (tipo, file) => {
    if (!file) return;
    setUploading(tipo);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      await db.entities.Documento.create({
        titulo: titulo[tipo] || file.name,
        tipo,
        arquivo_url: file_url,
        acampamento_id: acampamentoId,
      });
      setTitulo((p) => ({ ...p, [tipo]: '' }));
      load();
    } finally {
      setUploading(null);
    }
  };

  const remover = async (id) => {
    if (!confirm('Remover este documento?')) return;
    await db.entities.Documento.delete(id);
    load();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {PASTAS.map((p) => {
        const items = docs.filter((d) => d.tipo === p.tipo);
        return (
          <div key={p.tipo} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-hero/10 flex items-center justify-center"><p.icon className="w-5 h-5 text-hero" /></div>
              <h3 className="text-sm font-semibold">{p.label}</h3>
              <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="space-y-2 mb-3">
              {items.map((d) => (
                <div key={d.id} className="flex items-center gap-2 text-sm bg-muted/40 rounded-lg px-3 py-2">
                  <span className="flex-1 truncate">{d.titulo}</span>
                  <a href={d.arquivo_url} target="_blank" rel="noreferrer" className="text-hero"><Download className="w-4 h-4" /></a>
                  <button onClick={() => remover(d.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Nenhum documento.</p>}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Título (opcional)" value={titulo[p.tipo] || ''} onChange={(e) => setTitulo((s) => ({ ...s, [p.tipo]: e.target.value }))} className="text-sm" />
              <Button size="sm" variant="outline" disabled={uploading === p.tipo} onClick={() => fileRefs.current[p.tipo]?.click()}>
                <Upload className="w-4 h-4 mr-1" /> {uploading === p.tipo ? 'Enviando...' : 'Enviar'}
              </Button>
              <input ref={(el) => (fileRefs.current[p.tipo] = el)} type="file" className="hidden" onChange={(e) => handleFile(p.tipo, e.target.files?.[0])} />
            </div>
          </div>
        );
      })}
    </div>
  );
}