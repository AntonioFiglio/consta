# Viabilidade inicial da tag Consta — bancada

Pesquisa assistida por IA, com fontes primárias consultadas em 07/11/2026. Proposta para discussão; não é seleção da BOM, desenho de fabricação nem liberação hospitalar. O levantamento foi feito em leitura; esta nota registra alternativas para discutir o protótipo visual. Os documentos lidos (`hardware/README.md` e `docs/rastreamento/arquitetura-ble.md`) preservam o nRF52833 como candidato não selecionado e não registram hardware construído.

## Direção recomendada

Para demonstrar anúncios BLE e presença por setor em bancada, começar com **Seeed Studio XIAO nRF52840 original, sem Sense e sem Plus**, bateria LiPo protegida e gabinete desmontável impresso. Escolher módulo e PCB próprios depois de medir consumo e confirmar requisito de RSSI/AoA. Não assumir Direction Finding/AoA na rota XIAO nRF52840. A sugestão não substitui a decisão do projeto sobre nRF52833.

| Rota | O que existe pronto | Trabalho necessário | Uso proposto |
| --- | --- | --- | --- |
| XIAO nRF52840 | Rádio, antena, USB, regulador e carregador em placa comercial | Firmware de anúncios, conexão correta da bateria, retenção mecânica, medição e gabinete | Primeiro demonstrador de bancada |
| Raytac MDBT50Q-1MV2 + PCB própria | Módulo nRF52840 com antena integrada | Esquemático, alimentação/carregador/proteção, desacoplamento, PCB, SWD, montagem e testes | Próxima revisão para controlar forma e manutenção |

As duas rotas usam nRF52840 e não confirmam a BOM final. Se AoA for requisito, reabrir seleção do SoC/módulo; não vender a simples troca de placa como implementação de localização.

## Componentes e documentos verificáveis

**XIAO:** a placa original tem contorno **21 × 17,8 mm**. A documentação informa BQ25101 e correntes de carga aproximadamente **50 mA ou 100 mA**, controladas por P0.13. O pino 3V3 é explicitamente saída. A altura montada, tolerâncias e área livre para gabinete não ficaram estabelecidas nesta consulta: importar DXF/esquemático da revisão realmente comprada e medir a placa. A wiki mistura variantes e tem instruções textuais de seleção de corrente divergentes do exemplo de código; validar contra esquemático e medir antes de carregar. [Documentação Seeed e recursos mecânicos](https://wiki.seeedstudio.com/XIAO_BLE/), [esquemático oficial atualmente vinculado](https://files.seeedstudio.com/wiki/XIAO-BLE/Res/260828_XIAO_nRF52840.pdf), [DXF oficial](https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-DXF.zip).

**Bateria candidata:** Adafruit **1317**, LiPo protegida **150 mAh**, **3,7 V nominal**, carga de término **4,2 V**. Catálogo declara **19,75 × 26,02 × 3,8 mm**, cabo **127,5 mm**, conector JST-PH. O datasheet PKCELL vinculado apresenta **20 ± 0,3 × 25 ± 0,3 × 4,0 ± 0,3 mm** no desenho, além de fio/conector; portanto catálogo e desenho não devem ser tratados como um envelope único garantido. Confirmar fabricante, revisão e medidas do lote entregue antes de congelar CAD. [Produto oficial](https://www.adafruit.com/product/1317), [datasheet original do fabricante disponibilizado pelo fornecedor](https://cdn-shop.adafruit.com/product-files/1317/C1515_-_Li-Polymer_402025_150mAh_3.7V_with_PCM.pdf).

**Módulo alternativo:** Raytac **MDBT50Q-1MV2**, versão L do datasheet: **15,5 × 10,5 × 2,05 mm**. Não confundir com MDBT50Q-P1MV2 ou revisões anteriores. VDD operacional **1,7–3,6 V**; VDDH **2,5–5,5 V**, cada qual exigindo circuito de referência apropriado. A faixa ampla não autoriza conectar uma LiPo carregada a VDD. Antena ocupa faixa **10,5 × 3,8 mm**; fabricante pede ausência de ground correspondente em cada camada, ampliada quanto possível, e posicionamento à borda. Isso é regra de layout, não distância universal de bateria/metal. [Datasheet Raytac versão L, cópia primária hospedada pela Mouser](https://www.mouser.com/datasheet/3/1361/1/nRF52840_MDBT50Q_1MV2_MDBT50Q_P1MV2_Ver.L_spec.pdf), [download do fabricante](https://www.raytac.com/tw/download/index.php?index_id=24). O servidor do fabricante falhou por timeout; a cópia do documento foi consultada.

## Alimentação correta da primeira bancada

Conectar bateria LiPo compatível aos pads **BAT+ e BAT−** da revisão exata da XIAO, por chicote com alívio de tração e polaridade conferida. Não conectar a bateria diretamente ao pino 3V3; não usar 5V/VBUS como entrada de uma LiPo. A XIAO original não possui o receptáculo JST da bateria: será necessário chicote/adaptador apropriado soldado aos pads, com inspeção e teste de continuidade sem bateria antes da energização. Proteção PCM da bateria não substitui o carregador CC/CV nem uma integração elétrica revisada. O produto 1317 admite carga até **150 mA**; configurar e medir o carregador da placa, sem copiar cegamente exemplo da wiki. Não conectar ao circuito ou à fonte do equipamento médico.

## Envelope proposto para estudar CAD

Gabinete retangular arredondado desmontável, **60 × 35 × 15 mm externos**, com parede nominal inicial **1,5 mm**, apenas como alvo de estudo. Sem grau IP, sem alegação de resistência química, sem alegação de compatibilidade RM. Uma base separada pode receber cinta/fixação após avaliação; não incluir a fixação nestas dimensões. Esta proposta é deliberadamente revisável após prova de montagem.

Arranjo inicial lado a lado, com ponta da antena voltada para a extremidade externa do gabinete e bateria afastada dela. Evitar parafusos, insertos, adesivo metálico, fios e bateria sobre a antena. Não há nesta pesquisa afastamento numérico certificado para a XIAO: validar a zona em documentação específica e por ensaio RF com gabinete e objeto representativo. Manter acesso ao USB e ao reset sob tampa removível; o recorte USB só pode ser cotado após confirmar conector/placa/cabo.

**Orçamento simbólico** (todas as dimensões em mm):

- `L_int = L_ext - 2*t`; `W_int = W_ext - 2*t`; `H_int = H_ext - 2*t`.
- `L_int ≥ L_bat_reservado + L_placa + g + reservas_de_pontas`.
- `H_int ≥ max(H_placa_montada + suporte + folga, H_bateria + retenção + folga, H_conector + folga)`.
- Reservar inicialmente **28 × 22 × 5 mm** para o corpo da bateria como decisão de projeto, ainda sem chicote, conector, raio de curvatura e expansão. Isto não é especificação do fabricante nem garantia de cabimento.
- Com os valores propostos, SciMath retornou interior ideal **57 × 32 × 12 mm**. Para `57 - (28 + 21 + 3)`, retornou **5 mm** de reserva longitudinal; para `32 - 22`, **10 mm** de reserva transversal. O gap **3 mm** é hipótese mecânica, não requisito RF validado. Não se pode consumir toda reserva com cantos, nervuras e parafusos.

As contas foram executadas em SciMath com grandezas originais e saída em mm; não incluem tolerâncias nem deformação. Aviso da ferramenta: magnitudes com unidades usam a precisão numérica do backend Pint. Sem altura da placa e volume do chicote medidos, **não foi demonstrado que o gabinete cabe**. O arranjo evita depender de bateria empilhada sob a antena e oferece uma hipótese concreta para teste de interferência.

## O que falta antes do desenho fabricável

Confirmar placa/SKU/revisão e seus arquivos mecânicos; obter amostras da bateria com desenho atual e medir pacote protegido, cabo e conector; selecionar chave/chicote e retenção; medir envelope montado e zonas de solda; definir processo de impressão, material, orientação e tolerância real da impressora; incluir folga sem comprimir ou perfurar a pouch; verificar alojamento de tampa, fixadores e acesso de manutenção; validar antena com gabinete, bateria e metal representativo; medir corrente de anúncios, sleep, LED e carga. Autonomia, precisão por setor e segurança hospitalar permanecem sem comprovação.

Um render GPT Image com fundo transparente pode comunicar a forma aprovada e a marca. Não usá-lo como vista cotada, tolerância, prova de encaixe, PCB real ou evidência de produto validado. CAD/desenho deve derivar dos componentes medidos e da revisão aprovada, independentemente do render.
