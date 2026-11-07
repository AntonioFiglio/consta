/** Nomenclatura documental: TC principal, manutenção e termo aditivo. */
export const contractCopy = {
  area: "Contratos e aditivos",
  principal: "Termo de Contrato (TC)",
  maintenance: "Contrato de manutenção",
  amendment: "Termo aditivo",
  annex: "Anexo contratual",
  file: "Arquivo",
  files: "Documentos contratuais",
  relatedFiles: "Documentos vinculados",
  addFile: "Adicionar documento",
  viewFile: "Ver arquivo",
  fileType: "Tipo de documento",
  upload: "Enviar TC",
  uploadHelp: "Como enviar o Termo de Contrato (TC)",
  uploadDescription: "Envie o Termo de Contrato (TC), contrato principal dos equipamentos, em PDF ou TXT. Contratos de manutenção e termos aditivos podem ser vinculados depois. Confira os dados antes de salvar.",
} as const;

/** Título da aba, navegação, breadcrumb e cabeçalho usam a mesma fonte. */
export const crmPageCopy = {
  calendar: {
    title: "Calendário",
    description: "Acompanhe as próximas manutenções dos equipamentos.",
    create: "",
  },
  contracts: {
    title: contractCopy.area,
    description: "Consulte os Termos de Contrato (TC), contratos de manutenção e termos aditivos.",
    create: "Novo TC",
  },
  assets: {
    title: "Equipamentos",
    description: "Consulte os equipamentos e suas informações de manutenção.",
    create: "Novo equipamento",
  },
} as const;
