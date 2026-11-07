# Requisitos do produto

Requisitos de construção, ainda não capacidades implementadas. A prioridade e a sequência estão no [backlog](../desenvolvimento/backlog.md).

## Gestão, documentos e manutenção

| ID | Requisito | Critério de aceite observável |
| --- | --- | --- |
| CRM-01 | Cadastrar unidades físicas de ativos | Patrimônio/série e instituição distinguem ativos; um modelo ou lote exige associação explícita às unidades |
| CRM-02 | Associar documentos versionados | Documento e versão continuam vinculados ao ativo/contrato; reenvio idêntico não duplica obrigações silenciosamente |
| CRM-03 | Extrair com evidência | Campo apresenta valor, unidade quando aplicável, status, documento, versão, página e trecho; ausências e conflitos ficam visíveis |
| CRM-04 | Exigir revisão antes de ativar plano | Extração não cria um plano aprovado; revisor e decisão ficam registrados |
| CRM-05 | Calcular obrigações por regra determinística | Periodicidade, tipo de gatilho e marco inicial estão explícitos; campo faltante bloqueia cálculo e upload não vira marco |
| CRM-06 | Acompanhar tarefa até a execução | Ativo, versão do plano, prazo, responsável, janela e mudanças de estado ficam rastreáveis |
| CRM-07 | Separar cobertura e execução | Um ativo coberto pode ter tarefa pendente; uma necessidade sem cobertura continua visível |
| CRM-08 | Registrar comprovante e decisão técnica | Encerramento segue a regra do plano; envio de aviso ou leitura de tag não conclui tarefa nem libera o ativo |
| CRM-09 | Preservar histórico | Revisar um plano não apaga tarefas, documentos ou execuções anteriores |
| CRM-10 | Controlar acesso por instituição e responsabilidade | Usuário sem autorização não consulta nem altera ativo, arquivo ou histórico de outra instituição |

## Casos reais para avaliar a extração documental

O [corpus público auditado](../referencias/auditoria-corpus-documental.md) acrescenta casos para verificar CRM-02 a CRM-05: instrumento assinado versus minuta/TR/extrato; garantia divergente entre contrato e anexo; SLA em horas úteis versus corridas; marco de instalação ausente; periodicidade dependente de manual; e número de processo inconsistente. Os [casos estruturados](../../data/referencias/casos-avaliacao-extracao.json) são critérios propostos de avaliação, ainda sem execução de LLM. Um contrato não comprova execução de manutenção ou ausência de falhas.

## Localização automática

| ID | Requisito | Critério de aceite observável |
| --- | --- | --- |
| LOC-01 | Atualizar sem ação operacional do funcionário | Tag e receptores produzem observações sem escaneamento; cadastro e manutenção de bateria são etapas separadas |
| LOC-02 | Vincular tag ao ativo correto | Associação tem período de validade; trocar a tag não reatribui histórico de outro equipamento |
| LOC-03 | Exibir localização com procedência | Interface apresenta área estimada, hora da observação, fonte e estado atual/desatualizado/desconhecido; simulação permanece identificada |
| LOC-04 | Tratar repetição e reordenação | Reenvio não duplica efeito; observação antiga não substitui uma estimativa atual mais recente |
| LOC-05 | Funcionar sem internet | Caminho receptor → serviço → persistência → consulta local opera com WAN desconectada, inclusive dependências de autenticação e licença |
| LOC-06 | Expor falhas de cobertura e infraestrutura | Receptor indisponível ou tag não observada não vira presença confirmada; última detecção permanece histórica |
| LOC-07 | Limitar implantação por equipamento e área | Configuração e áreas aprovadas ficam registradas; alertas não são apresentados como barreira física ou sistema certificado de segurança |

## Qualidade e operação

- Dados reais exigem autorização; a demonstração usa dados sintéticos identificados.
- A operação local precisa de política de backup, recuperação, energia e monitoramento. Ausência de internet não cobre queda de energia ou falha da LAN.
- Precisão, autonomia, capacidade e intervalo de atualização serão critérios pactuados antes do ensaio; não há valores de produto medidos.
- Extração por provedor externo pode ficar indisponível sem internet; o sistema deve explicitar a pendência e permitir o fluxo manual. IA local não está escolhida.
- A validação de localização e a compatibilidade hospitalar são verificações distintas. Veja o [plano de validação](../rastreamento/validacao.md).
