# Consta com CR2032 — direção corrigida

Pesquisa complementar em 07/11/2026. A preferência agora é **pilha moeda CR2032 substituível**, não LiPo. Isto substitui a sugestão anterior de alimentação recarregável: **não conectar CR2032 aos pads BAT nem ao carregador LiPo da XIAO**.

## Conceito técnico proposto

**CR2032 primária + retentor Keystone 3034 + módulo Raytac MDBT50Q-1MV2 em PCB própria.** O módulo usa nRF52840; permanece alternativa para bancada RSSI, sem selecionar o nRF52833 citado no projeto nem prometer AoA. A rota exige esquemático, PCB, montagem e firmware; não existe ainda uma tag física pronta.

Alimentação conceitual: `CR2032 → proteção e distribuição de alimentação revisadas → domínio VDD do módulo`, com GND comum, desacoplamento e referência de alimentação de baixa tensão do fabricante. A configuração de VDD/VDDH/DCCH deve seguir o esquemático de referência exato, não a simples ligação de pinos pelo nome. Programação por SWD com fonte externa isolada da pilha, evitando retroalimentação. **Sem carregador, sem recarga, sem USB de carga.** Não substituir por LIR2032/recarregável sem reprojetar.

## Componentes e dimensões de origem

| Componente | Dados publicados | Observação para CAD |
| --- | --- | --- |
| Panasonic CR2032 padrão | Primária, 3 V nominal, 225 mAh nominais, Ø20,0 × 3,2 mm nominais; descarga contínua padrão 0,2 mA | Datasheet apresenta tolerâncias de fabricação no desenho; não usar só a dimensão nominal como cavidade |
| Keystone 3034 | Retentor SMT para células de 20 mm, compatível com 2032; desenho 3034 apresenta 23,24 mm, corpo 16,12 mm, projeção 21,21 mm REF e altura 4,06 ± 0,38 mm | Não é soquete plástico fechado: o contato negativo é pad na própria PCB. O pad negativo do desenho é 3,96 mm quadrados, mínimo; importar footprint e desenho da revisão adquirida |
| Raytac MDBT50Q-1MV2 | Módulo 15,5 × 10,5 × 2,05 mm, datasheet versão L | Não confundir com variante P ou revisão antiga; VDD operacional 1,7–3,6 V |

[Panasonic: página oficial](https://energy.panasonic.com/eu/business/products/lithium/coin-cr-standard/models/CR2032) e [datasheet oficial](https://industrial.panasonic.com/cdbs/www-data/pdf2/AAA4000/AAA4000C496.pdf). A capacidade nominal não é uma previsão de autonomia com anúncios BLE.

[Keystone: produto 3034](https://www.keyelco.com/product.cfm/product_id/798), [desenho atual no fabricante](https://www.keyelco.com/product-pdf.cfm?p=798) e [cópia do desenho do fabricante revisão D disponibilizada pela DigiKey](https://www.digikey.in/htmldatasheets/production/1417506/0/0/1/3034TR-Drawing.pdf). As cotas transcritas acima são da cópia revisão D; o endpoint do fabricante identifica revisão F. **Comparar revisões antes de fabricar**, especialmente perfil e pads. A projeção REF e o corpo metálico não representam sozinhos o envelope completo da célula instalada.

[Raytac: datasheet primário versão L hospedado pela Mouser](https://www.mouser.com/datasheet/3/1361/1/nRF52840_MDBT50Q_1MV2_MDBT50Q_P1MV2_Ver.L_spec.pdf). O desenho da antena indica faixa 10,5 × 3,8 mm sem ground correspondente em cada camada, ampliada quanto possível, com módulo na borda. Isso não define uma distância universal suficiente da pilha/metal.

## Forma e dimensão para a próxima ilustração

Direção revista com o coordenador: **retângulo de cantos arredondados, 52 × 36 × 12 mm externos**, sem contar base externa de fixação. É **alvo de protótipo virtual**, sujeito ao layout real; não dimensão de produto industrial pronto. A PCB própria permanece a definir.

Premissas propostas, não especificações dos fornecedores:

- Parede nominal de estudo **1,5 mm**. Origem de coordenadas no canto externo inferior; valores abaixo em mm.
- Reserva virtual de suporte+célula **26 × 24 × 5**, posição mínima **[3; 6; 2,5]**. Não é dimensão garantida do 3034, nem dispensa conferir a célula instalada e seu curso de inserção.
- Módulo Raytac real **15,5 × 10,5 × 2,05**; reserva virtual **16 × 11 × 3,5**, posição mínima **[31; 12,5; 3]**.
- Componentes lado a lado, antena voltada para a ponta externa. Gap geométrico não é afastamento RF certificado. Zona de antena sem bateria, parafusos ou ground adicional conforme projeto RF a revisar.
- Altura, contorno, orientação e suporte da PCB precisam ser definidos. O contato negativo do 3034 exige pad na PCB; os blocos virtuais não estabelecem a posição elétrica/mecânica desse contato. Não sobrepor blocos nem criar uma PCB sem apoio apenas para fazê-los caber.

**Contas conferidas em SciMath**, com variáveis dimensionais originais e saída em mm:

| Expressão/premissa | Resultado |
| --- | --- |
| `52 mm − 2 × 1,5 mm` | Interior ideal longitudinal 49 mm |
| `36 mm − 2 × 1,5 mm` | Interior ideal transversal 33 mm |
| `12 mm − 2 × 1,5 mm` | Interior ideal vertical 9 mm |
| `3 mm + 26 mm` | Extremidade longitudinal da reserva da pilha 29 mm |
| `31 mm − (3 mm + 26 mm)` | Separação geométrica entre reservas 2 mm |
| `31 mm + 16 mm` | Extremidade longitudinal da reserva do módulo 47 mm |
| `52 mm − 1,5 mm − (31 mm + 16 mm)` | Reserva até parede interna de extremidade 3,5 mm |
| `12 mm − 1,5 mm − (2,5 mm + 5 mm)` | Reserva acima do bloco da pilha 3 mm |

As contas ignoram cantos, geometria detalhada do retentor, solda, componentes auxiliares, tolerâncias, tampa e alojamentos de fixação. Aviso SciMath: magnitudes com unidades usam a precisão numérica do backend Pint. **Resultado nominal não é prova de montagem.** Uma pilha precisa entrar e sair do retentor sem o gabinete interferir; o curso de inserção deve ser conferido em CAD e em amostra física. O conjunto de blocos ainda não representa uma PCB elétrica roteada ou um desenho pronto para fabricação.

## Manutenção, fixação e verificação

Tampa da bateria retida por fixador que exija ferramenta, com acesso restrito à manutenção; projetar para impedir acesso casual à pilha, especialmente por crianças, e evitar liberação no transporte/queda. Não usar portinhola que abra só por pressão. Isso é requisito de desenho proposto, ainda sem ensaio de retenção ou conformidade.

Preservar a solução discutida: corpo removível de um berço externo; cinta/abraçadeira para a primeira bancada, e base adesiva candidata após conferir substrato, processo de limpeza, remoção e retenção. A base permanece separada do acesso à bateria. Sem ímãs, perfuração do ativo ou alimentação elétrica pelo equipamento.

A CR2032 deve ser avaliada sob pulsos reais de rádio, resistência interna, temperatura, envelhecimento e tensão de fim de vida. Medir queda de tensão durante anúncios, reset, consumo de sleep e efeito dos capacitores escolhidos. Os 225 mAh nominais e a corrente de teste do fabricante não permitem prometer meses/anos de uso. Validar autonomia após firmware e hardware reais; capacidade de pulso não equivale à corrente contínua padrão.

**Estado honesto:** conceito e orçamento geométrico pesquisados; ainda faltam esquemático, footprint revisado, layout elétrico/RF, BOM, medição do suporte e da pilha instalada, CAD de montagem, tolerâncias de fabricação, protótipo físico e ensaios. Não há prova de RF no hospital, localização, impermeabilidade, resistência a desinfetantes, segurança clínica ou RM. O próximo render deve comunicar esta versão virtual com pilha substituível e berço, sem usar a imagem como prova de encaixe ou fabricação.
