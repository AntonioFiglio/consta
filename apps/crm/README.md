# CRM Consta

**Situação:** espaço reservado à aplicação. Ainda não há código, dependências, banco ou comando de execução.

## Responsabilidade

Aplicação de gestão usada pela equipe hospitalar: inventário, ficha do ativo, documentos/contratos, revisão de extração, plano, calendário/lista de tarefas, execução, comprovantes e histórico. No projeto, CRM é a aplicação operacional de ativos e manutenção.

Leia os [requisitos](../../docs/produto/requisitos.md), os [fluxos](../../docs/produto/fluxos.md) e o [modelo de dados](../../docs/arquitetura/dominio-e-dados.md) antes de implementar. O [guia da marca](../../brand/README.md) orienta a interface em pt-BR.

## Primeira entrega esperada

Uma fatia utilizável: ativo fictício → documento → revisão → plano → tarefa → execução com comprovante. A primeira versão pode usar extração simulada claramente identificada; integração real com IA e armazenamento precisa de sua própria validação. Para localização, consumir o [contrato](../../packages/contratos/README.md) com adaptador simulado, sem depender de hardware pronto.

O backend pode começar junto da aplicação. Framework e dependências ainda serão escolhidos e registrados pela equipe. Ao inicializar, documente aqui os comandos reais de instalação, ambiente, migração, execução e testes, incluindo versões de runtime e gerenciador de pacotes.

## Fronteiras

- O CRM é autoridade de cadastro e associação tag–ativo.
- O serviço de localização fornece estimativas com procedência; o CRM não infere disponibilidade ou liberação técnica.
- A aprovação de planos pertence à equipe autorizada. Prazos são calculados por regras, não pela LLM a cada execução.
- Documentos e dados respeitam instituição e autorização; não criar amostras públicas com dados hospitalares restritos.
