import { useEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, RefObject } from "react";

// Todos os diálogos se movem no viewport, inclusive os abertos dentro de outro.
export function useDraggablePanel(
  panel: RefObject<HTMLElement | null>,
) {
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const origin = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  function geometry() {
    const box = panel.current?.getBoundingClientRect();
    return {
      left: box?.left || 0,
      top: box?.top || 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  function constrain(left: number, top: number) {
    const limits = geometry();
    return {
      left: Math.max(
        12,
        Math.min(left, limits.width - (panel.current?.offsetWidth || 0) - 12),
      ),
      top: Math.max(
        12,
        Math.min(top, limits.height - (panel.current?.offsetHeight || 0) - 12),
      ),
    };
  }
  useEffect(() => {
    const resized = () =>
      setPosition((old) => (old ? constrain(old.left, old.top) : old));
    const observer = new ResizeObserver(resized);
    if (panel.current) observer.observe(panel.current);
    window.addEventListener("resize", resized);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resized);
    };
  }, [panel]);
  const handleProps: HTMLAttributes<HTMLDivElement> = {
    role: "button",
    tabIndex: 0,
    "aria-label":
      "Mover dialog. Arraste ou use as setas do teclado.",
    onPointerDown(event) {
      if (event.button !== 0 || window.innerWidth <= 650) return;
      event.preventDefault();
      event.currentTarget.focus();
      const { left, top } = geometry();
      origin.current = { x: event.clientX, y: event.clientY, left, top };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event) {
      const start = origin.current;
      if (start)
        setPosition(
          constrain(
            start.left + event.clientX - start.x,
            start.top + event.clientY - start.y,
          ),
        );
    },
    onPointerUp(event) {
      origin.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel() {
      origin.current = null;
    },
    onLostPointerCapture() {
      origin.current = null;
    },
    onKeyDown(event) {
      if (
        !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
          event.key,
        ) ||
        window.innerWidth <= 650
      )
        return;
      event.preventDefault();
      const { left, top } = geometry();
      const amount = event.shiftKey ? 40 : 10;
      setPosition(
        constrain(
          left +
            (event.key === "ArrowLeft"
              ? -amount
              : event.key === "ArrowRight"
                ? amount
                : 0),
          top +
            (event.key === "ArrowUp"
              ? -amount
              : event.key === "ArrowDown"
                ? amount
                : 0),
        ),
      );
    },
  };
  const style: CSSProperties | undefined = position
    ? {
        left: position.left,
        top: position.top,
        right: "auto",
        bottom: "auto",
        margin: 0,
      }
    : undefined;
  return { handleProps, style };
}
