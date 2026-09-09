import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAcampamento } from '@/lib/AcampamentoContext';

export default function TopBar({ onMenuClick }) {
  const { acampamento, acampamentos, setAcampamentoId } = useAcampamento();

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button className="lg:hidden p-1.5 -ml-1 text-muted-foreground" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-sm text-muted-foreground truncate max-w-[140px] sm:max-w-md">
          {acampamento ? acampamento.nome : 'Selecione um acampamento'}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <select
          value={acampamento?.id || ''}
          onChange={(e) => setAcampamentoId(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 sm:px-3 py-1.5 bg-white max-w-[140px] sm:max-w-[220px] truncate"
        >
          {acampamentos.map((a) => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          SISTEMA ONLINE
        </div>
        <Link to="/perfil" className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
          PS
        </Link>
      </div>
    </header>
  );
}