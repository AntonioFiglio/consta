# Validação da apresentação — 07/11/2026

## Estado atual; notas anteriores são histórico

Main de5e84f integrada, sem edição do CRM nesta rodada. Pitch21estados, capa no mesmo documento, demo nativa e extração preparada, cinco registros/previsões comprovados em API/SQLite RAM. Demo automática8→9→10 internos; câmera11, etiqueta12, mapa13/14, fluxo15/16, Smart Agenda17, atendimento18, financeiro19 e equipe20. Smart Agenda é uma proposta frontend com20tarefas sintéticas, capacidade/janela explícitas e confirmação humana. O iceberg distingue cirurgia adiada em Paranaguá2025 de encaminhamentos e despesa dos demais casos; BLE tem analogia editorial AirTag e compatibilidade eletromagnética a avaliar com Engenharia Clínica. Os relatos abaixo preservam etapas anteriores; não usar seus índices como contrato da versão atual.

A suíte de estados/navegação e a da demo passaram após integrar as três melhorias. QA integrado dos agentes aprovou iceberg e agenda em1920×1080,1280×720,1024×768; agenda com antecipação emumtoque, cancelamento, retorno e reduzido; mensagens BLE sem sobreposição. Fala limpa atualizada e clipboard com leitura de retorno conferida. O ensaio oral físico/projetor permanece distinto destes testes.


## Escopo

Apresentação HTML offline, capa integrada, apoio BLE, documentação das evidências e conceito virtual da tag. O CRM de Antonio foi inspecionado em leitura no commit `27fd27a`; sua branch e seus arquivos não foram alterados.

## Verificações reproduzíveis

Execute na raiz do repositório, usando uma instalação local já disponível de Playwright/WebKit:

```sh
export CONSTA_PLAYWRIGHT_MODULE=/caminho/para/node_modules/playwright
export CONSTA_WEBKIT_EXECUTABLE=/caminho/para/webkit/pw_run.sh
node scripts/verificar_pitch.cjs
node scripts/verificar_motion_pitch.cjs
node scripts/verificar_apoio_pitch.cjs
python3 pitch/assets/tag/verificar_geometria.py
python3 scripts/verificar_repositorio.py
git diff --check
```

`CONSTA_QA_OUTPUT` pode guardar capturas da suíte principal. Os scripts de motion e apoio guardam evidências em `/tmp/consta-temporal-qa` e `/tmp/consta-support-qa`. As dependências são de verificação, não da apresentação.

## Cobertura

- WebKit headless por `file://`, sem rede, em 1920×1080, 1280×720 e 1024×768: estados, ordem narrativa, retorno e salto, assets, ausência de overflow horizontal, identificação de simulação, teclas, foco, repetição e movimento reduzido.
- Inversão do mapa durante o movimento: posição preservada na troca de direção e retorno ao setor esperado. Revisão direcionada também exercitou várias inversões consecutivas.
- Transições de avanço em 1280×720: capturas e interseção geométrica entre fio e retângulos de texto em amostras de 120, 360, 760 e 1600 ms. Amostragem não é prova de ausência de defeitos em todos os frames.
- Capa e telas BLE em 1920×1080 e 1280×720: navegação, carregamento offline e inspeção visual. Os monogramas da equipe são composição tipográfica, sem fotos fictícias.
- Tag: contenção dos envelopes declarados, ausência de interseção entre eles e controles negativos de colisão/protrusão. PNG com canal alpha; SVG cotado e CAD conceitual preservados.

## Defeitos encontrados e corrigidos

O fio atravessava o título do ativo e varria textos durante transições. Âncoras passaram a usar medidas do conteúdo; o fio se recolhe antes de mudar de origem e se redesenha depois. A linha de ligação da tag termina antes do texto do gabinete.

A demonstração mostrava salvamento de lote com uma unidade ainda sem identificação. O exemplo passou a usar somente unidades identificadas, conforme a validação existente no CRM.

Voltar durante o deslocamento do marcador iniciava a rota reversa no destino e causava salto. A regressão reproduziu a falha; sua comparação de posição pausa o frame amostrado para que leituras de layout não acrescentem avanço natural de tempo entre as medidas. a implementação passou a capturar a posição renderizada e percorrer somente o trecho restante. A tentativa intermediária com `Animation.reverse()` ainda falhava em WebKit e foi substituída; os testes não foram enfraquecidos.

## Limites

Testes de navegador não validam operação clínica, hardware, precisão BLE, autonomia ou execução real da IA. Câmera e integração física não foram implementadas nesta tarefa. A fala é roteiro para três minutos, sem duração física comprovada; ensaiar com a caneta e o projetor. Fontes e contas estão no apoio; não há resultado próprio de economia de tempo ou dinheiro antes do ensaio/piloto.

## Continuação local com a main atualizada

O corpus foi publicado separadamente na main pelo PR7, commit2c4659b, após Antonio fe0e190. O checkout local parte dessa main e preserva o pitch como arquivos locais, conforme pedido. O CRM passou em `npm test` e `npm run build` depois de correções somente nos testes: Host via HTTP real e leitura da fixture V2 na persistência. Regras de autorização e persistência do servidor não foram alteradas.

O build foi aberto em WebKit com API e SQLite em memória, sem credenciais do provedor. Upload do PDF público real, leitura de volta com hash idêntico, listagem do contrato e acesso direto às rotas calendário/contratos/equipamentos passaram. Isso valida ingestão e navegação, sem demonstrar extração da LLM. O banco do usuário não foi usado.

O arquivo `apps/crm/.env.local` não está presente. Esta revisão não executou nem cronometrou extração real do provedor. Os tempos e o multiplicador de ganho permanecem em branco para ensaio equivalente e conferência.

## Adendo de legibilidade e colaboração com Opus

Matheus pediu baixa densidade: uma mensagem principal por avanço. A tabela principal foi reduzida a série/patrimônio e preserva as cinco identidades; modelos/TAGs/fabricante e evidências completas ficam no PDF e no gabarito. O visual principal do BLE é a imagem gerada da tag instalada. A gaveta original do Pedro foi recuperada; os outros componentes seguem a direção atual. O fio aparece só nas conexões úteis, com o ponto como guia.

Uma segunda sessão do Claude Code Opus5.5 medium revisou o texto e as alegações; ajustes deixaram explícitos a simulação da tela de cadastro, a origem manual dos dados visuais e a ausência de montagem física. A aprovação clínica não é presumida e permanece detalhada no apoio técnico. A imagem não é evidência de instalação.

Os critérios detalhados de medição das cinco frentes permanecem no apoio, sem repetir as letras pequenas no resumo principal. O adendo de custo/mínimo de peças será estudado antes de alterar o conceito mecânico.

## Revisão de fluxo e justificativa BLE

A auditoria do CRM separou o fluxo disponível (entrada do contrato → sugestões de campos → conferência/salvamento → inventário/agenda) das próximas integrações. O slide usa três etapas e duas funções transversais; removeu a promessa de execução com comprovante como capacidade pronta. A pesquisa FMUSP2023 aparece com 100% por setor nos testes externos, amostra e autoria; “beacons” virou “etiquetas Bluetooth”. A fala e o apoio distinguem baixo consumo/atualização automática de comprovação de ausência de interferência clínica.

As cenas12–14 foram abertas offline em WebKit nos tamanhos1920×1080 e1280×720, com inspeção das capturas12/13. O callout ganhou posicionamento absoluto para não ficar abaixo do painel. A suíte de estados/navegação completa passou antes da nova implementação de morfose. A nova morfose ainda exige sua própria rodada temporal.

## Fluxo da IA e telas reais — estado atual

O Opus5.5 escreveu o percurso dos beats13/14 antes de a sessão atingir a quota: tarefas inicialmente ativas; ponto sobre a curva SVG; riscos disparados pela posição do ponto; pausa na conferência; chegada à gestão. QA independente passou em WebKit offline nas três proporções para posição sobre o SVG, progresso semântico, retorno/interrupção e movimento reduzido. Relatório local: `/tmp/consta-opus-flow-quota-qa.md`.

A demo agora usa PNGs da interface real do CRM nos beats7/8/9. Capturas DPR2 (viewport lógico1920×1080, PNG3840×2160) substituem a tabela HTML. O script de captura verificou upload real, respostaHTTPpreparada, cinco ativos salvos em SQLiteRAM e campos de intervalo/data nulos. [Prova](demo/capture/capture-result.json). A simulação não demonstra precisão ou duração de IA externa.

A nova coreografia dessas telas ainda não foi produzida pelo Opus: Claude Code retornou limite de5horas com restabelecimento anunciado às9h20. Nenhum outro modelo foi apresentado como seu substituto. A versão atual usa `product-demo-static.css` com estados sem animação nova por avanço, aguardando a escolha de Matheus. Não há vídeo da solução nem SFX.

Após integrar as telas reais e o fluxo: `verificar_pitch.cjs` passou nos três viewports; verificação direcionada dos estados de captura/simulação/recursos offline passou em1280×720 e1024×768; verificador do repositório e diff-check passaram. A inspeção visual confirmou os campos ampliados e os cinco registros; regras ausentes não foram transformadas em previsões.

## Atualização visual da etiqueta adesiva

O beat10 passou às imagens conceituais sem berço/cinta, incluindo a cápsula isolada com liner. A âncora do ponto acompanha a etiqueta lateral e a vista comparativa fica à mesma altura. Inspeção visual em1280×720 e checagens de entrada/retorno, assets offline e texto sem dimensões antigas passaram nos três formatos. O apoio técnico distingue a proposta adesiva do CAD anterior com berço. Essa validação é de apresentação; não ensaia fixação física ou custo de fabricação.

## Cenário completo e correções finais

O documento ativo passou a ser `demo/synthetic-contract.txt`, inteiramente sintético, com todos os dados e regras explícitos. A API real foi exercitada com resposta preparada em SQLite RAM: cinco cadastros, zero linhas com pendência, plano e cobertura revisados pelo botão real “Confirmar e salvar” e cinco previsões em05/02/2027. Resultado em `demo/native/capture-result.json`. Não houve provedor externo, cronometragem real de IA, OCR físico ou BLE.

A escala da aplicação foi fixada para enquadrar cabeçalho, tabela e rodapé; o cursor usa uma única RAF com translate3d, sem zoom ou WAAPI no próprio cursor. A câmera móvel agora utiliza capturas da CapturePage real, com resposta e imagem sintéticas. O SVG antigo órfão que gerava triângulo preto foi removido. Uma conexão residual cruzava “Contrato” ao entrar na demo; essa linha local foi retirada, mantendo a morfose e as conexões narrativas fora da interface.

A suíte de navegação da demo voltou a passar após o cenário completo. Verificação independente das alegações confirmou atribuição externa para FMUSP/HC-UFG e identificou dois resíduos na fala (PDF versus TXT e link antigo de execução), ambos corrigidos. Fotos reais da equipe não foram fornecidas; os espaços4:5 mantêm iniciais. Último fetch mantém main emde5e84f, sem novo commit do mapa do Antonio.

## Fechamento de navegação e cenário financeiro

Após os ajustes da demo completa, `verificar_pitch.cjs` aprovou todos os estados e controles nos três viewports. `verificar_motion_pitch.cjs` aprovou avanço, retorno e interrupções sem interseções amostradas entre fio e texto nos três viewports. O slide16 depois recebeu o cenário financeiro Suzano/2026 e verificação direcionada própria. Nenhuma projeção é apresentada como economia observada ou ROI. As falas acompanham18estados, com170segundos de reserva e10de margem; não houve ensaio humano/projetor físico.

## Dois impactos e interpretação dos números

Sequência atual19estados. Novo16:operação/atendimento com13de42funcionando no início2025 e34de42disponíveis ao fim, resultado externo do HC-UFG. Financeiro17 diferencia referência de custo da economia própria. Time18. `verificar_pitch.cjs` aprovou os19estados e controles nos três viewports. Verificação direcionada dos dois impactos aprovou avanço/retorno, fio sem interseções amostradas, tema escuro da cena operacional, leitura das condições financeiras e ausência de erros. A fala limpa foi enviada ao clipboard e a leitura de retorno confirmou igualdade com o arquivo.

## Oclusão da gaveta — Astra medium

Apenas o SVG da gaveta e seletores drawer foram alterados. Cavidade com clipPath estático, documentos atrás da frente com opacidade constante, descida completa antes de fechar e retorno abrindo antes de elevar os documentos. Verificação independente WebKit offline nos três formatos confirmou clip, ordem de pintura, topo final abaixo da frente, interrupções e movimento reduzido. Inspeção visual de entrada/arquivado aprovada. Não houve medição deFPS. Evidências locais: `/tmp/consta-drawer-qa/` e `/tmp/consta-drawer-independent/`.

## Capa integrada e continuidade da tela cheia

Capa incluída como primeiro estado de `deck.html`, total20estados. `cover.html` redireciona para essa capa. Home, PageUp e link Capa usam o mesmo documento. Teste dedicado WebKit ativou fullscreen de fato e confirmou preservação de `fullscreenElement` e do objeto Document em avanço, retorno e botão Capa nos três formatos. Capturas em `/tmp/consta-cover-integrated-{1920,1280,1024}.png`. Suites de estados/navegação, demo automática e capa/apoio aprovadas após deslocar os índices. Falas renumeradas e clipboard atualizado com leitura de retorno confirmada. Nenhuma interface de CRM ou trabalho de outro integrante alterados nesta integração.

## Capa, especialidades, agenda e pacientes — atualização local

Capa: “Gestão de ativos e manutenção preventiva hospitalar.” Nicolas Braga: engenheiro de dados, conforme informação da equipe. Especialidades ampliadas para32px no palco1920. Ordem: CRM9–11 → Smart Agenda12 → celular13, com repetição da captura até avançar. Contrato fictício de20equipamentos se transforma na agenda proposta; antecipação e movimento reduzido preservados. Fala reorganizada na mesma ordem.

Impacto assistencial: acrescentado caso separado do HRSM/DF, mais de200pacientes atendidos até julho2025, com fonte primária IgesDF. Integração de serviços e novo radiologista são o mecanismo relatado; não é consequência do13→34 do HC-UFG nem resultado do Consta. Não foi calculada conversão de aparelhos em pacientes.

QA WebKit: sequência de cenas/demo, saída antecipada, cancelamento de timers e movimento reduzido aprovados após reordenação. Enquadramento dos papéis/fotos e especialidades verificado em três viewports; scripts de referências locais e diff sem erros. Testes de interface não comprovam segurança clínica, extração externa da IA ou impacto do Consta.

### Revisão posterior do cenário assistencial

O usuário pediu conversão dos aparelhos em capacidade. Substituído o caso independente do HRSM por cenário explicitamente hipotético:21aparelhos recuperados ×1exame adicional por aparelho/dia ×20dias úteis =420vagas potenciais/mês. SciMath conferiu420. A pesquisa não encontrou média observada por aparelho;1e20 não são médias publicadas. Não usar3200pacientes, pacientes perdidos ou produção clínica medida. Foram removidos os rótulos superiores redundantes solicitados; a fonte HC-UFG continua no rodapé e a natureza hipotética consta no painel e na fala. Clipboard da fala atualizado e conferido por leitura de retorno.

### Referência de produção real — revisão Berrini/IMED

Substituído o cenário hipotético420 por volume publicado do HMB, IMED24/03/2026: cerca70exames/dia, até2milprocedimentos/mês em três salas. Fala e fonte vinculadas no painel. Não multiplicar produção do serviço por endoscópios recuperados em outro hospital. Berrini informa duração, não produtividade; nenhuma fonteG1 encontrada resolveu o denominador. Referências locais e diff verificados.

## Rótulos de pitch e fontes no rodapé

Rótulos editoriais padronizados como Dor, Solução, Demonstração, Impacto e Time. As chamadas iniciais de notícias preservam os veículos. Citações documentais, FMUSP eIMED deslocadas ao rodapé, sem retirar identificação dos estudos. Âncora do ponto vermelho do iceberg agora pertence ao diagrama, centrada no fim da conexão SVG, independente da altura da lista. QA WebKit em1920×1080,1280×720 e1024×768 conferiu alinhamento do centro com tolerância inferior a1pixel e ausência de errosJS; capturas inspecionadas. Referências locais e diff sem erros. Ordem e conteúdo da fala preservados.

## Notícias em uma única tela

Três notícias reveladas juntas no primeiro estado de notícias. Navegação próxima vai direto ao custo; anterior retorna à tela completa. Contador exibe20telas e fala foi unificada e renumerada. Índice interno legado2 preservado para links antigos. QA WebKit confirmou dois cartões laterais ativos, próxima/anterior corretos e contador02/20. Verificação de repositório e diff aprovadas.

## Cortes pontuais e continuidade — após restauração

Preservada a identidade anterior. Removidos da navegação celular, custo75mil, logo isolado e exemplos contratuais da gaveta. Gaveta do gestor em uma tela com loopCSS interrompido ao sair e versão estática para movimento reduzido. Gestor em vermelho no iceberg. Logo usa os contornos originais da DMMono: bolinha→fio→CONSTA→percurso da IA, com etapas riscadas, revisão preenchida e chegada à gestão automaticamente, sem segundo avanço. QA WebKit aprovou esses comportamentos, conclusão de quatro etapas, pausa no check, saída e movimento reduzido em três viewports.

Impactos: verde, textos reduzidos, painel financeiro direito removido.2mil é referência de procedimentos em outro hospital, não pacientes restaurados pelo Consta.500mil é cenário bruto de economia condicionado a dispensar12mensalidades, não aumento de receita ou resultado medido. CTA depois do time e Business depois do CTA. QR gerado e decodificado comohttps://consta.vercel.app; destino respondeu451/DEPLOYMENT_DISABLED. Nenhum deploy alterado. Faixas anuais propostas6/12/24mil, não preços contratados. Repositório e diff sem erros.

## Verificação da entrega para integração

Clone limpo baseado na develop remota c97be02, com alterações locais selecionadas sem bancos, cópias de sincronização ou artefatos de build.93testes do CRM aprovados sem skips; build/TypeScript aprovados;3testes da preparação do corpus aprovados. Navegação em ordem final, retorno do mapa, caneta/foco/repetição, recursos offline, demo automática e apoio BLE aprovados no WebKit. QA adicional aprovou logo+fluxo automático, gaveta em looping, movimento reduzido e time→CTA→Business em três viewports. QR decodificado para o endereço solicitado. Publicação autorizada explicitamente por Matheus após os ajustes.

## Correção da entrada automática na demo

Após mover o fluxo da IA antes do CRM, o salto de índice16→8 recebia a classe snap. O controlador da demo interpretava isso como pedido de exibir o estado final estático, sem emitir conclusão ou avançar. O mesmo ocorria em abertura direta por#b=8. A entrada agora inicia o playback mesmo quando a transição entre slides é instantânea; apenas movimento reduzido ou finishCurrent continuam estáticos. Regressão reproduziu running=false antes da correção e passou depois sem restart manual. A suíte cobre entrada natural, link direto, avanço automático, antecipação e cancelamento.


## Impactos combinados, Business e continuidade — revisão final

- Reprodução antes da correção: avanço normal 1→4, 16→8 e 11→13 apresentava fase idle e reposicionamento imediato, por confundir distância entre índices legados com distância entre telas visíveis. A entrada do logo também assentava o ponto antes da viagem.
- Correção: adjacência pela rota visível; concatenar chegada e morfose; não assentar o fluxo ao antecipar avanço; passagem do guia para o marcador do mapa e âncora real do CTA.
- `scripts/verificar_continuidade_pitch.cjs`: avanço/retorno de toda a sequência, ausência de salto no primeiro quadro, interrupção do logo e alias do impacto retirado; aprovado nos três viewports. Teste de geometria complementar confere chegada e interrupção do mapa.
- `scripts/verificar_demo_pitch.cjs`: autoplay, avanço por tecla, cancelamento e movimento reduzido aprovados.
- `scripts/verificar_pitch.cjs`: estados, navegação, assets offline, simulação e modo reduzido aprovados nos três viewports.
- Impacto assistencial: produção externa publicada, não pacientes únicos nem benefício medido do Consta. Financeiro: cenário bruto condicional, não faturamento. Business: proposta comercial, sem custo/margem de hardware validados.

- `scripts/verificar_motion_pitch.cjs`: sem interseções amostradas entre fios e textos/controles nas transições de avanço, retorno e interrupção, nas três resoluções.
- Teste adicional encontrou endpoint do mapa anterior ao reenquadramento da câmera; a chegada passou a acompanhar o marcador renderizado durante a entrada. Conferência de posição final e antecipação de avanço/retorno aprovada nos três viewports.
- Fala atualizada no clipboard com leitura de retorno idêntica.
