import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle } from "lucide-react";
import logo from "../../../brand/logo/svg/consta-wordmark-black.svg?raw";
import { api } from "./api";

type CaptureRow = {
  key: string;
  name: string;
  patrimony: string | null;
  readAt: string | null;
};

type CaptureView = {
  photosSubmitted: boolean;
  rows: CaptureRow[];
};

export function CapturePage({ token }: { token: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const aliveRef = useRef(true);
  const [view, setView] = useState<CaptureView | null>(null);
  const [blocked, setBlocked] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [readingKey, setReadingKey] = useState<string | null>(null);
  const [cameraKey, setCameraKey] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<CaptureView>(`/captures/${token}`);
      setView(data);
      setBlocked("");
      setError("");
    } catch (e) {
      const message = (e as Error).message;
      if (
        message.includes("encerrado") ||
        message.includes("não está disponível")
      ) {
        setBlocked(message);
        setView(null);
      } else setError(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraKey(null);
    setCameraReady(false);
  }, []);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);
  useEffect(() => {
    document.title = `${blocked ? "Link encerrado" : "Fotografar tombamento"} · CONSTA.`;
  }, [blocked]);
  useEffect(() => {
    if (!blocked) return;
    stopCamera();
  }, [blocked, stopCamera]);
  useEffect(() => {
    if (blocked) return;
    void load();
    const id = window.setInterval(() => void load(), 2000);
    return () => window.clearInterval(id);
  }, [load, blocked]);
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream || !cameraKey) return;
    video.srcObject = stream;
    const ready = () => setCameraReady(true);
    if (video.readyState >= 1) ready();
    else video.addEventListener("loadedmetadata", ready);
    void video.play().catch(() => {
      setError("Não foi possível mostrar a imagem da câmera.");
    });
    return () => video.removeEventListener("loadedmetadata", ready);
  }, [cameraKey]);

  async function openCamera(rowKey: string) {
    setError("");
    if (streamRef.current) {
      setCameraKey(rowKey);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "Este navegador não liberou a câmera. Abra o link no Chrome ou Safari deste dispositivo.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      if (!aliveRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setCameraReady(false);
      setCameraKey(rowKey);
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      setError(
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? "Permita o uso da câmera para fotografar a etiqueta."
          : name === "NotFoundError" || name === "DevicesNotFoundError"
            ? "Nenhuma câmera foi encontrada neste dispositivo."
            : "Não foi possível abrir a câmera. Tente novamente.",
      );
    }
  }
  async function shoot() {
    const video = videoRef.current;
    const rowKey = cameraKey;
    if (!video || !rowKey || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) {
      setError("Não foi possível registrar a foto. Tente novamente.");
      return;
    }
    stopCamera();
    setReadingKey(rowKey);
    setError("");
    try {
      const body = new FormData();
      body.append(
        "file",
        new File([blob], "etiqueta.jpg", { type: "image/jpeg" }),
      );
      body.append("rowKey", rowKey);
      await api(`/captures/${token}/photos`, { method: "POST", body });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setReadingKey(null);
    }
  }

  const duplicated = new Set(
    (view?.rows || [])
      .filter(
        (row, _index, rows) =>
          row.patrimony &&
          rows.some(
            (other) =>
              other.key !== row.key &&
              other.patrimony?.toLocaleLowerCase("pt-BR") ===
                row.patrimony?.toLocaleLowerCase("pt-BR"),
          ),
      )
      .map((row) => row.key),
  );

  return (
    <main className="capture-page">
      <section className="capture-card" aria-labelledby="capture-title">
        <span
          className="wordmark"
          dangerouslySetInnerHTML={{ __html: logo }}
        />
        <h1 id="capture-title">
          {blocked ? "Link encerrado" : "Fotografar tombamento"}
        </h1>
        {loading && !view && !blocked ? (
          <p className="capture-note" role="status">
            <LoaderCircle className="spin" size={16} /> Carregando…
          </p>
        ) : blocked ? (
          <p className="capture-note">{blocked}</p>
        ) : (
          <>
            <p className="capture-note">
              Fotografe a etiqueta com o número de tombamento de cada
              equipamento. O número entra na conferência que ficou aberta.
            </p>
            {cameraKey && (
              <div className="capture-camera" role="region" aria-label="Câmera">
                <p>
                  Enquadre a etiqueta de{" "}
                  <strong>
                    {view?.rows.find((row) => row.key === cameraKey)?.name ||
                      "equipamento"}
                  </strong>
                  .
                </p>
                <video ref={videoRef} autoPlay muted playsInline />
                <div className="capture-camera-actions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={stopCamera}
                    disabled={Boolean(readingKey)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => void shoot()}
                    disabled={!cameraReady || Boolean(readingKey)}
                  >
                    <Camera size={16} />
                    {cameraReady ? "Tirar foto" : "Abrindo câmera…"}
                  </button>
                </div>
              </div>
            )}
            {!view?.rows.length ? (
              <p className="capture-note">
                Adicione o equipamento na conferência para fotografar a
                etiqueta.
              </p>
            ) : (
              <ul className="capture-list">
                {view.rows.map((row) => (
                  <li
                    key={row.key}
                    className={cameraKey === row.key ? "is-shooting" : ""}
                  >
                    <div>
                      <strong>{row.name || "Equipamento sem nome"}</strong>
                      <span className="capture-patrimony">
                        {row.patrimony || "Aguardando a foto da etiqueta"}
                      </span>
                      {duplicated.has(row.key) && (
                        <small>
                          Este número também apareceu em outro equipamento.
                        </small>
                      )}
                    </div>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={Boolean(readingKey)}
                      onClick={() => void openCamera(row.key)}
                    >
                      {readingKey === row.key ? (
                        <LoaderCircle className="spin" size={16} />
                      ) : (
                        <Camera size={16} />
                      )}
                      {readingKey === row.key
                        ? "Lendo…"
                        : row.patrimony
                          ? "Fotografar de novo"
                          : "Fotografar"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <p className="capture-footnote">
              Este link deixa de funcionar depois que as fotos forem enviadas e
              o cadastro for salvo.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
