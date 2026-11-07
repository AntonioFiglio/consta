import type { OnBreakdown } from "./breakdowns";
import { ManagedDialog } from "./DialogManager";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  FileText,
  GripHorizontal,
  SlidersHorizontal,
  LoaderCircle,
  Plus,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import type {
  Asset,
  Contract,
  ContractSummary,
  EquipmentExtraction,
  Extraction,
  PeriodUnit,
} from "./types";
import { ContractViewer } from "./ContractViewer";
import { brandAndModel } from "./equipment-identity";
import { api } from "./api";
import {
  draftFromAsset,
  draftFromExtraction,
  emptyDraft,
  existingForDraft,
  extractionItems,
  isMultiExtraction,
  type EquipmentDraft,
} from "./contract-extraction";

const pretty = (date?: string | null) =>
  date
    ? new Date(date + "T12:00:00").toLocaleDateString("pt-BR")
    : "não informado";
const labels: Record<Exclude<keyof EquipmentExtraction, "warnings">, string> = {
  equipment: "Equipamento",
  patrimony: "Número de tombamento",
  serial: "Número de série",
  sector: "Setor",
  brand: "Marca",
  maintenanceCompany: "Empresa de manutenção",
  maintenancePhone: "Telefone da manutenção",
  maintenanceEmail: "E-mail da manutenção",
  model: "Modelo",
  notes: "Observações",
  quantity: "Quantidade",
  periodValue: "Intervalo",
  periodUnit: "Unidade",
  firstDueDate: "Primeira manutenção",
  anchorDate: "Data de referência",
  anchorType: "Referência",
  validFrom: "Início do contrato",
  validUntil: "Fim do contrato",
};
export function AssetDialog({
  asset,
  assets,
  aiReady,
  contracts = [],
  onClose,
  onSaved,
  onBreakdown,
}: {
  asset: Asset | null;
  assets: Asset[];
  aiReady: boolean;
  contracts?: ContractSummary[];
  onClose: () => void;
  onSaved: () => void;
  onBreakdown?: OnBreakdown;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<1 | 2>(asset ? 2 : 1);
  const [rows, setRows] = useState<EquipmentDraft[]>([
    asset ? draftFromAsset(asset) : emptyDraft(crypto.randomUUID()),
  ]);
  const [previewContractId, setPreviewContractId] = useState<string | null>(
    null,
  );
  const [contract, setContract] = useState<Contract | null>(null);
  const [busy, setBusy] = useState<"upload" | "extract" | "save" | null>(null);
  const [loading, setLoading] = useState(Boolean(asset?.contractId));
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [advancedRows, setAdvancedRows] = useState<Set<string>>(new Set());
  const [advancedTab, setAdvancedTab] = useState<
    "identity" | "coverage" | "evidence"
  >("identity");
  const advancedBack = useRef<HTMLButtonElement>(null);
  const tableRegion = useRef<HTMLDivElement>(null);
  const floatingDetails = useRef<HTMLDialogElement>(null);
  const lastDetailsButton = useRef<HTMLButtonElement | null>(null);
  const [renewTargetId, setRenewTargetId] = useState<string | null>(null);
  const [captureIntent, setCaptureIntent] = useState(false);
  const [captureState, setCaptureState] = useState<"idle" | "creating" | "ready">(
    "idle",
  );
  const [capture, setCapture] = useState<{
    token: string;
    path: string;
    photosSubmitted: boolean;
  } | null>(null);
  const [capturedKeys, setCapturedKeys] = useState<Set<string>>(new Set());
  const captureRef = useRef(capture);
  captureRef.current = capture;
  const sealedRef = useRef(false);
  const openingCapture = useRef(false);
  const editedAt = useRef<Record<string, number>>({});
  const appliedAt = useRef<Record<string, string>>({});
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const uploadTarget = useRef<string | null>(null);
  const renewalBackup = useRef<{
    rows: EquipmentDraft[];
    contract: Contract | null;
  } | null>(null);
  const previousContract = useRef<Contract | null>(null);
  useEffect(() => {
    if (asset?.contractId)
      api<Contract>(`/contracts/${asset.contractId}`)
        .then((value) => {
          setContract(value);
          previousContract.current = value;
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [asset]);
  useEffect(() => {
    dialog.current?.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, [step]);
  useEffect(() => {
    if (
      step !== 2 ||
      !captureIntent ||
      !contract ||
      capture ||
      openingCapture.current
    )
      return;
    openingCapture.current = true;
    setCaptureIntent(false);
    setCaptureState("creating");
    const snapshot = rows.map((row) => ({ key: row.key, name: row.name }));
    const contractId = contract.id;
    void api<{ token: string; path: string }>("/captures", {
      method: "POST",
      body: JSON.stringify({ contractId, rows: snapshot }),
    })
      .then((created) => {
        const next = { ...created, photosSubmitted: false };
        captureRef.current = next;
        setCapture(next);
        setCaptureState("ready");
      })
      .catch((e) => {
        openingCapture.current = false;
        setCaptureState("idle");
        setError((e as Error).message);
      });
  }, [step, captureIntent, contract, capture, rows]);
  const captureRows = rows.map((row) => `${row.key}\n${row.name}`).join("\n");
  useEffect(() => {
    if (!capture || step !== 2) return;
    const token = capture.token;
    const snapshot = rows.map((row) => ({ key: row.key, name: row.name }));
    const handle = window.setTimeout(() => {
      if (sealedRef.current) return;
      void api(`/captures/${token}/rows`, {
        method: "PATCH",
        body: JSON.stringify({ rows: snapshot }),
      }).catch((e) => {
        if (String((e as Error).message).includes("encerrado"))
          sealedRef.current = true;
      });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [capture, step, captureRows]);
  useEffect(() => {
    if (!capture || step !== 2) return;
    let stop = false;
    const tick = () => {
      if (stop || sealedRef.current) return;
      void api<{
        photosSubmitted: boolean;
        rows: {
          key: string;
          patrimony: string | null;
          readAt: string | null;
        }[];
      }>(`/captures/${capture.token}`)
        .then((view) => {
          if (stop || sealedRef.current) return;
          setCapture((current) =>
            current && current.photosSubmitted === view.photosSubmitted
              ? current
              : current
                ? { ...current, photosSubmitted: view.photosSubmitted }
                : current,
          );
          const currentRows = rowsRef.current;
          let changed = false;
          const next = currentRows.map((row) => {
            const incoming = view.rows.find((item) => item.key === row.key);
            if (!incoming?.patrimony || !incoming.readAt) return row;
            if (appliedAt.current[row.key] === incoming.readAt) return row;
            if ((editedAt.current[row.key] || 0) > Date.parse(incoming.readAt))
              return row;
            appliedAt.current[row.key] = incoming.readAt;
            changed = true;
            return { ...row, patrimony: incoming.patrimony };
          });
          if (changed) setRows(next);
          setCapturedKeys((current) => {
            const keys = Object.keys(appliedAt.current);
            if (
              keys.length === current.size &&
              keys.every((key) => current.has(key))
            )
              return current;
            return new Set(keys);
          });
        })
        .catch((e) => {
          if (String((e as Error).message).includes("encerrado"))
            sealedRef.current = true;
        });
    };
    tick();
    const id = window.setInterval(tick, 1500);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [capture, step]);
  useEffect(() => {
    if (advancedRows.size) advancedBack.current?.focus({ preventScroll: true });
    else lastDetailsButton.current?.focus({ preventScroll: true });
  }, [advancedRows]);
  function closeDetails() {
    const fields =
      floatingDetails.current?.querySelectorAll<HTMLInputElement>(
        "input, textarea",
      );
    for (const field of fields || []) {
      if (!field.checkValidity()) {
        const panel = field.closest('[role="tabpanel"]');
        setAdvancedTab(
          panel?.id === "panel-coverage" ? "coverage" : "identity",
        );
        requestAnimationFrame(() => field.reportValidity());
        return;
      }
    }
    setAdvancedRows(new Set());
  }
  function goToStep(next: 1 | 2) {
    setError("");
    setStep(next);
  }
  function change<K extends keyof EquipmentDraft>(
    key: string,
    field: K,
    value: EquipmentDraft[K],
  ) {
    setRows((old) =>
      old.map((row) =>
        row.key === key
          ? {
              ...row,
              [field]: value,
              ...(["firstDueDate", "periodValue", "periodUnit"].includes(field)
                ? { anchorDate: "", anchorType: "Primeira manutenção" }
                : {}),
            }
          : row,
      ),
    );
  }
  function applyExtraction(data: Extraction) {
    const items = extractionItems(data);
    const target = assets.find((item) => item.id === renewTargetId) || asset;
    const drafts = items.map((item) => {
      const row = draftFromExtraction(item, crypto.randomUUID());
      const matched = existingForDraft(row, assets);
      if (matched)
        return {
          ...row,
          brand: row.brand || matched.brand || "",
          assetId: matched.id,
        };
      // Mantém a identificação já cadastrada somente quando o contrato aponta uma unidade única.
      if (
        target &&
        items.length === 1 &&
        (!Number(row.quantity) || Number(row.quantity) === 1) &&
        !row.patrimony &&
        (row.serial
          ? row.serial === target.serial
          : row.name.trim().toLocaleLowerCase("pt-BR") ===
              target.name.trim().toLocaleLowerCase("pt-BR") &&
            (!row.brand ||
              !target.brand ||
              row.brand.trim().toLocaleLowerCase("pt-BR") ===
                target.brand.trim().toLocaleLowerCase("pt-BR")) &&
            (!row.model ||
              !target.model ||
              row.model.trim().toLocaleLowerCase("pt-BR") ===
                target.model.trim().toLocaleLowerCase("pt-BR")))
      )
        return {
          ...row,
          assetId: target.id,
          brand: row.brand || target.brand || "",
          patrimony: target.patrimony,
          serial: row.serial || target.serial,
        };
      return row;
    });
    setRows(drafts);
    setAdvancedRows(new Set());
  }
  async function upload(file?: File) {
    if (!file || busy) return;
    if (file.size > 15 * 1024 * 1024 || !/\.(pdf|txt)$/i.test(file.name)) {
      setError("Selecione um PDF ou TXT de até 15 MB.");
      return;
    }
    setError("");
    setBusy("upload");
    const targetId =
      uploadTarget.current || (asset && step === 1 ? asset.id : null);
    try {
      const body = new FormData();
      body.append("file", file);
      const uploaded = await api<Contract>("/contracts", {
        method: "POST",
        body,
      });
      const target = assets.find((item) => item.id === targetId);
      if (
        target &&
        (target.contractId === uploaded.id ||
          target.coverages?.some((plan) => plan.contractId === uploaded.id))
      )
        throw new Error(
          "Este contrato já está vinculado ao equipamento. Selecione o novo contrato.",
        );
      if (targetId) {
        if (!renewalBackup.current)
          renewalBackup.current = {
            rows,
            contract: contract || previousContract.current,
          };
        setRenewTargetId(targetId);
      }
      setContract(uploaded);
      if (uploaded.extraction) applyExtraction(uploaded.extraction);
      else {
        setRows([emptyDraft(crypto.randomUUID())]);
        setAdvancedRows(new Set());
      }
      if (targetId) setStep(1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
      uploadTarget.current = null;
      if (input.current) input.current.value = "";
    }
  }
  async function readContract() {
    if (!contract) return false;
    setBusy("extract");
    setError("");
    try {
      const result = await api<Contract>(`/contracts/${contract.id}/extract`, {
        method: "POST",
      });
      setContract(result);
      applyExtraction(result.extraction!);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(null);
    }
  }
  async function nextStep() {
    if (!contract || busy || loading) return;
    if (
      aiReady &&
      (!contract.extraction || !isMultiExtraction(contract.extraction)) &&
      !(await readContract())
    )
      return;
    setCaptureIntent(true);
    goToStep(2);
  }
  async function closeCaptureLink() {
    const link = captureRef.current;
    if (!link || sealedRef.current) return;
    sealedRef.current = true;
    try {
      await api(`/captures/${link.token}/seal`, { method: "POST" });
    } catch {
      try {
        await api(`/captures/${link.token}/revoke`, { method: "POST" });
      } catch {
        sealedRef.current = false;
      }
    }
  }
  function requestClose() {
    if (busy) return;
    const link = captureRef.current;
    if (link && !sealedRef.current) {
      sealedRef.current = true;
      void api(`/captures/${link.token}/revoke`, { method: "POST" }).catch(() => {
        sealedRef.current = false;
      });
    }
    onClose();
  }
  function cancelRenewal() {
    if (renewalBackup.current) {
      setRows(renewalBackup.current.rows);
      setContract(renewalBackup.current.contract);
    }
    setRenewTargetId(null);
    renewalBackup.current = null;
    setError("");
  }
  const extraction = contract?.extraction;
  const globalWarnings = [
    ...(extraction?.warnings || []),
    ...(extraction && !isMultiExtraction(extraction)
      ? [
          "Leitura antiga: releia o contrato para identificar todos os equipamentos.",
        ]
      : []),
  ];
  const readyCount = rows.filter(
    (row) => row.periodValue && row.firstDueDate,
  ).length;
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (advancedRows.size) {
      closeDetails();
      return;
    }
    if (step === 1) {
      await nextStep();
      return;
    }
    if (busy || loading || !rows.length) return;
    for (const field of tableRegion.current?.querySelectorAll<HTMLInputElement>(
      "table input, table select",
    ) || []) {
      if (!field.reportValidity()) return;
    }
    const missingStart = rows.find((row) => {
      const existing = existingForDraft(row, assets);
      return (
        existing &&
        contract &&
        existing.contractId !== contract.id &&
        !row.validFrom
      );
    });
    if (missingStart) {
      setAdvancedTab("coverage");
      setAdvancedRows(new Set([missingStart.key]));
      setError(
        `Informe quando começa o contrato de ${missingStart.name || "equipamento"} nas configurações avançadas.`,
      );
      return;
    }
    if (
      renewTargetId &&
      !rows.some((row) => existingForDraft(row, assets)?.id === renewTargetId)
    ) {
      setError(
        "Complete o número de tombamento do equipamento escolhido para vinculá-lo ao novo contrato. Os demais equipamentos do contrato também podem ser incluídos.",
      );
      return;
    }
    setBusy("save");
    setError("");
    try {
      const payload = rows.map((row) => {
        const {
          key: _key,
          evidence: _evidence,
          quantity: _quantity,
          assetId: _assetId,
          ...fields
        } = row;
        const existing = existingForDraft(row, assets);
        const contractId = contract?.id || existing?.contractId || null;
        return {
          ...fields,
          ...(existing ? { id: existing.id } : {}),
          renew: Boolean(existing && existing.contractId !== contractId),
          periodValue: row.periodValue ? Number(row.periodValue) : null,
          anchorDate: row.anchorDate || null,
          firstDueDate: row.firstDueDate || null,
          validFrom: row.validFrom || null,
          validUntil: row.validUntil || null,
          contractId,
          reviewed: Boolean(row.periodValue && row.firstDueDate),
        };
      });
      await api("/assets/batch", {
        method: "POST",
        body: JSON.stringify({ assets: payload }),
      });
      await closeCaptureLink();
      onSaved();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }
  return (
    <ManagedDialog
      closeDisabled={Boolean(busy)}
      onRequestClose={requestClose}
      ref={dialog}
      className={`asset-dialog multi-equipment-dialog ${step === 2 ? "equipment-table-dialog" : ""}`}
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) {
          if (advancedRows.size) closeDetails();
          else requestClose();
        }
      }}
      onClick={(e) => {
        if (e.target === dialog.current && !busy) requestClose();
      }}
    >
      <header className="dialog-header">
        <div>
          <h2 id="dialog-title">
            {step === 1 ? "Envie o contrato" : "Confira os equipamentos"}
          </h2>
          <p>
            {step === 1
              ? aiReady
                ? "A IA preenche os dados de cada equipamento descrito no arquivo."
                : "Envie o contrato e complete os dados a seguir."
              : contract?.extraction
                ? "Confira os dados preenchidos pelo contrato e complete o que faltar."
                : "Complete os dados de cada equipamento e confira a manutenção."}
          </p>
        </div>
      </header>
      <form onSubmit={save} noValidate>
        <fieldset disabled={Boolean(busy) || loading}>
          <input
            className="visually-hidden"
            ref={input}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            aria-label="Selecionar contrato"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          {step === 1 ? (
            <section className="form-section contract-step">
              <h3 ref={heading} tabIndex={-1} className="visually-hidden">
                Enviar contrato
              </h3>
              <button
                type="button"
                className={`dropzone ${dragging ? "dragging" : ""}`}
                onClick={() => input.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  upload(e.dataTransfer.files[0]);
                }}
              >
                <span className="upload-icon">
                  {busy === "upload" ? (
                    <LoaderCircle className="spin" size={23} />
                  ) : contract ? (
                    <FileText size={23} />
                  ) : (
                    <UploadCloud size={23} />
                  )}
                </span>
                <strong>
                  {busy === "upload"
                    ? "Enviando contrato…"
                    : contract?.name || "Arraste o PDF aqui"}
                </strong>
                <span>
                  {contract
                    ? "Clique para trocar o arquivo"
                    : "ou clique para selecionar"}
                </span>
                <small>PDF ou TXT · até 15 MB</small>
              </button>
              {contract && (
                <button
                  type="button"
                  className="text-button upload-preview-action"
                  onClick={() => setPreviewContractId(contract.id)}
                >
                  <FileText size={14} /> Ver arquivo enviado
                </button>
              )}
            </section>
          ) : (
            <section className="form-section simple-config">
              <h3 ref={heading} tabIndex={-1} className="visually-hidden">
                Equipamentos do contrato
              </h3>
              <div className="equipment-table-toolbar">
                {!contract && (
                  <span className="equipment-table-count">
                    {rows.length}{" "}
                    {rows.length === 1 ? "equipamento" : "equipamentos"}
                  </span>
                )}
                {contract && (
                  <div className="compact-contract">
                    <FileText size={15} />
                    <button
                      type="button"
                      className="text-button contract-preview-link"
                      onClick={() => setPreviewContractId(contract.id)}
                    >
                      {contract.name}
                    </button>
                    <span>
                      {rows.length}{" "}
                      {rows.length === 1 ? "equipamento" : "equipamentos"}
                    </span>
                  </div>
                )}
                {(capture || captureState === "creating" || rows.length < 50) && (
                  <div className="equipment-table-actions">
                    {capture ? (
                      <a
                        className="text-button add-equipment"
                        href={capture.path}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Camera size={14} />
                        Fotografar tombamento
                      </a>
                    ) : (
                      captureState === "creating" && (
                        <button
                          type="button"
                          className="text-button add-equipment"
                          disabled
                        >
                          <LoaderCircle size={14} className="spin" />
                          Preparando câmera…
                        </button>
                      )
                    )}
                    {rows.length < 50 && (
                      <button
                        type="button"
                        className="text-button add-equipment"
                        onClick={() =>
                          setRows((old) => [
                            ...old,
                            emptyDraft(crypto.randomUUID()),
                          ])
                        }
                      >
                        <Plus size={14} />
                        Adicionar equipamento
                      </button>
                    )}
                    <p className="visually-hidden" aria-live="polite">
                      {capturedKeys.size
                        ? `${capturedKeys.size} ${capturedKeys.size === 1 ? "número de tombamento lido da foto." : "números de tombamento lidos da foto."}`
                        : ""}
                    </p>
                  </div>
                )}
              </div>
              {renewTargetId && (
                <div className="renewal-notice">
                  O novo contrato será vinculado aos equipamentos conferidos
                  abaixo. Os arquivos anteriores serão preservados.
                  <button
                    type="button"
                    className="text-button"
                    onClick={cancelRenewal}
                  >
                    Cancelar novo contrato
                  </button>
                </div>
              )}
              {extraction &&
                isMultiExtraction(extraction) &&
                extraction.equipments.length > 1 &&
                rows.length === 1 &&
                asset && (
                  <button
                    type="button"
                    className="text-button show-contract-items"
                    onClick={() => applyExtraction(extraction)}
                  >
                    Mostrar todos os equipamentos deste contrato
                  </button>
                )}
              {globalWarnings.length > 0 && (
                <details className="document-warnings">
                  <summary>O contrato tem informações para conferir</summary>
                  {globalWarnings.map((warning, index) => (
                    <p className="field-hint" key={index}>
                      {warning}
                    </p>
                  ))}
                </details>
              )}
              {!rows.length && (
                <div className="empty-extraction">
                  <FileText size={24} />
                  <strong>Nenhum equipamento identificado.</strong>
                  <p>
                    Confira o arquivo ou adicione o equipamento manualmente.
                  </p>
                </div>
              )}
              <div
                className="equipment-editor-scroll"
                ref={tableRegion}
                role="region"
                aria-label="Tabela de equipamentos do contrato"
                tabIndex={0}
              >
                <table className="equipment-editor-table">
                  <caption className="visually-hidden">
                    Equipamentos identificados no contrato. Confira cada linha
                    antes de salvar.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Equipamento</th>
                      <th scope="col">Número de tombamento</th>
                      <th scope="col">Manutenção a cada</th>
                      <th scope="col">Primeira manutenção</th>
                      <th scope="col">Situação</th>
                      <th scope="col">
                        <span className="visually-hidden">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => {
                      const existing = existingForDraft(row, assets);
                      const renewing = Boolean(
                        existing &&
                        contract &&
                        existing.contractId !== contract.id,
                      );
                      const ready = Boolean(
                        row.periodValue && row.firstDueDate,
                      );
                      const warnings = row.evidence?.warnings || [];
                      const incompleteEvidence = Boolean(
                        row.evidence &&
                        Object.keys(labels).some(
                          (key) =>
                            row.evidence?.[key as keyof typeof labels]
                              ?.status === "conflict",
                        ),
                      );
                      const open = advancedRows.has(row.key);
                      return (
                        <tr
                          key={row.key}
                          id={row.key}
                          className={open ? "editor-row-open" : ""}
                        >
                          <td>
                            <input
                              required
                              aria-label={`Equipamento ${index + 1}`}
                              value={row.name}
                              maxLength={160}
                              placeholder={
                                row.evidence
                                  ? "Não informado no contrato"
                                  : "Ex.: Bomba de infusão"
                              }
                              onChange={(e) =>
                                change(row.key, "name", e.target.value)
                              }
                            />
                            {(row.brand || row.model) && (
                              <small className="editor-row-hint">
                                {brandAndModel(row)}
                              </small>
                            )}
                            {existing && (
                              <small className="editor-row-hint">
                                {renewing
                                  ? "Já cadastrado · novo contrato"
                                  : "Equipamento já cadastrado"}
                              </small>
                            )}
                            {Number(row.quantity) > 1 && (
                              <small className="editor-row-hint">
                                Contrato menciona {row.quantity} unidades ·
                                confira em Detalhes
                              </small>
                            )}
                          </td>
                          <td>
                            <input
                              required
                              aria-label={`Número de tombamento de ${row.name || index + 1}`}
                              value={row.patrimony}
                              maxLength={80}
                              placeholder={
                                row.evidence
                                  ? "Não informado no contrato"
                                  : "Número de tombamento"
                              }
                              onChange={(e) => {
                                editedAt.current[row.key] = Date.now();
                                delete appliedAt.current[row.key];
                                setCapturedKeys((current) => {
                                  if (!current.has(row.key)) return current;
                                  const next = new Set(current);
                                  next.delete(row.key);
                                  return next;
                                });
                                change(row.key, "patrimony", e.target.value);
                              }}
                            />
                            {capturedKeys.has(row.key) && row.patrimony && (
                              <small className="editor-row-hint">
                                Lido da foto da etiqueta
                              </small>
                            )}
                          </td>
                          <td>
                            <div className="input-pair">
                              <input
                                type="number"
                                min={1}
                                max={366}
                                step={1}
                                aria-label={`Intervalo de manutenção de ${row.name || index + 1}`}
                                placeholder="—"
                                value={row.periodValue}
                                onChange={(e) =>
                                  change(row.key, "periodValue", e.target.value)
                                }
                              />
                              <select
                                aria-label={`Unidade do intervalo de ${row.name || index + 1}`}
                                value={row.periodUnit}
                                onChange={(e) =>
                                  change(
                                    row.key,
                                    "periodUnit",
                                    e.target.value as PeriodUnit,
                                  )
                                }
                              >
                                <option value="months">meses</option>
                                <option value="days">dias</option>
                                <option value="years">anos</option>
                              </select>
                            </div>
                          </td>
                          <td>
                            <input
                              type="date"
                              aria-label={`Primeira manutenção de ${row.name || index + 1}`}
                              min="1900-01-01"
                              max="2200-12-31"
                              value={row.firstDueDate}
                              onChange={(e) =>
                                change(row.key, "firstDueDate", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <span
                              className={`badge ${ready ? "neutral" : "warning"}`}
                            >
                              {!ready
                                ? "Cadastro incompleto"
                                : renewing
                                  ? "Novo contrato"
                                  : "Conferir dados"}
                            </span>
                            {(warnings.length > 0 || incompleteEvidence) && (
                              <small className="editor-row-hint warning-text">
                                Conferir dados do contrato
                              </small>
                            )}
                          </td>
                          <td>
                            <div className="editor-actions">
                              <button
                                type="button"
                                className="text-button"
                                aria-expanded={open}
                                aria-controls="equipment-details"
                                aria-label={`Configurações avançadas de ${row.name || "equipamento"}`}
                                onClick={(event) => {
                                  lastDetailsButton.current =
                                    event.currentTarget;
                                  setAdvancedTab("identity");
                                  setAdvancedRows(new Set([row.key]));
                                }}
                              >
                                <SlidersHorizontal size={14} />
                                Detalhes
                              </button>
                              {rows.length > 1 && (
                                <button
                                  type="button"
                                  className="icon-button"
                                  disabled={open}
                                  aria-label={`Remover ${row.name || "equipamento"} da lista`}
                                  onClick={() =>
                                    setRows((old) =>
                                      old.filter(
                                        (item) => item.key !== row.key,
                                      ),
                                    )
                                  }
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <ManagedDialog
                onRequestClose={closeDetails}
                closeButtonRef={advancedBack}
                inline
                id="equipment-details"
                ref={floatingDetails}
                className="floating-equipment-dialog"
                role="dialog"
                aria-modal="false"
                aria-labelledby="equipment-details-title"
                hidden={!advancedRows.size}
                onCancel={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  closeDetails();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    closeDetails();
                  }
                }}
              >
                {rows
                  .filter((row) => advancedRows.has(row.key))
                  .slice(0, 1)
                  .map((row) => {
                    const existing = existingForDraft(row, assets);
                    const renewing = Boolean(
                      existing &&
                      contract &&
                      existing.contractId !== contract.id,
                    );
                    const ready = Boolean(row.periodValue && row.firstDueDate);
                    const warnings = row.evidence?.warnings || [];
                    return (
                      <div className="editor-details" key={row.key}>
                        <header className="floating-details-header">
                          <div className="floating-drag-handle">
                            <GripHorizontal size={16} className="drag-grip" />
                            <div>
                              <h4 id="equipment-details-title">
                                {row.name || "Detalhes do equipamento"}
                              </h4>
                              <p className="details-identity">
                                {row.patrimony
                                  ? `Tombamento ${row.patrimony}`
                                  : "Número de tombamento não informado"}
                              </p>
                            </div>
                          </div>
                        </header>
                        <div className="floating-details-body">
                          <div
                            className="equipment-detail-tabs"
                            role="tablist"
                            aria-label="Detalhes do equipamento"
                            onKeyDown={(event) => {
                              if (
                                ![
                                  "ArrowLeft",
                                  "ArrowRight",
                                  "Home",
                                  "End",
                                ].includes(event.key)
                              )
                                return;
                              event.preventDefault();
                              const tabs = [
                                "identity",
                                "coverage",
                                "evidence",
                              ] as const;
                              const index = tabs.indexOf(advancedTab);
                              const next =
                                event.key === "Home"
                                  ? 0
                                  : event.key === "End"
                                    ? 2
                                    : (index +
                                        (event.key === "ArrowRight" ? 1 : 2)) %
                                      3;
                              setAdvancedTab(tabs[next]);
                              (
                                event.currentTarget.querySelectorAll("button")[
                                  next
                                ] as HTMLButtonElement
                              )?.focus();
                            }}
                          >
                            {(
                              [
                                ["identity", "Identificação"],
                                ["coverage", "Contrato"],
                                ["evidence", "Dados da IA"],
                              ] as const
                            ).map(([tab, label]) => (
                              <button
                                key={tab}
                                type="button"
                                role="tab"
                                tabIndex={advancedTab === tab ? 0 : -1}
                                id={`tab-${tab}`}
                                aria-selected={advancedTab === tab}
                                aria-controls={`panel-${tab}`}
                                onClick={() => setAdvancedTab(tab)}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                          {Number(row.quantity) > 1 && (
                            <div className="quantity-hint">
                              <p>
                                O contrato menciona {row.quantity} unidades
                                deste equipamento. Identifique cada unidade pelo
                                número de tombamento.
                              </p>
                              {rows.length < 50 && (
                                <button
                                  type="button"
                                  className="text-button"
                                  onClick={() =>
                                    setRows((old) => [
                                      ...old,
                                      {
                                        ...row,
                                        key: crypto.randomUUID(),
                                        assetId: undefined,
                                        patrimony: "",
                                        serial: "",
                                        quantity: "",
                                      },
                                    ])
                                  }
                                >
                                  <Plus size={13} />
                                  Adicionar outra unidade
                                </button>
                              )}
                            </div>
                          )}

                          {!ready && (
                            <p className="field-hint">
                              Sem intervalo e data, esta unidade fica pendente e
                              não gera previsões.
                            </p>
                          )}
                          <div className="advanced-content">
                            <div
                              className="form-grid"
                              role="tabpanel"
                              id="panel-identity"
                              aria-labelledby="tab-identity"
                              hidden={advancedTab !== "identity"}
                            >
                              <label>
                                Marca
                                <input
                                  value={row.brand}
                                  maxLength={160}
                                  placeholder={
                                    row.evidence
                                      ? "Não informada no contrato"
                                      : "Marca do equipamento"
                                  }
                                  onChange={(e) =>
                                    change(row.key, "brand", e.target.value)
                                  }
                                />
                              </label>
                              <label>
                                Modelo
                                <input
                                  value={row.model}
                                  maxLength={160}
                                  placeholder={
                                    row.evidence
                                      ? "Não informado no contrato"
                                      : "Modelo"
                                  }
                                  onChange={(e) =>
                                    change(row.key, "model", e.target.value)
                                  }
                                />
                              </label>
                              <label>
                                Número de série
                                <input
                                  value={row.serial}
                                  maxLength={100}
                                  placeholder={
                                    row.evidence
                                      ? "Não informado no contrato"
                                      : "Série do fabricante"
                                  }
                                  onChange={(e) =>
                                    change(row.key, "serial", e.target.value)
                                  }
                                />
                              </label>
                              <label>
                                Setor
                                <input
                                  value={row.sector}
                                  maxLength={100}
                                  placeholder={
                                    row.evidence
                                      ? "Não informado no contrato"
                                      : "Setor"
                                  }
                                  onChange={(e) =>
                                    change(row.key, "sector", e.target.value)
                                  }
                                />
                              </label>
                              <label className="full">
                                Observações
                                <textarea
                                  rows={2}
                                  maxLength={4000}
                                  value={row.notes}
                                  onChange={(e) =>
                                    change(row.key, "notes", e.target.value)
                                  }
                                />
                              </label>
                            </div>
                            <div
                              className="form-grid"
                              role="tabpanel"
                              id="panel-coverage"
                              aria-labelledby="tab-coverage"
                              hidden={advancedTab !== "coverage"}
                            >
                              <label>
                                Início do contrato
                                <input
                                  type="date"
                                  min="1900-01-01"
                                  max="2200-12-31"
                                  value={row.validFrom}
                                  onChange={(e) =>
                                    change(row.key, "validFrom", e.target.value)
                                  }
                                />
                              </label>
                              <label>
                                Até
                                <input
                                  type="date"
                                  min={row.validFrom || "1900-01-01"}
                                  max="2200-12-31"
                                  value={row.validUntil}
                                  onChange={(e) =>
                                    change(
                                      row.key,
                                      "validUntil",
                                      e.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label className="span-two">
                                Empresa responsável pela manutenção
                                <input
                                  value={row.maintenanceCompany}
                                  maxLength={200}
                                  onChange={(event) =>
                                    change(
                                      row.key,
                                      "maintenanceCompany",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label>
                                Telefone para manutenção
                                <input
                                  type="tel"
                                  value={row.maintenancePhone}
                                  maxLength={100}
                                  onChange={(event) =>
                                    change(
                                      row.key,
                                      "maintenancePhone",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label>
                                E-mail para manutenção
                                <input
                                  type="email"
                                  value={row.maintenanceEmail}
                                  maxLength={254}
                                  onChange={(event) =>
                                    change(
                                      row.key,
                                      "maintenanceEmail",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                            </div>
                            <p
                              className="field-hint"
                              hidden={advancedTab !== "coverage"}
                            >
                              Sem fim informado, não há vencimento conhecido.
                              Confira quando o contrato começa e termina.
                            </p>
                            <div
                              role="tabpanel"
                              id="panel-evidence"
                              aria-labelledby="tab-evidence"
                              hidden={advancedTab !== "evidence"}
                            >
                              {advancedTab === "evidence" && !row.evidence && (
                                <p className="field-hint">
                                  Nenhuma leitura da IA disponível para este
                                  equipamento.
                                </p>
                              )}
                              {advancedTab === "evidence" && row.evidence && (
                                <details className="evidence" open>
                                  <summary>
                                    <Sparkles size={14} />
                                    Ver informações deste equipamento
                                  </summary>
                                  <div className="evidence-content">
                                    {Object.entries(labels).map(
                                      ([key, label]) => {
                                        const field =
                                          row.evidence?.[
                                            key as keyof typeof labels
                                          ];
                                        if (!field) return null;
                                        return (
                                          <div
                                            className="evidence-field"
                                            key={key}
                                          >
                                            <strong>{label}</strong>
                                            <p>
                                              {field.status === "found"
                                                ? field.value
                                                : field.status === "conflict"
                                                  ? "Informações divergentes — conferir"
                                                  : "Não encontrado no contrato"}
                                            </p>
                                            {field.quote && (
                                              <blockquote>
                                                {field.quote}
                                              </blockquote>
                                            )}
                                            {field.page && (
                                              <a
                                                href={`/api/contracts/${contract!.id}/file#page=${field.page}`}
                                                target="_blank"
                                                rel="noreferrer"
                                              >
                                                Página {field.page}
                                              </a>
                                            )}
                                          </div>
                                        );
                                      },
                                    )}
                                    {warnings.map((warning, i) => (
                                      <p className="evidence-warning" key={i}>
                                        {warning}
                                      </p>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>
                            {advancedTab === "coverage" && existing && (
                              <div className="coverage-history">
                                <h4>Contratos desta unidade</h4>
                                {(existing.coverages || []).map(
                                  (plan, position, all) => {
                                    const next = all
                                      .slice(position + 1)
                                      .find((item) => item.reviewed);
                                    return (
                                      <div
                                        className="coverage-record"
                                        key={plan.id}
                                      >
                                        {plan.contractId ? (
                                          <button
                                            type="button"
                                            className="text-button"
                                            onClick={() =>
                                              setPreviewContractId(
                                                plan.contractId!,
                                              )
                                            }
                                          >
                                            <FileText size={14} />
                                            {plan.contractName ||
                                              "Contrato anterior"}
                                          </button>
                                        ) : (
                                          <strong>Cadastro manual</strong>
                                        )}
                                        <span>
                                          {plan.validFrom
                                            ? `De ${pretty(plan.validFrom)}`
                                            : "Início não informado"}{" "}
                                          ·{" "}
                                          {plan.validUntil
                                            ? `até ${pretty(plan.validUntil)}`
                                            : "Sem vencimento informado"}
                                        </span>
                                        {next?.validFrom && (
                                          <small>
                                            Substituído a partir de{" "}
                                            {pretty(next.validFrom)}
                                          </small>
                                        )}
                                      </div>
                                    );
                                  },
                                )}
                                {!renewing && (
                                  <button
                                    type="button"
                                    className="button secondary"
                                    onClick={() => {
                                      uploadTarget.current = existing.id;
                                      input.current?.click();
                                    }}
                                  >
                                    <Plus size={14} />
                                    Adicionar novo contrato
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <footer className="floating-details-footer">
                          <span>Alterações no rascunho</span>
                          <button
                            type="button"
                            className="button primary"
                            onClick={closeDetails}
                          >
                            Concluir edição
                          </button>
                        </footer>
                      </div>
                    );
                  })}
              </ManagedDialog>
              {!advancedRows.size && contract && aiReady && (
                <details className="extraction-controls">
                  <summary>Leitura do arquivo</summary>
                  <button
                    type="button"
                    className="text-button"
                    onClick={readContract}
                  >
                    <Sparkles size={14} />
                    Preencher novamente pelo contrato
                  </button>
                  <p className="field-hint">
                    Uma nova leitura substitui os campos deste formulário. Os
                    cadastros só mudam após confirmar e salvar.
                  </p>
                </details>
              )}
            </section>
          )}
        </fieldset>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <footer className="dialog-footer">
          <div key={step}>
            {step === 1 ? (
              <>
                <button
                  type="button"
                  className="text-button manual-entry"
                  disabled={Boolean(busy) || loading}
                  onClick={() => goToStep(2)}
                >
                  Preencher manualmente
                </button>
                <button
                  type="button"
                  className="button primary"
                  disabled={!contract || Boolean(busy) || loading}
                  onClick={(e) => {
                    e.preventDefault();
                    void nextStep();
                  }}
                >
                  {busy ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  {busy === "extract"
                    ? "Lendo contrato…"
                    : busy === "upload"
                      ? "Enviando…"
                      : "Continuar"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="button secondary"
                  disabled={Boolean(busy) || advancedRows.size > 0}
                  onClick={() => goToStep(1)}
                >
                  <ArrowLeft size={15} />
                  Voltar
                </button>
                <button
                  type="submit"
                  className="button primary"
                  disabled={
                    Boolean(busy) ||
                    loading ||
                    !rows.length ||
                    advancedRows.size > 0
                  }
                >
                  {busy === "save" && (
                    <LoaderCircle size={16} className="spin" />
                  )}
                  {busy === "save"
                    ? "Salvando…"
                    : readyCount
                      ? "Confirmar e salvar"
                      : "Salvar cadastros"}
                </button>
              </>
            )}
          </div>
        </footer>
      </form>
      {previewContractId && (
        <ContractViewer
          contractId={previewContractId}
          assets={assets}
          contracts={contracts}
          onClose={() => setPreviewContractId(null)}
          onContract={setPreviewContractId}
          onBreakdown={onBreakdown}
        />
      )}
    </ManagedDialog>
  );
}
