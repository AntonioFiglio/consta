import { createContext, forwardRef, useContext, useId, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import type { DialogHTMLAttributes, ReactNode, Ref } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useDraggablePanel } from "./useDraggablePanel";

// A pilha é compartilhada inclusive entre janelas abertas por outros diálogos.
type Entry = { id: string; element: HTMLDialogElement; opener: HTMLElement | null };
export class DialogStack {
  entries: Entry[] = [];
  workspace: HTMLElement | null = null;
  private listeners = new Set<() => void>();
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  hasDialogs = () => this.entries.length > 0;
  add(entry: Entry) {
    this.entries.push(entry);
    this.activate(entry.id);
    this.paint();
  }
  remove(id: string) {
    const entry = this.entries.find(item => item.id === id);
    const wasTop = this.top()?.id === id;
    this.entries = this.entries.filter(item => item.id !== id);
    this.paint();
    if (wasTop) {
      const top = this.top()?.element;
      const target = entry?.opener;
      if (target?.isConnected && (!top || top.contains(target))) target.focus({ preventScroll: true });
      else top?.focus({ preventScroll: true });
    }
  }
  top() { return this.entries.at(-1); }
  activate(id: string) {
    const entry = this.entries.find(item => item.id === id);
    if (!entry) return;
    const parent = entry.element.parentElement?.closest("dialog");
    const parentEntry = this.entries.find(item => item.element === parent);
    if (parentEntry) this.activate(parentEntry.id);
    if (this.top() === entry) return;
    this.entries = this.entries.filter(item => item !== entry);
    this.entries.push(entry);
    this.paint();
  }
  paint() {
    // inert bloqueia clique e teclado na tela de fundo, enquanto houver um dialog aberto.
    if (this.workspace) this.workspace.inert = this.hasDialogs();
    this.listeners.forEach(listener => listener());
    this.entries.forEach((entry, index) => {
      entry.element.style.zIndex = String(1000 + index);
      entry.element.dataset.active = String(index === this.entries.length - 1);
    });
  }
}
const Context = createContext<DialogStack | null>(null);
export function DialogProvider({ children }: { children: ReactNode }) {
  const stack = useRef(new DialogStack()).current;
  const hasDialogs = useSyncExternalStore(stack.subscribe, stack.hasDialogs);
  useLayoutEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const top = stack.top();
      if (!top) return;
      event.preventDefault();
      event.stopPropagation();
      top.element.dispatchEvent(new Event("cancel", { cancelable: true }));
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [stack]);
  return <Context.Provider value={stack}>
    <div className="dialog-workspace" inert={hasDialogs} ref={element => {
      stack.workspace = element;
      if (element) element.inert = stack.hasDialogs();
    }}>{children}</div>
    {hasDialogs && createPortal(<div className="dialog-workspace-backdrop" aria-hidden="true" />, document.body)}
  </Context.Provider>;
}

export const ManagedDialog = forwardRef<HTMLDialogElement, DialogHTMLAttributes<HTMLDialogElement> & { inline?: boolean; closeDisabled?: boolean; closeButtonRef?: Ref<HTMLButtonElement>; onRequestClose?: () => void }>(
  function ManagedDialog({ children, inline = false, closeDisabled = false, closeButtonRef, onRequestClose, hidden, style, className = "", onPointerDownCapture, onFocusCapture, ...props }, forwardedRef) {
    const stack = useContext(Context);
    if (!stack) throw new Error("ManagedDialog precisa de DialogProvider.");
    const id = useId();
    const panel = useRef<HTMLDialogElement>(null);
    const { handleProps, style: position } = useDraggablePanel(panel);
    useLayoutEffect(() => {
      const element = panel.current;
      if (!element || hidden) return;
      stack.add({ id, element, opener: document.activeElement instanceof HTMLElement ? document.activeElement : null });
      element.focus({ preventScroll: true });
      return () => stack.remove(id);
    }, [id, stack, hidden, inline]);
    const content = <dialog
      {...props}
      ref={element => {
        panel.current = element;
        if (typeof forwardedRef === "function") forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
      }}
      open={!hidden}
      hidden={hidden}
      tabIndex={-1}
      aria-modal="false"
      className={`${className} managed-dialog ${inline ? "managed-dialog-inline" : ""}`}
      style={{ ...style, ...position }}
      onFocusCapture={event => {
        if ((event.target as Element).closest("dialog") === panel.current) stack.activate(id);
        onFocusCapture?.(event);
      }}
      onPointerDownCapture={event => {
        // Eventos de portais React também sobem pela árvore do diálogo pai.
        if ((event.target as Element).closest("dialog") === panel.current) stack.activate(id);
        onPointerDownCapture?.(event);
      }}
    >
      <div className="dialog-titlebar">
        <div className="dialog-move-bar" {...handleProps} aria-label="Mover dialog. Arraste ou use as setas do teclado.">
          <span aria-hidden="true">⠿</span> Mover dialog
        </div>
        <button
          type="button"
          ref={closeButtonRef}
          className="dialog-close-button"
          aria-label="Fechar dialog"
          title="Fechar dialog"
          disabled={closeDisabled}
          onClick={() => {
            if (onRequestClose) onRequestClose();
            else panel.current?.dispatchEvent(new Event("cancel", { cancelable: true }));
          }}
        >
          <X size={15} />
        </button>
      </div>
      {children}
    </dialog>;
    return inline ? content : createPortal(content, document.body);
  }
);
