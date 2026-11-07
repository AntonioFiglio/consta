# Experiência da importação em lote — telas, textos e progresso

**Status: proposta para aprovação, sem interface implementada. Data: 07/11/2026.**

A referência consolidada é o [README da implementação documental](../implementacao-documental/README.md). Complementa o [plano de implementação](plano-implementacao-documentos-em-lote-e-manutencao.md) e o [estudo de impacto](../desenvolvimento/estudo-impacto-documentos-em-lote-e-manutencao.md). Define como a pessoa entende o envio de muitos documentos, acompanha o processamento e chega à revisão do planejamento. A aplicação continua local.

## 1. Constatações no frontend atual

- `contractCopy.upload` diz **Enviar TC**, e a ajuda orienta enviar um contrato principal e vincular documentos depois. Isso não descreve o novo fluxo.
- `crmPageCopy.contracts.create` diz **Novo TC**; a nova ação principal precisa representar importação de documentos, sem confundir com cadastro manual.
- O botão lateral em `App.tsx` abre `AssetDialog` com `setEditing(null)`. Mudar só o texto manteria o comportamento de arquivo único e seria incorreto.
- `AssetDialog.tsx` lê `files[0]` na seleção e no arraste, aceita PDF/TXT e organiza o fluxo em torno de um TC. O lote precisa de entrada própria com seleção múltipla, envio e acompanhamento persistente.
- `ContractImportProgress.tsx` foi feito para um documento, usa três etapas e textos como **Extrair dados com IA**. Não representa fila, OCR, processamento local, falhas parciais ou correlação entre documentos.
- `src/api.ts` usa `fetch`, sem instrumentação de bytes enviados. Na primeira entrega, exibir contagem de arquivos confirmados; não simular percentual de bytes. Progresso real em bytes exigiria um adaptador específico de upload.

## 2. Navegação e entrada

O botão lateral e o botão principal no cabeçalho de Contratos passam a **Enviar documentos**. Ambos abrem o mesmo diálogo de seleção múltipla, com a mesma copy e comportamento. Não usar **Enviar TC** ou **Novo TC** para essa ação. O nome da área de acompanhamento pode continuar **Importações**, com lista de lotes em andamento e anteriores.

Após confirmar o envio no diálogo, criar o lote e navegar para seu acompanhamento, proposto em `/importacoes/:batchId`, onde ocorrem a preparação e o envio de pacotes compactados. Não manter cem arquivos em processamento presos no diálogo. A página do lote tem endereço persistente, acessível dentro da mesma aplicação local e sujeito à autenticação existente.

Preservar o cadastro manual e a importação individual como ações secundárias identificadas. Os botões **Adicionar documento** em um contrato específico e o envio de comprovante/documento de manutenção continuam contextuais; não trocar todo singular por plural indiscriminadamente.

### Copy proposta

| Local | Texto |
| --- | --- |
| Botão lateral e ação principal em Contratos | Enviar documentos |
| Título do diálogo | Enviar documentos |
| Descrição principal | Envie TCs, contratos de manutenção, termos aditivos e anexos juntos. |
| Área de arraste | Selecione ou arraste seus PDFs. |
| Ação de seleção | Selecionar PDFs |
| Ação após selecionar | Enviar 100 arquivos — quantidade dinâmica, com singular/plural |
| Ação secundária | Adicionar mais arquivos |
| Remoção antes do envio | Remover da seleção |
| Cadastro independente | Cadastrar equipamento manualmente |

### Copy completa do diálogo para revisão

```text
Enviar documentos

Envie TCs, contratos de manutenção, termos aditivos e anexos juntos.

Selecione ou arraste seus PDFs.
[Selecionar PDFs]
PDF · até 15 MB por arquivo

[Cancelar]                                      [Enviar documentos]
```

O limite de 15 MB corresponde ao validador atual; a interface deve ler a configuração efetiva, não fixar esse número no componente. Após a seleção, o botão final passa a **Enviar 1 arquivo** ou **Enviar 100 arquivos**, refletindo somente os arquivos válidos selecionados. Sem seleção válida, permanece desabilitado. Listar rejeitados separadamente e explicar que não serão enviados.

Manter a abertura curta, sem seção explicativa adicional. Informações sobre revisão, instalação ausente ou processamento aparecem nas etapas correspondentes. Não prometer agendamento ou descoberta automática de datas sem evidência.

O botão principal no cabeçalho de Equipamentos hoje diz **Novo equipamento** e compartilha o handler de abertura do diálogo individual. Diferenciar os handlers: o cabeçalho de Contratos e a lateral abrem o lote; **Novo equipamento** continua abrindo o cadastro individual. Se houver outra entrada de upload no cadastro individual, ela conserva seu escopo e texto próprios.

Mostrar formatos e limites realmente implementados, obtidos da configuração. A proposta de lote começa com PDFs; o fluxo individual preserva TXT. Não anunciar “até 100 PDFs” como capacidade garantida antes da validação de volume. Se o limite escolhido for inferior à seleção, explicar e permitir corrigir antes de enviar.

As explicações essenciais ficam visíveis. Tooltip pode complementar, mas não deve ser o único lugar que informa o que será enviado ou que é necessária revisão.

## 3. Diálogo de seleção e transição para o envio

Exibir resumo **100 arquivos selecionados**, tamanho total e lista com nome, tamanho e validação. A pessoa pode retirar itens ou acrescentar arquivos antes de confirmar. Mostrar rejeições por tipo/tamanho de forma individual; não comunicar que todos serão enviados quando houver rejeitados.

Após confirmar, criar o lote, transferir os arquivos ao controlador da aplicação e abrir o acompanhamento. Um Web Worker prepara o manifesto, os hashes e um ou mais pacotes ZIP limitados por tamanho. O controlador envia os pacotes com concorrência limitada; o backend descompacta, valida e persiste os PDFs antes de iniciar a análise. O [README principal](../implementacao-documental/README.md) define integridade, limites, selamento do lote e idempotência.

Seleção múltipla e arraste usam todos os PDFs válidos. Arquivos não são serializados na URL. Se criar o lote falhar, manter a seleção no diálogo. Preparação não equivale a envio e confirmação de upload não equivale a confirmação dos documentos extraídos.

Se o navegador fechar antes da confirmação, pode ser necessário selecionar novamente os originais para recompor os pacotes pendentes. Reutilizar IDs do manifesto; pacotes confirmados e arquivos existentes não são duplicados. Só continuar com conjunto parcial após decisão explícita e registro dos itens ausentes.

Mostrar estados curtos: **Preparando arquivos**, **Enviando documentos** e **Recebendo documentos**. Detalhes técnicos da compactação ficam fora da copy inicial. O progresso usa entradas preparadas, pacotes confirmados e PDFs persistidos como medidas diferentes.

## 4. Tela de acompanhamento do lote

O acompanhamento usa uma página completa, adequada a 100 documentos. Não prender o usuário em um modal nem exibir cem spinners simultâneos.

Composição proposta:

```text
Importação de documentos                          Voltar para Importações
100 arquivos no lote                             Recebido hoje às 14:30

Preparar e enviar → Receber documentos → Analisar → Organizar → Conferir

Analisando documentos
Barra: 62 de 100 arquivos com análise pronta
62 prontos · 4 em processamento · 31 aguardando · 3 precisam de atenção

Todos | Em processamento | Aguardando | Precisam de atenção | Prontos
Buscar arquivo...

Arquivo                  Situação                       Ação
TC-123.pdf               Pronto para revisão             Ver resultado
arquivo-02.pdf           Lendo páginas digitalizadas     Ver detalhes
aditivo.pdf              Não foi possível ler o PDF      Ver problema

Última atualização: 14:36:12     Tempo decorrido: 06:12
Você pode sair desta página. Os arquivos recebidos continuam sendo processados
enquanto o aplicativo local estiver em execução.
```

Os números do exemplo são ilustrativos. A quantidade de arquivos é diferente da quantidade de instrumentos documentais e da quantidade de equipamentos. Se um PDF contiver três instrumentos, a contagem do lote continua sendo um arquivo; segmentos aparecem no resultado.

Lista paginada ou com carregamento incremental, filtros e pesquisa. Detalhes de erro e evidências abrem sob demanda. Manter ordenação estável durante atualizações para evitar que o item sob o ponteiro mude de posição.

## 5. Progress bar e significado dos números

**Não usar uma porcentagem única inventada para upload, OCR, IA e correlação.** Cada etapa tem seu progresso verificável e seu denominador. O indicador de etapas mostra a fase do lote, não estimativa de tempo restante.

| Etapa | Indicador | Condição para concluir |
| --- | --- | --- |
| Preparar arquivos | Entradas/pacotes preparados, quando o total for conhecido | Manifesto e pacotes prontos; sem avanço artificial pelo tempo |
| Enviar pacotes | Pacotes confirmados / pacotes previstos | Pacotes recebidos sem erro de transporte |
| Receber documentos | PDFs extraídos, validados e persistidos / PDFs previstos no manifesto | Descompactação e persistência completas ou exclusão explícita dos itens pendentes |
| Analisar documentos | Arquivos com análise pronta / arquivos admitidos no processamento | Todos analisados ou falhas explicitamente resolvidas/aceitas como pendência |
| Relacionar documentos | Grupos/unidades de correlação processados / total fixado para aquela execução, quando disponível | Resultado de correlação persistido; exibir atividade indeterminada se o total não for conhecido |
| Preparar revisão | Atividade indeterminada ou unidades persistidas com total conhecido | Grupos, candidatos e pendências salvos e disponíveis à revisão |

Na análise, o percentual determinado é `arquivos com análise pronta / arquivos admitidos × 100`. Arquivos em falha não entram no numerador de sucesso. Não exibir 100% de sucesso quando 97 arquivos foram lidos e três falharam. Mostrar **Processamento encerrado com pendências: 97 de 100 arquivos analisados** e a revisão parcial, se aceita pela pessoa.

Duplicata com análise válida em cache conta como pronta e recebe **Análise reaproveitada**. Arquivo com apenas OCR parcial não conta como análise completa; pode ser encerrado como pendência explícita. Nova tentativa ou nova versão de análise inicia uma execução identificada, sem fingir que o progresso anterior nunca existiu.

Pode haver animação discreta na etapa ativa, mas ela não altera contadores nem faz a barra avançar pelo tempo. Sem total confiável, mostrar atividade indeterminada e estado textual. Tempo decorrido é informativo. Não anunciar “faltam dois minutos” sem método validado de estimativa.

O backend fornece estado persistido, totais, contagens por situação, timestamps, revisão do estado e tarefas ativas. O frontend consulta periodicamente enquanto visível, reduz consultas em segundo plano e faz nova leitura ao voltar. Interromper polling não cancela o trabalho. Se falhar a consulta, preservar último estado com **Não foi possível atualizar o andamento**, sem declarar falha dos arquivos.

## 6. Textos dos estados e recuperação

| Situação | Texto e ação proposta |
| --- | --- |
| Arquivo recebido | Arquivo recebido — aguardando processamento |
| Leitura local | Buscando equipamentos, datas e cláusulas de manutenção |
| OCR | Lendo páginas digitalizadas |
| Etapa semântica necessária | Analisando o contexto dos trechos encontrados |
| Cache utilizado | Análise reaproveitada — arquivo já processado |
| IA não disponível | Este arquivo precisa de análise adicional. Configure a leitura ou confira manualmente. |
| PDF ilegível/protegido | Não foi possível ler este PDF. Veja o motivo ou substitua o arquivo. |
| Falha de upload | Este arquivo não foi recebido. Selecione-o novamente para reenviar. |
| Falha transitória de análise | O arquivo está salvo, mas a análise não terminou. Tentar novamente. |
| Correlação | Relacionando contratos, aditivos e documentos de manutenção |
| Sem relação segura | Documento sem vínculo identificado — conferir |
| Conclusão com falhas | Parte dos arquivos precisa de atenção. Você pode conferir os resultados disponíveis. |
| Resultados disponíveis | Documentos organizados para conferir |
| Primeira revisão | Conferir vínculos |
| Regras disponíveis | Conferir planejamento de manutenção |
| Sem marco inicial | Regra encontrada — falta confirmar a data de referência |
| Plano aprovado | Planejamento aprovado — consultar calendário |

Reenvio, nova tentativa de análise e substituição de arquivo são ações diferentes. Substituição preserva o original e registra nova versão. **Interromper processamento** exige semântica implementada: impedir novas etapas e marcar cancelamento cooperativo quando possível; uma chamada externa já iniciada pode continuar e ter custo. Não oferecer botão de pausa se o backend não puder cumpri-la.

Em falha parcial, **Conferir resultados disponíveis** deve informar quais documentos foram excluídos da correlação e que a chegada deles pode alterar a proposta. Não aprovar automaticamente um vínculo ou regra dependente de arquivo ausente.

## 7. Da organização à aprovação

Após processar, abrir revisão com resumo: arquivos recebidos, documentos identificados, grupos propostos, equipamentos candidatos e pendências. Usar títulos com contagens distintas, evitando chamar todo resultado de “equipamento cadastrado”.

Na revisão documental, apresentar árvore/grupos de um lado e arquivo/evidência do outro. Oferecer **Confirmar vínculo**, **Alterar vínculo**, **Deixar pendente** e acesso aos documentos sem grupo. Documentos aprovados levam à conferência dos equipamentos e do planejamento.

Na revisão de manutenção, mostrar por serviço: periodicidade, primeira ocorrência, marco e sua origem, cobertura, responsável e fonte. Destacar falta de instalação/aceite ou cláusula ambígua como ações concretas: **Informar data de referência**, **Consultar evidência** e **Resolver conflito**.

Antes de **Aprovar planejamento**, mostrar prévia das datas e impacto sobre regras já aprovadas. Essa ação é separada de confirmar vínculos e cadastrar equipamentos. Após aprovar, oferecer **Ver no calendário** e **Ver painel de manutenção**. Pendências permanecem acessíveis.

## 8. Mapa de alterações do frontend

Prefixo: `apps/crm/`. Estes nomes são propostos.

| Arquivo | Trabalho previsto |
| --- | --- |
| `src/contract-copy.ts` | **Enviar documentos** nas duas entradas globais, com descrições coerentes; preservar textos singulares onde a ação continuar individual |
| Novo `src/document-import-copy.ts` | Copy de lote, ajuda visível, pluralização, estados e recuperação centralizadas |
| `src/App.tsx` e `src/routes.ts` | Trocar o destino da ação principal, rotas persistentes e acesso à lista de importações |
| `src/ContractsPage.tsx` | Entrada de lote e acesso ao histórico, mantendo cadastro/documentos contextuais |
| Novo `src/DocumentImportsPage.tsx` | Lista de lotes e retomada do acompanhamento |
| Novo `src/DocumentImportDialog.tsx` | Diálogo compartilhado: tipos aceitos, ajuda visível, seleção múltipla, validação e confirmação |
| Novo `src/DocumentImportPage.tsx` | Acompanhamento e recuperação do lote, recebendo o controlador de upload após a confirmação |
| Novo `src/useDocumentUpload.ts` | Coordenar preparação e upload de pacotes, limitar concorrência e recuperar confirmações sem depender da montagem do diálogo |
| Novos `src/document-package.worker.ts` e `src/document-package.ts` | Manifesto, hashes e ZIP incremental, com limites e atividade fora da thread da interface |
| Novo `src/DocumentBatchProgress.tsx` | Indicador por fase, contagens reais e estados parciais |
| Novo `src/DocumentBatchFiles.tsx` | Lista com filtros, pesquisa, detalhes e ações por arquivo |
| Novo `src/useDocumentBatch.ts` | Polling com cancelamento da consulta, estado persistido e recuperação da conexão |
| Novo `src/document-progress.ts` | Funções puras de contagem/estado para evitar divergências na barra e nos textos |
| `src/document-types.ts` | Contrato de contagens, fase, cobertura, execução e atualização |
| `src/ContractImportProgress.tsx` | Preservar o componente individual; compartilhar apenas primitivas úteis, sem adaptá-lo por simples pluralização |
| `src/AssetDialog.tsx` | Manter upload individual e textos coerentes; não ligar o botão global de lote ao `files[0]` |
| `src/DocumentReviewPage.tsx`, `src/MaintenancePlanReview.tsx` e `src/DocumentEvidence.tsx` | Implementar revisão com evidência e ações de pendência/aprovação |
| `src/styles.css` | Layout responsivo, tabelas/listas, progresso e estados com tokens existentes |

O backend deve fornecer os fatos necessários para esses componentes. Não criar indicadores que dependam de adivinhar progresso por quantidade de segundos ou de termos internos como tokens, leases ou SQL.

## 9. Acessibilidade, dispositivos e validação

- Operar seleção, remoção, filtros e ações pelo teclado; oferecer alternativa ao arraste.
- `role=progressbar` com nome e valor real quando determinado; sem `aria-valuenow` quando indeterminado. `aria-valuetext` explica a unidade e as pendências.
- Anunciar mudanças relevantes em região de status sem ler cem linhas ou o cronômetro a cada atualização.
- Cor não é o único sinal de falha/conclusão; usar texto e ícone. Respeitar movimento reduzido.
- Não roubar foco ao chegar uma resposta; mover foco só após ação explícita ou navegação prevista.
- Em telas pequenas, empilhar revisão e evidência, preservar ações e conter rolagem da lista. Testar nomes longos e 100 itens.

Testes propostos: seleção/arraste de múltiplos arquivos; preparação de pacotes sem travar a interface; falha de descompactação; reenvio de pacote; pluralização com 0/1/100; rejeição parcial; confirmações fora de ordem; hash duplicado; análise parcial; três falhas em cem sem 100% de sucesso; cache; consulta interrompida; retorno à página; reinício do servidor; processamento sem IA; revisão parcial e aprovação separada.

Acrescentar `tests/document-progress.test.ts` para semântica de estados/contagens e `tests/document-batch-ui.test.ts` para renderização acessível dos componentes. Manter testes de `ContractImportProgress` do fluxo individual. Conferir visualmente as telas no navegador e usar testes de integração para upload/polling; renderização estática não demonstra retomada ou envio real.

## 10. Critério para aprovação desta experiência

A pessoa deve entender, sem conhecer o backend: o que enviar; o que foi recebido; o que está em processamento; quais arquivos exigem atenção; o que pode fazer enquanto espera; o que foi apenas sugerido; e qual ação coloca as previsões no calendário. Aprovar esta especificação não significa que essas telas já existem.
