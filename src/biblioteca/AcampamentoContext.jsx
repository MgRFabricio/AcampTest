const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const Ctx = createContext(null);

export function AcampamentoProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [acampamentos, setAcampamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.entities.Acampamento.list('-created_date', 100)
      .then(setAcampamentos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const urlId = searchParams.get('acampamentoId');
  const acampamentoId = urlId || acampamentos[0]?.id || null;
  const acampamento = acampamentos.find((a) => a.id === acampamentoId) || null;

  const setAcampamentoId = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set('acampamentoId', id);
    setSearchParams(next);
  };

  return (
    <Ctx.Provider value={{ acampamentos, acampamento, acampamentoId, setAcampamentoId, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAcampamento() {
  return useContext(Ctx);
}