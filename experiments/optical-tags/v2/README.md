# Consta — protótipo óptico V2

**Óptica como caminho principal de desenvolvimento.** Esta versão implementa identidade individual, detecção de geometria, retificação projetiva, leitura redundante e critérios de rejeição. [Abrir demonstração offline](index.html) · [Ver movimento](replay.gif) · [Ver identidades](overview.png).

## Avanços implementados

- A V1 aproximava a marca por uma elipse. A V2 encontra moldura ou referências circulares nos pixels e estima uma homografia antes de ler o código.
- O payload aparece em dois anéis. Discordância ou falta de contraste produz bits desconhecidos; não é voto cego entre leituras.
- Uma faixa branca pode parecer espaço branco válido. A V2 procura interrupções nas bordas opostas da moldura e usa essa evidência geométrica para inferir uma faixa reta. Não recebe máscara de oclusão do gerador. Essa hipótese não identifica qualquer objeto branco ou qualquer formato de cobertura.
- O catálogo V2 tem **1.024 identidades de 32 setores**, com separação discreta auditada sob rotações e reflexos. Não há QR nem leitura humana por movimentação.
- As imagens de câmera são avaliadas em resolução nativa: primeiro se encontra o candidato no quadro inteiro; só depois ele é retificado. Não há crop com coordenadas verdadeiras fornecidas ao detector.
- `detect_image.py` já aceita um arquivo de imagem local e devolve IDs, diagnóstico e imagem anotada, sem serviço de internet. Isso permite testar capturas de bancada, embora nenhuma câmera física tenha sido ensaiada nesta entrega.

Os IDs dos ativos foram preservados, mas os códigos e o desenho óptico mudaram: etiquetas da V1 não são compatíveis com o catálogo V2. O carregador rejeita a versão errada. Nenhuma etiqueta física previamente implantada está sendo presumida.

## Resultados desta rodada

A bateria principal tem **2.488 quadros sintéticos**, com **2.224 observações esperadas e correspondidas**, sem IDs extras nesse conjunto. Inclui todos os 1.024 IDs no cenário limpo; casos de perspectiva, iluminação variável, ruído/desfoque combinados, faixas cinza/branca, um anel encoberto, resolução nativa e múltiplos alvos. Negativos incluem cenas sem identidade visível e anéis conflitantes. [Dados completos](results.json)

Uma validação escrita separadamente tem **92 quadros**, usando o mesmo renderizador básico, outra geração de cenas e parâmetros. Preservou **4 perdas de leitura**: uma cobertura branca diagonal e três exemplos muito pequenos. Não registrou IDs extras ou associação espacial incorreta. Isso delimita as condições testadas; não é garantia universal. [Validação adversarial](qa/independent_results.json) · [Revisão](qa/independent_review.md)

As contagens agregadas foram verificadas pelo servidor numérico em [numeric_audit.json](qa/numeric_audit.json). Os dados iniciais com falha de faixa branca permanecem em [first_benchmark.json](qa/first_benchmark.json); a solução não foi obtida relaxando a separação do catálogo ou aumentando o orçamento de erros.

## Como funciona

1. Um equipamento recebe um ID do catálogo e sua etiqueta correspondente.
2. O detector recebe apenas pixels e o catálogo público; extrai contornos e referências geométricas.
3. Uma transformação estimada da imagem retifica a marca.
4. Pontos nos anéis são amostrados com referências de contraste; o algoritmo classifica bits ou desconhecidos.
5. O dicionário é consultado com limites de erro, quantidade de informação e margem entre candidatos. Informação insuficiente não produz posição nova.
6. O replay associa o centro observado a ambientes fictícios e mostra explicitamente quando não existe leitura atual. Não usa o ID verdadeiro do renderizador como saída.

Uma marca totalmente coberta continua fisicamente invisível ao sensor. O replay é pré-calculado, não uma câmera ao vivo. Os rótulos são colocados depois da detecção. Cópia de tag ou troca de sua fixação continuam problemas de integridade física distintos da leitura.

## Reprodução e uso em imagens locais

Dependências já utilizadas no ambiente: Python, OpenCV, NumPy e Pillow. A mesma implementação não foi testada em todas as plataformas.

```sh
python3 experiments/optical-tags/v2/generate_catalog32.py
python3 experiments/optical-tags/v2/benchmark.py
python3 experiments/optical-tags/v2/qa/independent_validation.py
python3 experiments/optical-tags/v2/verify.py
python3 experiments/optical-tags/v2/replay.py
python3 experiments/optical-tags/v2/build_gallery.py
```

```sh
python3 experiments/optical-tags/v2/detect_image.py minha-foto.png --output foto-anotada.png
```

A ferramenta recusa sobrescrever a entrada ou um arquivo de saída existente. Os scripts de geração da pesquisa recriam seus próprios artefatos; preserve versões antes de alterar o algoritmo e executar novamente a validação. O catálogo não deve ser regenerado e distribuído silenciosamente após emissão de etiquetas físicas.

## Testes e limites

- Plano adversarial anterior aos resultados: [adversarial_plan.md](qa/adversarial_plan.md).
- O detector nunca recebe identidade verdadeira, cantos verdadeiros, homografia verdadeira ou máscara verdadeira. Eles existem somente no gerador e na pontuação.
- A validação adversarial usa outra implementação do cenário, mas compartilha o renderizador básico da tag. Não é generalização de câmera física.
- A deduplicação e o agrupamento de referências foram testados em alvos separados. Superposição, grande aglomeração e carga de processamento com fundos complexos exigem testes específicos.
- O limite de hipóteses de agrupamento não é um teto rígido para todo o trabalho de contornos em imagens arbitrárias.
- O diagnóstico não classifica semanticamente qualquer oclusor. Uma cobertura branca diagonal já causou perda na validação, que não foi apagada nem ajustada para passar.
- Materiais, fixação, curvatura, impressão, iluminação física, privacidade e compatibilidade clínica continuam sem ensaio. O resultado desta entrega é avanço funcional de visão computacional e identidade; não autorização de instalação hospitalar.

## Histórico de escala do catálogo

O método anterior de extensão preservando códigos de 24 bits esgotou o orçamento antes da meta pretendida: [catalog256.json](catalog256.json) registra o resultado real, não uma família de 256. A V2 usa novo layout/códigos de 32 bits para atingir 1.024, sem reduzir a separação. Isso não prova capacidade máxima nem N ilimitado. [Gerador e auditoria](generate_catalog32.py)

## Próxima fronteira concreta

Os arquivos de captura local permitem confrontar esta versão com imagens de bancada em ambiente não assistencial. O trabalho de algoritmo deve continuar sobre novas cenas congeladas, especialmente coberturas diagonais, substratos curvos, reflexos e superposição, sem apagar as falhas atuais. A óptica permanece a candidata principal nesta linha; não foi substituída por BLE nesta rodada.
