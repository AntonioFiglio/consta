# CRM Consta — fase 1

Aplicação local com **React 19 + Vite + TypeScript**, API Express e SQLite. Três áreas: calendário, equipamentos e contratos, com formulário de cadastro/revisão que recebe contrato PDF/TXT e número de tombamento. Logo SVG e tokens são importados diretamente de `brand/`; Inter e DM Mono são distribuídas localmente via Fontsource, com licenças nos respectivos pacotes.

## Navegação da fase 01

A sidebar principal mantém Calendário, Equipamentos e Contratos, cadastro em destaque e a mensagem “Do contrato à próxima manutenção.”. Pode ser fechada pelo botão ou arrastando a borda esquerda do conteúdo em direção à lateral da janela; **Abrir menu** no cabeçalho restaura a largura anterior. A largura e o fechamento ficam em `localStorage`. A borda também aceita setas, Home (fechar) e End (restaurar). Em telas pequenas, o menu abre como painel lateral com botão e fundo para fechar.

Não há totais de contratos, equipamentos ou previsões nos links. **Reparos pendentes** aparece apenas quando há quebra registrada ainda sem resolução, informa a quantidade de equipamentos e abre a lista filtrada para essa ação. O número não constitui avaliação automática de risco clínico.

## Identificação: nome, marca e modelo

A marca é armazenada em campo próprio (`brand`), separado do nome do equipamento e do modelo. A lista mostra **nome + bandeira de atenção**, **marca · modelo** e tombamento/setor, sem acrescentar explicações aos status. A ficha e as configurações de identificação do cadastro permitem consultar/editar a marca. A busca de equipamentos e contratos aceita marca e modelo.

O SDK solicita evidência documental de marca por unidade, sem confundir a empresa fornecedora ou assistência técnica com a marca, e sem deduzi-la pelo modelo. A resposta nova inclui `brand` com valor/status/página/trecho; leituras antigas sem esse campo continuam legíveis e sem marca inventada. O formato armazenado `version: 2` permanece compatível, com normalização de ausência na leitura.

A API de ativos aceita `brand` como texto opcional de até 160 caracteres. Cadastros antigos retornam marca vazia. Atualizações que omitem o campo preservam a marca já salva; enviar uma string vazia a remove explicitamente. SQLite mantém a marca no payload existente, sem migração destrutiva, inclusive em edições/renovações. O uso de dados reais no SDK continua dependendo da configuração do usuário.

## Gestão de manutenção na lista de equipamentos

A tela usa uma lista compacta sem cards ou contadores: equipamento com tombamento/setor, um único status e a ação correspondente. Pendências recebem bandeira vermelha no início da linha e aparecem primeiro. Os filtros ficam visíveis por situação: responsável não definido, sem contrato ativo, contrato vencido, dados do contrato a conferir, prazo do contrato a confirmar, manutenção por contrato e manutenção interna. Motivos, datas e orientações ficam na ficha do equipamento; a lista não repete explicações sob o status.

- **Manutenção por contrato** exige vínculo documental, revisão e início/fim de vigência conhecidos, incluindo a data consultada. Um arquivo anexado sozinho não comprova cobertura.
- **Dados do contrato a conferir** indica revisão pendente. **Prazo do contrato a confirmar** indica contrato já conferido com início ou fim ausente; a ação **Gerenciar manutenção** abre as opções de contrato/aditivo, Oficina de Manutenção do hospital ou ainda não definido. Somente ao escolher contrato ficam disponíveis configuração documental e preenchimento da vigência. A oficina não exige datas contratuais; documentos anteriores são preservados. Contratos vencidos, futuros e lacunas aparecem como situações de atenção. Uma renovação pendente ou futura não oculta a cobertura anterior ainda válida.
- **Manutenção interna** identifica a **Oficina de Manutenção**, somente após escolha explícita. Ausência de contrato não atribui o equipamento à oficina automaticamente.
- **Definir responsável** permite escolher manutenção por contrato ou aditivo, manutenção interna pela Oficina do hospital ou responsável não definido. A responsabilidade é persistida no equipamento; a operação preserva documentos, coberturas e planejamento existentes.

`maintenanceProvider` aceita `contract`, `internal` ou `unassigned`. Registros legados continuam legíveis: vínculo documental indica intenção de atendimento por contrato, sujeito à verificação de cobertura; sem documento, responsabilidade a definir. Edições por consumidores antigos que omitem o campo preservam a definição existente. A escolha da oficina não cria datas, tarefas ou registros de execução.

A lista de equipamentos mostra um ícone de ajuda em cada situação, com explicação e próximo passo em tooltip do [Floating UI](https://floating-ui.com/docs/tooltip). Abre por hover ou foco de teclado e por toque; fecha com Escape, saída do ponteiro/foco ou toque fora. O texto explicativo não ocupa uma linha fixa na tabela.

A ficha do equipamento abre em **Visão geral**, destacando responsável, próxima previsão e pendência com ação direta. **Documentos** reúne contratos, aditivos e anexos sem repetir o mesmo arquivo; **Cadastro** guarda identificação, referência do plano e observações. As abas aceitam setas, Home e End. A ficha acompanha atualizações do equipamento sem precisar fechar e abrir novamente.

## Contratos principais e aditivos

A tabela mostra contratos principais. A seta expande uma lista recolhível com todos os aditivos daquele contrato. **Adicionar aditivo** fica dentro da área expandida, junto à lista, inclusive quando ela estiver vazia. Permite enviar PDF/TXT ou vincular um documento já salvo. **Organizar** permite mudar o contrato principal de um aditivo ou torná-lo principal novamente.

O vínculo explícito usa `parentContractId` nos metadados persistidos. Registros antigos sem esse campo continuam como principais. Um aditivo pertence a um único principal; ciclos, vínculo consigo mesmo e aditivos dentro de aditivos são rejeitados. Um principal que já tem aditivos precisa reorganizá-los antes de se tornar aditivo. Arquivos, evidências, equipamentos e regras de manutenção são preservados.

A busca por aditivo mantém o principal no resultado e expande seu grupo. A consulta do principal reúne equipamentos vinculados a ele ou aos aditivos, sem duplicar unidades. A consulta individual do aditivo continua mostrando apenas seus próprios vínculos. Organizar documentos não renova nem altera a cobertura de manutenção automaticamente.

## Consulta de contratos e equipamentos

A área se chama **Contratos**. Os tipos são **Contrato principal**, **Termo aditivo**, **Contrato terceirizado** e **Anexo**; **arquivo** identifica somente o PDF/TXT enviado ou consultado. O vocabulário compartilhado está em `src/contract-copy.ts`.

- O mesmo leitor atende a todas as origens. Clicar no nome ou em **Ver arquivo** abre o arquivo escolhido, inclusive quando é aditivo ou terceirizado. **Ver equipamentos** entra diretamente nessa aba.
- **Arquivos do contrato** permanece na lateral com o principal e os vínculos explícitos. Trocar a seleção altera o arquivo exibido na mesma janela. Os arquivos vinculados aparecem como ramos de uma árvore recolhível; em telas pequenas, a área da árvore tem rolagem própria.
- As abas **Visão geral**, **Arquivo** e **Equipamentos** aceitam setas, Home e End. O principal reúne os equipamentos de todo o grupo sem duplicar unidades; cada vínculo mostra seus próprios equipamentos.
- **Adicionar arquivo** permite enviar PDF/TXT ou escolher um arquivo salvo e classificá-lo como termo aditivo, contrato terceirizado ou anexo. **Organizar vínculo** permite trocar o contrato de origem. Essas ações preservam arquivo e planos de manutenção.
- O PDF usa o leitor do navegador, por Blob temporário revogado na troca/fechamento. Requisições antigas são canceladas ao selecionar outro arquivo. TXT é exibido como texto; a consulta não chama IA nem envia o arquivo para serviço externo.

`PATCH /api/contracts/:id/parent` recebe `parentContractId` (UUID ou `null`) e `documentKind` opcional (`amendment`, `outsourced` ou `complement`). Aditivo exige principal; ciclos, pais inválidos e transformação de principal com filhos são rejeitados. O campo opcional preserva compatibilidade com consumidores anteriores.

## Resumo para gestão clínica

A primeira abertura de **Visão geral** solicita o resumo do arquivo selecionado, priorizando prestadora, equipamentos, serviços, prazos, SLA, responsabilidades, valores e limites. Cada ponto real inclui trecho/página sugeridos para conferência humana. O resumo é informativo e não modifica cadastro, aprovação, calendário ou liberação técnica.

- Sem `OPENAI_API_KEY` e `OPENAI_MODEL` válidos, retorna Lorem com selo **Simulação**, sem rede externa. Esse resultado é persistido separadamente e não é tratado como análise do contrato.
- Com chave/modelo configurados e backend reiniciado, a próxima consulta promove a simulação para resumo real. O arquivo é enviado uma vez ao provedor configurado; resumos reais já salvos são reutilizados, inclusive após reinício ou remoção da chave.
- SQLite guarda o resumo por arquivo imutável/deduplicado, hash SHA-256, origem, modelo e horário. A tabela aditiva `contract_briefs` leva o banco a `user_version=5`, preservando arquivos e dados anteriores.
- Requisições simultâneas compartilham geração; uma reserva atômica no banco impede duas instâncias de gerarem o mesmo resumo. Reserva expirada ou falha exige **Tentar novamente**, sem repetição automática. Não há botão de regeneração para resumos reais já salvos.
- O SDK usa Responses API, JSON Schema estrito, `store: false`, timeout de 90 segundos, zero retries e limite de 2200 tokens de saída. Alterar o modelo não regenera os resumos existentes. A qualidade da síntese e das citações ainda depende de validação com provedor real.

`POST /api/contracts/:id/summary` recebe `{ "retry": false }` (opcional) e retorna `ContractBrief` com `source`, `generatedAt`, `sourceHash`, `model`, `overview`, `points` e `warnings`. Reutiliza o conteúdo salvo; `retry: true` só permite recuperar falhas/reservas expiradas. Retornos: 404 arquivo ausente, 409 geração em andamento ou tentativa explícita necessária, 502 falha do provedor. O endpoint segue a autenticação e verificação de origem da API.

## Executar

Na raiz, com Node.js **22.17 ou posterior** e npm:

```sh
npm ci
npm run dev
```

Interface: `http://127.0.0.1:5173`. API: `http://127.0.0.1:3007`. Ambos escutam somente em loopback. A configuração é lida de `apps/crm/.env.local`; use o [exemplo sem segredos](.env.example). Nenhuma chave foi criada ou gravada nesta implementação.

Build e execução local dos artefatos:

```sh
npm run build
npm start
```

Depois do build, `http://127.0.0.1:3007` serve interface e API juntas. Para parar, use Ctrl+C. `npm run dev` observa alterações de frontend/backend.

Se o login informar falha de conexão e `http://127.0.0.1:5173/api/config` mostrar a própria interface em vez de JSON, o servidor dessa porta não está encaminhando as chamadas à API. Com o backend e o build disponíveis, acesse `http://127.0.0.1:3007` para usar interface e API juntas. Para desenvolvimento, encerre o servidor incorreto de 5173 e inicie `npm run dev` na raiz. Uma resposta HTML não é aceita como configuração de autenticação nem como sucesso de login; a senha continua exigida quando configurada.

## Navegação por URL

A navegação usa [React Router](https://reactrouter.com/start/declarative/routing), com as páginas carregadas sob demanda:

| URL | Página |
| --- | --- |
| `/calendario` | Calendário e agenda |
| `/contratos` | Contratos e arquivos vinculados |
| `/equipamentos` | Inventário e situação da manutenção |

O endereço `/` abre Calendário. Links antigos `/#calendario`, `/#contratos` e `/#equipamentos` redirecionam para a página correspondente, substituindo a entrada antiga do histórico. Caminhos desconhecidos voltam a Calendário. O menu usa links do roteador, com seleção automática, suporte a voltar/avançar e abertura em outra aba. A troca de página atualiza o título da janela e o foco no título da tela; a sessão e os diálogos continuam compartilhados.

`CalendarPage`, `ContractsPage` e `EquipmentPage` têm arquivos de build separados, carregados com `React.lazy` e `Suspense`. A navegação não recarrega a aplicação inteira. O servidor Express já oferece fallback para `index.html`, permitindo abrir e recarregar essas URLs diretamente; `/api` continua reservado às respostas JSON. Em outro servidor de hospedagem, configure o mesmo fallback para as rotas da interface.

## Configuração do SDK

Preencha as variáveis em `apps/crm/.env.local` e reinicie a aplicação:

| Variável | Uso |
| --- | --- |
| `OPENAI_BASE_URL` | URL base do endpoint, incluindo `/v1` quando aplicável; não adicionar `/responses` |
| `OPENAI_API_KEY` | Chave apenas no backend |
| `OPENAI_MODEL` | Identificador do modelo do seu provedor |
| `APP_PASSWORD` | Opcional: senha e sessão local de oito horas; reiniciar expira sessões |
| `DATABASE_PATH` | Opcional: SQLite; padrão `.data/consta.sqlite` nesta pasta |
| `SEED_DEMO` | `false` para iniciar um banco novo sem os três exemplos sintéticos |
| `PORT` | Porta da API; ao alterar em desenvolvimento, ajuste o proxy em `vite.config.ts` |

O SDK usa **Responses API**, arquivo inline em base64 e saída estruturada. Endpoint/modelo precisam suportar `POST /responses`, arquivo e JSON Schema estrito. Compatibilidade apenas com Chat Completions não basta. Usamos `store: false`, timeout de 90 segundos e nenhuma repetição automática de chamadas; políticas do provedor são próprias dele. [Arquivos na API](https://developers.openai.com/api/docs/guides/file-inputs) e [saídas estruturadas](https://developers.openai.com/api/docs/guides/structured-outputs).

Nenhuma chamada real foi executada nesta entrega. Sem chave/modelo, upload, cadastro manual, edição e calendário continuam disponíveis; leitura automática fica desabilitada. Enviar arquivo salva-o localmente; envio ao provedor ocorre somente ao clicar em **Continuar** após selecionar um contrato, quando a IA estiver configurada. Erros preservam o arquivo e permitem nova tentativa.

## Fluxo disponível

1. Enviar contrato PDF/TXT e continuar. A IA, quando configurada, retorna todos os equipamentos do documento em uma resposta estruturada versionada.
2. Conferir a tabela preenchida: cada linha tem nome, número de tombamento, intervalo e primeira manutenção próprios. Modelo, série, setor, observações, vigência e evidências ficam nas configurações avançadas de cada linha, também preenchidos pela IA quando documentados.
3. Completar somente as lacunas ou resolver conflitos e confirmar o lote. Regras incompletas permanecem pendentes; não são inventadas datas. A confirmação é a revisão humana explícita.
4. Para quantidade sem identidades, identificar cada unidade por número de tombamento; Adicionar outra unidade duplica apenas o contexto para preenchimento, sem inventar número de tombamento ou série.
5. Consultar o inventário com contrato, cobertura, próxima manutenção e busca por série/contrato. Abrir uma unidade permite ver documentos anteriores e adicionar um novo contrato.

Uma cláusula só é compartilhada quando aplicável explicitamente às unidades correspondentes. Cada ficha pode ter regra e vigência diferentes. Equipamentos conhecidos são atualizados por identidade explícita; documento diferente exige início da cobertura e renovação. O lote pode conter criação, edição e renovação, com transação única e validação de identidades, sem gravação parcial.

A extração usa `version: 2` e `equipments[]`; leituras antigas permanecem legíveis e são reprocessadas ao continuar quando a IA está configurada. Não foi executado benchmark ou chamada real com provedor nesta entrega. Os testes usam respostas sintéticas e transporte simulado. Veja o [contrato e critérios do fluxo](../../docs/produto/fase-1-cadastro-e-calendario.md).

### Fronteiras de API local

- `PATCH /api/assets/:id/coverages/:coverageId/dates`: recebe `validFrom` e `validUntil` obrigatórios, no formato `YYYY-MM-DD`. Atualiza somente as datas da cobertura indicada; preserva documento, revisão e demais coberturas. Valida ordem das datas, primeira manutenção e sequência dos inícios de cobertura. Não altera datas de outras unidades do mesmo contrato.

- `PATCH /api/contracts/:id/parent`: recebe `{ parentContractId: "UUID do principal" | null }` e retorna os metadados atualizados, sem extração/bytes. `null` torna o documento principal. A mesma autenticação e validação de origem se aplicam; não altera equipamentos ou planejamento.

- `PATCH /api/assets/:id/maintenance-responsibility`: recebe somente `{ maintenanceProvider: "contract" | "internal" | "unassigned" }`, valida autenticação/origem e persiste a responsabilidade sem alterar o plano ou o histórico. Retorna o equipamento atualizado; campos extras e valores inválidos são rejeitados.

- `GET /api/contracts`: lista `{ id, name, mime, createdAt, parentContractId? }` dos documentos enviados, inclusive sem vínculo, sem bytes ou extração. Exige a mesma sessão das demais rotas quando a senha está configurada.
- `GET /api/contracts/:id/file`: documento original protegido; a prévia usa esses bytes e não executa extração de IA.

- `POST /api/assets/batch`: até 50 fichas com regras e vigências próprias; `id` opcional em cada item identifica a unidade a atualizar; `renew: true` adiciona nova cobertura com início obrigatório quando muda o contrato. `existingId` na raiz permanece como compatibilidade para identificar apenas o primeiro item. Operação atômica.
- `POST /api/assets/:id/contracts`: adiciona cobertura com novo documento e início obrigatório; `additionalAssetIds` seleciona outras unidades existentes usando a mesma regra (rota de compatibilidade; a interface múltipla usa a regra de cada linha no lote). Não modifica identidades dessas unidades. Operação atômica.
- `GET /api/assets`: inclui `coverages`, com documentos, regras, vigência e revisão anteriores.
- `GET /api/events`: projeções com contrato de origem; vencimento e nova cobertura revisada limitam o intervalo efetivo, sem duplicações. Novo contrato pendente não ativa substituição.

`POST /api/assets` e `PUT /api/assets/:id` continuam disponíveis para uma unidade; substituir documento exige a operação explícita de renovação.

## Persistência e acesso

SQLite guarda cadastros, coberturas por equipamento, metadados, extrações e bytes dos contratos; arquivos idênticos são deduplicados por SHA-256. Previsões são projeções consultadas, não eventos duplicados no banco. Registros sobrevivem ao reinício. A migração para `user_version=2` adiciona `asset_contracts` e registra as coberturas legadas sem limpar o banco. Documentos e coberturas anteriores são preservados na renovação; alterações da cobertura mais recente ainda não constituem um histórico imutável de toda edição de plano. Não há exclusão de equipamento/arquivo nesta fase; uploads de formulário cancelado permanecem no banco. Retenção e limpeza são trabalho posterior.

Por padrão, demonstração local com três exemplos sintéticos identificados **sem senha**; use somente dados fictícios. `APP_PASSWORD` habilita proteção de API/arquivos com sessão HttpOnly/SameSite, limitação de tentativas e verificação de origem. Há um único espaço local: **não implementa usuários, papéis ou isolamento multi-instituição** e não é implantação hospitalar. Essa implantação exige controle de acesso, configuração e validação próprios.

`.data/` e `.env.local` são ignorados pelo Git. Para cópia de segurança inicial, pare o backend e copie integralmente `.data/`; restaure com o processo parado. Backup agendado e recuperação de desastre não foram implementados/validados.

## Documentos na definição de manutenção

“Quem cuida da manutenção?” mostra as opções de responsabilidade. **Empresa externa** segue por **Continuar** para duas opções: **Termo aditivo** ou **Contrato de manutenção terceirizada**, mais o upload de PDF/TXT (até 15 MB). Não há campo de descrição. Cancelar antes de salvar não envia o arquivo.

O termo aditivo altera o contrato de origem; o contrato terceirizado é um documento separado relacionado à gestão do equipamento. Ambos mantêm vínculo ao principal, com classificação própria, sem substituir o contrato de origem ou serem confundidos na lista de documentos e no histórico da unidade. A ficha reúne esses arquivos e as coberturas anteriores. Esses registros documentais não comprovam manutenção executada.

**Salvar no histórico** envia `POST /api/assets/:id/maintenance-documents` autenticado, com multipart `file` e `kind` (`amendment` ou `outsourced`). O backend rejeita `contract` e `complement` nesse fluxo e exige contrato de origem. Arquivo, vínculo e responsabilidade são gravados na mesma transação; reenvios mantêm um único registro por unidade. Descrições históricas e o campo opcional `notes` da API permanecem compatíveis, sem entrada na interface.

A migração transacional para `user_version=4` amplia os tipos em `asset_documents`, preservando IDs, arquivos, registros e a ordem histórica da versão 3. Coberturas continuam em `asset_contracts`. O histórico é retornado em `maintenanceDocuments`; `documentKind` diferencia aditivo de contrato terceirizado. Anexar não altera vigência, revisão ou previsões existentes.

## Quebra, reparo e contato da manutenção

A ficha removeu **Gerenciar manutenção** e o bloco de pendência contratual. **Registrar quebra** fica no rodapé e abre um `ManagedDialog` sobreposto, com identificação da unidade, opção de agendamento e data. Sem data, o equipamento recebe a flag de quebrado e nenhum evento fictício. A lista prioriza equipamentos quebrados e oferece filtro próprio. A ficha permite reagendar e informar o reparo em diálogos do mesmo padrão, mantendo o histórico.

`PATCH /api/assets/:id/breakdown` autenticado recebe `{ action: "report", scheduledDate?: "YYYY-MM-DD" | null }`, `{ action: "schedule", scheduledDate: "YYYY-MM-DD" | null }` ou `{ action: "resolve" }`. Datas reais são validadas; ações indevidas/campos extras são rejeitados. `breakdowns[]` persiste no payload da unidade, preservado nas edições e renovações. Um único registro pode ficar aberto. O evento de reparo tem `kind: corrective`, ID próprio e destaque vermelho com rótulo no calendário e na agenda. Reagendar move o evento; informar reparo encerra sua projeção ativa, preservando o histórico. As preventivas continuam separadas; o registro do reparo é uma informação do usuário, sem liberação técnica automática ou ordem de serviço completa.

**Quem atende** usa o vínculo de manutenção mais recente (registro documental ou cobertura), com nome da empresa e links de telefone/e-mail quando disponíveis. Não herda contato de um vínculo anterior se o mais recente não trouxer essa informação; sem nome, mostra **Empresa terceirizada**. Oficina do hospital permanece uma responsabilidade interna explícita. A identificação da empresa não aprova cobertura/vigência.

O SDK extrai `maintenanceCompany`, `maintenancePhone` e `maintenanceEmail` com evidência por equipamento. Os campos são preenchidos e revisáveis nas configurações de Contrato do cadastro, persistidos no equipamento e na cobertura. Extrações antigas continuam legíveis; ausência/conflito não inventa contatos. Os documentos adicionados pelo fluxo de manutenção também são lidos quando o SDK está configurado; falha da leitura não altera o vínculo. Sem SDK configurado, o documento pode ser registrado com responsável genérico. A gravação da extração e do vínculo é transacional. Os contatos nos registros documentais são derivados da extração correspondente à unidade, sem confundir fabricante/hospital com prestador.

## Entradas compartilhadas do reparo

A ação principal na lista de Equipamentos abre o registro de quebra diretamente; atendimento contratual fica na ação secundária. Ficha, contratos e prévia do cadastro encaminham para o mesmo diálogo controlado em `App`. Ao salvar, `syncRepairEvent` atualiza a ocorrência na agenda imediatamente, preservando preventivas e outras unidades. A API usa o mesmo projetor `repairEventFor`. A confirmação global pode abrir o calendário no mês/dia escolhido; o atalho é omitido quando existe um cadastro em edição.

O status mostrado e o filtro usam a mesma situação: um equipamento com quebra aberta não aparece como coberto/interno na lista enquanto exibe quebrado. A fila diferencia atraso, ausência de agendamento e reparo agendado. Concluir restaura a apresentação contratual anterior sem declarar liberação técnica. Referências e decisões estão na [pesquisa de mercado do fluxo](../../docs/produto/registro-de-quebra-pesquisa-e-fluxo.md).

## Verificação

Na raiz:

```sh
npm test
npm run build
python3 scripts/verificar_repositorio.py
```

Testes cobrem meses/bissextos, datas ausentes, múltiplas unidades por contrato, vigência, renovação, lacunas, sobreposição, rollback de lote, migração de banco legado, persistência SQLite e SDK com transporte simulado sem rede. A suíte HTTP isolada cobre sessão, autorização de arquivos, upload, edição, reinício e SDK com provedor local; marca `skip` com motivo se o ambiente nega abertura de portas (`EPERM`), sem apresentar esse caso como aprovado. A configuração real de IA depende do usuário e permanece sem validação.

Veja [diagrama e escopo da fase 1](../../docs/produto/fase-1-cadastro-e-calendario.md). Localização BLE e hardware não estão integrados.

Ao abrir um contrato, aditivo ou arquivo vinculado, **Visão geral** vem selecionada e solicita o resumo por IA, reutilizando o resultado salvo quando disponível. **Arquivo** permite consultar o original e **Equipamentos** reúne as unidades vinculadas. O atalho explícito para equipamentos mantém seu destino. A ficha abre como janela flutuante arrastável sobre a mesma consulta, sem fechar o contrato nem perder o scroll da lista. A linha selecionada fica destacada; fechar a ficha devolve o foco ao equipamento. O cabeçalho também aceita movimento pelas setas. Em telas pequenas, a janela fica fixa.

## Padrão visual

Calendário, contratos, equipamentos, formulários e diálogos usam Inter, com fontes locais e escala compartilhada em `brand/tokens.css`. DM Mono fica na marca e nas prévias de texto técnico. Tamanhos, pesos, cores de texto, foco, espaçamentos, raios e sombras seguem o [guia da marca](../../brand/README.md#padrão-visual-da-aplicação). Reutilize os tokens e controles existentes ao acrescentar telas; preserve fontes legíveis em telas pequenas.
