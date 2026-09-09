const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tent, Users, Heart, UsersRound, ClipboardList, UserCircle, Calendar, X, Gift, Globe, FileText, UserCog } from 'lucide-react';

import { useAcampamento } from '@/lib/AcampamentoContext';
import { formatDataCurta } from '@/lib/format';

const navItems = [
  { label: 'Visão geral', path: '/', icon: LayoutDashboard },
  { label: 'Acampamentos', path: '/acampamentos', icon: Tent },
  { label: 'Campistas', path: '/campistas', icon: Users },
  { label: 'Inscrição Site', path: '/inscricao-site', icon: Globe },
  { label: 'Tribos', path: '/tribos', icon: Heart },
  { label: 'Equipes', path: '/equipes', icon: UsersRound },
  { label: 'Logística', path: '/logistica', icon: ClipboardList },
  { label: 'Secretaria', path: '/secretaria', icon: FileText },
  { label: 'Sorteio', path: '/sorteio', icon: Gift },
  { label: 'Perfil', path: '/perfil', icon: UserCircle },
  { label: 'Usuários', path: '/usuarios', icon: UserCog },
];

const noQuery = ['/acampamentos', '/perfil', '/usuarios'];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { acampamento } = useAcampamento();
  const query = acampamento ? `?acampamentoId=${acampamento.id}` : '';
  const [isMaster, setIsMaster] = useState(false);
  useEffect(() => {
    db.auth.me().then((u) => setIsMaster(!!u?.is_master)).catch(() => setIsMaster(false));
  }, []);
  const visibleItems = navItems.filter((item) => item.path !== '/usuarios' || isMaster);

  return (
    <>
      {open && <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={onClose} />}
      <aside
        className={`w-60 bg-sidebar text-sidebar-foreground flex flex-col fixed inset-y-0 left-0 z-40 transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 flex items-center justify-between gap-2.5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center">
              <Tent className="w-5 h-5 text-sidebar-ring" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-white">Acampamento</div>
              <div className="text-[10px] tracking-[0.2em] text-sidebar-foreground/70">GESTÃO · EVENTOS</div>
            </div>
          </div>
          <button className="lg:hidden text-sidebar-foreground p-1" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const active = location.pathname === item.path;
            const to = noQuery.includes(item.path) ? item.path : `${item.path}${query}`;
            return (
              <Link
                key={item.path}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-sidebar-accent text-white' : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 p-4 rounded-xl bg-sidebar-accent/60">
          <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-sidebar-foreground/70 mb-2">
            <Calendar className="w-3 h-3" /> PRÓXIMO MARCO
          </div>
          <div className="text-sm font-semibold text-white">{acampamento ? formatDataCurta(acampamento.data_inicio) : '—'}</div>
          <div className="text-xs text-sidebar-foreground/80 mt-1 line-clamp-2">{acampamento?.nome || 'Nenhum evento'}</div>
          <div className="mt-3 h-1.5 rounded-full bg-sidebar-border overflow-hidden">
            <div className="h-full w-2/3 bg-sidebar-ring"></div>
          </div>
          <div className="text-[10px] text-sidebar-foreground/60 mt-1.5">preparação em curso</div>
        </div>
      </aside>
    </>
  );
}