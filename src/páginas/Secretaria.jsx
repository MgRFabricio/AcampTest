import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CamisetasReport from '@/components/secretaria/CamisetasReport';
import PagamentoReport from '@/components/secretaria/PagamentoReport';
import CronogramaReport from '@/components/secretaria/CronogramaReport';
import PastasSection from '@/components/secretaria/PastasSection';
import { Shirt, CreditCard, CalendarDays, FolderOpen } from 'lucide-react';

export default function Secretaria() {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs tracking-[0.2em] text-muted-foreground">ADMINISTRATIVO</div>
        <h1 className="text-2xl font-bold mt-1">Painel Secretaria</h1>
        <p className="text-sm text-muted-foreground mt-1">Relatórios e documentos do acampamento.</p>
      </div>
      <Tabs defaultValue="camisetas">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="camisetas"><Shirt className="w-4 h-4 mr-1" />Camisetas</TabsTrigger>
          <TabsTrigger value="pagamento"><CreditCard className="w-4 h-4 mr-1" />Pagamento</TabsTrigger>
          <TabsTrigger value="cronograma"><CalendarDays className="w-4 h-4 mr-1" />Cronograma</TabsTrigger>
          <TabsTrigger value="pastas"><FolderOpen className="w-4 h-4 mr-1" />Pastas</TabsTrigger>
        </TabsList>
        <TabsContent value="camisetas" className="mt-4"><CamisetasReport /></TabsContent>
        <TabsContent value="pagamento" className="mt-4"><PagamentoReport /></TabsContent>
        <TabsContent value="cronograma" className="mt-4"><CronogramaReport /></TabsContent>
        <TabsContent value="pastas" className="mt-4"><PastasSection /></TabsContent>
      </Tabs>
    </div>
  );
}