import { ContextHelp } from "./ContextHelp";
import type { MaintenanceStatus, MaintenanceStatusKind } from "./maintenance-status";

const guidance: Record<MaintenanceStatusKind, string> = {
  unassigned: "Escolha quem atende: contrato, aditivo ou Oficina do hospital.",
  internal: "Manutenção sob responsabilidade da Oficina do hospital.",
  covered: "O contrato cobre a manutenção neste período.",
  uncovered: "Sem contrato válido hoje. Defina contrato, aditivo ou Oficina.",
  expired: "Contrato terminou. Informe a renovação ou escolha a Oficina.",
  review: "Confira os dados de manutenção do contrato ou aditivo.",
  dates: "Informe início e fim do atendimento, conforme o contrato ou aditivo.",
};

export function StatusHelp({ status }: { status: MaintenanceStatus }) {
  return <ContextHelp label={`Entender situação: ${status.label}`} text={guidance[status.kind]} />;
}
