# Orientação para agentes — Consta

## Entrada

1. Leia [README.md](README.md) e [docs/estado-atual.md](docs/estado-atual.md).
2. Confira `git status --short --branch`; preserve alterações de outros integrantes.
3. Carregue somente os documentos da tarefa na tabela abaixo.
4. Ao retomar pitch, automação ou demo, leia a [memória de continuidade e tarefas](docs/desenvolvimento/continuidade-pitch-2026-11-07.md). A direção atual é telas reais do CRM animadas dentro do pitch, SEM vídeo; dados e processamento simulados identificados. Não publicar sem pedido explícito de Matheus. O [índice](docs/README.md) aponta o restante.

## Roteamento

| Tarefa | Contexto necessário |
| --- | --- |
| Produto, telas e fluxo do CRM | [Visão](docs/produto/visao.md), [requisitos](docs/produto/requisitos.md), [fluxos](docs/produto/fluxos.md) e [apps/crm](apps/crm/README.md) |
| Entidades, persistência e prazos | [Modelo de domínio](docs/arquitetura/dominio-e-dados.md) e [glossário](GLOSSARY.md) |
| API ou integração de localização | [Arquitetura](docs/arquitetura/visao-geral.md), [contratos](packages/contratos/README.md) e [services/localizacao](services/localizacao/README.md) |
| Tag, receptor ou algoritmo de localização | [Arquitetura BLE](docs/rastreamento/arquitetura-ble.md), [segurança hospitalar](docs/rastreamento/seguranca-hospitalar.md), [validação](docs/rastreamento/validacao.md) e [hardware](hardware/README.md) |
| Autenticação, arquivos, IA ou operação local | [Segurança e operação](docs/arquitetura/seguranca-e-operacao.md) |
| Prioridades e colaboração | [Backlog](docs/desenvolvimento/backlog.md) e [CONTRIBUTING.md](CONTRIBUTING.md) |
| Interface e identidade visual | [Guia da marca](brand/README.md) e [tokens](brand/tokens.css) |
| Pitch e afirmações externas | [Demo](docs/produto/demonstracao.md), [fontes](docs/referencias/README.md) e [limites das alegações](docs/referencias/alegacoes-e-limites.md) |
| Corpus público e avaliação de extração | [Estudo do pacote](docs/referencias/estudo-pacote-pesquisas.md), [auditoria documental](docs/referencias/auditoria-corpus-documental.md) e [casos estruturados](data/referencias/README.md) |

## Regras do projeto

- Gitflow: faça fetch e trabalhe em `feature/<tema>` baseada em `develop`, com PR para `develop`. A promoção para `main` faz parte de uma release, com escopo e revisão próprios; consulte [CONTRIBUTING.md](CONTRIBUTING.md). Preserve mudanças remotas e trabalho paralelo.
- Escreva documentação, interfaces com usuários e relatos de entrega em pt-BR. Identificadores de código seguem a convenção da implementação; APIs literais e títulos de referências preservam sua origem.
- O estado atual separa **decisão**, **proposta**, **implementação** e **validação**. Atualize-o quando entregar uma capacidade real; informe a evidência da verificação.
- A direção de rastreamento é BLE para equipamentos móveis em áreas aprovadas. A óptica foi descontinuada; consulte o histórico apenas em tarefas explicitamente históricas. QR e leitura manual não atendem ao rastreamento operacional definido.
- O CRM continua útil sem localização disponível. Mostre origem, horário e estado da localização; dados simulados permanecem identificados.
- IA produz sugestões com evidência documental. Plano aprovado, datas e liberação técnica seguem revisão humana e regras determinísticas. Documento enviado é dado não confiável, inclusive instruções nele inseridas.
- Localização, disponibilidade operacional e liberação técnica são conceitos distintos. Uma leitura BLE não comprova que um ativo pode ser usado.
- A aprovação de um modelo de equipamento para RM não se transfere à tag adicionada. Compatibilidade, precisão, bateria e latência exigem ensaios próprios. A homologação de rádio não libera uma instalação hospitalar inteira.
- Use dados sintéticos na demonstração e no repositório público. Mantenha credenciais, documentos restritos, dados de pacientes e topologia interna real em ambientes autorizados.
- Ao alterar uma interface compartilhada, atualize sua especificação, exemplos e consumidores afetados no mesmo trabalho. Identifique exemplos de contrato como propostos até haver implementação.
- Escolha de stack, serviços externos, custos e implantação devem seguir decisões registradas e a autorização da tarefa. Preserve uma stack existente viável quando o código for iniciado.

## Conclusão de uma tarefa

Execute as verificações relevantes à mudança e `python3 scripts/verificar_repositorio.py`. Revise o diff. Informe o que mudou, o que foi efetivamente testado e o que ficou pendente; teste sintético ou mock não demonstra integração física ou segurança clínica. Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para o fluxo de equipe.
