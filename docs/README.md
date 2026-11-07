# Documentação do Consta

Leia o [estado atual](estado-atual.md) antes de assumir que uma função já existe. Este índice organiza a documentação vigente; decisões antigas de rastreamento não são requisitos ativos.

## Produto

- [README principal da nova implementação documental](implementacao-documental/README.md) — goal unificado, copy, pacotes compactados, ferramentas, equipamentos e agenda

- [Fase 1 — Cadastro por contrato e calendário, com diagrama simples](produto/fase-1-cadastro-e-calendario.md)
- [Visão, público e escopo](produto/visao.md)
- [Requisitos e critérios de aceite](produto/requisitos.md)
- [Fluxos de documentos, manutenção e localização](produto/fluxos.md)
- [Cadastro por documentos: pesquisa e prompt de implementação](produto/fluxo-documental-e-prompt-cadastro.md) — proposta com TC obrigatório, manutenção/aditivos opcionais e múltiplos equipamentos
- [Plano de implementação local: documentos em lote e planejamento de manutenção](produto/plano-implementacao-documentos-em-lote-e-manutencao.md) — proposta de organização, correlação, revisão, calendário e dashboard para lotes de 50 a 100 PDFs
- [Importação em lote: experiência, copy e progresso](produto/experiencia-importacao-em-lote-copy-e-progresso.md) — proposta de telas, textos, progress bar, falhas parciais e revisão
- [Demonstração e discurso do projeto](produto/demonstracao.md)
- [Glossário](../GLOSSARY.md)

- [Registro de quebra: pesquisa de mercado e integração](produto/registro-de-quebra-pesquisa-e-fluxo.md)

## Arquitetura e desenvolvimento

- [Visão geral e escolhas em aberto](arquitetura/visao-geral.md)
- [Modelo de domínio e dados](arquitetura/dominio-e-dados.md)
- [Segurança, IA e operação local](arquitetura/seguranca-e-operacao.md)
- [Contratos de integração](../packages/contratos/README.md)
- [Primeiros passos](desenvolvimento/primeiros-passos.md)
- [Backlog e entregas](desenvolvimento/backlog.md)
- [Estudo de impacto: documentos em lote e manutenção](desenvolvimento/estudo-impacto-documentos-em-lote-e-manutencao.md) — investigação do código, arquivos afetados e fluxo funcional proposto para aprovação
- [Contribuição em equipe](../CONTRIBUTING.md)
- [Instruções para LLMs](../AGENTS.md)

## Rastreamento e hardware

- [Arquitetura BLE](rastreamento/arquitetura-ble.md)
- [Segurança e limites hospitalares](rastreamento/seguranca-hospitalar.md)
- [Plano de validação](rastreamento/validacao.md)
- [Especificação de hardware](../hardware/README.md)
- [Tag](../hardware/tag/README.md)
- [Receptor](../hardware/receptor/README.md)

## Decisões e referências

- [ADR 0001 — BLE e descontinuação da óptica](adr/0001-rastreamento-ble.md)
- [ADR 0002 — Repositório único e fronteiras de desenvolvimento](adr/0002-monorepo.md)
- [ADR 0003 — Gitflow para colaboração](adr/0003-gitflow.md)
- [ADR 0004 — CRM local da fase 1 com React 19 e Vite](adr/0004-crm-fase-1.md)
- [Fontes técnicas e estudos internacionais](referencias/README.md)
- [BLE em access points: avaliação para o pitch](referencias/ble-aps-e-pitch.md)
- [Estudo do pacote de pesquisas fornecido por Matheus](referencias/estudo-pacote-pesquisas.md) — síntese do que agrega e do que não se pode concluir
- Auditorias do pacote: [documentos](referencias/auditoria-corpus-documental.md), [rastreabilidade](referencias/auditoria-rastreabilidade.md) e [economia](referencias/auditoria-economia-ociosidade.md)
- [Notícias para contextualizar o pitch](referencias/noticias-para-pitch.md) — casos, datas, respostas e limites de interpretação
- [Contexto hospitalar e limites das alegações](referencias/alegacoes-e-limites.md)
- [Notas de descoberta do hackathon](referencias/descoberta-hackathon.md) — material de origem, sem precedência sobre o escopo atual
- [Registro histórico da óptica](historico/optica-descontinuada.md) — descontinuada

## Marca e dados

- [Identidade visual](../brand/README.md) e [identidade atual](../brand/identity.html)
- [Dados de demonstração e seus limites](../data/README.md)
