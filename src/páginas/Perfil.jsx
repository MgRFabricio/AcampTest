const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Lock, LogOut } from 'lucide-react';

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ telefone: '', cidade: '', bio: '', notificacoes_email: true });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    db.auth.me().then((u) => {
      setUser(u);
      setForm({
        telefone: u.telefone || '',
        cidade: u.cidade || '',
        bio: u.bio || '',
        notificacoes_email: u.notificacoes_email !== false,
      });
    });
  }, []);

  const salvar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await db.auth.updateMe({
        telefone: form.telefone,
        cidade: form.cidade,
        bio: form.bio,
        notificacoes_email: form.notificacoes_email,
      });
      toast({ title: 'Preferências salvas com sucesso.' });
    } catch {
      toast({ title: 'Não foi possível salvar.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="text-muted-foreground">Carregando...</div>;

  const inicial = (user.full_name || user.email || '?').charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="text-xs tracking-[0.2em] text-muted-foreground">CONTA · 06</div>
        <h1 className="text-2xl font-bold mt-1">Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">Seus dados de acesso e preferências pessoais.</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold shrink-0">
            {inicial}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-lg truncate">{user.full_name || 'Sem nome'}</div>
            <div className="text-sm text-muted-foreground truncate">{user.email}</div>
            <span className="inline-block mt-1 text-[10px] tracking-widest px-2 py-1 rounded-full bg-muted text-muted-foreground uppercase">{user.role}</span>
          </div>
        </div>
      </div>

      <form onSubmit={salvar} className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Dados de acesso</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Nome e e-mail são gerenciados pela sua conta.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Nome</Label>
            <Input value={user.full_name || ''} disabled />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input value={user.email || ''} disabled />
          </div>
        </div>
        <Button type="button" variant="outline" onClick={() => navigate('/forgot-password')}>
          <Lock className="w-4 h-4 mr-1" />Alterar senha
        </Button>

        <div className="pt-4 border-t border-border">
          <h2 className="text-sm font-semibold mb-1">Preferências pessoais</h2>
          <p className="text-xs text-muted-foreground mb-4">Contato e notificações usados pelo sistema.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </div>
          </div>
          <div className="mt-4">
            <Label>Bio / observações</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Notificações por e-mail</div>
              <div className="text-xs text-muted-foreground">Receber atualizações sobre o acampamento.</div>
            </div>
            <Switch checked={form.notificacoes_email} onCheckedChange={(v) => setForm({ ...form, notificacoes_email: v })} />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar preferências'}</Button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-border p-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Encerrar sessão</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Sai da sua conta neste dispositivo.</p>
        </div>
        <Button variant="outline" onClick={() => db.auth.logout('/login')}>
          <LogOut className="w-4 h-4 mr-1" />Sair
        </Button>
      </div>
    </div>
  );
}