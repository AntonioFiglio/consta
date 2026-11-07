# BLE em access points: avaliação para o pitch

Pesquisa documental em 6 de novembro de 2026. Fontes primárias públicas; sem acesso à rede do hospital, cotação, ensaio físico ou seleção de fornecedor.

## Parecer

**Faz sentido manter BLE como direção do Consta e apresentar APs com receptor BLE como possibilidade de infraestrutura. Não faz sentido condicionar o produto à troca de todos os APs do hospital ou prometer ausência de interferência.** Esta é uma recomendação técnica para o pitch, não uma compra aprovada nem alteração da direção de desenvolver tag e receptor próprios.

A arquitetura proposta continua sendo tag a bateria → receptor fixo → LAN → serviço local → CRM. Um AP compatível pode exercer o papel do receptor; cobertura e integração precisam ser demonstradas. “Roteador” não é a especificação adequada: o componente a avaliar é o access point, seus rádios, firmware e interfaces.

## O que as fontes confirmam

| Fonte consultada | Evidência | Limite para o Consta |
| --- | --- | --- |
| [Cisco — Wireless APs](https://www.cisco.com/c/en/us/td/docs/wireless/spaces/iot-services-wireless/b_iot_services/m-wireless-aps.html) | Há gateways BLE em APs compatíveis com modos Scan, Transmit e Dual | Ter Bluetooth ou transmitir beacon não demonstra capacidade de receber nossas tags; verificar modelo e firmware |
| [Cisco DevNet — eventos Firehose](https://developer.cisco.com/docs/cisco-spaces-firehose/event-types/) | A interface inclui `BLE_RSSI_UPDATE` e eventos IoT | Exportar RSSI não equivale a obter sala ou posição correta; requer integração e estimador |
| [Cisco — Local Firehose](https://www.cisco.com/c/en/us/td/docs/wireless/spaces/connector/config/b_connector_30/m-local-firehose.html) | Connector entrega eventos BLE ao motor de localização parceiro; configuração usa dashboard Spaces e ativação de aplicação parceira | Há caminho de dados local documentado, mas isso não prova autonomia integral sem WAN. Conferir licenças, provisionamento, autenticação, recuperação e operação offline |
| [HPE Aruba — `iot transportProfile`](https://arubanetworking.hpe.com/techdocs/CLI-Bank/Content/aos8/iot-trans-pro.htm) | ArubaOS documenta exportação BLE para endpoint configurável, `Telemetry-Websocket`, filtros e relatórios RSSI | É candidato para backend próprio local. Suporte depende do conjunto AP/rádio/versão; o comando documentado na licença base não prova custo zero da solução ou comportamento de outros modos de gestão |

Essas fontes demonstram a existência da categoria, sem sustentar “quase todos os APs modernos” ou “o hospital ganha RTLS automaticamente”. A Huawei citada no texto original não foi homologada como opção nesta pesquisa; nenhuma das marcas foi selecionada para o projeto.

## Correções do texto recebido

| Alegação | Avaliação |
| --- | --- |
| iPhones fixos garantiriam rastreamento de AirTags ou qualquer tag em tempo real | A analogia ajuda a explicar observadores fixos; não estabelece interoperabilidade, latência ou capacidade. Não adotar AirTag como contrato de rádio do Consta |
| Basta instalar APs com BLE para ter localização | Falta verificar recepção, acesso ao payload, identidade, RSSI/horário/receptor, transporte, software de localização e cobertura |
| Distância fixa entre receptores garante cobertura | Não há espaçamento universal definido. Projeto e ensaio devem considerar paredes, pisos, portas, metal, pessoas e posição das tags |
| Potência BLE fica necessariamente no intervalo baixo citado | O [Bluetooth SIG](https://www.bluetooth.com/learn-about-bluetooth/tech-overview/) documenta potência de transmissão de até +20 dBm. É característica a configurar e medir, não limite universal de uma tag BLE |
| A tag sempre troca de canal instantaneamente quando há ruído | O [primer do Bluetooth SIG](https://www.bluetooth.com/bluetooth-le-primer/) distingue advertising de conexões. Anúncios legados usam os canais primários 37, 38 e 39; AFH de conexões não deve ser atribuído automaticamente ao beacon. Advertising não tem confirmação de recepção |
| Sala correta, atualização instantânea e bateria de anos | São hipóteses dependentes da implantação. Bateria, intervalo, potência, recepção, exportação e processamento têm compromissos; medir no protótipo |
| BLE é sempre mais barato que Wi-Fi ativo ou UWB | Não demonstrado para o Consta. Comparar custo total de tags, receptores/APs, licenças, cabeamento, servidor, implantação, calibração, bateria e suporte |

As observações de propagação têm fundamento na explicação do [Bluetooth SIG sobre alcance](https://www.bluetooth.com/learn-about-bluetooth/key-attributes/range/). RSSI pode apoiar estimativa por setor, mas sala correta exige validação; [AoA](https://www.bluetooth.com/learn-about-bluetooth/feature-enhancements/direction-finding/) exige hardware e antenas apropriados, não apenas o rótulo BLE.

A [Apple](https://support.apple.com/en-us/119874) descreve identificadores Bluetooth que mudam frequentemente e a rede Buscar com proteção de localização. Inferência de integração: não pressupor que APs corporativos consigam transformar AirTags em tags empresariais de identidade estável ou consultar livremente sua posição. A semelhança de experiência não torna os ecossistemas equivalentes.

## Segurança: baixa potência não é laudo

O [NHS relata no MKUH](https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/knowledge-products-and-artefacts/advice-and-guidance/internet-of-things-implementation-lessons-learned/lessons-learned/) que pontos BLE afetaram equipamentos médicos dependentes de Wi-Fi e restringiram a implantação RTLS. O relato atribui o problema ao compartilhamento do espectro e descreve mitigação naquele local. Não documenta lesão de paciente nem demonstra incompatibilidade universal, mas contradiz a garantia de que a interferência seria irrelevante ou sem consequência operacional.

A [FDA](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/radio-frequency-wireless-technology-medical-devices-guidance-industry-and-fda-staff) recomenda avaliar coexistência, qualidade de serviço, segurança e EMC. Reduzir potência e tempo de transmissão é uma medida de projeto; não quantifica o risco clínico da instalação. Não é possível atribuir “risco extremamente baixo” ao Consta sem configuração e evidências próprias.

A [descrição pública da IEC 60601-1-2](https://webstore.iec.ch/en/publication/2590) trata de requisitos e ensaios de segurança básica e desempenho essencial de equipamentos e sistemas eletromédicos frente a perturbações eletromagnéticas. Escolher BLE não confere conformidade automática. Foi consultada a descrição pública, não o texto integral pago; o enquadramento e a edição aplicável precisam de avaliação especializada.

A [Anatel](https://www.gov.br/pt-br/servicos/homologar-produtos-de-telecomunicacoes-anatel) descreve a homologação para uso/comercialização de produtos de telecomunicações no Brasil. Certificação estrangeira não a substitui automaticamente; módulo homologado não libera por si só o produto final ou a instalação hospitalar. Referências FDA/NHS não são legislação brasileira.

Aplicar o [plano de validação](../rastreamento/validacao.md) e a [avaliação de segurança](../rastreamento/seguranca-hospitalar.md): coexistência com a rede real, desempenho essencial dos equipamentos selecionados, montagem, limpeza e liberação por área. Tags continuam fora do escopo inicial de áreas especiais de RM. Criptografia e controle de acesso devem ser especificados; identidade BLE aberta não é, sozinha, segurança contra cópia ou rastreamento externo.

## Caminho recomendado

1. Inventariar APs, controladores, versões, licenças, cobertura e sistemas de localização já existentes com TI e engenharia clínica. Não pressupor ausência de infraestrutura no HCFMUSP.
2. Em ambiente autorizado, verificar se um AP recebe o payload da tag e exporta identificação resolvível, receptor, horário e RSSI ao serviço local. Desenvolver o adaptador respeitando os contratos do projeto.
3. Comparar reaproveitamento de APs, receptores dedicados e solução híbrida. Renovação seletiva de APs só entra com justificativa de custo, cobertura, manutenção e impacto na rede assistencial; não exigir renovação geral para iniciar o piloto.
4. Validar associação tag–ativo, acerto de setor, transição entre áreas, falsos alertas, atualização, capacidade e consumo. Metas devem ser acordadas antes do ensaio; não há números aprovados nesta pesquisa.
5. Testar perda de WAN preservando LAN/energia e, separadamente, falhas de LAN, receptor e servidor. Exportação local documentada não substitui o ensaio do caminho inteiro.
6. Avaliar coexistência e desempenho essencial com os responsáveis do hospital antes de uso assistencial. Expandir somente o conjunto de modelos e áreas liberados.

## Formulação para o hackathon

> O Consta propõe conectar documentos e manutenção à localização automática dos equipamentos móveis. Tags BLE a bateria serão detectadas por receptores fixos, com processamento previsto na rede local. Vamos avaliar o aproveitamento de APs com BLE compatíveis e complementar a cobertura quando necessário. O piloto medirá localização por setor e atualização, além de avaliar coexistência e compatibilidade com engenharia clínica e TI antes do uso assistencial.

Se perguntarem sobre troca da rede: **“Não é pré-requisito. Primeiro verificamos a infraestrutura existente e suas interfaces; receptores dedicados são uma alternativa.”**

Se perguntarem sobre interferência: **“BLE permite projetar comunicação de baixo consumo, mas segurança depende do conjunto e da instalação. A liberação será por equipamentos e áreas avaliados.”**

Não anunciar “sem interferência”, certificação IEC, precisão de sala, economia, bateria de anos, suporte a todo AP ou rastreamento em tempo real como resultados já alcançados. A evidência produzida aqui é documental; CRM, adaptador, firmware e protótipo continuam pendentes conforme o [estado atual](../estado-atual.md).
