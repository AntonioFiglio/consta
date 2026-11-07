# Como contribuir

O repositório reúne o trabalho de Matheus e dos demais engenheiros de software do Consta. A divisão é por entregas verificáveis; as frentes abaixo não atribuem pessoas ou permissões automaticamente.

## Antes de começar

Leia os [primeiros passos](docs/desenvolvimento/primeiros-passos.md), confira o [estado atual](docs/estado-atual.md) e escolha uma entrega do [backlog](docs/desenvolvimento/backlog.md). Registre no trabalho compartilhado da equipe qual entrega e quais arquivos você assumiu. Consulte o [AGENTS.md](AGENTS.md) quando trabalhar com uma LLM.

## Trabalho em paralelo

| Frente | Responsabilidade | Interface a combinar antes de integrar |
| --- | --- | --- |
| CRM e experiência | Inventário, ficha, revisão documental, planos e tarefas | Entidades, estados e origem dos dados |
| Domínio e persistência | Regras, acesso, arquivos, histórico e processamento de documentos | Modelo de dados e revisão de planos |
| Localização | Ingestão, deduplicação, associação de tags e projeção de localização | Contrato receptor → serviço → CRM |
| Hardware e integração | Tag, receptor, alimentação, fixação e bancada | Pacote BLE, identidade e observação do receptor |

No início, o backend do CRM pode permanecer na própria aplicação. Uma frente de trabalho não exige um serviço separado. A equipe pode distribuir ou combinar frentes conforme a capacidade disponível.

## Gitflow

Por orientação de Matheus, o desenvolvimento segue Gitflow. A `main` representa a linha estável; a `develop` é a base de integração. A entrega em andamento fica em branch própria e é revisada por pull request antes de entrar em `develop`.

| Branch | Origem | Destino e finalidade |
| --- | --- | --- |
| `feature/<tema>` | `develop` atualizada | PR para `develop`, com implementação, documentação e validação |
| `release/<versao>` | `develop` | Preparação e homologação da versão; após aprovação, integração em `main` e retorno a `develop` |
| `hotfix/<tema>` | `main` | Correção urgente da linha estável; revisão e integração em `main` e `develop` |

Uma entrega de pesquisa/documentação também usa `feature/<tema>`. Integração em `develop` não inicia automaticamente deploy ou promoção para `main`. A release tem escopo e revisão próprios e só é promovida quando essa operação fizer parte da entrega autorizada. Versões e tags devem corresponder a uma release real, não a cada alteração documental.

## Fluxo de alteração

1. Faça fetch, confira `git status` e as branches remotas. Parta da `develop` atualizada e crie `feature/<tema>`. Preserve alterações e branches pendentes de outros integrantes; não faça stash, reset ou rebase de trabalho alheio.
2. Faça uma entrega delimitada. Combine mudanças de contrato antes de outros integrantes dependerem delas.
3. Inclua documentação e verificações compatíveis com a mudança. Regras de prazo, autorização, persistência e ordenação de eventos precisam de testes de comportamento quando implementadas.
4. Execute os comandos realmente disponíveis. Nesta etapa, o verificador documental é o único check automatizado do projeto; o CRM ainda não tem build nem suíte.
5. Abra um pull request para `develop` explicando problema, comportamento resultante, validação e limitações. Peça revisão de outro integrante, especialmente nas fronteiras compartilhadas.
6. Integre sem apagar trabalho alheio, reescrever histórico compartilhado ou enviar credenciais. Deploy é uma ação separada da integração do código.

Esse é o fluxo de trabalho documentado. Proteções obrigatórias de branch, aprovação automática, permissões e ambientes de deploy não são configurados por um arquivo Markdown e continuam dependendo das configurações efetivas do repositório.

## Documentação e decisões

- Documente em pt-BR junto da capacidade entregue. O [índice](docs/README.md) é o ponto de navegação.
- Use o [glossário](GLOSSARY.md) para os termos do domínio.
- Atualize o [estado atual](docs/estado-atual.md) com capacidades existentes e evidências, e o [backlog](docs/desenvolvimento/backlog.md) com o trabalho restante.
- Registre em `docs/adr/` decisões estruturais que envolvam alternativas e custo de reversão. Sugestões ainda não acordadas devem ser marcadas como propostas.
- Mantenha fontes e limites junto das afirmações. Um cenário econômico fictício não é resultado do produto.
- Exemplos de integração devem declarar se são simulados. Mudança incompatível de contrato exige estratégia de transição e atualização dos consumidores.

## Dados e propriedade intelectual

Este é um repositório público. Use amostras sintéticas ou materiais públicos autorizados, preservando sua atribuição. Dados hospitalares reais exigem autorização e ambiente adequado. A apresentação da marca usa DM Mono e Inter via Google Fonts; ao distribuir fontes com o produto, inclua suas licenças correspondentes. A licença do projeto ainda precisa ser escolhida pelos titulares.
