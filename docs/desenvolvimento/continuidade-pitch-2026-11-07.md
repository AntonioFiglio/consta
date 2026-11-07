## Atualização atual — impactos, Business e continuidade

Objetivo ativo solicitado por Matheus: corrigir a continuidade da bolinha em toda a apresentação, unir impactos e revisar monetização; manter a publicação já autorizada em develop e main.

- [x] Impacto único, atendimento primeiro e economia potencial depois, verde; retirar 13/42 → 34/42 da navegação e do palco.
- [x] Até 2 mil atendimentos de endoscopia/mês como produção externa do HMB; aproximadamente R$ 500 mil/ano como cenário de custos extras dispensados. Fontes e condições no rodapé e na fala, sem chamar economia de faturamento.
- [x] Business: R$ 20 mil / R$ 60 mil / R$ 180 mil por ano, até 100 / 500 / 2.000 equipamentos; 20 tags na contratação inicial, extras/receptores/implantação separados. Pesquisa primária, incluindo contrapontos mais baratos, em [preços](../referencias/precos-business-consta.md).
- [x] Corrigir a navegação para medir vizinhança pelas telas visíveis, não pelos índices antigos; manter chegada da bolinha antes da morfose, evitar salto ao interromper o fluxo e dar continuidade ao CTA.
- [x] Conferir a passagem do guia global para o marcador do mapa, sem duplicar ou deslocar o ponto.
- [x] Testes de navegação, autoplay da demo e continuidade em avanço/retorno nas três resoluções aprovados. Conferência temporal de interseções aprovada. Publicação segue feature → develop → main, autorizada e registrada nos PRs.

Sequência atual: 16 telas, impacto 13, time 14, CTA 15 e Business 16. Os relatos abaixo são históricos; não reintroduzir estados removidos com base neles. A especialidade local de Nicolas foi preservada como engenheiro de software nesta edição, sem sobrescrever a mudança existente no workspace.

> Atualização de autorização: em07/11/2026, Matheus pediu explicitamente commit e integração do trabalho em develop e main após as verificações. As orientações anteriores de manter apenas local são históricas para esta entrega. Preservar alterações paralelas do CRM.

## Mais recente: iceberg, Smart Agenda e explicação BLE

Pitch21estados. Iceberg substituiu somente a cadeia de consequências no índice4; preçoR75 ficaoculto nesse estado. Cirurgias adiadas têm fonte específica JB Litoral21/12/2025 com nota Sesa/PR, Paranaguá/autoclaves; não atribuir a outros casos. Smart Agenda no índice17 propõe distribuir20preventivas em4por dia, janela autorizada sintética01–05/02/2027/capacidadehipotética, confirmaçãoEngClin. NãoalterouCRMnemcasoAPIde5ativos; care18finance19team20. Markers demos/camera/mapa/fluxo anteriores preservados. NovoJS constaSmartAgenda respeita nextfinish+advance,retorno/reduzido. BLEtitlemantémabreviação, AirTaganalogiaeditorialsomente, baixo consumo+EMIaavaliarEngClin;nãogarantirzeroEMI. Fontes novas em `docs/referencias/ble-e-impacto-paciente-palco.md`. Falasrenumeradas, orçamento170+10=180 (planejado), clipboardatualizadoeleituraderetornoconferida.

## Capa integrada como primeiro slide

`pitch/deck.html` contém a capa no primeiro estado(índice0), total20estados. Todos os antigos índices/data-on/data-beat foram deslocados conjuntamente em CSS, controlador e componentes; demo agora8→9→10 internos, câmera11, mapa13/14, fluxo15/16, operação17, financeiro18, equipe19. Home, PageUp e botão Capa navegam na mesma página; cover.html é redirecionamento compatível. Não voltar a usar uma página de capa independente, pois isso quebra continuidade de tela cheia. Falas renumeradas sem alterar o conteúdo nem o orçamento de170+10segundos; capa de espera sem leitura obrigatória. Preservação do documento e fullscreen efetivamente exercitada/aprovada em WebKit nas três resoluções, além das suítes de estados, demo e apoio. Fala renumerada copiada ao clipboard e retorno conferido.

## Gaveta: oclusão física corrigida

GPT-6 Astra medium corrigiu somente SVG da gaveta em `pitch/deck.html` e seletores `.drawer-*` em `pitch/palco.css`. Papéis descem por cavidade recortada e ficam atrás da frente, com opacidade constante. Frente fecha depois; reversão abre antes de levantar documentos. Identidade original preservada. QA de movimento, oclusão, interrupções e modo reduzido aprovado em WebKit offline nos três formatos; não há medição deFPS. Não alterar falas/clipboard por essa correção visual.

## Clareza do caso HC-UFG no palco

O slide16 agora explicita13de42funcionavam no início2025 e34de42disponíveis ao final após trabalho da manutenção. São equipamentos para exames de endoscopia, não pacientes ou resultado do Consta. À direita: quando fazer (agenda), quem acionar (empresa/contato), cobertura (contrato do ativo). Ação técnica continua com a equipe. Falas17/18 explicam o caso e distinguem os dois valores financeiros; texto de palco já copiado/verificado no clipboard. QA de estados/navegação e transições direcionadas dos dois impactos aprovado nas três resoluções. Orçamento atualizado170+10=180, sem ensaio humano prometido.

## Última revisão: impactos, fala e clipboard

Sequência19estados: novo16 operação/atendimento (HC-UFG externo), financeiro17 com rótulo custo de referência, time18. Cadastro/busca/manutenção/atendimento/dinheiro têm métricas distintas. R$75mil/mêsNatal e ≈R$500mil/anoSuzano não são economiaConsta, não são total e não se somam. Fala revisada em `pitch/fala.md` com tabela de interpretação, fórmulas e limites; `pitch/fala-palco.txt` contém só a fala para copiar. Reserva170+10=180 (SciMath), ainda sujeita a ensaio humano. Texto final de `pitch/fala-palco.txt` copiado para o clipboard por pedido expresso de Matheus; leitura de retorno da API confirmou igualdade integral. Prova atual:5cadastros+5previsõesAPIrealcomextracaopreparada; sembenchmarkde10segundosouROI medido. Pesquisa em `docs/referencias/impactos-pitch-sintese.md`.

## Ajuste mais recente: anual e foto do Nicolas

Impacto16 destaca aproximadamente R$500mil/ano como equivalência arredondada de doze mensalidades (exato R$494.291,40); R$41.190,95/mês aparece menor abaixo. A condição de mensalidades adicionais efetivamente dispensadas e custos permanece. Nicolas foi trocado pela foto indicada `Downloads/A6702062-1.png`, com enquadramento de rosto por CSS; a indicação anterior A6702092 foi substituída. Nenhum original foi alterado.

## Fotos da equipe — atualização

Fotografias fornecidas por Matheus integradas ao beat17 em `pitch/assets/team/`, com enquadramento4:5 e aproximação via CSS, sem alterar os arquivos originais. Nicolas:PNGDownloadsA6702092-1; Antonio:A6702068; Matheus:A6702086; Pedro:últimafotoPNG enviada com fundo laranja, substituindo a primeira indicação. `team-portraits.css` controla aproximação/posição por pessoa; futuras trocas são simples. QAWebKit offline aprovou carregamento/proporção e ausência de erros nos três viewports. Não publicar/commitar sem novo pedido.

## Direção final do impacto financeiro

O beat16 foi refeito com potencial financeiro condicional: referência primária do Contrato042/2026-C, Hospital e Maternidade de Suzano/INTS, p.12, R$41.190,95/mês pela locação de um tomógrafo (RH separado). O palco mostra aproximadamente R$41mil por uma mensalidade inteira adicional efetivamente dispensada; não é economia observada, custo por hora de parada ou redução automática do contrato. Fonte, aviso/rescisão, custos, sensibilidade e causalidade em `docs/referencias/cenario-financeiro-pitch.md` e `pitch/metodo.html#financeiro-cenario`. HC-UFG13→34 permanece como precedente no apoio. A API com cinco cadastros/previsões é prova de funcionamento separada do cenário econômico. Não declarar previsão10s/ROI ou preventiva eliminando falhas.

## Escopo urgente mais recente: cenário completo

Matheus exige zero campos ou regras pendentes na demonstração. Para cumprir sem forjar o contrato público do HC, a demo ativa foi migrada para `pitch/demo/synthetic-contract.txt` (HTML/Markdown disponíveis), contrato inteiramente sintético com cinco equipamentos e todos os dados explícitos. Interface real e resposta preparada continuam identificadas; não transformar coreografia em tempo real de IA. A pessoa confirma o cadastro/plano pelo botão real. A execução isolada em `pitch/demo/native/capture-result.json` comprovou cinco cadastros completos, zero linhas com pendência, plano/cobertura revisados pelo botão real e cinco previsões para05/02/2027. O caso público HC permanece separado, sem campos inventados.

## Atualização desta rodada

- Main local `de5e84f`; último fetch ainda sem commit novo do Antonio. Sem push/commit do pitch.
- Demo nativa com dados documentados enriquecidos (empresa, TAG e instituto em observações); campos sem fonte continuam sinalizados. Execução API/SQLite RAM com resposta preparada, sem IA externa ou benchmark de dez segundos.
- Celular com página do Nicolas; captura/leitura simuladas, confirmação humana. Não afirmar QR ou acesso entre dispositivos validado.
- 100% por setor do HC ampliado; novo slide de impacto13→34 HC-UFG2025 externo, separado do ensaio de cinco cadastros. Método em `docs/referencias/impacto-pitch-mensuravel.md`.
- Pesquisa adicional dos campeões concluída em `docs/referencias/auditoria-storytelling-campeoes-2026-11-07.md`; aplicadas frases de usuário/diferencial, ponte CRM→BLE e convite mensurável, sem reordenar slides. Dor→solução→demo→viabilidade/impacto→time/convite é recomendação, não regulamento confirmado.

# Memória de continuidade — Consta, pitch e demonstração

Registro explícito solicitado por Matheus em 07/11/2026. Ler ao retomar esta frente. Este arquivo registra decisões/tarefas e evidências; não garante vitória nem transforma pendência em implementação. Atualizações desta continuação ficam locais, sem commit/push, até novo pedido de Matheus.

## Direção vigente — pedidos mais recentes

Matheus autorizou **GPT-6 Astra medium para tudo que envolver design**, incluindo esta rodada de motion, após a quota do Opus. Root comunicou essa execução; não manter a quota como bloqueio da entrega atual nem atribuir o código novo ao Opus. A morfose original continua de autoria Opus; nova demo nativa e mapa são trabalho do Astra com integração/QA do responsável.

- Main local sincronizada para **de5e84f**, mergePR8 do Nicolas (foto/OCR). Backup das pendências e do banco anterior em `/tmp/consta-before-main-sync-20261107-074310`; não houve descarte das alterações locais.
- Build/TypeScript e75testes passaram. Novo código de câmera existe, mas QR e fluxo entre outro celular/servidor não estão demonstrados. Há achados de OCR/concorrência no relatório de auditoria; não afirmar leitura sem erros.
- Demo deve ter **zero loading**, cursor sem flicker e avanço que conclui e troca a etapa no mesmo toque; demo7→8→9 automática, parando no inventário. A tela curta de foto de patrimônio está inserida após o inventário, com capturas da CapturePage e dados sintéticos.
- A sequência atual tem18estados com câmera no índice10 e impacto no16; tag/mapa/fluxo/time serão deslocados pelo responsável de forma conjunta. Falas devem acompanhar essa sequência e as ações autônomas, com orçamento total planejado de180segundos.
- Check: a bolinha entra no centro, preenche o círculo/✓ de laranja e só então sai para gestão. O ponto não deve ficar pairando acima de um check que permanece incompleto.
- Retratos da equipe em proporção4:5, com iniciais provisórias até Matheus enviar as fotos.
- Mapa interno com linguagem de navegação, planta fictícia, pan/zoom, setores e origem/horário. Não usar a planta interna real do hospital. O mapa do Antonio entrará após commit informado e verificado.

## Decisões e fatos a preservar

- Pitch de três minutos, para palco/projetor. Identidade original do Pedro: CONSTA., DM Mono/Inter, preto, branco, laranja e vermelho. Uma mensagem principal por avanço; explicações completas, fontes e método ficam no apoio.
- Arco: notícias/dor → consequência financeira → informação desconectada → Consta/cadastro assistido → localização → benefícios/validação → time. Preservar a gaveta original, recuperada de `00d10db`; não restaurar o restante do design antigo.
- Matheus escolheu **morfose literal**: uma linha acompanha a bolinha pelas laterais e se deforma nas letras CONSTA; o ponto termina na posição exata da marca. A opção de apenas desenhar/revelar contornos foi apresentada e não foi escolhida. Preservar legibilidade, continuidade ao interromper/voltar e movimento reduzido.
- Tasks novas devem andar em paralelo, com agentes separados e propriedade de arquivos. Matheus pediu Claude Code **Opus 5.5 medium** junto ao responsável até a revisão final; bypass autorizado somente para essas sessões. Não alterar permissões globais nem confundir um agente Codex com Claude.
- Corpus atualizado foi publicado primeiro na **main**, PR #7, commit `2c4659b`, após Antonio `fe0e190`. Publicação exclusiva de documentos/índices. Originais em Downloads preservados; cópias públicas com tratamento de CPFs-alvo, sem plantas internas/raw/pacotes duplicados. Há manifesto de inclusões/exclusões.
- Checkout local: `feature/pitch-local-atualizado`, baseado na main, com pitch e pesquisas locais preservados e pendências anteriores intactas. Não publicar essas mudanças por inferência.
- Caso real para testar cadastro: `data/referencias/casos/hcfmusp-05-2026/`. Contrato HCFMUSP 05/2026, cinco autoclaves individualizadas na página 2; gabarito conferido visualmente e original comparado ao PNCP. Não há periodicidade preventiva explícita; vigência depende do termo de início. Não inventar calendário. Planilhas heurísticas não são gabarito.
- Fonte forte de localização: dissertação Silvio Tacla Alves Barbosa, FMUSP, 2023, Centro Cirúrgico do Instituto Central do HCFMUSP. Resultado externo: setor correto em 90 medições com os mesmos 30 beacons reutilizados em 3 setores; acurácia por sala de 60%–76,67% limitada. Confirmar fonte/páginas ao editar o slide. Não atribuir 100% ao Consta nem prometer precisão universal.
- Vocabulário de palco: **“etiquetas Bluetooth”**, não “beacons”; **“receptores fixos”**, com explicação simples. Dizer “100% de acerto ao identificar o setor nos testes do HC”, com denominador e atribuição. Detalhes por sala e de rádio ficam acessíveis no apoio.
- Tag atual é imagem/CAD conceituais, sem montagem física validada. Matheus quer mínimo de peças: estudar cápsula adesiva de verso plano, liner destacável e acesso frontal/lateral à pilha, sem berço externo. Custos em `docs/referencias/custo-ble-minimo-2026-11-07.md` são referências de bancada/itens, não orçamento de implantação. Não presumir troca de roteadores: receptores BLE podem usar a LAN existente, com firmware e integração a desenvolver.

## Tarefas e condições de conclusão

| ID | Trabalho | Situação / pronto quando |
| --- | --- | --- |
| FLUXO | Auditar o código do CRM e reordenar as cinco frentes em torno da automação | Conferir código atual, mapear captura/entrada → extração → campos organizados → conferência/confirmar → inventário/agenda → gestão. Distinguir digitação eliminada de decisão/conferência ainda humana. Não usar “100% da operação automatizada” sem prova. Localização e contratos podem ser funções transversais, não etapas sequenciais. |
| CAMERA | Captura de patrimônio pela câmera do celular, desenvolvida pelo Nicolas | **Em desenvolvimento, informado por Matheus.** Depois do commit, inspecionar implementação e testar fluxo real; não mostrar como pronta antes disso. Foto/QR de entrada não substitui BLE operacional. Conferir patrimônio versus série e falhas de leitura. |
| MAPA | Novo mapa do hospital, desenvolvido pelo Antonio | **Em desenvolvimento, informado por Matheus.** Atualizar pitch somente após entrega verificável. Se o rádio não estiver integrado, mapa/rastreamento continuam marcados como simulados. Não publicar topologia interna real por acidente. |
| TEMPO | Baseline manual e medição do Consta por equipamento | Pesquisa brasileira existente não encontrou média recente comparável. Não inventar minutos nem transferir contagem RFID/OPME para cadastro. Usar o mesmo PDF/campos, medir envio/IA/conferência/correções/salvamento; contar equipamentos aceitos, preservar erros e retrabalho, registrar lote e condições. Protocolo em `pitch/experimento-cadastro.md`; CSV vazio preparado. |
| DINHEIRO | Converter tempo medido em impacto financeiro defensável | Usar custo-hora efetivo informado pelo hospital e volume observado; distinguir capacidade de trabalho liberada de redução de desembolso/lucro. Registrar custo da IA/infra/operação quando conhecido. Menor tempo de cadastro não prova, sozinho, menos horas de máquina parada. Downtime exige sua própria linha causal e medição. |
| EVIDENCIA | Destacar o precedente BLE do próprio HC com linguagem fácil | 100% por setor nos testes externos, denominador e fonte legíveis, sem extrapolar para o produto. Limitação por sala no apoio. Resultado e mecanismo precisam ser compreensíveis sem jargão. |
| MORPH | Linha lateral acompanhando o ponto, morfose literal do logo | Opção escolhida por Matheus. Exigir glifos fiéis à marca, nenhum texto cruzado, estados reversíveis e QA temporal; não chamar simples fade/reveal de morfose literal. |
| DENSIDADE | Revisar cada slide para projetor, sem excesso de informação | Uma hierarquia clara, conteúdo essencial grande; fonte/método no apoio. Preservar contexto necessário sem empilhar avisos, métricas e campos numa única tela. |
| DEMO-FINAL | Telas reais do CRM com motion HTML dentro do pitch, SEM vídeo | **Pedido mais recente substitui a exportação de vídeo; CLIdeo AI continua solicitado para orientar o motion nativo.** Capturar interface real com dados e processamento simulados, identificados. Mostrar upload → campos preenchidos → conferência → inventário; agenda só com regra válida. Captura usa API/SQLite em memória e HTTP mock V2, sem provedor real nem banco do usuário. Integrar câmera/mapa quando chegarem os commits. |

## Demo no pitch: definição atual de entrega

- **Sem vídeo da solução.** Não criar MP4 nem deixar a entrega atual aguardando montagem de vídeo. Usar a skill CLIdeo AI na direção do motion nativo, conforme solicitado. Usar telas reais do CRM com aproximações, cursor/indicação de ação e transições dentro do próprio HTML do pitch.
- Matheus confirmou que dados e processamento podem ser simulados. Interface real funcionando com resposta de extração simulada não equivale a IA real nem integração BLE física; manter uma indicação discreta e legível de demonstração simulada.
- Sequência central: plataforma geral → enviar documento → preenchimento da tela real → conferir/salvar → inventário. Calendário depende de regra/marco; não gerar periodicidade das cinco autoclaves quando o contrato não a informa.
- A captura pode usar mock HTTP V2 derivado do gabarito público, com servidor e SQLite em memória, isolados do banco/configurações do usuário. Registrar prova da passagem pelas rotas reais e dos ativos salvos; não preencher tempos/R$ de ganho com a execução simulada.
- Câmera e mapa serão incorporados após Matheus informar os commits; ler o código, sincronizar sem perder alterações locais e testar antes de apresentá-los como implementados. A entrega atual usa o fluxo disponível e identifica localização simulada.
- A presença de protótipo funcional será afirmada com as verificações do sistema. Não alegar regra pública exigindo código/demo ao vivo: isso não foi localizado no regulamento oficial.
- QR para experimentar só quando houver URL de demonstração utilizável e verificada. Não usar localhost, link de repositório ou URL inventada como acesso para a plateia.
- Validar navegação, telas offline, transições, legibilidade e versão atual do CRM. Ensaio físico com caneta/projetor e duração da fala permanecem verificações de palco.

## Evidências atuais e limites

- Suíte local do CRM e build passaram após corrigir apenas testes desatualizados de transporte Host e fixture V2. As correções ficaram locais. CI da main já falhava nesses testes antes do corpus; publicação documental não alterou o CRM.
- API isolada em memória recebeu o PDF público, devolveu bytes de hash idêntico e apresentou contrato/rotas em WebKit. Não houve uso do banco do usuário nem execução da IA externa.
- Não há `.env.local` do CRM e o ambiente herdado não tinha par chave/modelo configurado na checagem. O tempo real da LLM/cadastro não foi medido. Não preencher y, n, multiplicador ou R$ com estimativas disfarçadas.
- Evidências de UI/motion não validam precisão BLE, autonomia, encaixe, adesivo ou segurança clínica.

## Justificativa BLE solicitada — linguagem aprovada para desenvolver

Etiquetas Bluetooth de baixo consumo + receptores atualizam automaticamente o último setor detectado, sem alguém registrar cada movimentação. Mostrar horário/origem. Estudo do HC é precedente de localização por setor; não é ensaio de ausência de EMI nem comprova superioridade absoluta. Não prometer “não afeta nada”, “zero interferência”, “mais segura” ou latência instantânea. Implantação depende de avaliação da Engenharia Clínica. [Evidências e fala curta](../referencias/ble-seguranca-palco.md).

A alternativa adesiva possui imagem gerada para comparação: `pitch/assets/tag/consta-tag-adesiva-na-bomba-conceito.png`. Não confundir com o CAD anterior com berço nem com montagem validada. A imagem não é cálculo de engenharia.

## Correção visual solicitada após o slide de três cards

Matheus rejeitou “Cinco frentes. Um fluxo.” com apenas três cards, pois desapareceu a visualização das etapas manuais ultrapassadas pela IA. Direção: trabalho manual (ler, localizar dados, preencher e organizar) com rota de automação evidente; conferir/salvar permanece antes da gestão. Reduzir densidade, copiar identidade real do CRM de Antonio, com composição mais forte para palco. Delegação explícita: GPT-6 Astra medium cria o fluxo; GPT-6.1 Sol medium adapta o restante da identidade; Claude Code Opus5.5 medium mantém a morfose. Integração é local, com arquivos separados e validação conjunta.

## Coreografia do fluxo pedida por Matheus

No beat13 as tarefas manuais aparecem ativas e sem risco. Ao avançar para14, a bolinha percorre a curva da IA, desenha a linha e risca cada tarefa quando a ultrapassa. Faz uma pausa visível junto à conferência humana e só então chega à gestão. Não saltar diretamente ao destino nem mostrar tudo já riscado. Reversão/interrupção e movimento reduzido precisam restaurar os estados corretos. Opus implementa no controlador global único; CSS/hooks do Astra já integrados.

## Autoria e formato de motion confirmados por Matheus

A animação da demo e do fluxo deve ser feita pelo Claude Code **Opus5.5 medium**, usando a skill CLIdeo AI e ferramentas úteis para direção/morph, com saída **direto em HTML/CSS/JS do pitch**. Sem SFX, sem áudio e sem vídeo da solução. Outros agentes podem preparar capturas/layout/QA, mas não integrar sua própria timeline como se fosse autoria Opus. O rascunho de JS do Astra foi retirado para `/tmp/consta-product-demo-motion-DRAFT-NOT-FOR-INTEGRATION.js`; NÃO integrar.

Capturas atuais: `pitch/demo/capture/` e prova `capture-result.json`; interface real, resposta HTTP V2 preparada, cinco ativos salvos no SQLite em memória, sem IA externa. Novos commits serão informados por Matheus; main continua em `2c4659b` na última consulta.

## Limite de uso do Opus — 07/11/2026

O Claude Code retornou `You've hit your 5-hour limit · resets 9:20am (America/Sao_Paulo)`. A nova animação do produto ainda não foi escrita pelo Opus. A sessão anterior escreveu código do percurso da IA antes de atingir a quota; QA está verificando esse código. A morfose do logo já foi concluída e testada em todas as proporções.

Matheus foi informado e recebeu escolha assíncrona: liberar uso extra mantendo Opus, autorizar GPT-6.1 Sol medium ou aguardar9h20. **Não substituir silenciosamente a autoria solicitada.** Não repetir chamadas que já falharam por quota antes de confirmação de liberação ou horário de restabelecimento. Capturas/layout/prova de execução podem continuar, mas nova animação depende dessa resposta.

## Estado após bloqueio — telas reais integradas sem timeline

O código do fluxo escrito pelo Opus antes da quota passou no QA independente (`/tmp/consta-opus-flow-quota-qa.md`): curva SVG real, riscos vinculados à passagem, pausa humana, gestão, retorno/interrupção/movimento reduzido nos três formatos.

O pitch agora usa as capturas reais do CRM nos beats7/8/9 em lugar da tabela HTML ilustrativa. Por enquanto é uma versão **estática por avanço**, preparada pelo responsável, sem fingir autoria de uma timeline Opus ausente. Fallback: `product-demo-static.css` e atributo `data-product-static` na seção. **Remover esse link/atributo ao integrar o JS final do Opus**, para não bloquear o motion com `transition:none`. A nova animação da demo continua dependendo da resposta à questão de quota.

## Versão de tag agora integrada

Após Matheus apontar que o slide ainda mostrava a base antiga, o beat10 passou às imagens adesivas (bomba e cápsula isolada), sem berço/cinta. Âncora da bolinha foi reposicionada na etiqueta lateral e o comparativo isolado desceu para a mesma altura. Nenhum algoritmo/timing de animação foi alterado. O CAD antigo permanece explicitamente da versão com berço. Subtotal de referência módulo+pilha: R$109,27 com estoque incerto, alternativa R$267,27; não são custo industrial próprio nem orçamento hospitalar. [Pesquisa](../referencias/custo-ble-minimo-2026-11-07.md).
