# Consta

![Consta](brand/logo/svg/consta-wordmark-on-white.svg)

**Gestão de ativos hospitalares: dos documentos à manutenção concluída, com localização automática dos equipamentos móveis.**

O Consta reúne cadastro de ativos, contratos, planos de manutenção, responsáveis, tarefas e comprovantes. A IA auxilia a extração documental com revisão humana. O rastreamento seguirá com **tags BLE a bateria, receptores fixos e processamento na rede local**, limitado aos equipamentos e às áreas aprovados pelo hospital.

**Estado real:** a fase 1 do CRM possui aplicação local com React 19 e Vite: upload de contrato, cadastro por patrimônio, revisão e calendário de manutenções previstas. O SDK está integrado com configuração pendente pelo usuário; não foi validado com um provedor real. Localização e hardware BLE continuam pendentes. Consulte o [estado atual](docs/estado-atual.md).

## Executar o CRM

Com Node.js 22.17 ou posterior e npm, na raiz:

```sh
npm ci
npm run dev
```

Abra `http://127.0.0.1:5173`. A aplicação começa com três equipamentos sintéticos identificados. O [guia do CRM](apps/crm/README.md) explica configuração do SDK, senha local, persistência e testes. O [diagrama da fase 1](docs/produto/fase-1-cadastro-e-calendario.md) apresenta o fluxo simplificado.

## Comece por aqui

| Preciso… | Leia |
| --- | --- |
| Entender o produto e seu escopo | [Visão do produto](docs/produto/visao.md) e [requisitos](docs/produto/requisitos.md) |
| Entender a primeira fase simplificada | [Contrato → cadastro → calendário](docs/produto/fase-1-cadastro-e-calendario.md) |
| Começar a desenvolver com a equipe | [Primeiros passos](docs/desenvolvimento/primeiros-passos.md) e [contribuição](CONTRIBUTING.md) |
| Trabalhar com uma LLM | [Instruções para agentes](AGENTS.md) |
| Entender as partes e suas interfaces | [Arquitetura](docs/arquitetura/visao-geral.md) e [contratos de integração](packages/contratos/README.md) |
| Desenvolver o rastreamento | [Arquitetura BLE](docs/rastreamento/arquitetura-ble.md) e [segurança hospitalar](docs/rastreamento/seguranca-hospitalar.md) |
| Escolher a próxima entrega | [Backlog](docs/desenvolvimento/backlog.md) |
| Encontrar uma decisão ou uma fonte | [Índice da documentação](docs/README.md) |
| Preparar o problema do pitch com casos reais | [Notícias, respostas dos hospitais e limites](docs/referencias/noticias-para-pitch.md) |
| Usar o corpus público para avaliar o CRM | [Estudo do pacote de pesquisas](docs/referencias/estudo-pacote-pesquisas.md) e [casos de avaliação](data/referencias/README.md) |

## Organização do repositório

```text
apps/crm/                 CRM local React 19/Vite, API e SQLite — fase 1
services/localizacao/     Recepção e estimativa de localização — implementação pendente
packages/contratos/       Especificação das interfaces entre software e receptores
hardware/                 Especificações de tag e receptor — fabricação pendente
docs/                     Produto, arquitetura, desenvolvimento, fontes e decisões
brand/                    Wordmarks atuais, tokens e apresentação da identidade
data/                     Exemplos e cenários exclusivamente fictícios
scripts/                  Verificação do repositório
.github/                  Verificação automatizada e modelo de pull request
```

O CRM tem comandos de execução e testes. Serviço de localização e hardware permanecem como especificações. A [decisão da stack inicial](docs/adr/0004-crm-fase-1.md) delimita a implementação local e seus limites.

## Direção atual

- **CRM:** documentos → extração com evidência → revisão → plano → tarefa → execução → histórico.
- **Localização:** tag BLE → receptor fixo → rede cabeada → serviço local → CRM. Sem escaneamento operacional ou dependência de celulares pessoais.
- **Escopo hospitalar:** equipamentos móveis e áreas autorizados; ressonância e outras áreas especiais ficam fora da implantação inicial.
- **Óptica:** descontinuada e removida da árvore atual. O [registro histórico](docs/historico/optica-descontinuada.md) explica a decisão e como consultar os experimentos anteriores no Git.

## Verificação disponível

Na raiz, com Python 3.9 ou posterior:

```sh
python3 scripts/verificar_repositorio.py
```

O comando verifica referências locais da documentação e recursos da marca. Para o CRM, use `npm test` e `npm run build`; consulte seus limites no [guia da aplicação](apps/crm/README.md).

## Identidade visual

[Galeria e downloads](brand/index.html) · [Guia de marca](brand/README.md)

Identidade de Pedro: **CONSTA.**, sem símbolo floral. Preto `#0A0A0A`, laranja `#F97316`, vermelho `#E63946` e branco `#FAFAF9`; DM Mono na marca e nos dados, Inter na interface. O [logo na raiz](consta-logo.svg) usa a wordmark atual. A referência ao hackathon HCFMUSP não representa aprovação institucional ou parceria de implantação.
