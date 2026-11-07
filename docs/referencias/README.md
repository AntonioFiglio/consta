# Fontes e limites da pesquisa

Registro de pesquisa dirigida, não revisão sistemática, laudo ou verificação contínua dos fornecedores. As fontes foram consultadas durante a preparação do projeto; datas de publicação e de implantação não devem ser confundidas com estado atual de um hospital. As referências abaixo informam decisões, sem transferir resultados de terceiros ao Consta.

## Pacote de pesquisas auditado

O [estudo do pacote fornecido por Matheus](estudo-pacote-pesquisas.md) consolida novas evidências documentais e revisa as premissas econômicas. Consulte a [auditoria documental](auditoria-corpus-documental.md), a [auditoria de rastreabilidade](auditoria-rastreabilidade.md) e a [auditoria econômica](auditoria-economia-ociosidade.md). Os [metadados e casos de avaliação](../../data/referencias/README.md) preservam fonte e identidade, sem publicar cópias integrais dos documentos.

## Contexto do produto

- [Catálogo de alegações e limites](alegacoes-e-limites.md): contexto hospitalar brasileiro, manutenção, concorrência e enquadramento. Conserva a identificação das fontes e dos recortes originais.
- [Descoberta no hackathon](descoberta-hackathon.md): síntese de gravações fornecidas por Matheus. Falas são relatos/sugestões, não validação de mercado ou requisito aprovado automaticamente.
- [Notícias para o pitch](noticias-para-pitch.md): reportagens do G1, UOL e outros veículos, com datas, contraditório e ligação limitada ao produto. Casos de indisponibilidade não demonstram que software evitaria a falha.
- [OMS — programa de manutenção](https://www.who.int/publications/i/item/9789241501538): fundamenta manutenção planejada; não demonstra eliminação de falhas.
- [OMS — sistemas de informação de inventário e manutenção](https://www.who.int/publications/i/item/9789240111257): referência de gestão, não validação do Consta.
- [Anvisa — RDC 509/2021](https://bvsms.saude.gov.br/bvs/saudelegis/anvisa/2020/rdc0509_27_05_2021.pdf): referência do gerenciamento de tecnologias abrangidas. Aplicabilidade e marco vigente precisam ser conferidos na implantação; a norma não exige compra do Consta.

## BLE e compatibilidade

| Fonte primária | O que sustenta | Limite |
| --- | --- | --- |
| [Bluetooth SIG — Direction Finding](https://www.bluetooth.com/learn-about-bluetooth/feature-enhancements/direction-finding/) | Mecanismo AoA/AoD e necessidade de antenas apropriadas | Não demonstra precisão em nosso hospital |
| [Nordic — nRF52833](https://www.nordicsemi.com/Products/nRF52833) | Componente disponível com BLE e Direction Finding | Não é projeto completo, seleção de peça ou aprovação hospitalar |
| [FDA — tecnologia RF em dispositivos médicos](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/radio-frequency-wireless-technology-medical-devices-guidance-industry-and-fda-staff) | Avaliar coexistência, qualidade de serviço e EMC | Referência técnica dos EUA; não certifica nosso produto |
| [FDA — EMC](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/electromagnetic-compatibility-emc-medical-devices) | Avaliação de compatibilidade de dispositivos no escopo | Não aplicar automaticamente ao software administrativo puro |
| [FDA/CDRH — EMC/EMI em hospitais](https://www.fda.gov/radiation-emitting-products/electromagnetic-compatibility-emc/fdacdrh-recommendations-emcemi-healthcare-facilities) | Gestão do ambiente e avaliação coordenada | Não fornece distância universal para o Consta |
| [NHS — lições de implementação IoT](https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/knowledge-products-and-artefacts/advice-and-guidance/internet-of-things-implementation-lessons-learned/lessons-learned/) | Caso de interferência BLE/Wi-Fi afetando equipamentos dependentes de rede | Não prova lesão, dano físico ou incompatibilidade de todo BLE |
| [FDA — riscos em RM](https://www.fda.gov/radiation-emitting-products/mri-magnetic-resonance-imaging/benefits-and-risks) | Materiais, campos, eletrônica e imagem têm riscos próprios | Tag não herda classificação do ativo; corredor não define segurança sozinho |
| [Anatel — homologação](https://www.gov.br/pt-br/servicos/homologar-produtos-de-telecomunicacoes-anatel) | Processo de conformidade de telecomunicações no Brasil | Não substitui avaliação do conjunto e do local hospitalar |

As análises vigentes estão em [arquitetura BLE](../rastreamento/arquitetura-ble.md) e [segurança hospitalar](../rastreamento/seguranca-hospitalar.md). Não houve ensaio físico do Consta.

## Contratos públicos disponíveis

Na pesquisa anterior, foi identificado **um registro público específico** usado como referência de contrato: [contrato nº 00020/2023 do Hospital das Clínicas da UFPE, no PNCP](https://pncp.gov.br/app/contratos/15126437000143/2023/007439). O objeto publicado descreve manutenção preventiva e corretiva de um angiógrafo identificado. HC-UFPE e HCFMUSP são instituições diferentes.

O registro ilustra vínculo entre contrato e equipamento. Não é um corpus amplo de contratos, não comprova execução das manutenções nem fornece inventário ou pendências do HCFMUSP. A demo deve usar documento sintético; campos como periodicidade e marco inicial só podem ser extraídos quando estiverem no documento efetivamente consultado. Não afirmar análise integral de anexos ou cláusulas sem realizá-la.

O novo pacote ampliou o material para **25 registros documentais**, com **8 PDFs adicionais de contratos publicados como assinados**, além de editais/TRs e extratos. Isso não equivale a 25 contratos ou compras concluídas. A [auditoria](auditoria-corpus-documental.md) registra os vínculos, leituras, hashes, estágios e conflitos; o contrato do HC-UFPE permanece fora desse recorte.

## Precedentes internacionais de rastreamento hospitalar

| Local e fonte | Tecnologia/escopo documentado | Limite de interpretação |
| --- | --- | --- |
| EUA — [Martinez et al., Johns Hopkins, 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7647311/), DOI `10.1093/jamia/ocaa033` | Estudo original com movimentos de bombas e infraestrutura RF + infravermelho | Não é evidência BLE; cobertura de inventário não é acerto de sala. Não demonstra EMC ou operação sem WAN |
| EUA — [Østbye et al., Duke, 2003](https://scholars.duke.edu/publication/742794), DOI `10.1023/A:1023709421380` | Avaliação controlada de rastreamento infravermelho/RF de equipamentos | Resultados de detecção e sala eram distintos; tecnologia histórica e efeito não uniforme por categoria |
| EUA — [UC Davis, edital de suporte RTLS](https://health.ucdavis.edu/media-resources/supply-chain/documents/fy26/10152025_BJ_RFP_RTLS_Preventive_Maintenance-12.2026_Final.pdf) | Registro institucional de infraestrutura instalada e necessidade de manutenção | Edital não prova execução dos serviços nem identifica todos os dispositivos como BLE; acesso posterior ao PDF foi intermitente |
| Reino Unido — [NHS, Mid Cheshire](https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/innovation-and-strategy/wireless-trialist-case-studies/mid-cheshire-hospitals-nhs-foundation-trust/) | Relato institucional de rastreamento de móveis com infraestrutura sem fio e caminho incluindo nuvem | Banco local não comprova operação sem internet; Reino Unido não integra a UE |
| Países Baixos/UE — [Radboudumc, relatório de 2021](https://www.radboudumc.nl/over-het-radboudumc/impact-2021/organisatie/bedrijfsvoering-2021) | Hospital relata track-and-trace de equipamentos móveis com Philips | A fonte institucional consultada não detalha rádio, precisão ou operação offline |
| Suécia/UE — [Pendrill et al., registro da Universidade de Lund, 2021](https://www.lunduniversity.lu.se/publication/f5d90e65-c531-4536-b4f8-2a9ba9d0667e), DOI `10.1080/24725579.2021.1881660` | Estudo de viabilidade com identidades BLE, observadores fixos, RSSI e serviço em nuvem | Escopo misto de equipamentos/pessoas, participação industrial e acesso integral ao editor limitado; não valida hospital inteiro ou LAN-only |

Esses casos sustentam o uso operacional de RTLS em hospitais, não uma equivalência de tecnologias ou uma garantia de ausência de interferência. A pesquisa original diferenciou estudos de campo, relatos institucionais e editais; não foi uma auditoria das instalações atuais.

## Fornecedores como referência, sem escolha fechada

[Quuppa](https://www.quuppa.com/documentation/QPE/topics/offline_module.html) documenta um módulo específico para operação offline. Isso ilustra por que é preciso conferir o caminho completo e a licença, mesmo quando receptores são cabeados e o motor pode ser local. Seu [guia Q17](https://www.quuppa.com/documentation/Q17/topics/Q17_installation_guide.html) contém restrições de uso do rádio; não é uma autorização universal para hospitais.

[Sonitor](https://www.sonitor.com/solutions/asset-tracking/) e [CenTrak](https://centrak.com/solutions/asset-tracking/) são referências comerciais de categoria. Produtos podem combinar modalidades; “infravermelho” ou “ultrassom” não prova ausência de rádio no sistema. Nenhum fornecedor foi contratado ou incorporado à arquitetura como dependência obrigatória.

## Autoria e propriedade intelectual

Usar BLE e componentes comerciais permite construir produto próprio; não torna o protocolo inventado pela equipe. Registrar decisões, contribuições, versões e licenças de SDKs/bibliotecas. O repositório público não concede automaticamente direito de copiar firmware, placas ou algoritmos proprietários de terceiros. Marca, patenteabilidade e liberdade de operação ainda não foram verificadas juridicamente.

## Atualização das evidências

Ao acrescentar uma afirmação, registrar fonte primária, data/recorte, o que foi consultado e limite do que ela demonstra. Resultados do Consta devem apontar configuração, método e dados do ensaio. Fontes de terceiros não substituem o [plano de validação](../rastreamento/validacao.md).
