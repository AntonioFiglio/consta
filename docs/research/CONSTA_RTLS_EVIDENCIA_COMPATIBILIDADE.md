# Consta — evidência comercial de compatibilidade de RTLS e rede local

Pesquisa dirigida em 6 de novembro de 2026. Complementa [a análise de EMC e exames](CONSTA_EMC_EXAMES_E_SEGURANCA.md). Escopo: tags autônomas, sensores distribuídos, processamento em LAN sem internet contínua, segurança clínica e interferência na instalação elétrica.

## Decisão que a evidência permite

**Há soluções comerciais documentadas para a arquitetura de tags e receptores com Ethernet; não foi encontrada comprovação pública de que um modelo específico satisfaça irrestritamente “nenhum impacto clínico, nenhum artefato de exame e nenhuma perturbação elétrica” em todo hospital.** Conformidade EMC é evidência de ensaio em condições delimitadas. A conclusão para Consta é selecionar produto, tag, rede e montagem exatos e validar o ambiente de uso.

A autonomia da tag significa alimentação própria e envio automático de identificador, não segurança eletromagnética automática. Não alimentar a tag pela porta USB, saída auxiliar ou fonte do equipamento médico evita um acoplamento elétrico direto, mas ainda deixa possíveis acoplamentos radiados, proximidade de sensores, restrições de montagem e particularidades de imagem. Isso é argumento de arquitetura proposto, não resultado experimental do Consta.

## Matriz de evidência verificada

| Produto/estudo | Documento e constatação | O que sustenta | O que não sustenta |
| --- | --- | --- | --- |
| Quuppa Q17 | Declaração UE, modelo exato Q17, assinada em 20/08/2025: EN 301 489-1 V2.2.3; EN 301 489-17 V3.3.1; EN 62368-1:2014/A11:2017; EN 62479:2010; EN 300 328 V2.2.2. [PDF oficial](https://quuppa.com/documentation/certificates/Quuppa_Q17_EU_DeclarationOfConformity.pdf) | Declaração do fabricante de conformidade de equipamento de rádio e segurança/saúde nas condições de finalidade prevista. | O documento não declara IEC 60601-1-2, aprovação para RM ou ausência de artefatos. Não é relatório de ensaio do conjunto Consta nem cobre uma tag de terceiro. |
| Quuppa Q35 | Declaração UE atual do Q35, mesma data e conjunto de normas de EMC/segurança de rádio acima. [PDF oficial](https://quuppa.com/documentation/certificates/Quuppa_Q35_EU_DeclarationOfConformity.pdf) | Evidência documental específica do locator Q35. | Não transfere sua conformidade ao hospital, à fonte, ao switch ou à tag arbitrariamente escolhida. Não equivale a autorização clínica. |
| Quuppa Q17, instruções de segurança | O manual orienta instalação profissional e proíbe ligar onde dispositivos sem fio sejam proibidos ou possam causar interferência/perigo. [Manual oficial](https://www.quuppa.com/documentation/Q17/topics/Q17_installation_guide.html) | O fabricante reconhece condições locais e restrições de instalação. | Contradiz o uso do produto como garantia genérica de “não interfere em nada”. |
| Q17/Q35, infraestrutura | Comparativo oficial lista dados por Ethernet e alimentação PoE ou micro-USB. [Comparativo oficial](https://www.quuppa.com/documentation/megamap/topics/hardware_comparison.html) | Permite projetar backhaul cabeado e alimentação centralizada dos sensores. | Ethernet não torna o sistema sem rádio: os locators são transceptores RF, e a localização envolve sinais das tags. |
| Quuppa QPE, operação offline | Módulo Offline opcional, comprado e ativado antecipadamente; QPE e controlador locais. [Manual oficial do módulo](https://www.quuppa.com/documentation/QPE/topics/offline_module.html) | É possível projetar operação sem internet contínua com licenciamento adequado e arquivos locais válidos. | Instalar servidor local não assegura autonomia offline por si só: sem módulo, o manual informa interrupção do rastreamento após 48 horas offline para verificação de licença. A assinatura ainda tem validade e exige atualização manual dos arquivos. |
| SonitorONE | A plataforma atual declara tags híbridas ULE + BLE, tags BLE e arquitetura hospedada em nuvem. [Plataforma oficial](https://sonitor.com/platform/) | Exemplo comercial real de sensores, tags e integração RTLS hospitalar. | “Usa ultrassom” não significa que não usa RF; a página pública atual não comprova implantação totalmente offline nem ensaio universal de não interferência. |
| SonitorONE, infraestrutura | ultraBeacons emitem/recebem ULE e BLE; gateways emitem/recebem BLE e fornecem backhaul. [Descrição oficial](https://sonitor.com/platform/rtls-infrastructure/) | Permite entender o caminho físico das observações no produto atual. | Não justificar “sensor só escuta”, “zero RF” ou “sem impacto elétrico” sem definir o SKU e sua configuração. |
| CenTrak, arquitetura | O fabricante descreve combinação de Gen2IR, RFID ativo, Wi-Fi e BLE. [Descrição oficial](https://centrak.com/resources/blog/rtls-vs-rfid) | Evidência de sistema híbrido de localização. | Não chamar o conjunto de óptico puro ou isento de RF por incluir infravermelho. |
| CenTrak, alegação de interferência | Blog institucional afirma certificação FCC, escolha de banda e ausência de relatos recebidos de interferência. [Publicação oficial](https://centrak.com/resources/blog/secret-to-rtls-staff-buy-in) | Relato comercial do fornecedor que pode orientar perguntas de diligência. | Não substitui relatório experimental por modelo, condições e critérios; ausência de relatos não prova ausência de risco. Não foram obtidos, nesta pesquisa, laudos médicos completos que comprovem todos os requisitos do Consta. |
| Bluetooth hospitalar, artigo de 2004 | Estudo original encontrou compatibilidade do enlace ensaiado com os equipamentos avaliados. [PubMed](https://pubmed.ncbi.nlm.nih.gov/14980934/) | Evidência de viabilidade em configuração delimitada. | Não valida BLE atual, qualquer tag, montagem, densidade ou exame. O texto integral não foi examinado nesta etapa. |
| RFID, estudo de 2013 | Artigo experimental aberto FDA/CDRH descreve EMI em certas combinações e ausência em outras. [Artigo completo](https://pmc.ncbi.nlm.nih.gov/articles/PMC3716957/) | Confirma necessidade de testar fontes e equipamentos específicos. | Não demonstra que todo RFID é inseguro nem que uma banda sem ocorrência no estudo é universalmente segura. |

**Controle de versão documental:** o resultado de busca indexado do PDF Q35 com `www` apresentou versão histórica de 2020. A leitura dos PDFs atuais apontados pelo [índice oficial de declarações](https://www.quuppa.com/documentation/megamap/topics/hardware_declaration_of_conformity.html), no domínio sem `www`, mostrou a revisão de 2025 acima. Confirmar revisão e modelo na compra; não misturar versões. Declaração de conformidade não é o mesmo que ter acesso ao relatório integral com arranjos e resultados do laboratório.

## Rede elétrica: PoE não é PLC

**PoE:** alimentação DC e dados usam o cabo Ethernet de cobre. O switch/injetor alimenta o dispositivo de rede compatível; não se está usando a fiação AC do hospital como canal de dados. [Cisco — definição de PoE](https://www.cisco.com/site/us/en/learn/topics/networking/what-is-power-over-ethernet.html).

**PLC/powerline:** adaptadores usam a instalação elétrica para transportar comunicação. É outra arquitetura. Para Consta, propor Ethernet dedicada em vez de PLC evita adicionar intencionalmente esse canal de comunicação à fiação de potência, mas não elimina consumo, fontes chaveadas, emissões conduzidas ou defeitos de instalação. [TP-Link — descrição técnica da arquitetura powerline](https://www.tp-link.com/us/powerline/).

A orientação NHS recomenda planejar percurso de cabos, afastamento de fontes de EMI, blindagem quando apropriada e fibra óptica como alternativa imune a EMI no enlace. Também ressalta que os cabos não devem criar interferência. **A fibra elimina o caminho condutivo do segmento óptico; não certifica fontes, switches e eletrônica nas pontas.** Essa última distinção é inferência de engenharia. [NHS — infraestrutura](https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/knowledge-products-and-artefacts/advice-and-guidance/wireless-infrastructure-building-guidance-for-health-and-care-organisation/infrastructure-guidance//).

A FDA identifica perturbações conduzidas, radiadas e descargas eletrostáticas como formas relevantes de energia eletromagnética. Portanto, um projeto cabeado também demanda EMC. [FDA — conceito de compatibilidade](https://www.fda.gov/radiation-emitting-products/radiation-safety/electromagnetic-compatibility-emc).

### Proposta para a instalação do Consta

Proposta de projeto, sem instalação realizada:

- Tags a bateria sem conexão elétrica, lógica ou de controle à máquina médica; montagem externa aprovada que preserve identificação, ventilação, limpeza e operação.
- Sensores fixos ligados por Ethernet/PoE a switch da infraestrutura RTLS. Nenhum adaptador powerline e nenhum uso de tomada/porta da máquina como ponto de energia da tag.
- Controlador e aplicação em servidor local, com autenticação e armazenamento locais; licenças, tempo, DNS, atualização e autenticação precisam ser analisados para não esconder dependências de internet.
- Circuito e alimentação dimensionados e autorizados pela infraestrutura hospitalar; não compartilhar extensões de equipamentos assistenciais nem alterar circuito crítico por conveniência.
- UPS para a infraestrutura de TI quando adequada ao projeto. Não colocar bombas, ventiladores ou outros equipamentos assistenciais na UPS da TI.
- Perda de energia/rede deve gerar localização desatualizada ou indisponível, sem enviar comando clínico nem alterar terapia; validar esse comportamento em falha real de bancada.

Uma UPS comum não é automaticamente apropriada para equipamento assistencial. A política APC/Schneider informa que seus produtos monofásicos/trifásicos não são testados/certificados às normas médicas indicadas e restringe usos em suporte à vida/cuidado direto quando falha possa causar risco. Essa restrição específica não proíbe qualquer UPS de TI no hospital; exige separar finalidade e selecionar o produto para o local e aplicação reais. [Política oficial](https://www.se.com/us/en/faqs/FAQ000270822/).

## Evidência mínima antes de afirmar atendimento aos requisitos

Solicitar ao integrador o conjunto exato de tag, locator, fonte, switch, firmware, licenças e montagem; declaração e relatórios completos aplicáveis; identificação de homologação brasileira quando exigível; restrições MR; materiais/limpeza; e histórico documentado de aplicações semelhantes. Definir com engenharia clínica e física médica os equipamentos e exames a avaliar. Ensaiar emissões/imunidade e desempenho clínico pertinente em configuração representativa, sem pacientes. Comparar qualidade de imagem com fantomas quando houver exposição ou presença de componentes na região de exame. Verificar falha de alimentação, reconexão e recuperação local.

O resultado esperado é uma matriz de condições aprovadas e excluídas, não uma frase absoluta. Um fornecedor pode oferecer documentação adicional sob contrato; a ausência dela na busca pública é **limite da pesquisa**, não prova de que o fornecedor não a possua.

## Frase defensável

“Usaremos tags autônomas e sensores de localização independentes das máquinas médicas, com rede Ethernet e processamento local. Isso evita ligar o rastreador ao circuito do equipamento e permite operar sem internet quando o produto e o licenciamento suportarem. Os equipamentos escolhidos terão documentação de conformidade e serão verificados no ambiente hospitalar. Não prometemos zero interferência: demonstraremos que a configuração aprovada preserva o desempenho e os exames nas condições de uso.”
