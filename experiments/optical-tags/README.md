# Consta — emulação óptica de identidade individual

**Spike descartável autorizado para pesquisa. Não é implementação de produto, câmera física ou validação clínica.** Abra [index.html](index.html) para explorar os resultados sem internet. [overview.png](overview.png) mostra diferentes identidades com a mesma estrutura circular.

## O que o experimento faz

Cada equipamento fictício recebe um padrão de setores pretos/brancos do dicionário. Todos compartilham o anel externo e o ponto central. O ponto central não é uma âncora de orientação: a leitura procura rotações cíclicas do padrão. Não há QR ou leitura por funcionário.

O detector recebe somente a matriz de pixels e o dicionário público. Busca contornos, estima elipses, amostra pontos em diferentes raios do anel e aceita um ID apenas dentro do orçamento de erro e com separação do próximo candidato. A geometria estimada vem da imagem; o centro, a transformação e o ID verdadeiro do renderizador não entram no detector. O ground truth serve para avaliação posterior.

O gerador usa família finita de 64 IDs com 24 setores. O alvo de separação discreta é de pelo menos 6 bits, auditado sob rotações e reflexos; o detector admite no máximo 1 substituição e exige margem para o próximo ID. Esses são parâmetros de projeto deste experimento, não capacidade hospitalar ou probabilidade de acerto. A família não contém N ilimitado de etiquetas.

## Resultados e limites

[results.json](results.json) contém cada observação e contagens por condição, incluindo falhas. O sistema reconheceu os IDs nos quadros limpos e em algumas degradações. Rejeitou os casos testados de perspectiva forte, cobertura parcial e total, espelhamento, cena vazia e padrão reservado fora do dicionário. Em redução extrema de informação houve perdas; não foram escondidas.

`small` e `tiny` reduzem e depois ampliam a imagem: representam perda de informação, **não** medição de alcance nem detecção em câmera com aquelas dimensões. A normalização por elipse é uma aproximação afim; não resolve homografia projetiva geral. Os exemplos não incluem toda a diversidade de iluminação, lente, fundo, sujeira ou movimento real.

[verification.json](verification.json) registra novos ângulos, escalas, translações e ruído com outra semente e mudanças de um bit. Essa sequência usa o **mesmo renderizador, dicionário e detector**, e não é validação independente de implementação ou generalização física. Os testes também conferem a separação do catálogo e uma cena com múltiplos candidatos.

A ausência de IDs errados nesta bateria finita não prova risco zero. Uma cópia válida ou uma etiqueta trocada de equipamento continuará parecendo o ID copiado: integridade da identidade física é outro problema. Não há autenticação criptográfica.

## Reprodução

Dependências usadas: Python, NumPy, OpenCV, Pillow; já disponíveis no ambiente da tarefa. Nenhuma biblioteca CCTag, RUNE-Tag, AprilTag ou TopoTag foi copiada para a implementação. A ideia de códigos visuais separados é anterior ao Consta; autoria do spike não equivale a patenteabilidade ou liberdade comercial verificada.

```sh
python3 experiments/optical-tags/emulate.py
python3 experiments/optical-tags/verify.py
python3 experiments/optical-tags/replay.py
python3 experiments/optical-tags/build_gallery.py
```

O explorador HTML mostra resultados **pré-calculados**, não uma captura ou decodificação ao vivo. Seu seletor muda o quadro e a observação salva correspondente. O corpus é reproduzível pelas sementes registradas. Preservado em `experiments/` para revisão; não conectado ao produto.

## O que ainda falta

Escolha de família escalável, cenário de câmera real e dimensões físicas; leitura sob distância/ângulos; cobertura multiambiente; materiais/limpeza; privacidade; comparação de arquitetura e avaliação clínica. O reconhecimento das imagens não prova EMC, segurança de RM, taxa de atualização da aplicação ou rastreamento contínuo quando a etiqueta está oculta.

## Replay de movimento

[replay.gif](replay.gif) mostra uma sequência pré-calculada com marcas em movimento entre ambientes fictícios. [replay.json](replay.json) contém as observações e a referência isolada. O detector lê a cena antes de desenhar os rótulos; a divisão de ambientes é um mapa sintético, sem escala física. A perda de leitura durante a cobertura é verificada. Não é vídeo de câmera, localização em tempo real de hardware ou demonstração hospitalar.
