# Auditoria de capacidade do CRM de Antonio

Referência imutável inspecionada: `origin/feature/crm-fase-1`, commit `27fd27ad195ebc3f495e3180e3f511234beddaf9`. Auditoria estática de blobs dessa referência, com cópia por git archive em `/tmp/consta-crm-antonio-audit`. Nenhum checkout, merge, stash ou alteração no trabalho compartilhado. As referências de linha abaixo correspondem a esse commit, não ao branch de pitch.

## Fluxo que o código implementa

**Enviar contrato PDF/TXT → Continuar → IA lê o documento → tabela de equipamentos já preenchida → conferir/completar lacunas → Confirmar e salvar → inventário e previsões no calendário.**

A IA não é só uma ilustração ou resposta fixa: existe integração de backend com o SDK OpenAI, Responses API, arquivo inline em base64 e schema Zod estruturado. Depende de chave/modelo configurados e compatibilidade do provedor. A entrega declara que nenhuma chamada real ao provedor foi validada; os testes existentes usam respostas sintéticas e transporte controlado. Portanto, pode-se dizer “o CRM implementa o fluxo”, mas uma execução real de IA não foi comprovada nesta auditoria.

A revisão humana acontece na própria tabela preenchida e no clique final de salvar. Não há outra fila de aprovação ou checkbox separado. O upload sozinho salva o documento, mas não cria ativos nem chama automaticamente a IA. “Continuar” dispara a leitura; “Confirmar e salvar” persiste o inventário. Se os dados documentados estiverem completos, não é necessário redigitá-los.

## Evidências de implementação

- `apps/crm/src/AssetDialog.tsx:224–300`: upload usa FormData em `/contracts`; leitura usa POST `/contracts/:id/extract`; `nextStep` chama leitura quando IA está pronta e não existe extração v2; aplica o resultado e passa à tabela.
- `apps/crm/src/AssetDialog.tsx:191–221`: cada equipamento extraído vira linha de formulário; reconhece equipamento já cadastrado pela identidade.
- `apps/crm/src/contract-extraction.ts:63–117`: mapeia nome, tombamento, modelo, série, setor, observações, quantidade, intervalo, datas e vigência para campos; calcula primeira manutenção a partir de marco explícito com regra determinística.
- `apps/crm/src/AssetDialog.tsx:322–394`: salvar valida dados, monta um item por linha e chama POST `/assets/batch`; `reviewed` é marcado quando há intervalo e primeira data. A ação final é o gesto explícito de revisão.
- `apps/crm/src/AssetDialog.tsx:1298–1300, 1356–1373`: a própria interface explica que os cadastros só mudam após confirmar/salvar; botão “Confirmar e salvar” ou “Salvar cadastros” se não há regra pronta.
- `apps/crm/server/extraction.ts:34–86`: `aiReady` exige chave/modelo; `client.responses.parse` envia arquivo e schema `version:2/equipments[]`, `store:false`; não há retorno fixo de demonstração nesse caminho.
- `apps/crm/server/app.ts:302–334`: aceita PDF com assinatura `%PDF-` ou TXT UTF-8; rejeita outros formatos; upload salva bytes e metadados.
- `apps/crm/server/app.ts:356–385`: extração salva resultado; sem IA retorna erro específico; falha preserva arquivo e informa opção manual; evita leituras simultâneas.
- `apps/crm/server/store.ts:16–20,82–149`: SQLite armazena ativos, documentos, bytes, extrações e coberturas; upload idêntico deduplicado por hash; lote usa transação com commit/rollback.
- `apps/crm/server/domain.ts:188–242`: calendário projeta datas apenas de planos revisados, com marco e intervalo, respeitando vigência e próxima cobertura revisada. Não comprova execução de manutenção nem liberação clínica.

## Múltiplos equipamentos, vínculo e lacunas

- O schema retorna `equipments[]` com dados e evidências próprios por equipamento (`server/extraction.ts:12–32`). As instruções distinguem tombamento institucional de série do fabricante, só compartilham cláusulas explicitamente aplicáveis e deixam ausência/conflito como null com aviso (`:56–61`). Instrução ao modelo não é prova de acurácia da extração.
- Uma linha gera uma unidade com UUID e tombamento obrigatório; série é opcional (`server/domain.ts:23–38,181`). A identificação de unidade já existente é por `assetId` explícito ou tombamento normalizado (`src/contract-extraction.ts:162–172`); série isolada não é índice universal de correspondência. Há um fallback contextual restrito para renovação de uma única unidade em `AssetDialog.tsx:198–218`.
- Um documento pode cobrir várias unidades com regras e vigências diferentes. Cada unidade pode guardar várias coberturas/documentos históricos (`server/store.ts:20,99–110`; `server/domain.ts:116–185`). Renovar exige documento diferente e início de cobertura, preservando anterior.
- Quantidade sem identidades não vira automaticamente várias fichas. Retorna linha de grupo; usuário identifica cada unidade e pode “Adicionar outra unidade”, sem inventar tombamento/série (`AssetDialog.tsx:995–1022`; testes em `tests/multi-extraction.test.ts:150–176`). Evitar prometer que qualquer contrato com quantidade vira inventário unitário completo sem intervenção.
- O formulário exige nome/tombamento (`AssetDialog.tsx:642–685`); conflitos/ausências não são preenchidos como fatos (`contract-extraction.ts:29–30`). Pode salvar ativo sem regra completa; nesse caso não gera previsão de manutenção (`server/domain.ts:202`). Avisos continuam disponíveis; não existe certificação automática da interpretação documental.
- API de lote valida identidade repetida, tombamentos conflitantes e existência dos documentos antes de gravar (`server/app.ts:201–254`); store usa transação única.

## Câmera, QR, foto e mapa

Não há implementação desses recursos na referência inspecionada. Busca no código fonte do CRM não localizou scanner, BarcodeDetector, getUserMedia, câmera, QR, mapa ou integração BLE. `src/App.tsx:60` limita áreas a calendário/equipamentos/contratos. O input aceita `.pdf,.txt,application/pdf,text/plain` (`AssetDialog.tsx:443–449`) e o backend rejeita imagem (`server/app.ts:309–330`). Portanto, nem foto direta do documento nem captura de câmera estão implementadas. Um PDF digitalizado pode ser enviado como PDF, mas qualidade de leitura não foi verificada.

QR no celular como atalho de consulta do ativo e mapa/setor com localização devem ser apresentados como próximas capacidades planejadas. QR não equivale a rastreamento operacional de movimentação; o projeto define BLE para isso. Nenhum mapa pronto ou localização física integrada foi encontrado. O README do CRM também explicita ausência de BLE/hardware integrado.

## Verificação realizada e limites

- Inspeção estática de commit e leitura das rotas, persistência, schema, mapeamento e controles de UI.
- Cópia temporária recebeu `git init`/`git add` somente em `/tmp` para executar o verificador que depende de `git ls-files`. A primeira tentativa em archive sem `.git` falhou por esse pré-requisito; a nova execução passou: “Referências locais, recursos da marca e sintaxe dos exemplos: OK.” Esse verificador não testa comportamento do CRM.
- Suíte e build não executados: não havia `node_modules` instalado na raiz compartilhada nem na cópia; nenhuma instalação foi feita. Foram lidos os testes existentes, que cobrem persistência, extração múltipla, SDK com transporte simulado e API contra provedor HTTP local de teste. A existência desses testes não é relatada como execução nesta auditoria.
- Nenhuma credencial lida, nenhuma chamada externa de IA, nenhum documento real enviado, nenhuma validação de equipamento/hospital.

## Texto de pitch fiel ao código

“O hospital envia o contrato. A IA identifica os equipamentos e organiza os campos e as regras de manutenção. A equipe confere o que veio preenchido, completa as lacunas e confirma: o inventário fica cadastrado e as próximas manutenções aparecem no calendário.”

Se for preciso uma cadeia visual mais curta: **Contrato → IA organiza → conferência → inventário + calendário.** A conferência pode ser visualmente pequena e integrada; não omitir o clique final como se ativos fossem criados ao upload.

Para evolução: **“No celular, planejamos acesso à ficha por QR; com BLE validado, a localização por setor poderá alimentar o mapa.”** Não apresentar essas telas como recursos já entregues.
