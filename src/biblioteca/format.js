import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatData(iso) {
  if (!iso) return '—';
  const d = parseISO(iso);
  return isValid(d) ? format(d, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : '—';
}

export function formatDataCurta(iso) {
  if (!iso) return '—';
  const d = parseISO(iso);
  return isValid(d) ? format(d, "d 'de' MMMM", { locale: ptBR }) : '—';
}

export function formatPeriodo(inicio, fim) {
  if (!inicio || !fim) return '—';
  return `${formatDataCurta(inicio)} — ${formatDataCurta(fim)}`;
}