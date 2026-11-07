import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { api } from "./api";
import type { ContractBrief, ContractBriefTopic } from "./types";

const topics: Record<ContractBriefTopic, string> = {
  responsible: "Quem atende", equipment: "Equipamentos", services: "Serviços",
  dates: "Prazos", response: "Atendimento", obligations: "Responsabilidades",
  costs: "Valores", limits: "Limites do contrato",
};

export function ContractBriefPanel({ contractId, active, onRead }: {
  contractId: string;
  active: boolean;
  onRead: () => void;
}) {
  const cache = useRef(new Map<string, ContractBrief>());
  const usedRetries = useRef(new Map<string, number>());
  const [result, setResult] = useState<{ id: string; brief?: ContractBrief; error?: string } | null>(null);
  const [attempt, setAttempt] = useState({ id: "", count: 0 });
  const resultId = contractId;
  const current = result?.id === resultId ? result : null;
  useEffect(() => {
    if (!active) return;
    const cached = cache.current.get(contractId);
    if (cached) { setResult({ id: contractId, brief: cached }); return; }
    const controller = new AbortController();
    const retry = attempt.id === contractId && attempt.count > (usedRetries.current.get(contractId) || 0);
    if (retry) usedRetries.current.set(contractId, attempt.count);
    setResult({ id: contractId });
    api<ContractBrief>(`/contracts/${encodeURIComponent(contractId)}/summary`, {
      method: "POST", signal: controller.signal,
      body: JSON.stringify({ retry }),
    }).then(brief => {
      if (controller.signal.aborted) return;
      if (brief.source === "ai") cache.current.set(contractId, brief);
      setResult({ id: contractId, brief });
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ id: contractId, error: (error as Error).message });
    });
    return () => controller.abort();
  }, [contractId, active, attempt]);

  return (
    <section className="contract-brief" aria-label="Resumo para gestão clínica" aria-busy={!current?.brief && !current?.error}>
      <div className="contract-brief-heading">
        <h3>O essencial do contrato</h3>
        {current?.brief && <span className={`contract-brief-source ${current.brief.source}`}>
          {current.brief.source === "simulated" ? "Simulação" : "Resumo por IA"}
        </span>}
      </div>
      {current?.error ? <div className="contract-brief-error">
        <p role="alert">{current.error}</p>
        <button type="button" className="button secondary" onClick={() => setAttempt(old => ({ id: contractId, count: old.id === contractId ? old.count + 1 : 1 }))}>Tentar novamente</button>
      </div> : !current?.brief ? <div className="contract-brief-loading" role="status"><LoaderCircle size={18} className="spin" /> Preparando o resumo…</div> : <>
        <p className="contract-brief-overview">{current.brief.overview}</p>
        <ul className="contract-brief-points">
          {current.brief.points.map((point, index) => <li key={`${point.topic}-${index}`}>
            <strong>{topics[point.topic]}</strong><p>{point.text}</p>
            {point.quote && <details><summary>{point.page ? `Fonte · página ${point.page}` : "Trecho do arquivo"}</summary><blockquote>{point.quote}</blockquote></details>}
          </li>)}
        </ul>
        {current.brief.warnings.length > 0 && <div className="contract-brief-warnings">
          <strong>{current.brief.source === "simulated" ? "IA não configurada" : "Pontos a conferir"}</strong>
          <ul>{current.brief.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>
        </div>}
        <footer className="contract-brief-footer">
          <span>{current.brief.source === "ai" ? "Salvo para consulta · confira a fonte antes de decidir" : "Sem chamada à IA"}</span>
          <button type="button" className="text-button" onClick={onRead}>Ver arquivo</button>
        </footer>
      </>}
    </section>
  );
}
