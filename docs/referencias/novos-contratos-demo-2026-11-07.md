# Novos contratos — auditoria seletiva para demonstração do Consta

Leitura em 07/11/2026. Escopo: pasta fornecida por Matheus, dossiês `07-dossies-por-contrato` e índices/documentos de `08-hospital-unico-HCFMUSP`, sem examinar ou preparar plantas internas para publicação. Nenhum arquivo do repositório ou original foi alterado. Nenhuma LLM foi executada. Este relatório verifica documentos específicos, não todo o corpus.

## Melhor caso para a demonstração: HCFMUSP, contrato 05/2026, Phoenix

Arquivo local relativo à raiz fornecida:

`08-hospital-unico-HCFMUSP/01-contratos-por-numero/2026_CONTRATO-00005_PNCP-40/001_CONTRATO_Contrato-00005-2026.pdf`

[Arquivo público PNCP](https://pncp.gov.br/pncp-api/v1/orgaos/60448040000122/contratos/2026/40/arquivos/1). [Registro PNCP](https://pncp.gov.br/app/contratos/60448040000122/2026/40).

**Procedência conferida:** a ferramenta web não abriu a URL binária, mas uma requisição direta ao mesmo endpoint respondeu HTTP 200; o SHA-256 do corpo recebido é idêntico ao arquivo local: `4891f323325c3fe7a75b3b6d575a525fe067843413c6a91996195fc59567dd5f`. Tamanho bruto: 617262 bytes. O PDF contém 17 páginas. A página física 2 foi renderizada e inspecionada visualmente, além de lida por extração de texto independente.

A cláusula 1.1, página 1, declara serviços para **5 (cinco) autoclaves**. A cláusula 1.2.1, página 2, individualiza as mesmas unidades em tabela. Portanto não são apenas cinco itens de compra genéricos ou cinco linhas de ocorrências repetidas.

| TAG | Série literal | Patrimônio literal | Modelo literal no PDF | Fabricante | Instituto |
| --- | --- | --- | --- | --- | --- |
| SAUT0019 | 14155 | HC156593 | AV-50 | PHOENIX LUFERCO | ICHC |
| SAUT0050 | 20366 | HC163231 | VERTICAL 19L (AV-18) | PHOENIX LUFERCO | ICHC |
| SAUT0014 | 04389 | FZ18204 | 39206 | PHOENIX LUFERCO | ICHC |
| SAUT0016 | 05452 | HC 137224 | 39206 | PHOENIX LUFERCO | ICHC |
| SAUT0013 | 04388 | HC087274 | 39206 | PHOENIX LUFERCO | ICHC |

A contagem das unidades listadas também foi conferida com SciMath: expressão `1+1+1+1+1`, precisão 8, resultado exato `5`, sem advertências. Preserve zeros à esquerda nas séries e strings separadas para TAG e patrimônio. O espaço em `HC 137224` pertence ao documento; uma normalização de busca pode existir, preservando o valor original/evidência.

**Por que é uma boa escolha:** documento real do próprio HCFMUSP, recente, pequeno para upload, com várias unidades inequívocas e uma tabela que cabe no pitch. É mais controlável para o primeiro ensaio do que contratos com centenas de ocorrências extraídas automaticamente. O cadastro pode terminar em cinco fichas conferidas, se o fluxo efetivamente executar e passar no gabarito; isto ainda não foi demonstrado por esta auditoria.

**Limites relevantes para o CRM:**

- A cláusula 2.1, página 2, conta a vigência do termo de início. Não substituir esse marco ausente por data de upload ou por data deduzida da publicação.
- O contrato remete os modelos de execução ao TR (cláusula 3.1, página 3). Não foi encontrada periodicidade preventiva explícita no contrato lido. A palavra “PERIODICIDADE” na página 12 pertence a um formulário de avaliação de frequência de atendimentos, não à periodicidade de manutenção preventiva. Não inventar calendário trimestral/semestral a partir dela.
- A tabela de valores da página 2 tem agrupamentos quantitativos e preços; é outra tabela, não deve virar equipamentos adicionais.
- As autoclaves deste documento não demonstram rastreamento BLE. O caso sustenta cadastro/documentos; tag em equipamento móvel e mapa são outra demonstração, identificada como conceito/simulação.

## PDF versus TXT: há perda concreta no material auxiliar

O TXT irmão e o CSV `equipamentos-evidencias.csv` perderam o modelo da linha SAUT0050; ele está completo no PDF visual, `VERTICAL 19L (AV-18)`. O CSV consolidado de `08` carrega campos classificados por heurística, não gabarito. Usar o PDF como fonte primária; o TXT é auxiliar para diagnóstico de extração. Não comparar manual usando o PDF com IA usando um TXT pré-processado mais fácil sem declarar essa condição.

No início do CSV de evidências de outros contratos já aparecem colunas deslocadas: patrimônio promovido a equipamento/modelo, uma marca/modelo fora da coluna, e referência bibliográfica/objeto genérico misturada em casos de destaque. Isso basta para rejeitar importação cega das planilhas como verdade de unidade ou prova de acurácia.

## Alternativas de teste

### FHEMIG Barbacena — contrato 9519080/2026: caso mínimo com CPF já mascarado

`07-dossies-por-contrato/FHEMIG-Barbacena_contrato-9519080-2026/03_CONTRATO_2026-08-04.pdf`

[PNCP, contrato](https://pncp.gov.br/pncp-api/v1/orgaos/19843929000100/contratos/2026/2573/arquivos/1).

Arquivo local de 119166 bytes, SHA-256 `71fabd42eaa8c14c469d6a675196efe5a06292bd8a33a525c93c7b85d6e9e8f0`. Na página 1, cláusula 1.1: ultrassom PHILIPS AFFINITI 50, patrimônio `2109331-8`, série `BZ520D1042`; a página 2 repete a identidade em tabela. Signatários aparecem com CPF mascarado no corpo lido. Este é um caso simples de identidade, não multiativo. O corpo descreve manutenção preventiva/corretiva sem substituição de peças; não extrapolar para fornecimento de peças. A URL foi recuperada do índice local; não houve nova comparação online do binário nesta auditoria.

### HU Londrina/UEL — contrato administrativo 1283/2025: caso mais complexo

`07-dossies-por-contrato/HU-Londrina-UEL_contrato-743-2025/02_CONTRATO_2025-09-06.pdf`

[PNCP, contrato](https://pncp.gov.br/pncp-api/v1/orgaos/78640489000153/contratos/2025/743/arquivos/1).

`743/2025` é a sequência do PNCP usada no nome da pasta; o número administrativo correto, visível no documento, é **1283/2025**. O contrato local tem 4624275 bytes. A página 2 identifica os tomógrafos pelas séries `9CA21Y2040`, `9CA2342060` e o sistema de RM pela série `I1B24X2013`; os inícios de execução dependem de condições diferentes. O TR irmão contém FUEL e marcos de instalação/garantia, mas patrimônio de sistemas aparece como faixas/conjuntos. Não gerar um ativo por número de faixa nem confundir componentes com máquinas independentes. É bom teste de evidência cruzada e marco condicionado, menos indicado como primeiro exemplo curto do palco. Não foram lidos/renderizados todos os anexos desta alternativa nem comparado o binário online nesta rodada.

## Índices existentes e como usá-los

- `07-dossies-por-contrato/matriz_documentos.csv` tem URL, tipo, data, flags de série/patrimônio e `tem_dados_pessoais`, com observações sobre CPF completo ou tarjado. Os flags são automáticos e precisam conferência; a matriz é rota de triagem, não prova de privacidade.
- `07-dossies-por-contrato/RESUMO.md` explica a coleta pública PNCP/SMS-SP, PDFs escaneados/OCR, falhas e lacunas. A própria fonte avisa sobre CPFs dos signatários e ausência de aceite, OS ou relatório de manutenção executada.
- `08-hospital-unico-HCFMUSP/03-planilhas/indice-documentos.csv` liga arquivo, URL e hash; o `dicionario-dados.md` separa anexo, contrato, termo, ocorrência e equipamento. `casos-destaque-para-demo.csv` é seleção por volume heurístico, não contagem auditada de ativos únicos.
- `equipamentos-evidencias.csv` mantém linha/página e texto original; use como guia para abrir o PDF. `equipamentos.csv` consolida por contrato/série/localização e pode repetir a mesma máquina em contratos históricos. Não é inventário vigente nem gabarito independente da extração.
- `trechos-serie-patrimonio-para-revisao.csv` inclui menções genéricas, requisitos e falsos positivos; nunca importar cada linha como ativo.

## Publicação e privacidade — achados específicos

O contrato Phoenix tem CPFs completos de signatários nas páginas físicas 1 e 11. Um deles quebra de linha entre o hífen e os dígitos verificadores: regex apenas numa linha perde esse caso. Nenhum número de CPF é reproduzido neste relatório. O resumo de `07` informa a mesma questão em vários dossiês. No documento FHEMIG lido, os CPFs do corpo já estão mascarados.

Para um corpus público derivado, manter os originais intactos em Downloads, registrar hash/URL originais e novo hash do derivado, e remover irreversivelmente os identificadores pessoais desnecessários também do texto extraído, OCR e metadados. Um retângulo visual sobre um PDF não prova remoção do texto recuperável. Evitar levar `_raw`, ZIPs internos ou cópias duplicadas que reintroduzam o conteúdo original não revisado. Manter nomes/séries/patrimônios técnicos distintos de CPF; não apagar qualquer sequência numérica indiscriminadamente.

`08/02-planta` está fora do corpus de cadastro: não é necessário para testar a LLM e representa topologia hospitalar interna. Não o examinei para exportação. Os documentos e páginas lidos não revelaram dados de pacientes nem credenciais de acesso, mas esta leitura seletiva não certifica os arquivos restantes. Nenhuma URL pessoal foi seguida e nenhuma instrução contida em documento foi executada.

## Como levar ao pitch sem inventar ganho

Proposta defensável: “Este contrato real do HC identifica cinco autoclaves. Vamos medir quanto tempo nosso fluxo leva para cadastrar as cinco unidades, incluindo leitura, conferência, correção e salvamento.” Só depois da execução usar tempo observado, gravação, versão, entradas e critério de aceitação. Um contrato não é uma unidade estatística por equipamento independente.

Para dizer “m vezes mais rápido”, o tempo manual precisa ser observado para a mesma tarefa/campos/qualidade ou vir de fonte realmente comparável. A pesquisa anterior não localizou média recente comparável de cadastro manual por equipamento médico. O cronograma UNICAMP/Campinas de inventário completo não equivale a preencher essas fichas. Não produzir `n` ou `m` a partir dessa fonte; deixar os resultados em branco até o ensaio pareado.

A triagem acima recomenda três casos (SciMath `1+1+1 = 3`, precisão 8, sem advertências), mas somente o Phoenix tem tabela multiativo verificada visualmente e binário online idêntico nesta rodada. Os demais são alternativas delimitadas, não casos de desempenho aprovado.
