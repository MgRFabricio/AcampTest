const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Pencil, Shield, Mail, Tent } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ROLE_MAP = {
  admin: { label: 'Administrador', cls: 'bg-hero/10 text-hero' },
  user: { label: 'Usuário', cls: 'bg-muted text-muted-foreground' },
};
const MASTER = { label: 'Administrador Master', cls: 'bg-amber-100 text-amber-800' };

export default function Usuarios() {
  const { toast } = useToast();
  const { acampamentos: acampList } = useAcampamento();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    db.auth.me().then((u) => { setCurrentUser(u); setChecking(false); }).catch(() => setChecking(false));
  }, []);
  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState({ email: '', nivel: 'user' });
  const [sending, setSending] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await db.entities.User.list('-created_date', 999);
      setUsers(list);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const convidar = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const role = invite.nivel === 'user' ? 'user' : 'admin';
      await db.users.inviteUser(invite.email, role);
      if (invite.nivel === 'master') {
        const list = await db.entities.User.list('-created_date', 999);
        const novo = list.find((u) => u.email === invite.email);
        if (novo) await db.entities.User.update(novo.id, { is_master: true });
      }
      toast({ title: 'Convite enviado', description: `E-mail enviado para ${invite.email}` });
      setOpen(false);
      setInvite({ email: '', nivel: 'user' });
      load();
    } catch (err) {
      toast({ title: 'Erro ao convidar', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const abrirEdicao = (u) => {
    setEditForm({
      id: u.id,
      role: u.role || 'user',
      is_master: u.is_master || false,
      telefone: u.telefone || '',
      cidade: u.cidade || '',
      bio: u.bio || '',
      acampamentos: u.acampamentos || [],
    });
    setEditOpen(true);
  };

  const toggleAcamp = (id) => {
    setEditForm((f) => {
      const has = f.acampamentos.includes(id);
      return { ...f, acampamentos: has ? f.acampamentos.filter((a) => a !== id) : [...f.acampamentos, id] };
    });
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    try {
      await db.entities.User.update(editForm.id, {
        role: editForm.role,
        is_master: editForm.is_master,
        telefone: editForm.telefone,
        cidade: editForm.cidade,
        bio: editForm.bio,
        acampamentos: editForm.acampamentos,
      });
      toast({ title: 'Perfil atualizado' });
      setEditOpen(false);
      setEditForm(null);
      load();
    } catch (err) {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    }
  };

  const nomeAcamp = (id) => acampList.find((a) => a.id === id)?.nome || '—';

  if (checking) return <div className="p-8 text-sm text-muted-foreground">Verificando permissão...</div>;
  if (!currentUser?.is_master) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-3">
        <Shield className="w-10 h-10 mx-auto text-muted-foreground" />
        <h2 className="text-lg font-semibold">Acesso restrito</h2>
        <p className="text-sm text-muted-foreground">Esta área é exclusiva para Administradores Master.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs tracking-[0.2em] text-muted-foreground">ADMINISTRAÇÃO · USUÁRIOS</div>
          <h1 className="text-2xl font-bold mt-1">Gestão de Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            Convide membros da equipe, defina permissões e vincule acampamentos a cada usuário.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="w-4 h-4 mr-1" />Convidar usuário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Convidar usuário</DialogTitle></DialogHeader>
            <form onSubmit={convidar} className="space-y-3">
              <div><Label>E-mail</Label><Input type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} required placeholder="pessoa@email.com" /></div>
              <div>
                <Label>Permissão</Label>
                <Select value={invite.nivel} onValueChange={(v) => setInvite({ ...invite, nivel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="master">Administrador Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={sending}>{sending ? 'Enviando...' : 'Enviar convite'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-border divide-y divide-border">
          {users.map((u) => {
            const r = ROLE_MAP[u.role] || ROLE_MAP.user;
            return (
              <div key={u.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-hero/10 flex items-center justify-center text-hero font-semibold">
                  {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{u.full_name || 'Sem nome'}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 truncate"><Mail className="w-3 h-3" />{u.email}</div>
                  {(u.acampamentos?.length > 0) && (
                    <div className="text-xs text-hero flex items-center gap-1 mt-0.5 truncate">
                      <Tent className="w-3 h-3" />{u.acampamentos.map(nomeAcamp).join(', ')}
                    </div>
                  )}
                </div>
                {u.is_master ? (
                  <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${MASTER.cls}`}><Shield className="w-3 h-3" />{MASTER.label}</span>
                ) : (
                  <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${r.cls}`}><Shield className="w-3 h-3" />{r.label}</span>
                )}
                <Button variant="outline" size="icon" onClick={() => abrirEdicao(u)}><Pencil className="w-4 h-4" /></Button>
              </div>
            );
          })}
          {users.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nenhum usuário cadastrado.</div>}
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar usuário</DialogTitle></DialogHeader>
          {editForm && (
            <form onSubmit={salvarEdicao} className="space-y-3">
              <div>
                <Label>Permissão</Label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Telefone</Label><Input value={editForm.telefone} onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })} /></div>
                <div><Label>Cidade</Label><Input value={editForm.cidade} onChange={(e) => setEditForm({ ...editForm, cidade: e.target.value })} /></div>
              </div>
              <div><Label>Bio / Observações</Label><Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={2} /></div>
              <div className="flex items-center gap-2">
                <Checkbox checked={editForm.is_master} onCheckedChange={(v) => setEditForm({ ...editForm, is_master: v })} id="is-master" />
                <label htmlFor="is-master" className="text-sm cursor-pointer">Administrador Master (gerencia tudo, inclusive outros admins)</label>
              </div>
              <div>
                <Label>Acampamentos que participa</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-3">
                  {acampList.length === 0 && <p className="text-xs text-muted-foreground">Nenhum acampamento cadastrado.</p>}
                  {acampList.map((a) => (
                    <div key={a.id} className="flex items-center gap-2">
                      <Checkbox checked={editForm.acampamentos.includes(a.id)} onCheckedChange={() => toggleAcamp(a.id)} id={`ac-${a.id}`} />
                      <label htmlFor={`ac-${a.id}`} className="text-sm cursor-pointer">{a.nome}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">Salvar alterações</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}