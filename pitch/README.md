# Apresentação do Consta

## Estado atual — 07/11/2026

Sequência com 16 telas visíveis: capa 1, notícias 2, iceberg com gestor 3, gaveta do gestor 4, logo/fluxo IA automático 5, demo 6–8, Smart Agenda 9, etiqueta BLE 10, mapa 11–12, impacto combinado 13 (atendimento primeiro, economia potencial depois), equipe 14, CTA/QR 15 e Business 16. O antigo link de atendimento redireciona ao impacto combinado. Piso Business definido por Matheus: R$ 20 mil/ano para até 100 equipamentos, com 20 tags na contratação inicial; faixas propostas de R$ 60 mil e R$ 180 mil para até 500 e 2.000 equipamentos. [Pesquisa e limites comerciais](../docs/referencias/precos-business-consta.md).

Use **Home**, PageUp ou o botão Capa para voltar à abertura sem sair do documento. A navegação mantém a sessão de tela cheia; não abre outra página.

A interface vem do CRM real; a resposta de extração é preparada. A demo atual usa [contrato sintético completo](demo/synthetic-contract.html), com todos os campos e regras; o caso público do HC é separado e não recebeu dados inventados. Não há medição real de dez segundos nem redução de corretivas/ROI atribuível ao Consta. R$75mil/mês é despesa anunciada em Natal; ≈R$500mil/ano é outra referência de custo, em Suzano. Não são economias, não são o total dos ganhos e não devem ser somados. [Fala completa](fala.md) e [fala limpa para ensaio](fala-palco.txt) explicam essa distinção. A hipótese financeira usa contrato hospitalar de2026 e uma mensalidade adicional efetivamente dispensada, antes dos custos; ver [cenário financeiro](../docs/referencias/cenario-financeiro-pitch.md). Fontes e método em [impacto mensurável](../docs/referencias/impacto-pitch-mensuravel.md). Os relatos abaixo preservam o histórico; versões estáticas e bloqueio por quota foram superados pela versão nativa Astra autorizada.


Abra [deck.html](deck.html) no navegador. A capa é o primeiro slide da mesma apresentação; o primeiro avanço entra nas notícias. [cover.html](cover.html) é uma entrada compatível que redireciona para essa capa. Os arquivos funcionam por `file://`, sem instalação, servidor ou internet para apresentar. Preserve esta pasta e seus assets juntos.

Use PageDown, seta direita, Espaço ou Enter para avançar; PageUp ou seta esquerda para voltar. Botões visíveis também navegam. `F` aciona tela cheia quando suportada pelo navegador. A navegação é reversível e respeita movimento reduzido; apenas a sequência interna da demo tem passagens automáticas. Ensaiar com a caneta e o projetor físicos.

## Caminho principal (histórico de evolução; estado atual acima)

Notícias brasileiras → consequência financeira documentada → informação desconectada → Consta e cadastro assistido → tag e mapa simulado → entrada → IA organiza → gestão e piloto → equipe. O ponto e o fio da identidade conectam as cenas; detalhes técnicos ficam fora da fala principal.

O fluxo de cadastro acompanha a [auditoria inicial](../docs/referencias/auditoria-crm-antonio-2026-11-07.md) e a [revisão do código atualizado](../docs/referencias/fluxo-crm-auditado-2026-11-07.md): PDF/TXT → extração → tabela preenchida → conferência e confirmação → inventário e calendário. O checkout local agora incorpora a main após Antonio fe0e190 e a atualização documental2c4659b. As funcionalidades do CRM foram preservadas; somente duas verificações locais de teste foram ajustadas à fronteira HTTP e à extração V2. A auditoria não executou o provedor real de IA.

A planta é fictícia e as leituras são simuladas. A imagem da tag é um conceito gerado; há geometria virtual declarada, sem montagem física, autonomia ou aprovação clínica demonstradas. Câmera/QR e integração física BLE permanecem próximas etapas.

## Apoio para a banca

- [Slides técnicos BLE](apoio-tecnico.html): pilha CR2032, fixação, arquitetura, integração proposta, evidência e plano de testes.
- [Método, contas e fontes](metodo.html): números externos, hipóteses e limites; não são cinco projeções de ganho da Consta.
- [Fala e ensaio](fala.md), [protocolo de cronometragem](experimento-cadastro.md) e [CSV vazio](data/ensaio-cadastro.csv).
- [Conceito da tag](assets/tag/README.md), [créditos das imagens](assets/SOURCES.md) e [estudo dos pitches de 2024](../docs/referencias/pitches-reais-hcfmusp-2024.md).

O aluguel anunciado de R$ 75 mil/mês é um caso brasileiro específico. A equivalência de R$ 2.500/dia pressupõe 30 dias e não representa perda de receita nem economia demonstrada pelo produto. Os ganhos do próprio sistema dependem do ensaio e do piloto. O estudo FMUSP/2023 é precedente pertinente, sem promessa de precisão universal; HCPA/RFID permanece somente no apoio, fora das melhorias atribuídas ao Consta.

## Verificação reproduzível

`python3 scripts/verificar_repositorio.py` verifica referências locais e exemplos do repositório. `scripts/verificar_pitch.cjs` verifica a apresentação em WebKit headless com Playwright local; informe `CONSTA_PLAYWRIGHT_MODULE` e, se necessário, `CONSTA_WEBKIT_EXECUTABLE`. `CONSTA_QA_OUTPUT` guarda capturas. Não há dependência de Playwright durante a apresentação.

[Relatório e comandos completos](VALIDACAO.md) incluem as verificações de motion, capa e apoio BLE.

A verificação de navegador não substitui ensaio no projetor, uso da caneta física, integração real de IA ou testes BLE/segurança hospitalar.

## Continuação local após publicar o corpus

Os [documentos atualizados](../data/referencias/pacotes/README.md) estão na main pelo PR7. Há um [PDF direto do contrato HCFMUSP05/2026](../data/referencias/casos/hcfmusp-05-2026/README.md) e gabarito das cinco autoclaves, conferido visualmente. Não há periodicidade preventiva explícita nesse documento; não inventar calendário nem tempo de processamento. O exemplo visual da apresentação não comprova saída real da LLM.

Matheus evoluiu a direção para uma linha acompanhando o ponto pelas laterais, com morfose literal até formar a marca CONSTA (em implementação). A gaveta original foi restaurada. A tag instalada é uma [imagem fotorealista conceitual gerada](assets/tag/PROMPT-tag-instalada.md), sem montagem física validada. [Análise do berço e custo](../docs/referencias/tag-custo-berco.md). Esta continuação não foi commitada nem enviada.

## Atualização de linguagem e fluxo

O resumo segue três etapas: Entrada → IA organiza → Gestão. Contratos e Localização são funções transversais. Revisão humana permanece; registro de execução com comprovante ainda não foi implementado. A câmera de Nicolas e o novo mapa de Antonio aguardam entrega e verificação. A [memória de continuidade](../docs/desenvolvimento/continuidade-pitch-2026-11-07.md) registra a condição para produzir a demo final.

No palco, “beacon” é apresentado como **etiqueta Bluetooth**. O destaque de 100% refere-se aos testes por setor da pesquisa externa no HC. Baixo consumo e atualização automática justificam a direção; não comprovam ausência de interferência. [Justificativa e limites de segurança](../docs/referencias/ble-seguranca-palco.md).

A revisão visual usa os estilos do CRM de Antonio em `crm-identity.css` e a sequência `flow-automation.css`: tarefas manuais de extração/transcrição são contornadas pela IA; a conferência antecede a gestão. Os controles aparecem com ponteiro/foco e se recolhem em repouso.

## Demo nativa em preparação

A direção final é telas reais do CRM animadas dentro do HTML, sem vídeo e sem SFX. As [capturas e prova de execução](demo/capture/README.md) usam dados/processamento simulados, com cinco cadastros realmente salvos em API/SQLite isolados. A coreografia das telas pelo Opus5.5 está bloqueada pela quota do Claude até 9h20, pendente da escolha informada por Matheus. As telas reais já foram integradas como estados estáticos por avanço; os próximos commits de câmera/mapa serão incorporados depois de verificados.

## Iceberg, agenda e BLE

A pane é apresentada como a parte visível do problema, com cirurgia adiada em caso específico de Paranaguá/2025 e demais consequências atribuídas às respectivas fontes. A Smart Agenda demonstra uma proposta sintética de20preventivas distribuídas em quatro por dia dentro de janela autorizada, distinta da demo de cinco ativos; não altera o CRM. BLE usa analogia de etiqueta localizável e explicita avaliação de compatibilidade eletromagnética com Engenharia Clínica antes de implantação. [Fontes e limites](../docs/referencias/ble-e-impacto-paciente-palco.md) e [cenário de agenda](demo/smart-agenda-cenario.md).
