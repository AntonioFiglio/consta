# Glossário do Consta

Vocabulário do produto e da engenharia clínica. As regras de implementação ficam na documentação de arquitetura.

## Gestão e manutenção

**Ativo:** unidade física individual administrada pelo hospital, identificada por cadastro, patrimônio ou número de série. Modelo ou lote não equivale a um ativo.

**Marca do equipamento:** identificação comercial expressamente associada ao equipamento. É um campo próprio, separado do modelo e do nome do fornecedor ou da assistência técnica.

**Modelo do equipamento:** designação da linha ou versão do produto, mantida separada da marca e da identificação da unidade física.

**Instituição:** organização responsável por um conjunto de ativos, pessoas, documentos e permissões.

**Setor/local:** área identificada da instituição, como enfermaria, corredor ou sala. O local cadastrado de um ativo pode diferir do local observado.

**Cobertura contratual:** serviços, condições e período abrangidos por um contrato para os ativos vinculados. Cobertura não comprova execução.

**Plano de manutenção:** conjunto revisado de obrigações, procedimentos, gatilhos e referências aplicáveis a um ativo.

**Plano de Gerenciamento de Tecnologias em Saúde (PGTS):** documento institucional que define critérios e responsabilidades ao longo do ciclo de vida das tecnologias abrangidas. Um plano de manutenção de um ativo é parte do processo de gestão, não equivale ao PGTS completo.

**Marco inicial:** acontecimento ou data a partir do qual se calcula uma obrigação. O envio de um documento não define esse marco.

**Tarefa de manutenção:** ocorrência concreta de trabalho, com ativo, plano de origem, prazo, responsável e estado de execução.

**Janela:** período acordado com o setor para executar uma intervenção ou recolher um ativo.

**Evidência documental:** página, trecho e versão de um documento que sustentam um dado extraído.

**Comprovante de execução:** registro que sustenta a realização de uma tarefa; é distinto da evidência usada para criar o plano.

**Liberação técnica:** decisão registrada pelo responsável autorizado sobre a condição técnica de um ativo. Localizar o ativo ou encerrar uma notificação não equivale a liberá-lo.

## Rastreamento

**Tag:** dispositivo fixado ao ativo para transmitir sua identificação por BLE. Sua associação ao ativo tem início e fim registrados.

**Receptor:** dispositivo fixo que observa sinais das tags a partir de um ponto conhecido da instituição.

**Observação:** registro de uma recepção de sinal por um receptor. Isoladamente, não estabelece a sala correta do ativo.

**Localização estimada:** interpretação das observações que indica a área provável de um ativo, com horário, origem e estado de atualização.

**Última detecção:** observação mais recente conhecida; pode estar desatualizada e não comprova presença atual.

**Área aprovada:** área cujo uso com uma configuração específica de rastreamento foi avaliado e autorizado pelos responsáveis do hospital.

**Dado simulado:** dado criado para desenvolver ou demonstrar um fluxo, sem representar uma observação física real.

## Vocabulário da interface de manutenção

Os termos de referência são **manutenção interna**, executada pela equipe do hospital, e **serviços contratados**, que podem ter contrato principal e termos aditivos. Consulte o manual do [Ministério da Saúde, 2002, páginas 32–36 e 135](https://bvsms.saude.gov.br/bvs/publicacoes/cd06_19_1.pdf). O [Caderno de Processos e Práticas de Engenharia Clínica da Ebserh, anexo 1, páginas 98–99](https://www.gov.br/hubrasil/pt-br/acesso-a-informacao/institucional/legislacao-e-normas/legislacao-e-normas-de-engenharia-clinica/caderno-de-processos-e-praticas-de-engenharia-clinica) define conceitos como manutenção e disponibilidade.

As frases abaixo são escolhas de linguagem clara do Consta para descrever dados e responsabilidades; não são uma classificação oficial de status hospitalares. As fontes consultadas não fornecem nomes para essas pendências específicas de cadastro.

| Código interno | Texto apresentado | Significado no aplicativo |
| --- | --- | --- |
| `unassigned` | Responsável não definido | Ainda não foi escolhida a forma de atendimento |
| `internal` | Manutenção interna | Atendimento atribuído à Oficina de Manutenção do hospital |
| `covered` | Manutenção por contrato | Contrato ou aditivo conferido e válido na data consultada |
| `uncovered` | Sem contrato ativo | Atendimento por contrato escolhido, mas sem período válido na data consultada |
| `expired` | Contrato vencido | O período registrado do contrato terminou |
| `review` | Dados do contrato a conferir | Informações do contrato ainda não foram confirmadas |
| `dates` | Prazo do contrato a confirmar | Dados conferidos, mas início ou fim ainda não informado |

Datas são apresentadas como **Início do contrato** e **Fim do contrato**. A conferência documental usa **Dados conferidos** e **Dados a conferir**. Esses estados não indicam que o equipamento está quebrado, em reparo ou liberado para uso. Não usar “em manutenção”, “operacional” ou “interditado” como substitutos de uma pendência documental.

## Nomes da área de contratos

- **Contratos:** nome da área e da aba da ficha de equipamento. É o vínculo de negócio da manutenção.
- **Contrato principal**, **termo aditivo** e **contrato terceirizado:** tipos apresentados ao usuário; não são intercambiáveis.
- **Anexo:** arquivo complementar, sem presumir nova contratação ou cobertura.
- **Arquivo:** PDF/TXT enviado ou visualizado. Usar “Adicionar arquivo”, “Ver arquivo” e “Arquivos do contrato”. “Abrir em outra aba” identifica a ação externa ao leitor.

Não alternar “documentos” e “contratos” como nome da área. Identificadores internos como `documentKind` e `maintenanceDocuments` permanecem compatíveis. Os textos compartilhados da interface ficam em `apps/crm/src/contract-copy.ts`.
