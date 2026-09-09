export const maskCPF = (v) => {
  const d = (v || '').replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const maskPhone = (v) => {
  const d = (v || '').replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
};

export const maskCEP = (v) => (v || '').replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');

export const maskRG = (v) => (v || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);

export const validateCPF = (cpf) => {
  const d = (cpf || '').replace(/\D/g, '');
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(d[i]) * (10 - i);
  let r1 = (s * 10) % 11 % 11;
  if (r1 !== parseInt(d[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(d[i]) * (11 - i);
  let r2 = (s * 10) % 11 % 11;
  return r2 === parseInt(d[10]);
};

export const validateEmail = (e) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);