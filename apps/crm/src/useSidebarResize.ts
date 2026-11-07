import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

const defaultWidth = 248;
const minWidth = 200;
const maxWidth = 340;
const storageKey = "consta.sidebar.v1";

function initialSize() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    const width = Number.isFinite(saved?.width) ? Math.max(minWidth, Math.min(maxWidth, saved.width)) : defaultWidth;
    return { width, open: !window.matchMedia("(max-width: 780px)").matches && saved?.closed !== true };
  } catch { return { width: defaultWidth, open: window.innerWidth > 780 }; }
}

export function useSidebarResize() {
  const [initial] = useState(initialSize);
  const [width, setWidth] = useState(initial.open ? initial.width : 0);
  const [resizing, setResizing] = useState(false);
  const expandedWidth = useRef(initial.width);
  const currentWidth = useRef(width);
  const dragging = useRef(false);
  const update = (next: number) => {
    currentWidth.current = next;
    if (next > 0) expandedWidth.current = next;
    setWidth(next);
  };
  const persist = () => {
    try { localStorage.setItem(storageKey, JSON.stringify({ width: expandedWidth.current, closed: currentWidth.current === 0 })); } catch { /* A preferência é opcional. */ }
  };
  const close = () => { update(0); persist(); };
  const restore = () => { update(expandedWidth.current); persist(); };
  const finish = () => { dragging.current = false; setResizing(false); persist(); };
  return {
    width, resizing, close, restore,
    closeOnMobile: () => { if (window.matchMedia("(max-width: 780px)").matches) close(); },
    resizeProps: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.button !== 0) return;
        event.preventDefault();
        dragging.current = true;
        setResizing(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (!dragging.current) return;
        update(event.clientX < 120 ? 0 : Math.max(minWidth, Math.min(maxWidth, event.clientX)));
      },
      onPointerUp: finish,
      onPointerCancel: finish,
      onLostPointerCapture: () => { if (dragging.current) finish(); },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Home") close();
        else if (event.key === "End") restore();
        else {
          const next = currentWidth.current + (event.key === "ArrowLeft" ? -24 : 24);
          update(next < minWidth ? 0 : Math.min(maxWidth, next));
          persist();
        }
      },
    },
  };
}
