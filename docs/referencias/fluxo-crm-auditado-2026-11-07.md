# Consta — fluxo real do CRM para o pitch de 3 min (auditoria read-only)

Base auditada: árvore local em `feature/pitch-local-atualizado` sobre `2c4659b` (inclui `fe0e190` do Antonio). Leitura de código apenas; testes não reexecutados (Root já registrou 73 pass + build). Nenhum provedor externo, `.env` ou banco real consultado.

**Fora do código atual (não afirmar como pronto):** captura de patrimônio por foto/QR/câmera e LLM de foto (Nicolas) e novo mapa do hospital (Antonio). O CRM hoje **não tem tela de localização**: `grep` por localização/location em `apps/crm/src` e `apps/crm/server` só encontra o `useLocation` do roteador (`apps/crm/src/App.tsx:28,85`). Rotas existentes: `/calendario`, `/contratos`, `/equipamentos` (`apps/crm/src/routes.ts:1-5`).

---

## 1. Passos manuais × Consta (hoje)

| # | Passo no processo manual | O que o Consta faz hoje | Ainda humano | Evidência |
|---|---|---|---|---|
| 1 | Receber contrato e arquivar | Upload PDF/TXT; arquivo preservado e servido depois | Escolher o arquivo | `apps/crm/src/AssetDialog.tsx:425` (accept pdf/txt); `apps/crm/server/app.ts:341-344`, `:420` |
| 2 | Ler o contrato e localizar cada equipamento | IA extrai **lista** de equipamentos (até 50) com valor + status found/missing/conflict + página + trecho | Nada para iniciar: avançar o passo dispara a leitura se a IA estiver configurada | `apps/crm/server/extraction.ts:6-38`, `:61`; `apps/crm/src/AssetDialog.tsx:276-284` (nextStep chama readContract); `apps/crm/server/app.ts:433-457` |
| 3 | Digitar nome, tombamento, série, marca, modelo, setor, empresa, telefone, e-mail, vigência | Campos **documentados** chegam pré-preenchidos no formulário editável | **Conferir** cada linha; corrigir conflito/ausente (vêm `null`, sem chute) | `apps/crm/src/contract-extraction.ts:75-133`; regras anti-invenção `apps/crm/server/extraction.ts:63-67` |
| 4 | Separar unidades quando o contrato traz só "modelo × quantidade" | IA devolve **um item de grupo** com `quantity` e identidades ausentes; UI avisa "O contrato menciona N unidades… identifique cada unidade" | **Completar** tombamento de cada unidade ("Adicionar outra unidade"); tombamento é obrigatório (`min(1)`) | `apps/crm/server/extraction.ts:61`; `apps/crm/src/AssetDialog.tsx:647-666`, `:884-910`; `apps/crm/server/domain.ts:40` |
| 5 | Evitar cadastro duplicado | Bloqueio de tombamento repetido (no lote e contra base) | Abrir cadastro existente se acusar | `apps/crm/server/app.ts:211-224`, `:258-268` |
| 6 | Calcular primeira manutenção e periodicidade | Se o documento tiver período + data (ou data de referência), o sistema calcula a primeira data | Se o contrato **não** tiver periodicidade explícita, informar manualmente ou deixar pendente ("não gera previsões") | `apps/crm/src/contract-extraction.ts:79-109`; `apps/crm/src/AssetDialog.tsx:912-919`; prompt `extraction.ts:66` (garantia/vigência/SLA ≠ preventiva) |
| 7 | Montar agenda / planilha de vencimentos | Calendário gerado deterministicamente a partir dos planos **revisados**, respeitando vigência e renovação | **Confirmar e salvar** (vira `reviewed` só com intervalo + data) | `apps/crm/src/AssetDialog.tsx:352-376`, `:1320`; `apps/crm/server/domain.ts:98-105`, `:273-333`; `apps/crm/server/app.ts:186-199`, `:230` |
| 8 | Saber quem atende e se há cobertura | Situação por equipamento (sem responsável, sem contrato ativo, vencido, a conferir, prazo a confirmar, interna) | Escolher contrato × oficina × não definido (nunca automático) | `apps/crm/README.md:21-28`; `apps/crm/server/app.ts:153` |
| 9 | Ler contrato para responder dúvida (SLA, valores) | Resumo do arquivo com trecho/página, informativo | Conferir na fonte; não altera cadastro | `apps/crm/server/app.ts:411`; `apps/crm/README.md:56-59` |
| 10 | Organizar aditivos e anexos | Árvore contrato principal → aditivos, com troca de vínculo | Classificar e vincular | `apps/crm/server/app.ts:386-404`; `apps/crm/README.md:36-49` |
| 11 | Registrar quebra/reparo | Registro e pendência "Reparos pendentes"; evento de reparo no calendário | Registrar e resolver | `apps/crm/server/app.ts:286-293`; `apps/crm/server/domain.ts:280-281` |
| 12 | Saber onde o equipamento está | **Não existe no CRM atual** | — | ver nota acima; BLE é direção registrada, mapa é do Antonio |
| 13 | Ler patrimônio da plaqueta física | **Não existe no CRM atual** (entrada só PDF/TXT) | Digitar/conferir tombamento | `AssetDialog.tsx:425`; câmera é do Nicolas |

**Frase defensável:** "não redigitar os campos que o documento traz" — com conferência humana e, quando o contrato só dá quantidade, completar a identidade de cada unidade. **Não dizer** "100% automatizado", "sem intervenção humana" ou "agenda pronta para qualquer contrato".

Caso real `data/referencias/casos/hcfmusp-05-2026/`: 5 autoclaves individualizadas, **sem periodicidade preventiva explícita** e vigência dependente do termo de início → o comportamento correto do código é deixá-las **pendentes**, sem previsões (`AssetDialog.tsx:912-919`). Bom exemplo honesto; não mostrar calendário fabricado para ele.

---

## 2. Ordem recomendada dos 5 cards

A ordem atual (Localização, Cadastro, Manutenção, Execução, Contratos) mistura etapas com funções transversais e abre com algo que o CRM ainda não mostra. Proposta: três etapas cronológicas + duas camadas transversais, visualmente distintas (ex.: 3 cards numerados em linha e 2 faixas/selos "em todo o fluxo").

**Etapas cronológicas (o que acontece em sequência):**

1. **Captura** — "Envie o contrato. *(Após entrega: fotografe a plaqueta.)* A IA lê e aponta página e trecho." · Medir: tempo do arquivo ao rascunho; campos achados × gabarito.
2. **Inventário** — "A equipe confere, completa unidades sem identidade e salva." · Medir: tempo com revisão; correções por campo; unidades que exigiram completar.
3. **Agenda e gestão** — "Plano revisado vira previsão; pendência e reparo ficam visíveis até a resolução." · Medir: tarefas no prazo; pendências sem plano; tempo até resolução.

**Transversais (sustentam as três etapas):**

4. **Contratos** — "Principal, aditivos e anexos ligados; cobertura e vigência com fonte." · Medir: coberturas conferidas por documento.
5. **Localização** — "Último setor visto pela tag BLE, com horário e origem." · Rótulo obrigatório enquanto não houver mapa + rádio integrados: **"em validação / simulado"**. · Medir: acerto por setor; tempo para encontrar.

Observação: "Execução" com "até o comprovante" não tem evidência de anexo de comprovante de execução no código auditado (há registro de quebra/reparo e documento de manutenção — `app.ts:286`, `:345`). Por isso fundir em "Agenda e gestão" ou retirar "comprovante".

---

## 3. Fala curta — "da captura à gestão" (~30 s)

> "No fluxo manual, o contrato exige localizar e redigitar os dados. No Consta, a equipe envia o documento; a IA encontra os equipamentos e preenche o que está escrito, sempre com página e trecho. O que falta ou diverge deve ficar marcado para conferência. A equipe confere, completa as unidades e salva. A partir daí, a agenda de manutenção é calculada por regra, e a gestão enxerga quem atende, o que vence e o que está pendente."

Depois da entrega do Nicolas (só se verificada): *"E a plaqueta: em vez de digitar o tombamento de cada unidade, a equipe fotografa e confere."* — é exatamente o passo 4/13 da tabela que hoje continua manual. Não dizer que a foto substitui o rastreamento BLE nem que dispensa conferência (patrimônio × série).

Depois da entrega do Antonio (só se verificada): *"E onde está: o mapa mostra o último setor visto"* + selo simulado se o rádio não estiver integrado.

---

## 4. Protocolo de medição (escopo, sem números)

Não há linha de base medida no repositório para tempo ou custo; **não citar ROI nem economia**. O que medir, em bancada com corpus sintético/público (ex.: HCFMUSP 05/2026 com gabarito conferido):

- **Tempo:** cronometrar o mesmo contrato (a) manual — leitura + digitação em planilha dos mesmos campos — e (b) Consta — upload → extração → conferência → salvar. Mesmo operador ou operadores contrabalanceados; registrar início/fim de cada fase; tempo de espera da IA separado do tempo humano.
- **Qualidade:** por campo, acerto/erro/ausente versus gabarito; conflitos sinalizados corretamente; nenhum valor sem trecho. Unidades que exigiram completar identidade.
- **Agenda:** contratos com periodicidade explícita → datas geradas versus calculadas à mão; contratos sem periodicidade → devem ficar pendentes (ex.: 5 autoclaves).
- **Câmera (após entrega):** taxa de leitura correta de tombamento, confusão patrimônio × série, falhas por iluminação/ângulo, tempo por unidade.
- **Localização (após mapa + rádio):** acerto por setor e latência, conforme `docs/rastreamento/validacao.md`.
- **Financeiro:** só como **fórmula** com variáveis a coletar (horas economizadas × custo-hora informado pela instituição; horas de indisponibilidade evitadas), sem preencher valores. Teste sintético não demonstra ganho clínico nem operacional real.

---

## 5. Critérios de aceite da demo final (após merge de câmera e mapa) + handoff CLIdeo

**Pré-condições (bloqueantes):** commits do Nicolas e do Antonio identificados em `develop`; app reaberto e fluxo executado de ponta a ponta; registrado o que é IA real, o que é simulação e o que é fixture.

**Aceite:**
- Captura: upload real de documento sintético/público; se câmera entregue, foto de plaqueta real/sintética com tombamento conferido na tela.
- Extração mostra página/trecho; ao menos um campo ausente ou conflito visível (prova de que não inventa).
- Quantidade sem identidade aparece com aviso e é completada na tela.
- "Confirmar e salvar" → equipamento aparece no inventário e a previsão no calendário somente quando o plano tem intervalo + data; caso sem periodicidade aparece pendente.
- Mapa: setor + horário + origem; selo "simulado" se não houver rádio integrado; nenhuma planta/topologia interna real.
- Nenhuma aceleração silenciosa: cortes de espera marcados (ex.: "leitura levou X s, acelerado") ou tempo real mantido.
- Só dados sintéticos/públicos; sem credenciais, pacientes ou dados internos em tela.
- Trecho cabe no tempo reservado dentro dos 3 min; frases do pitch batem com o que aparece.

**Handoff CLIdeo (NÃO produzir agora):** quando os critérios acima forem atendidos, Claude Code Opus 5.5 medium + responsável: carregar `clideo.md`/skill clideo e a identidade Consta (`brand/`); gravar telas verdadeiras em sessão limpa; roteiro = Captura → Inventário → Agenda/gestão, com Contratos e Localização como inserts; legendas pt-BR em safe zone; versão sem música se aplicável; validar o vídeo final transcrevendo e conferindo cada alegação contra `docs/referencias/alegacoes-e-limites.md`.
