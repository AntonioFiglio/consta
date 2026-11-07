import { useEffect, useId, useState } from "react";
import { Check, CheckCircle2, TriangleAlert } from "lucide-react";

export type ContractImportState = {
  phase: "upload" | "uploaded" | "extract" | "ready";
  startedAt: number;
  failed?: boolean;
};

const steps = [
  "Receber arquivo",
  "Extrair dados com IA",
  "Preparar conferência",
];

export function ContractImportProgress({
  progress,
  itemCount,
  registered = false,
}: {
  progress: ContractImportState;
  itemCount: number;
  registered?: boolean;
}) {
  const titleId = useId();
  const [now, setNow] = useState(Date.now);
  const running =
    !progress.failed &&
    (progress.phase === "upload" || progress.phase === "extract");
  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [progress.startedAt, running]);

  const ready = progress.phase === "ready";
  const completed = ready ? steps.length : progress.phase === "upload" ? 0 : 1;
  const elapsed = Math.max(0, Math.floor((now - progress.startedAt) / 1000));
  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const title = progress.failed
    ? progress.phase === "upload"
      ? "O envio não foi concluído"
      : "A leitura não foi concluída"
    : ready
      ? registered ? "Equipamentos cadastrados" : "Dados prontos para conferir"
      : progress.phase === "upload"
        ? "Enviando o documento"
        : progress.phase === "uploaded"
          ? "Arquivo recebido"
          : "Lendo o documento com IA";
  const description = progress.failed
    ? progress.phase === "upload"
      ? "Selecione o arquivo novamente para tentar enviar."
      : "O arquivo foi preservado. Clique em Continuar para tentar novamente."
    : ready
      ? itemCount
        ? registered
          ? `${itemCount} ${itemCount === 1 ? "equipamento cadastrado" : "equipamentos cadastrados"} no TC. Complete a identificação e confira os dados.`
          : `${itemCount} ${itemCount === 1 ? "item para conferir" : "itens para conferir"}. Confira os dados antes de salvar.`
        : "A leitura terminou. Confira os dados do documento."
      : progress.phase === "upload"
        ? "Salvando o arquivo para iniciar a leitura."
        : progress.phase === "uploaded"
          ? "Clique em Continuar para iniciar a extração dos dados."
          : elapsed >= 45
            ? "A IA ainda está processando. Documentos extensos podem levar mais tempo."
            : "Identificando equipamentos, prazos e informações de manutenção presentes no arquivo.";

  return (
    <section
      className={`contract-import-progress ${ready ? "is-ready" : ""} ${progress.failed ? "has-error" : ""}`}
      aria-labelledby={titleId}
    >
      <div
        className="contract-import-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="contract-import-heading">
          {ready && <CheckCircle2 size={18} aria-hidden="true" />}
          {progress.failed && <TriangleAlert size={18} aria-hidden="true" />}
          <h3 id={titleId}>{title}</h3>
        </div>
        <p>{description}</p>
      </div>
      <div
        className="contract-import-track"
        role="progressbar"
        aria-labelledby={titleId}
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={completed}
        aria-valuetext={`${completed} de 3 etapas concluídas${running ? ` · ${title}` : ""}`}
      >
        {steps.map((label, index) => (
          <span
            key={label}
            className={
              index < completed
                ? "is-complete"
                : index === completed && running
                  ? "is-active"
                  : ""
            }
            aria-hidden="true"
          />
        ))}
      </div>
      {!ready && (
        <>
          <ol
            className="contract-import-steps"
            aria-label="Etapas da importação"
          >
            {steps.map((label, index) => {
              const done = index < completed;
              const active =
                index === completed && (running || progress.failed);
              return (
                <li
                  key={label}
                  className={done ? "is-complete" : active ? "is-active" : ""}
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className="contract-import-step-icon"
                    aria-hidden="true"
                  >
                    {done ? <Check size={13} /> : index + 1}
                  </span>
                  <span>
                    {label}
                    <small>
                      {done
                        ? "Concluído"
                        : active
                          ? progress.failed
                            ? "Interrompido"
                            : "Em andamento"
                          : "Aguardando"}
                    </small>
                  </span>
                </li>
              );
            })}
          </ol>
          {running && (
            <div className="contract-import-time" aria-hidden="true">
              Tempo nesta etapa <span>{time}</span>
            </div>
          )}
        </>
      )}
    </section>
  );
}
