# ADR 0004 — Stack e recorte local da fase 1

**Status: implementada para o protótipo local, em 07/11/2026; sem implantação hospitalar.**

O usuário restringiu a primeira fase a contrato → patrimônio → extração revisável → calendário e solicitou Vite com React 19. Também pediu somente integrar o SDK, deixando URL e chave para configuração posterior. A análise extensa foi removida a pedido; o [recorte simplificado](../produto/fase-1-cadastro-e-calendario.md) orienta a primeira entrega.

A interface usa React 19, Vite e TypeScript, logo/tokens da marca e fontes locais. Express mantém arquivos e SDK fora do navegador; SQLite via `node:sqlite` evita provisionar banco externo no protótipo. Node.js 22.17 ou posterior e npm com lockfile são a base de execução. SQLite é uma escolha delimitada à aplicação local, não uma decisão definitiva para múltiplas instituições. PostgreSQL permanece alternativa para a evolução, mediante necessidade e migração própria.

O SDK OpenAI fica no backend com base URL, chave e modelo configuráveis. Não foi escolhido modelo, contratado provedor ou criada credencial. A extração sugere campos/evidências e não aprova plano. Datas seguem intervalo fixo e marco conferidos; condições por uso ou informações insuficientes ficam pendentes. Sem configuração, o cadastro manual continua disponível.

A aplicação escuta em loopback e funciona como espaço local único. Sem senha, somente demonstração sintética; senha opcional protege API e arquivos por sessão local. Usuários, papéis, autorização por instituição, instalação em LAN hospitalar, planos versionados e execução são etapas futuras. Não apresentar esse protótipo como substituto dos requisitos completos de segurança e operação.

As previsões são calculadas na consulta por intervalo, preservando o dia do marco original quando possível e ajustando fim de mês sem acumular deriva. Alterar uma regra altera sua projeção; ainda não existe livro de execuções históricas. Arquivos/metadados/extrações ficam no SQLite, com deduplicação por hash e sem exclusão automática nesta fase.

Alternativas: PostgreSQL desde o início acrescentaria provisionamento para esse recorte; somente localStorage não guardaria arquivos/acesso no backend; executar o SDK no navegador exporia a chave. A opção inicial mantém frontend e backend pequenos, com migração de banco e de autorização explicitamente pendentes para expansão.
