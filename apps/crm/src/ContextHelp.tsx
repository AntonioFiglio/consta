import { useState } from "react";
import { CircleHelp } from "lucide-react";
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";

export function ContextHelp({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top-start",
    strategy: "fixed",
    middleware: [offset(8), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, {
    move: false,
    delay: { open: 150, close: 100 },
    handleClose: safePolygon(),
  });
  const focus = useFocus(context);
  const click = useClick(context, { ignoreMouse: true });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover, focus, click, dismiss, role,
  ]);

  return (
    <>
      <button
        type="button"
        className="status-help-trigger"
        ref={refs.setReference}
        {...getReferenceProps({ "aria-label": label })}
      >
        <CircleHelp size={15} aria-hidden="true" />
      </button>
      {open && (
        <FloatingPortal>
          <div
            className="status-help-tooltip"
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <p>{text}</p>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
