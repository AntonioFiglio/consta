# Visão do produto

**O Consta transforma documentos de ativos hospitalares em planos revisados e tarefas acompanhadas até a conclusão, conectando responsáveis, prazos, contratos e localização.**

O produto inicial é voltado a hospitais e à engenharia clínica. Neste projeto, **CRM** é o nome usado pela equipe para a aplicação de gestão operacional; seu núcleo é a gestão de ativos e manutenção, não um funil comercial de vendas.

## Problema e hipótese de valor

Informações sobre o ativo, o contrato, a periodicidade e a execução podem estar dispersas. Uma cobertura contratual não garante que a preventiva seja solicitada, agendada, realizada e comprovada. Encontrar o equipamento móvel pode adicionar trabalho à coordenação.

A hipótese do Consta é reduzir esse esforço, mantendo evidência e responsabilidade em cada etapa. O processo atual e o benefício precisam ser medidos em cada instituição; não presumimos ausência de sistemas existentes nem prometemos eliminar falhas de equipamentos.

## Usuários

| Papel | Necessidade |
| --- | --- |
| Engenharia clínica | Identificar ativos, aprovar planos, organizar manutenção e registrar liberação técnica |
| Técnicos de manutenção | Receber escopo e janela, localizar o ativo, registrar execução e comprovante |
| Setor assistencial | Combinar recolhimento ou parada sem atualizar movimentações manualmente |
| Gestão e contratos | Acompanhar cobertura, pendências, responsabilidades e gastos documentados |
| TI e infraestrutura | Controlar integração, acesso, rede e instalação dos receptores |

O paciente é beneficiário indireto. O escopo inicial é administrativo e operacional; o Consta não decide diagnóstico, tratamento ou liberação clínica de leitos.

## Escopo inicial

- Cadastro manual e importação assistida de ativos, setores e responsáveis.
- Documentos versionados e extração com página/trecho de origem.
- Revisão técnica e plano de manutenção aprovado.
- Prazos determinísticos, tarefas, responsáveis, janelas e comprovantes.
- Histórico de alterações e execução.
- Localização automática de equipamentos móveis com origem, horário e indicação de atualização.
- Consulta e fluxo essencial de operação pela LAN no desenho de implantação local.

Ativos fixos, como grandes equipamentos de imagem, podem ter sua sala cadastrada e sua manutenção gerida pelo CRM. Não precisam receber tag móvel no escopo inicial. Ativos prediais e laboratórios são possibilidades de expansão, com seus próprios planos e responsáveis.

## Limites do produto inicial

O rastreamento BLE será restrito a configurações e áreas avaliadas pelo hospital. Identificar um equipamento não prova disponibilidade, limpeza ou condição de uso. A restrição a áreas especiais precisa fazer parte do controle operacional do hospital, além dos alertas do software.

Ficam fora do escopo inicial: rastreamento de pacientes/pessoas, prontuário, controle de máquinas, decisão clínica, previsão de falhas por IA, marketplace e contratação automática. A óptica foi [descontinuada](../adr/0001-rastreamento-ble.md). A atualização de localização não dependerá de QR ou escaneamento manual.

## Diferenciação e evidência

Sistemas de gestão de manutenção e RTLS já existem. A hipótese de diferenciação é facilitar a passagem de documentos para execução verificável, conectada à localização quando ela ajuda a encontrar o ativo. Isso ainda exige comparação e validação com usuários.

As [fontes e seus limites](../referencias/README.md) sustentam o contexto e os precedentes. Nenhum caso de terceiro demonstra automaticamente desempenho, segurança ou economia do Consta.
