# Primeiros passos para a equipe

## Entenda o estado antes de instalar

Leia a [fase 1](../produto/fase-1-cadastro-e-calendario.md), o [estado atual](../estado-atual.md) e o [backlog](backlog.md). O CRM local já é executável; na raiz, com Node.js 22.17 ou posterior e npm, execute `npm ci` e `npm run dev`. O [guia da aplicação](../../apps/crm/README.md) descreve configuração, banco local e testes. Hardware e serviço de localização continuam sem implementação.

A stack inicial está no [ADR 0004](../adr/0004-crm-fase-1.md). Preserve a separação: **pasta documentada não equivale a componente implementado**; a aplicação local não demonstra implantação hospitalar.

## O que já pode ser usado

### Documentação e integridade local

Com Git e Python 3.9 ou posterior disponíveis, na raiz:

```sh
git status --short --branch
python3 scripts/verificar_repositorio.py
```

O verificador usa apenas a biblioteca padrão do Python. Confere links locais Markdown, recursos HTML/CSS da marca, XML dos SVGs e JSON. Não verifica âncoras, links externos ou comportamento do CRM. Use também `npm test` e `npm run build`. A CI está em [.github/workflows/documentacao.yml](../../.github/workflows/documentacao.yml).

### Marca

Abra [brand/index.html](../../brand/index.html) em um navegador para consultar o kit local, ou use as wordmarks SVG atuais. A apresentação carrega fontes pelo Google Fonts e depende de internet para essa tipografia. Consulte o [guia da marca](../../brand/README.md).

### Integração sem hardware

Leia os [contratos propostos](../../packages/contratos/README.md). Os exemplos JSON são estáticos e sintéticos; não há simulador executável ainda. A entrega inicial de localização deve criar esse adaptador e seus testes, permitindo construir a interface antes da bancada BLE.

## Começando uma entrega

1. Identifique a entrega e sua dependência no backlog; combine responsável e arquivos compartilhados.
2. Leia os documentos da tarefa. Para uma LLM, use o [AGENTS.md](../../AGENTS.md); ele encaminha o contexto conforme o tipo de trabalho.
3. Faça fetch e crie `feature/<tema>` a partir da `develop` atualizada, conforme o [Gitflow](../../CONTRIBUTING.md). Entregue por PR para `develop`; a `main` é promovida por release aprovada.
4. Implemente uma fatia verificável e documente comandos, ambiente e estado real.
5. Rode verificações apropriadas, revise o diff e apresente evidências no pull request.

## Critério para inicializar o CRM

A primeira alteração de código deve incluir escolha explícita da stack, manifesto/lockfile, versão de runtime, exemplo de ambiente sem segredos, comandos de execução e verificações. Banco e arquivos devem usar ambiente de desenvolvimento com dados fictícios e preservação de dados entre reinícios quando isso fizer parte da entrega.

Evite criar serviços externos ou contratar provedores para apenas completar a estrutura. A configuração real deverá respeitar o contexto e a autorização do trabalho em andamento.
