# Primeiros passos para a equipe

## Entenda o estado antes de instalar

Leia a [visão do produto](../produto/visao.md), o [estado atual](../estado-atual.md) e o [backlog](backlog.md). O repositório ainda não tem aplicação executável, dependências de frontend, banco ou infraestrutura provisionada. Não há comando `npm install`, migração ou servidor de CRM a executar nesta etapa.

As decisões de stack serão registradas com a primeira implementação. Preserve essa separação: **pasta documentada não equivale a componente implementado**.

## O que já pode ser usado

### Documentação e integridade local

Com Git e Python 3.9 ou posterior disponíveis, na raiz:

```sh
git status --short --branch
python3 scripts/verificar_repositorio.py
```

O verificador usa apenas a biblioteca padrão do Python. Confere arquivos referenciados por links locais Markdown, recursos HTML/CSS da marca, sintaxe XML dos SVGs e sintaxe JSON dos exemplos compartilhados. Não verifica âncoras de seção, disponibilidade dos links externos, precisão científica ou comportamento de software ainda não implementado. A CI está em [.github/workflows/documentacao.yml](../../.github/workflows/documentacao.yml).

### Marca

Abra [brand/index.html](../../brand/index.html) em um navegador para consultar o kit local, ou use diretamente os SVGs e PNGs. Gerar a marca de novo não é necessário para desenvolver o CRM. Se precisar reconstruí-la, siga o [guia da marca](../../brand/README.md).

### Integração sem hardware

Leia os [contratos propostos](../../packages/contratos/README.md). Os exemplos JSON são estáticos e sintéticos; não há simulador executável ainda. A entrega inicial de localização deve criar esse adaptador e seus testes, permitindo construir a interface antes da bancada BLE.

## Começando uma entrega

1. Identifique a entrega e sua dependência no backlog; combine responsável e arquivos compartilhados.
2. Leia os documentos da tarefa. Para uma LLM, use o [AGENTS.md](../../AGENTS.md); ele encaminha o contexto conforme o tipo de trabalho.
3. Crie uma branch de trabalho conforme [CONTRIBUTING.md](../../CONTRIBUTING.md).
4. Implemente uma fatia verificável e documente comandos, ambiente e estado real.
5. Rode verificações apropriadas, revise o diff e apresente evidências no pull request.

## Critério para inicializar o CRM

A primeira alteração de código deve incluir escolha explícita da stack, manifesto/lockfile, versão de runtime, exemplo de ambiente sem segredos, comandos de execução e verificações. Banco e arquivos devem usar ambiente de desenvolvimento com dados fictícios e preservação de dados entre reinícios quando isso fizer parte da entrega.

Evite criar serviços externos ou contratar provedores para apenas completar a estrutura. A configuração real deverá respeitar o contexto e a autorização do trabalho em andamento.
