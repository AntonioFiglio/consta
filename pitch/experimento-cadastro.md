# Ensaio de cadastro — roteiro para gravação

Objetivo: medir o fluxo realmente implementado, do documento ao inventário conferido e salvo. Ainda não há resultado próprio de economia de tempo. Não comparar o cadastro com contagem de estoque RFID, nem com um inventário hospitalar completo que inclui deslocamento.

## Preparação

Use documentos sintéticos ou públicos e um gabarito independente por equipamento: nome, patrimônio, série quando disponível, modelo, setor, vínculo contratual e regras de manutenção documentadas. Inclua documentos com várias unidades e lacunas; quantidade sem identidade não autoriza inventar fichas. Anote versão do sistema, modelo de IA, conexão e participantes sem identificá-los publicamente.

Compare os mesmos documentos e campos nas duas condições: preenchimento manual e extração assistida. Alterne a ordem entre participantes/lotes para reduzir o efeito de aprendizado. Não dê à IA um documento mais simples que o usado na condição manual.

## Cronometragem

1. Comece com o documento disponível e os registros vazios. Acione o cronômetro antes da primeira ação de cadastro.
2. No modo assistido: envie PDF/TXT, avance para extrair, confira a tabela preenchida, complete lacunas e confirme o salvamento. Inclua upload, espera da IA, conferência, correções e falhas no tempo.
3. No modo manual: preencha e confira os mesmos campos, com o mesmo acesso ao documento e critério de aceitação.
4. Termine somente quando as fichas estiverem salvas e aceitas pelo gabarito; confirme os vínculos e as previsões de manutenção aplicáveis. Registro incompleto não conta como cadastro concluído.
5. Registre tempo decorrido do lote, esforço de todas as pessoas, quantidade de equipamentos aceitos, falhas, retrabalho e acertos por campo. Guarde tentativas com erro ou timeout. Um contrato com várias unidades é um lote; seus equipamentos não são experimentos independentes.

Use [o CSV vazio](data/ensaio-cadastro.csv). Tempo por equipamento deve ter denominador explícito: tempo total do lote dividido pelo número de equipamentos aceitos. Registre preparação compartilhada separadamente para não duplicá-la. Qualquer conta publicada precisa de conferência e memória de cálculo; não há números preenchidos neste modelo.

## Como apresentar

Mostre a gravação completa ou o resultado do ensaio com número de lotes/equipamentos, condições, critério de qualidade e revisão incluída. Diga “ensaio da equipe com documentos sintéticos”, sem generalizar como média nacional ou eficácia hospitalar. Não declare “sem erros” por ter mostrado um único caso bem-sucedido.

A captura por câmera/QR é uma próxima etapa: só entra neste ensaio depois de existir implementação funcional. O mapa da apresentação é simulado e não participa da medição de cadastro.

## Evidência externa

A [pesquisa brasileira](../docs/referencias/tempo-inventario-brasileiro.md) não encontrou uma média recente e comparável de cadastro manual por equipamento médico. O cronograma UNICAMP/Campinas de 2024 estima inventário completo, com outras atividades e dedicação integral; não é uma cronometragem da etapa automatizada pela Consta. O [fluxo de Antonio auditado](../docs/referencias/auditoria-crm-antonio-2026-11-07.md) delimita o que o código implementa e o que não foi executado nesta auditoria.

## Caso real preparado para a gravação

Use o [contrato HCFMUSP05/2026](../data/referencias/casos/hcfmusp-05-2026/README.md), na cópia pública com CPFs-alvo ocultados. As cinco autoclaves da página2 têm identidades conferidas no gabarito independente. O TXT antigo perdeu um modelo: ambas as condições devem começar com o mesmo PDF, sem oferecer à IA uma transcrição mais fácil escondida. Não usar o gabarito como entrada da IA.

A interpretação correta deixa a periodicidade preventiva desconhecida e não inventa o início da vigência. Aceitar um cadastro documental não exige fabricar datas para encher o calendário. O ensaio com esse PDF não valida BLE: o demonstrador de rastreamento usa outro equipamento móvel fictício. Não foi executada extração real do provedor nesta revisão.
