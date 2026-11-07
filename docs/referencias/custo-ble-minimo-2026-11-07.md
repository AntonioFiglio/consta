# BLE mínimo: preços brasileiros e arquitetura de baixo custo

Pesquisa em 07/11/2026. Somente leitura; nenhuma compra, contato com vendedor ou alteração de código/BOM. Preços são anúncios consultados, sem frete, não uma cotação fechada. Não foi calculado total de implantação nem preço industrial por tag.

## Decisão recomendada para estudar

A simplificação proposta por Matheus faz sentido: **cápsula com verso plano e adesivo com liner para destacar e colar**, sem berço externo. Manter acesso à pilha pela frente/lateral; colar a própria tampa de bateria ao equipamento criaria retrabalho a cada troca. Corpo/tampa, placa e retenção da pilha continuam necessários: uma única cápsula comercial não significa uma única peça física na fabricação. Escolher vedação e fechamento depois dos ensaios, sem multiplicar parafusos, trilhos e suportes neste primeiro conceito.

É inferência de projeto, não economia já medida. O adesivo elimina a interface extra do berço, mas ainda exige material compatível, aplicação, retenção, remoção e limpeza. Não escolher apenas “a cola mais forte”: remover sem danificar o equipamento e acessar a pilha também fazem parte do custo.

## Preços encontrados

| Item / fornecedor | Preço anunciado e condição | Disponibilidade e limite |
| --- | --- | --- |
| [WT32-ETH01, MarinoStore](https://www.marinostore.com/wireless-iot/esp/modulo-wt32-eth01-esp32-ethernet-wifi) | **R$ 119,90** pela placa; pedido mínimo do site R$100, desconsiderando frete | “Disponibilidade: Imediata”. Placa ESP32 com BLE e Ethernet RJ45, alimentação externa. Não inclui um gateway hospitalar pronto, firmware do Consta, gabinete, fonte, instalação ou ensaios. Página descreve barras de pinos para soldar. |
| [WT32-ETH01, Tech Sul](https://techsuleletronicos.com.br/product/wt32-eth01-modulo-esp32-com-ethernet-wifi-e-bluetooth/) | **R$ 179,50** | Estoque anunciado na busca. Alternativa de comparação da placa, não diferença calculada nem gateway completo. |
| [iBeacon NRF51822 + case, SmartSEC](https://lojasmartsec.com.br/p-1946407-Modulo-Beacon-Ibeacon-Bluetooth-4.0-Nrf51822-) | **R$ 259,00**, preço unitário; página também lista Pix e Mercado Pago no mesmo valor | Usa CR2032 e declara **não acompanhar a pilha**. A case está incluída. Produto para desenvolvedores; estoque não confirmado por compra/contato. SKU e fabricante do beacon completo não demonstrados. Não é orçamento de fabricação própria. |
| [iBeacon NRF51822 + case, UsinaInfo](https://www.usinainfo.com.br/transmissores-e-receptores/modulo-ibeacon-nrf51822-rssi-ble-40-case-5842.html) | Página atual exibiu **R$ 101,00 Pix/boleto** ou **R$ 106,32 cartão** | CR2032 não incluída na ficha; há seletor opcional de pilha. **Disponibilidade contraditória:** “avise-me quando disponível”, comentário HTML “OutOfStock”, mas também “últimas unidades” e quantidade em JS. Não tratar como compra pronta. Snippet antigo exibiu R$84,17, que foi descartado após reabertura atual. |
| [Panasonic CR2032, Achei Componentes](https://www.acheicomponentes.com.br/diversos/bateria-de-litio-3v-panasonic-cr2032) | **R$ 3,80 por peça**, pedido mínimo do site **R$20,00** | Anúncio informa estoque e pronta entrega. Abertura completa teve timeout após consulta de busca; usar como preço anunciado sujeito à confirmação, não promessa de entrega. |
| [Panasonic CR2032, Proesi](https://www.proesi.com.br/bateria-lithium-cr2032-3v-panasonic) | **R$ 8,27** no HTML/JSON-LD atual (BRL; condição de pagamento não discriminada nessa oferta estruturada) | JSON-LD do próprio site informa `InStock`. Abertura textual da página não exibiu o preço dinâmico; consulta direta ao HTML confirmou `og:price`, `product:price:amount` e `Offer.price` em 8.27. Snippet de busca R$7,57 estava desatualizado e foi descartado. Não usar “225mA” como autonomia; consultar datasheet Panasonic. |
| [Fita 3M VHB4910, Anhanguera Ferramentas](https://www.anhangueraferramentas.com.br/produto/fita-dupla-face-adesivo-transferivel-19mm-x-5m-4910-vhb-3m-122539) | **R$ 31,41 Pix**, **R$ 34,90 cartão**, rolo anunciado de **19mm × 5m** | Sujeita a frete e tributação interestadual; não dividir em “custo por tag” antes de definir área, recorte e perdas. A descrição técnica mistura propriedades de outros adesivos; usar só anúncio de preço/MPN como referência comercial e dados da própria 3M para seleção. |

A opção UsinaInfo mostra que existe referência de varejo brasileira abaixo do preço da SmartSEC, mas **não permite prometer disponibilidade, somar um orçamento de kit imediato ou usar o preço de snippet antigo**. Nesta busca não confirmei um beacon acabado CR2032, com fabricante/modelo e estoque inequívocos, por preço suficientemente melhor para fechar uma BOM comprável. Não concluir que não exista; solicitar cotação seria próximo passo separado.

## Candidatos que não sustentam preço do pitch

- [Chronyx, beacon genérico adesivo](https://www.chronyx.com.br/loja/beacon/beacon-ble-engate): anuncia R$89,00 Pix, iBeacon/Eddystone, **CR2477**, adesivo industrial. Porém o rodapé exibe **“CNPJ XX.XXX.XXX/0001-XX”** e não identifica fabricante/modelo completo. **Descartado como orçamento confiável.** Não substitui CR2032 e não usar alegações de autonomia/IP como validação própria.
- [SmartCore EMBC01-F401-H1000](https://loja.smartcore.com.br/beacon-bluetooth-low-energy): beacon comercial com bateria e gabinete, mas preço público aparece **“R$***”**. É candidato para cotação, sem cifra verificável.
- [Taggen brasileiro](https://taggen.com.br/wp-content/uploads/2023/05/DataShet-Beacon_M7_Rev-110.pdf): fonte primária de um produto nacional BLE, sem preço de compra validado nesta rodada. O [gateway Taggen](https://taggen.com.br/wp-content/uploads/2023/05/TaggenGateway_M1_Datasheet_Rev_103.pdf) declara licença da plataforma PLT e internet; não assumir adequação à integração local própria do Consta ou custo sem recorrência.
- Anúncios de marketplace internacional de nRF52810 e preços de chips sem placa não equivalem a tag pronta entregue/homologada. Não usar o preço mínimo de um CI ou lote industrial como preço de tag acabada.

## Receptor e roteador são peças diferentes da conta

Para o protótipo de bancada, o receptor pode ser uma placa ESP32 com firmware para escutar anúncios BLE e encaminhar observações ao serviço local. A WT32-ETH01 citada tem BLE e Ethernet na mesma placa e é um candidato de estudo compatível com a direção cabeada do repositório. A descrição de varejo não comprova que o firmware de fábrica já executa scanner BLE e o protocolo do Consta; isso precisa ser implementado e testado.

A rede Ethernet existente transportaria os dados até o servidor/CRM. **O roteador não precisa ganhar BLE se houver um receptor dedicado fazendo a escuta.** Assim, trocar todos os APs não é pré-requisito desta alternativa. Reaproveitar pontos de rede, switches e alimentação depende da TI e da infraestrutura real; “rede existente” não significa porta livre, cobertura, fonte, cabo ou instalação gratuitos.

Wi-Fi existente pode servir a um ensaio de bancada com placa compatível; seria outra condição de teste. O caminho essencial documentado do Consta é cabeado/local, e não deve ser silenciosamente trocado por Wi-Fi para baratear a narrativa. Um AP corporativo com recepção BLE só é alternativa se exportar os dados necessários e seu licenciamento/API forem compatíveis. Não é equivalente a comprar um roteador Wi-Fi doméstico “com Bluetooth”.

### O que falta no custo da placa anunciada

Fonte e conexão elétrica adequadas; gabinete; fixação; cabo/porta de rede; programação e firmware; ingestão no serviço local; manutenção do software; instalação/calibração por área e ensaios. PoE não está demonstrado como incluído no WT32-ETH01 anunciado; não afirmar alimentação pelo cabo sem hardware apropriado. Também não extrapolar número de receptores por área a partir de alcance comercial em espaço aberto.

## Adesivo: fonte técnica e limites

O [boletim oficial 3M de preparação](https://multimedia.3m.com/mws/media/873133O/surface-preparation-for-3m-vhb-tape-applications.pdf) vincula resultado ao substrato e à aplicação. O [guia oficial de aplicação/remoção](https://www.3m.com/3M/en_US/vhb-tapes-us/resources/applying-3m-vhb-tapes/) trata a remoção como parte do processo. Esses documentos não autorizam primer, solventes ou lixamento numa carcaça médica. O fabricante do equipamento e Engenharia Clínica devem definir local/material/procedimento compatíveis.

Por isso a recomendação de cápsula adesiva é **uma simplificação para desenhar e testar**, não uma cola já selecionada para todos os ativos nem liberação hospitalar. Sem materiais, massa, processo e lote não há custo fechado de gabinete; sem consumo medido não há autonomia da tag.

## Texto curto defensável para a banca

“Propomos uma tag adesiva simples e receptores fixos ligados à rede já existente. Não precisamos pressupor a troca de toda a rede Wi-Fi. O primeiro custo é de um piloto delimitado; quantidade de receptores, integração e preço de produção serão definidos após bancada e levantamento da infraestrutura.”

Não colocar no slide principal uma BOM incompleta como se fosse custo hospitalar instalado. Deixar referências comerciais e itens faltantes no apoio. Nenhum total ou multiplicador foi derivado nesta pesquisa; portanto não houve conta a conferir por SciMath.

### Conferência adicional de preço dinâmico

Na Proesi, a oferta JSON-LD atual do próprio HTML tem `priceCurrency=BRL`, `availability=https://schema.org/InStock`, `price=8.27`; o metadado `priceValidUntil=2099-12-31` é um padrão de sistema, não garantia de preço até essa data. Usar consulta atual, sem interpretar esse campo como compromisso comercial.

## Memória de conta do subconjunto de bancada — não é orçamento de implantação

Para comprar um exemplar de tag com gabinete, uma pilha, uma placa receptora WT32-ETH01 e um rolo inteiro de fita:

- Referência Usinainfo, estoque contraditório: 101,00 + 8,27 + 119,90 + 31,41 = **R$ 260,58**.
- Referência SmartSec anunciada: 259,00 + 8,27 + 119,90 + 31,41 = **R$ 418,58**.

Conferência SciMath: expressão `tag+battery+receiver+tape`, variáveis em reais, precisão10; resultados exatos `13029/50` e `20929/50`, sem advertências. A primeira soma não constitui oferta comprável confirmada; a disponibilidade precisa ser confirmada. Nenhuma compra foi realizada.

São somas de itens de varejo, não custo unitário industrial e não sistema pronto. Não incluem frete, fonte de alimentação, cabo, programador USB–serial se necessário, gabinete do receptor, firmware, serviço de localização, instalação, ensaios, homologação aplicável ou operação. O rolo de fita é compra compartilhável, não consumo de um único ativo. Não há cotação de fabricação do gabinete Consta nem redução percentual de custo validada.

## Direção mínima proposta para a cápsula

Comparar o conceito de berço removível com **gabinete de verso plano, adesivo pré-aplicado com liner destacável e acesso à pilha pela frente/lateral**. Retirar o berço e a cinta da versão adesiva; não colar a tampa que precisa abrir para trocar a pilha. Corpo e tampa continuam necessários para um gabinete reparável, com retenção a projetar. Encaixe sem parafusos é alternativa a testar, não mecanismo já aprovado.

Adesivo é candidato de fixação, não indicação universal de cola para qualquer equipamento. Confirmar superfície, material, remoção e produtos de limpeza com responsáveis; uma cola muito forte também pode danificar a carcaça ou impedir manutenção. A prova em bancada não exige redesenhar a rede hospitalar inteira.

O receptor adicional pode ser desenvolvido com Ethernet para a LAN existente; o rádio BLE escuta as tags e a placa encaminha os dados. Não pressupor compra de roteador BLE. Um AP existente só pode substituir esse receptor se realmente exportar observações com interfaces/licenças disponíveis; ter chip BLE não comprova essa integração. A placa cotada é componente para desenvolvimento, sem firmware/integracão física demonstrados neste repo.

## Atualização da versão visual e referência por etiqueta

O slide principal passou a usar o conceito de cápsula adesiva, sem berço e cinta. O CAD anterior de52×36×12mm permanece como estudo da outra versão; suas folgas não validam a cápsula adesiva. Não há cotação de fabricação própria nem percentual comprovado de economia.

Referências brasileiras reabertas nesta atualização:

- UsinaInfo: módulo BLE NRF51822 com case a R$101,00 Pix, disponibilidade contraditória; Proesi: CR2032 a R$8,27 nos metadados `og:price` e `product:price:amount`. Subtotal dos dois itens: **R$109,27**, antes de adesivo, frete e demais custos. Não é compra garantida nem orçamento do nosso gabinete.
- SmartSEC: módulo com case a R$259,00, explicitamente sem CR2032; com a pilha da referência Proesi, subtotal **R$267,27**. Também não é orçamento industrial do Consta.
- MarinoStore: placa receptora WT32-ETH01 a R$119,90, sem o gateway completo.

Contas SciMath: expressão `tag+battery`; variáveis decimais `101`, `8.27` → exato `10927/100`, aproximado `109.2700000`; `259`, `8.27` → exato `26727/100`, aproximado `267.2700000`; precisão10, sem advertências.

A simplificação elimina componentes externos de fixação. A eletrônica, pilha, gabinete reparável, adesivo compatível e ensaios continuam na conta. Não estimar a economia do produto acabado apenas contando peças removidas.
