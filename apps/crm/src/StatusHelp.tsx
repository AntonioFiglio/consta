import { ContextHelp } from "./ContextHelp";
import type { MaintenanceStatus, MaintenanceStatusKind } from "./maintenance-status";

const guidance: Record<MaintenanceStatusKind, string> = {
  unassigned: "Defina a empresa responsável pela manutenção ou a Oficina do hospital.",
  internal: "Manutenção sob responsabilidade da Oficina do hospital.",
  covered: "A manutenção está coberta neste período, conforme o documento revisado.",
  uncovered: "Não há cobertura contratual de manutenção vigente. Confira o contrato de manutenção ou defina a Oficina do hospital.",
  expired: "A cobertura de manutenção terminou. Vincule a renovação ou defina a Oficina do hospital.",
  review: "Confira as condições de manutenção no TC, no contrato de manutenção ou no termo aditivo.",
  dates: "Confira a vigência da manutenção no TC, no contrato de manutenção ou no termo aditivo.",
};

export function StatusHelp({ status }: { status: MaintenanceStatus }) {
  return <ContextHelp label={`Entender situação: ${status.label}`} text={guidance[status.kind]} />;
}
