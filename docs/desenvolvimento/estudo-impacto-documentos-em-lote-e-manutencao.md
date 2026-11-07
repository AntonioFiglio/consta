# Estudo de impacto — documentos em lote e manutenção

**Data: 07/11/2026. Status: estudo técnico e funcional para aprovação; implementação não autorizada nesta etapa.**

Referência consolidada e goal: [README da implementação documental](../implementacao-documental/README.md). O transporte atual proposto é por pacotes compactados, conforme esse README.

Este estudo confronta o [plano de implementação](../produto/plano-implementacao-documentos-em-lote-e-manutencao.md) com o código atual. Os caminhos abaixo são relativos à raiz do repositório. Nomes de módulos novos e contratos são propostas, não recursos existentes. O escopo permanece inteiramente na aplicação local.

A [especificação de experiência, copy e progresso](../produto/experiencia-importacao-em-lote-copy-e-progresso.md) detalha a entrada de múltiplos arquivos, as telas de acompanhamento e revisão, os estados parciais e o mapa complementar de arquivos do frontend. Esses requisitos fazem parte da revisão anterior à implementação.

## 1. Resultado da investigação

O plano é viável sobre a stack atual, mas envolve mais que alterar o prompt. Existem quatro mudanças de domínio: processamento persistente em lote, relações documentais além de um pai, evidências reutilizáveis por página e planos de manutenção versionados por serviço. Implementar uma de cada vez, com adaptação dos consumidores existentes.

| Evidência no código | Consequência para o plano |
| --- | --- |
| `server/extraction.ts` envia o arquivo inteiro ao SDK e força uma chamada `prepare_equipment_import` | A ferramenta atual estrutura/expande a resposta; não executa busca local, regex ou leitura de páginas. Acrescentar pipeline local antes da etapa semântica |
| `server/app.ts` usa `extracting`, um `Set` em memória, para bloquear outra leitura | Não é fila e perde estado ao reiniciar. Importação individual e lote precisam compartilhar coordenação persistente |
| `server/store.ts` usa `node:sqlite`, arquivos BLOB e migrações até `user_version=6` | Preservar IDs, hashes e bytes; acrescentar tabelas e migração sequencial, sem rebaixar versão ao abrir o banco |
| `store.setContractParent` e `src/contract-groups.ts` modelam agrupamento com um pai e restrições de profundidade | Uma árvore de múltiplos níveis e relações entre TCs não cabe no modelo atual. Separar hierarquia e relações cruzadas |
| `server/contract-import.ts` cadastra automaticamente as unidades do TC com `reviewed=false` e preserva IDs/correções no reenvio | Manter cadastro documental e aprovação de manutenção separados. Não reusar importação automática indistintamente em aditivos/manutenção |
| `src/types.ts` mistura campos atuais de periodicidade no ativo/cobertura e tem evidência sem ID/posição | Introduzir tipos de análise, evidência e plano sem tornar os JSONs legados ilegíveis |
| `domain.eventsFor` e `schedule.nextMaintenanceDate` tratam coberturas como uma sequência de substituições | Um serviço mensal não pode substituir outro semestral só por aparecer depois. Versionar por serviço e calcular serviços independentes |
| `eventsFor` gera ID `${asset.id}:${date}` | Duas manutenções no mesmo equipamento/data colidem. Novas ocorrências precisam incluir serviço/plano/versão |
| `PeriodUnit` aceita apenas dias, meses e anos | Semana pode ser normalizada para sete dias com evidência preservada. Cronograma explícito e regras por uso exigem representação própria |
| `AssetDialog.tsx` combina upload, extração, cadastro e revisão | Evitar ampliar esse componente com toda a importação em lote. Criar telas próprias e pontos pequenos de integração |
| `src/routes.ts` só define calendário, contratos e equipamentos | Acompanhamento de lotes e dashboard precisam de navegação, título e estado de rota próprios |
| `package.json` não inclui extrator PDF/OCR local | Escolha requer prova técnica; não declarar OCR disponível nem instalar dependências nesta etapa |

O código usa `reviewed` para liberar projeções, mas o novo domínio precisa registrar exatamente qual regra/versão e quais fontes foram aprovadas. Isso é uma evolução, não uma propriedade já atendida pela flag existente.

## 2. Ajustes recomendados ao plano

1. **Extrair evidências antes de trocar o prompt.** Validar texto por página e padrões locais com corpus sintético antes de conectar o novo caminho à IA.
2. **Preservar o formato legado.** Manter `Extraction` existente e criar um formato de análise documental separado. Adaptadores podem preparar rascunhos compatíveis, sem reutilizar uma extração incompleta como se fosse a versão 2 integral.
3. **Separar cobertura, serviço e versão de plano.** Cobertura define condições de atendimento; serviço define obrigação; versão aprovada determina o cálculo. A migração de regras legadas conserva seu significado original.
4. **Tratar o grafo explicitamente.** Manter a associação principal atual como compatibilidade de apresentação; relações aprovadas em tabela própria tornam-se a fonte do novo fluxo. Não manter duas fontes editáveis que possam divergir.
5. **Validar a primeira ocorrência.** A âncora de instalação e a primeira data preventiva podem não coincidir com a cadência original. Se a primeira manutenção tiver deslocamento especial, modelar primeira ocorrência e recorrência separadamente.
6. **Centralizar a consulta de previsões.** Hoje servidor e cliente calculam previsões por caminhos distintos. Compartilhar a função pura de cálculo e o contrato de consulta para evitar datas diferentes na ficha, calendário e dashboard.
7. **Definir o que pode ser aprovado.** Um candidato extraído por regex continua sendo proposta. Falta de dados bloqueia apenas a regra afetada; não trava a organização documental do lote inteiro.
8. **Otimizar com cobertura mensurável.** Cache, regex e busca não podem esconder remissões, anexos, tabelas ou negações. Não prometer economia de tokens antes de comparar resultados contra gabarito.

## 3. Fluxo funcional esperado

### Passo 1 — Enviar documentos

Na lateral ou no cabeçalho de Contratos, a pessoa escolhe **Enviar documentos**, seleciona os PDFs e confirma o envio. Não precisa definir previamente quais são os TCs ou aditivos. O sistema mostra arquivos, tamanho e rejeições antes de processar. O limite atual de arquivo deve ser preservado até validação específica; quantidade de PDFs e quantidade de equipamentos são limites diferentes.

O diálogo usa apenas a explicação **Envie TCs, contratos de manutenção, termos aditivos e anexos juntos.** A seleção gera manifesto e pacotes ZIP limitados por tamanho, preparados fora da thread da interface. O backend recebe por streaming, descompacta com limites e confirma cada pacote após validar e persistir todos os seus PDFs. Só então o lote selado inicia a análise. Reenvio de pacote é idempotente; queda do navegador pode exigir nova seleção dos originais ainda não confirmados. Compactação não substitui a otimização de tokens por ferramentas.

### Passo 2 — Acompanhar o processamento

Mostrar por arquivo: recebido, lendo texto, aguardando OCR, buscando evidências, analisando contexto, pronto para revisão ou falha. Quando a IA for necessária e não estiver disponível, mostrar a pendência e permitir revisão manual.

A página pode ser fechada. Ao reabrir, o backend entrega o estado salvo; durante o fechamento do servidor local, o trabalho pausa e depois se recupera. Um PDF corrompido não interrompe os demais. Reprocessar um item não reinicia todo o lote.

### Passo 3 — Conferir organização

Apresentar grupos com TC, manutenção, aditivos e anexos, além de uma área **Sem vínculo identificado**. Documentos de instalação/aceite podem comprovar marcos sem serem contratos. O mesmo arquivo pode aparecer como referência em mais de um grupo sem gerar cópias.

Selecionar uma relação abre o trecho que a sustenta. A pessoa confirma, corrige ou rejeita. Referências ambíguas mostram candidatos; não se escolhe um principal por conveniência. Relações aprovadas ficam registradas, sem alterar calendário.

### Passo 4 — Conferir equipamentos

Mostrar unidades já reconhecidas, possíveis correspondências e unidades provisórias sem série/patrimônio. Marca/modelo iguais não justificam fusão. Exibir origem de cada unidade e tratar conflitos com equipamentos de outro TC antes de cadastrar ou vincular.

No fluxo de lote proposto, a confirmação dessa etapa autoriza a criação/vinculação do conjunto selecionado. No cadastro individual atual, preservar a criação automática já existente. Nenhum dos dois aprova manutenção implicitamente.

### Passo 5 — Conferir instalação e regras

Por equipamento/serviço, mostrar fonte, condição de início, data-base, primeira ocorrência, periodicidade, vigência e responsável. Cada campo pode abrir a evidência correspondente. Distinguir instalação comprovada, confirmação informada, data-base aprovada e marco desconhecido.

Exemplo: contrato exige primeira preventiva seis meses após instalação e recorrência semestral; instalação ainda não comprovada. Mostrar a regra encontrada e a pendência do marco, sem eventos oficiais. Após registrar/confirmar instalação em 10/01/2026, apresentar a prévia de 10/07/2026 e 10/01/2027, sujeita à vigência e revisão.

Se houver apenas “visitas periódicas conforme manual”, solicitar a fonte ou decisão técnica; não gerar intervalo. Se um aditivo mudar somente valor, manter a frequência anterior. Alteração conflitante exige decisão explícita.

### Passo 6 — Aprovar planejamento

A pessoa seleciona os planos completos e vê uma prévia de inclusões, alterações e pendências. A aprovação salva versão, fontes, decisão e responsável declarado. Planos incompletos permanecem pendentes. Não oferecer **Aprovar tudo** que ignore lacunas.

Se outra revisão tiver alterado o grupo desde sua abertura, detectar versão desatualizada e solicitar reconferência; não sobrescrever a alteração concorrente. A senha compartilhada não comprova identidade nominal de um usuário.

### Passo 7 — Consultar dashboard e calendário

O dashboard mostra previsões por mês e pendências de documentação/planejamento. O calendário mostra somente as previsões de regras aprovadas, preservando reparos já existentes. Inspeção mensal e preventiva semestral aparecem como serviços distintos, inclusive quando ocorrerem no mesmo dia.

Ao abrir um evento, a pessoa vê equipamento, serviço, responsável, versão aprovada e evidências. “Prevista” não significa realizada. Ausência de comprovante não vira diagnóstico automático de indisponibilidade ou atraso operacional.

### Passo 8 — Receber documentos posteriores

Um novo aditivo reaproveita as análises existentes e apresenta proposta de mudança apenas para os grupos/serviços atingidos. Mostrar o antes/depois das datas futuras. Só a nova aprovação altera as previsões oficiais; preservar histórico e registros de execução.

## 4. Mapa de arquivos existentes a alterar

Prefixo dos caminhos de código abaixo: `apps/crm/`.

| Arquivo | Alteração proposta e motivo |
| --- | --- |
| `server/app.ts` | Montar rotas de lote/revisão, validar operações e integrar coordenação persistente; preservar autenticação/origem local e rotas individuais |
| `server/index.ts` | Inicializar/parar rotina local de processamento e aguardar fechamento seguro do banco |
| `server/store.ts` | Separar migrações de abertura, expor métodos transacionais dos novos repositórios e preservar métodos atuais; não expor SQLite bruto ao modelo |
| `server/extraction.ts` | Integrar adaptador de análise com trechos e fallback; conservar compatibilidade do importador atual durante transição |
| `server/contract-import.ts` | Reutilizar criação idempotente de unidades; diferenciar cadastro por TC da vinculação documental em lote |
| `server/contract-file.ts` | Compartilhar validação dos uploads novos; manter leitura privada e limites, sem aceitar arquivo só por extensão |
| `server/domain.ts` | Consumir planos versionados e serviço comum de projeção; preservar reparos e validações legadas |
| `src/types.ts` | Acrescentar contratos novos e referências opcionais em eventos; não tornar campos legados obrigatórios sem migração |
| `src/schedule.ts` | Centralizar cálculo por regra/serviço com primeira ocorrência explícita, vigência e identidade estável |
| `src/App.tsx` | Integrar rotas, navegação e atualização de dados após revisões, mantendo o fluxo individual |
| `src/routes.ts` e `src/contract-copy.ts` | Acrescentar rotas/títulos; usar **Enviar documentos** nas duas entradas e copy curta no diálogo |
| `src/ContractsPage.tsx` | Incluir entrada para lote e acesso à organização aprovada |
| `src/contract-groups.ts` | Ler grafo por adaptador, garantir grupos sem duplicação e compatibilidade de pesquisa |
| `src/ContractViewer.tsx` | Exibir relações e abrir evidências na página correspondente; comprovar navegação do leitor por ensaio visual |
| `src/CalendarPage.tsx` e `src/DayScheduleDialog.tsx` | Exibir serviço e fontes, lidar com ocorrências no mesmo dia e estados de proposta/oficial |
| `src/AssetOverview.tsx` e `src/maintenance-status.ts` | Consultar próximos serviços/cobertura sem confundir pendência documental, atendimento e disponibilidade |
| `src/AssetDialog.tsx` | Ajustes delimitados para interoperar com planos/versionamento; não transformar o diálogo individual na tela inteira de lote |
| `src/api.ts` | Preservar códigos/estados de erro necessários à recuperação, mantendo rejeição de HTML; mudanças só se exigidas pelo contrato final |
| `src/styles.css` | Estados, revisão, evidências, árvore e painel responsivos, reutilizando tokens atuais |
| `package.json` e `../../package-lock.json` | Dependências locais de PDF/OCR somente após escolha validada; não atualizar bibliotecas sem relação com o escopo |
| `README.md` e `.env.example` | Instruções da fila, limites/configuração sem segredos e comportamento sem IA |

Revisar também `src/maintenance-contact.ts` e `src/equipment-situation.ts` se os contratos de serviço/cobertura afetarem suas leituras. Não alterá-los por antecipação se o adaptador mantiver o comportamento.

## 5. Módulos novos propostos

| Caminho relativo a `apps/crm/` | Responsabilidade |
| --- | --- |
| `server/migrations.ts` | Migrações incrementais e versão monotônica do esquema |
| `server/document-store.ts` | Lotes, páginas, análises, evidências e relações por operações transacionais |
| `server/document-jobs.ts` | Reserva, retomada, cancelamento e retentativas limitadas |
| `server/document-worker.ts` | Orquestração local de etapas fora da requisição HTTP |
| `server/document-text.ts` | Extração paginada e qualidade; adaptador de OCR com cancelamento e limites |
| `server/document-rules.ts` | Dicionários, padrões registrados e candidatos determinísticos |
| `server/document-tools.ts` | Busca/contexto autorizados e validação de evidências; sem escrita pelo modelo |
| `server/document-analysis.ts` | Cache, recuperação de contexto, fallback semântico e orçamento |
| `server/document-relations.ts` | Candidatos a vínculos, grafo e validações de revisão |
| `server/maintenance-plans.ts` | Consolidação de regras, marcos, aprovações e impacto de alterações |
| `server/maintenance-store.ts` | Persistência de versões, fontes e decisões |
| `server/document-routes.ts` | Rotas do fluxo em lote, isoladas do arquivo principal |
| `src/document-types.ts` | Tipos compartilhados de lote, página, evidência e relação |
| `src/maintenance-plan-types.ts` | Tipos compartilhados de serviço, marco, regra e versão |
| `src/DocumentImportDialog.tsx` | Seleção múltipla e copy curta, compartilhadas pelos dois botões |
| `src/DocumentImportPage.tsx` | Preparação/envio compactado, recepção e acompanhamento do lote |
| `src/document-package.worker.ts` e `src/document-package.ts` | ZIP com manifesto/hashes, limites e preparação sem bloquear a interface |
| `server/document-packages.ts` | Recepção por streaming, extração limitada e confirmação transacional dos PDFs |
| `src/DocumentReviewPage.tsx` | Revisão da organização e conflitos |
| `src/MaintenancePlanReview.tsx` | Evidências, lacunas e prévia antes da aprovação |
| `src/MaintenanceDashboardPage.tsx` | Resumo mensal e pendências com consultas consistentes |
| `src/DocumentEvidence.tsx` | Contexto, origem e navegação para evidência |

Essas são fronteiras de responsabilidade. Consolidar arquivos pequenos quando melhorar a clareza; não criar microserviços. Compartilhar a mesma conexão transacional por interfaces restritas ou usar estratégia explícita de conexão; não criar escritores concorrentes sem testar contenção e reservas.

## 6. Migração e decisões de dados

1. Produzir backup consistente e ensaio de restauração em cópia de teste, com tratamento do WAL.
2. Extrair a rotina de migração e impedir que o código antigo de abertura fixe `user_version=6` depois de migrar. Não escolher versão final sem conferir o estado no momento de implementar.
3. Criar tabelas de lote/trabalho/texto/evidência/análise/relação e depois serviço/plano/versão/revisão. Separar migrações por entrega.
4. Preservar originais e links antigos. Converter `parentContractId` em relação de compatibilidade idempotente e definir a tabela canônica do novo fluxo.
5. Expor coberturas legadas como regras compatíveis por adaptador. Não inventar evidência ou aprovador para registros antigos; indicar origem legada. Persistir a conversão somente com teste de equivalência das projeções.
6. Acrescentar IDs completos nos eventos e revisar consumidores, sem alterar o histórico de reparos.
7. Reversão de código após migração só deve ocorrer com compatibilidade comprovada; restaurar backup pode descartar novas gravações e não é reversão automática segura.

O banco local e os artefatos compilados aparecem em `git ls-files`, apesar de constarem no `.gitignore`. Não removê-los nem alterá-los como efeito lateral deste estudo. Na implementação, revisar o tratamento desses arquivos separadamente; executar testes em bancos temporários, e revisar artefatos gerados pelo build antes de qualquer commit.

## 7. Testes e aceitação por área

| Área | Arquivos existentes a ampliar / novos propostos | Comportamento a demonstrar |
| --- | --- | --- |
| Texto e regras | Novos `tests/document-text.test.ts`, `tests/document-rules.test.ts` | Texto por página, OCR seletivo, negações, instalação futura, SLA e datas impossíveis |
| Ferramentas e IA | `tests/storage-and-sdk.test.ts`, `tests/multi-extraction.test.ts`; novo `tests/document-analysis.test.ts` | Caso completo sem IA, orçamento, evidência inválida, ampliação de contexto e cache por versão |
| Lote | Novos `tests/document-jobs.test.ts`, `tests/document-batch.test.ts`, `tests/document-packages.test.ts` | Integridade do ZIP, limites de extração, nomes repetidos, reinício, reserva expirada, envio incompleto, idempotência e cancelamento |
| Grafo | `tests/contracts.test.ts`, `tests/contract-groups.test.ts`; novo `tests/document-relations.test.ts` | Relações cruzadas, hierarquia sem ciclos, revisão e compatibilidade legada |
| Inventário | `tests/contract-auto-import.test.ts`, `tests/equipment-import.test.ts` | Mesmos IDs no reenvio, unidades provisórias e preservação de correções |
| Planos | `tests/domain.test.ts`, `tests/maintenance-status.test.ts`; novo `tests/maintenance-plans.test.ts` | Múltiplos serviços, primeira ocorrência especial, aditivo parcial, pendências e versões |
| API | `tests/api.test.ts`, `tests/api-client.test.ts`; novo `tests/document-api.test.ts` | Acesso privado, origem, conflitos de revisão e recuperação de erros |
| Interface | Conferência no navegador e testes puros existentes pertinentes | Upload, estados reais, revisão acessível, evidências, navegação e consistência entre telas |

Os testes HTTP existentes podem ser ignorados quando o ambiente proíbe abrir portas. Esse resultado não substitui validação integrada em ambiente que permita os servidores de teste. Não usar provedor real ou documentos privados para obter um teste verde automaticamente.

Antes de escolher biblioteca PDF/OCR, comparar opções locais com páginas de texto, digitalizações, documentos mistos e tabelas. Registrar qualidade, instalação no ambiente suportado, licença e consumo de recursos. A escolha e novos requisitos de instalação entram na revisão técnica antes de conectar o pipeline.

Validar o volume de 50/100 PDFs após ter critérios de correção: tempo e memória medidos, recuperação de falhas e resultado contra gabarito. Registrar redução de chamadas/tokens sem aceitar perda de cláusulas relevantes.

## 8. Sequência proposta para aprovação e implementação

1. Aprovar o fluxo e as fronteiras deste estudo; manter implementação suspensa até autorização do usuário.
2. Fazer prova local de extração/OCR e corpus com gabarito; documentar escolha, sem integrar o produto prematuramente.
3. Entregar ferramentas determinísticas e evidências com testes de instalação/manutenção.
4. Entregar manifesto, pacotes compactados, descompactação validada, persistência do lote, fila e API com recuperação; integrar o caminho individual à mesma coordenação.
5. Entregar revisão documental e compatibilidade do grafo.
6. Entregar planos versionados, serviço comum de cálculo e revisão.
7. Integrar dashboard/calendário e validar o conjunto de 50/100 PDFs.

As etapas permitem revisão incremental; não autorizam publicar, contratar serviços, alterar credenciais ou enviar mensagens. A aprovação de implementação deve se referir a este fluxo local e às mudanças descritas, com dependências técnicas ainda identificadas como pendentes.

## 9. Evidências desta investigação

- Código, scripts, tipos e testes inspecionados na branch `feature/fluxo-documental-cadastro`, que estava 16 commits à frente da referência local `origin/develop` no início do estudo. Não houve sincronização remota bem-sucedida nesta sessão: o fetch anterior falhou por DNS.
- `npm test`: 81 testes, 80 aprovados e um HTTP integrado ignorado por restrição de portas; nenhuma falha.
- `npm run check`: TypeScript do frontend e backend aprovado, sem emissão de artefatos.
- Nenhuma dependência instalada, migração executada, dado de uso alterado ou chamada real ao provedor de IA realizada neste estudo.
- Build não executado nesta etapa documental, para evitar gerar alterações nos artefatos compilados rastreados. Não foi realizada conferência visual de telas novas, que ainda não existem.

Verificação documental e revisão de espaços/diff devem acompanhar a entrega deste arquivo. Esses resultados demonstram o estado da base e a consistência documental, não a capacidade futura de processar lotes.
