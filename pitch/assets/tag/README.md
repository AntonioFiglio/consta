# Versão atual no pitch — cápsula adesiva

O pitch principal mostra [a cápsula adesiva isolada](consta-tag-adesiva-isolada-conceito.png) e [aplicada à bomba genérica](consta-tag-adesiva-na-bomba-conceito.png), sem berço ou cinta. São imagens geradas de uma proposta de fixação mais simples, sem hardware fabricado. A CR2032 continua como direção de alimentação; acesso à pilha e fechamento precisam de projeto e ensaios.

O desenho cotado/CAD e as verificações abaixo descrevem a **versão anterior com berço**. Não comprovam dimensões ou encaixes da alternativa adesiva. O preço de produção própria ainda não foi cotado. [Referências de custo e limites](../../../docs/referencias/custo-ble-minimo-2026-11-07.md).

# Estudo anterior com berço — geometria virtual e CR2032

O [PNG transparente](consta-tag-conceito.png) comunica a direção visual de uma tag BLE com corpo removível de um berço. Foi gerado pela ferramenta nativa GPT Image em 07/11/2026. **Não é fotografia de hardware fabricado nem prova de encaixe.** O corpo tem alvo nominal de **52 × 36 × 12 mm**, sem contar o berço. A imagem anterior foi preservada em [consta-tag-conceito-v1-lipo.png](consta-tag-conceito-v1-lipo.png).

O estudo anterior com berço adotou **CR2032 primária substituível, retentor Keystone 3034 e módulo Raytac MDBT50Q-1MV2 em PCB própria ainda a projetar**. A pilha não é recarregável. O berço poderá ser preso por cinta/abraçadeira na bancada; uma base adesiva depende de avaliação dos materiais, limpeza, retenção e remoção. Parafusos e ranhuras visíveis no render são intenção de desenho, sem detalhe mecânico validado.

- [Desenho nominal e reservas](desenho-cotado.svg)
- [CAD paramétrico OpenSCAD](conceito-tag.scad)
- [Parâmetros e fontes](parametros.json)
- [Direção de geração e origem](PROMPT.md)
- [Pesquisa da CR2032 e dos componentes](../../../docs/referencias/tag-prototipo-cr2032.md)
- [Estudo de fixação](../../../docs/referencias/tag-fixacao.md)

## O que foi verificado

Execute `python3 pitch/assets/tag/verificar_geometria.py` na raiz. O verificador confere contenção dos envelopes numa cavidade nominal arredondada e ausência de interseção, com controles negativos de colisão e protrusão. Passar significa somente que **as caixas declaradas cabem no modelo**.

Os parâmetros registram contas previamente conferidas com SciMath: interior ideal de **49 × 33 × 9 mm**, separação longitudinal entre reservas de **2 mm**, folga de extremidade da reserva do módulo de **3,5 mm** e folga superior da reserva da pilha de **3 mm**. São resultados condicionados aos envelopes assumidos, não tolerâncias de fabricação ou afastamentos RF aprovados.

A reserva de **26 × 24 × 5 mm** para pilha e retentor não é uma dimensão garantida do conjunto instalado. A reserva do módulo é **16 × 11 × 3,5 mm**; o módulo publicado mede **15,5 × 10,5 × 2,05 mm**. O contato negativo do retentor exige pad na PCB própria. Conferir revisão do desenho do retentor, orientação, solda e curso de troca da pilha antes de desenhar a montagem.

## O que permanece pendente

Esquemático, PCB roteada, componentes auxiliares, tolerâncias, apoios, fixadores, tampa e retenção, berço detalhado, curso de inserção da pilha e zona RF. O arquivo OpenSCAD é fonte paramétrica; não foi compilado neste ambiente. Não houve impressão, montagem física, medição de consumo, firmware executado, ensaio RF ou validação hospitalar. Não há autonomia, impermeabilidade, resistência a desinfetantes, compatibilidade clínica ou fabricação seriada demonstradas.

Este estudo não altera a BOM ou seleciona definitivamente o hardware do produto. É uma hipótese concreta para orientar a próxima bancada.

## Alternativa mínima em estudo

Matheus solicitou reduzir peças e avaliar cápsula com adesivo no verso, sem berço externo, com acesso à pilha pela frente/lateral. A [pesquisa de custo](../../../docs/referencias/custo-ble-minimo-2026-11-07.md) separa referências de bancada de um orçamento completo. O desenho/CAD e a imagem atuais mostram a versão com berço; não são documentação de fabricação da alternativa adesiva. Não foram recalculados encaixes, seleção da fita ou mecanismo de fechamento nessa alternativa.

## Alternativa adesiva — imagem para comparação

[Tag adesiva na bomba, conceito gerado](consta-tag-adesiva-na-bomba-conceito.png): cápsula sem berço externo nem cinta, sobre superfície lateral plana. A imagem ilustra a proposta de reduzir peças; não comprova aderência, resistência à limpeza, dimensões, acesso à pilha ou montagem. O CAD anterior e seu ensaio virtual descrevem outra versão, com berço; não validam esta alternativa. Não atribuir a esta imagem custo de fabricação já fechado.
