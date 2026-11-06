# Consta — identidade óptica individual e RTLS de equipamentos móveis

Relatório de pesquisa e proposta de próxima prova de conceito. Versão: 06/11/2026. Preparado com ferramentas de IA, busca dirigida em fontes primárias, revisão por subagentes e emulação computacional. Não é revisão sistemática, laudo de segurança, projeto clínico aprovado ou demonstração de novidade patenteável.

## Resumo da decisão

**É possível atribuir a cada equipamento uma identidade óptica distinta dentro de uma família com o mesmo desenho geral.** O que muda é o padrão codificado, associado ao patrimônio de uma unidade física; o que permanece é a estrutura usada para encontrar e ler a marca. Identidade única no catálogo não significa leitura perfeita pela câmera. Há métodos publicados para marcadores circulares, como CCTag e RUNE-Tag, e o spike Consta demonstra uma implementação própria simplificada, sem QR e sem escaneamento humano. [R1–R2; experimento E1]

Para acompanhar ativos móveis frequentemente ocultos por pessoas, cortinas ou mobiliário, **minha recomendação operacional é avaliar BLE em áreas que venham a ser aprovadas pela instituição, com processamento local, mantendo a óptica como linha de P&D e possível complemento**. É uma proposta de engenharia baseada em mecanismos e precedentes, não uma superioridade medida em custo, cobertura ou segurança. A escolha final de produto/hardware continua aberta. [R3–R8; inferência]

A ideia de distinguir scanners instalados de bombas e monitores móveis é útil: um scanner fixo pode ter sua sala registrada no cadastro de instalação. Porém, seus acessórios e equipamentos de suporte podem entrar no ambiente de RM. Excluir uma sala no mapa não impede fisicamente essa entrada nem prova que qualquer transmissor no corredor seja aceitável. [R9–R12]

## Perguntas e método

A pergunta de pesquisa foi: quais arquiteturas permitem identidade individual e localização automática de ativos móveis na LAN, e o que a evidência internacional e uma emulação óptica delimitada permitem concluir?

Foram examinadas três questões: identidade óptica por unidade; uso documentado de RTLS nos EUA, UE e Reino Unido; e limites de BLE por zonas próximas de máquinas fixas. Foram priorizados artigos originais, documentos hospitalares, manuais de fabricantes e organizações técnicas. Casos comerciais servem como evidência do que o fornecedor descreve, sem converter alegação comercial em ensaio independente. Os registros em `sources/` preservam consultas, acesso integral ou parcial, conflitos de interesse e exclusões.

A busca foi dirigida e iterativa, não exaustiva. Não houve inspeção presencial, medição RF, câmera física, ensaio de exame ou inventário do HCFMUSP. A confirmação de que um sistema existiu no período da fonte não é auditoria de seu estado atual.

## Identidade individual: o mesmo desenho pode representar equipamentos diferentes

Uma etiqueta precisa de dois níveis: o layout que o detector reconhece e a informação que diferencia um exemplar. Assim, duas bombas iguais recebem padrões distintos, mesmo compartilhando anel, proporção e acabamento. O cadastro associa o ID lido à instituição, patrimônio e série. Faces adicionais da mesma bomba podem repetir sua identidade; equipamentos diferentes não devem compartilhar um ID emitido. [R1–R2; proposta de cadastro]

A distinção deve ser suficientemente grande para resistir às distorções previstas. “Microdiferenças” invisíveis à resolução da câmera não ajudam: o processamento só pode usar informação efetivamente observada. Mais IDs, menor marcador e maior distância de leitura competem com a informação disponível; este relatório não fixa capacidade hospitalar sem dimensionamento físico. Códigos separados e políticas conservadoras de rejeição reduzem algumas confusões, mas não resolvem cobertura opaca ou geometria mal estimada. [R1–R2; inferência de projeto]

CCTag codifica identidades com relações de anéis concêntricos; RUNE-Tag explora elementos circulares e codificação cíclica. São precedentes de que a família visual pode ser consistente sem ser QR. O nosso marcador de setores não reproduz esses algoritmos nem herda seus resultados. A biblioteca CCTag publica licença MPL-2.0; o experimento Consta não copiou essa implementação. Autoria do código de demonstração não é comprovação de invenção exclusiva. [R1–R2; E1]

Também é necessário separar identificação de autenticidade: se alguém copiar uma marca válida ou trocá-la de máquina, a câmera lerá a identidade apresentada. O sistema proposto exige governança do vínculo físico; a marca visual não é autenticação criptográfica. [Inferência de arquitetura]

## O que foi emulado e o que o resultado significa

Foi criado um spike descartável com uma família de **64 identidades**, cada uma com **24 setores**. O desenho compartilha anel de detecção e ponto central; o ponto não é âncora de orientação. O detector procura rotações cíclicas do padrão. O dicionário tem alvo de separação de pelo menos **6 bits**, auditado sob rotações e reflexos; a política de leitura admite no máximo **1 substituição** e exige separação do próximo candidato. Esses são parâmetros e propriedades discretas do experimento, não capacidade real de instalação. [E1]

O pipeline recebe somente pixels e o dicionário: extrai contornos, ajusta elipses, estima contraste, amostra pontos em diferentes raios dos setores e aceita ou rejeita um ID. Posição, transformação e identidade verdadeira do renderizador são usadas apenas depois, para avaliar a saída. Não há leitura de nomes de elementos SVG ou metadados de objeto como se fossem visão computacional. [E1; auditoria em qa_logs/optical_review.md]

| Condição sintética | IDs corretos | Sem ID aceito | ID incorreto/extra |
| --- | --- | --- | --- |
| Quadro limpo | 64 | 0 | 0 |
| Rotação | 64 | 0 | 0 |
| Desfoque configurado | 64 | 0 | 0 |
| Escurecimento uniforme | 64 | 0 | 0 |
| Redução de informação `small` | 64 | 0 | 0 |
| Redução extrema `tiny` | 12 | 52 | 0 |
| Transformação afim `oblique` | 64 | 0 | 0 |
| Perspectiva projetiva testada | 0 | 64 | 0 |
| Cobertura parcial testada | 0 | 64 | 0 |
| Cobertura total | 0 | 64 | 0 |
| Reflexo espelhado | 0 | 64 | 0 |

Fonte: observações em E1/results.json; contagens recontadas por servidor numérico em `qa_logs/numeric_verification.json`. Não são percentuais de acurácia física. O código reservado fora do dicionário e a cena vazia também foram rejeitados, e a cena com múltiplas marcas produziu as identidades esperadas. [E1]

Os casos `small` e `tiny` reduzem e depois ampliam a imagem; não representam alcance medido ou detecção nativa de câmera naquela dimensão. O escurecimento é uniforme, sem reproduzir toda a física de pouca luz. A normalização por elipse aproxima a transformação afim, não uma homografia geral. Todas as marcas sob a perspectiva forte e a cobertura parcial configuradas falharam. Essas falhas são resultados úteis, não motivos para aumentar silenciosamente o orçamento de correção. [E1]

Uma sequência adicional alterou ângulos, escala, translação, ruído e uma substituição de bit por amostra. Os testes passaram nas condições declaradas. Ela usa o mesmo renderizador, família e detector; não é implementação independente nem validação física. Negativos simples adicionais foram auditados, mas não estabelecem taxa de falso positivo em fundos hospitalares. Ausência de troca de IDs neste corpus finito não prova detecção perfeita. [E1; qa_logs/optical_review.md]

O explorador HTML permite selecionar ID e degradação e ver a imagem e a saída salvas. Também há um replay sintético de movimentação entre ambientes: seus rótulos vêm da decodificação dos quadros antes de qualquer legenda, e a cobertura interrompe a leitura. Ambos mostram resultados pré-calculados, não captura ou decodificação ao vivo.

## Como hospitais dos EUA e Europa rastreiam equipamentos

| Local e fonte | O que está documentado | O que não podemos inferir |
| --- | --- | --- |
| Johns Hopkins, EUA; estudo de 2020 sobre movimentos de bombas | Infraestrutura RF+IR em áreas assistenciais e corredores, com análise de distribuição | Não é evidência de BLE, funcionamento offline ou ensaio de EMI [R3] |
| Duke, EUA; avaliação controlada de 2003 | Rastreamento combinado IR/RF de bombas e outros ativos; houve limitações de localização por sala | Tecnologia histórica não prevê desempenho do Consta [R4] |
| UC Davis, EUA; documento hospitalar de manutenção de 2026 | Infraestrutura RTLS instalada que requer manutenção de tags, baterias e software | O documento inclui várias funções e não classifica todo o parque como BLE [R5] |
| Mid Cheshire, Reino Unido; caso NHS de 2023/24 | Tags e infraestrutura mistas de RFID/BLE/Wi-Fi para móveis; topologia inclui Cisco DNA Spaces cloud e banco local | Banco local não prova continuidade completa sem internet [R6] |
| Radboudumc, Países Baixos/UE; material institucional de 2021 | Track-and-trace de equipamentos móveis desenvolvido com Philips | A fonte hospitalar não define o rádio nem comprova offline [R7] |
| Skåne/Lund, Suécia/UE; estudo de 2021 | Etiquetas BLE, observadores fixos e processamento em serviço cloud | Estudo de viabilidade com participação industrial; não valida LAN offline ou EMC universal [R8] |

Esses casos confirmam a categoria e o uso em equipamentos móveis, não uma tecnologia única. O registro distingue artigos com texto completo, resumos institucionais, documentos de manutenção e trechos indexados. Acesso direto ao publisher de Lund retornou restrição; foi possível verificar metadados universitários e trechos indexados, sem auditoria integral independente do artigo. UC Davis teve acesso inicial seguido de falhas de obtenção. Há participação de empresas nos casos identificados; isso está registrado, não omitido. [sources/international_cases.md]

## BLE no corredor e RM fixa: o que muda

A delimitação de circulação reduz o problema de tentar rastrear qualquer objeto dentro de qualquer scanner. Permite projetar uma prova de conceito fora de salas críticas. Contudo, corredor é um local, não uma certificação de compatibilidade. [Inferência apoiada em R9–R12]

É preciso distinguir blindagem RF, campo magnético estático e controle de acesso. ACR 2026 descreve zonas e objetos portáteis; GE orienta limitar interferência RF ambiental e cuidar da blindagem/instalação. Não foi medido o efeito de uma tag BLE Consta fora de uma sala fechada: não afirmamos que causará artefato, tampouco que jamais causará. Não há distância universal dedutível destas fontes. [R9–R10]

Além disso, ventiladores e outros suportes móveis podem participar do fluxo de RM sob condições próprias. A classificação MR Conditional do aparelho não é classificação de uma tag acrescentada. Um geofence pode avisar, mas não impede entrada ou garante detectar toda passagem. O fluxo a projetar deve preservar a identidade quando houver exclusão/remoção de tag, mostrar a perda de observação e respeitar triagem e controle físico do serviço. Nada disso foi validado nesta pesquisa. [R9; R12; proposta]

O NHS também documentou problemas de coexistência entre BLE e Wi-Fi com impacto em aparelhos dependentes da rede numa implantação RTLS. O relato não é evidência de dano ao paciente nem de artefato de RM; é contraevidência à garantia de que excluir o scanner elimina o problema. [R11]

## Comparação dos caminhos de desenvolvimento

| Caminho | Vantagem a investigar | Limite principal |
| --- | --- | --- |
| BLE por proximidade/RSSI | Tag automática; não exige visibilidade óptica da marca | Intensidade maior não prova sala correta; coexistência e montagem precisam de avaliação |
| BLE AoA | Direção de chegada com arranjo de antenas nos localizadores | Exige hardware/pacotes específicos; não é um gateway BLE comum nem precisão Consta comprovada [R13] |
| UWB TDoA | Comparação de tempos de chegada em infraestrutura de âncoras | Sincronização e infraestrutura próprias; não há caso hospitalar operacional verificado suficiente neste recorte para equiparar a evidência internacional [R14] |
| Óptica passiva | Sem transmissão ativa ou bateria na etiqueta; identidade individual visual | Visibilidade, resolução, iluminação, privacidade e leitores eletrônicos; o spike não resolve perspectiva geral |
| Combinação seletiva | A mesma identidade de ativo pode receber observações de métodos diferentes | Mais custo/complexidade e risco de conflito; não é automaticamente melhor nem precisa equipar todos os ativos com tudo |

A recomendação é **avaliar BLE/AoA para a primeira aplicação operacional delimitada de móveis, e continuar o experimento óptico como P&D**, sem tornar isso uma decisão de compra ou implementação aprovada. O argumento não é custo menor ou precisão superior demonstrada: é a menor dependência de visibilidade visual contínua, junto da evidência de uso de tags móveis. Se cobertura por sala não atender, ou se coexistência/compatibilidade falharem, essa hipótese deverá ser recusada ou alterada. [R3–R14; inferência]

## O que pode ser autoral e o próximo experimento

Podem ser próprios o desenho da tag, firmware e protocolo quando desenvolvidos, motor de observações, tratamento de incerteza, identidade física, diagnóstico e integração com manutenção. Os princípios de RTLS e códigos visuais são antecedentes; licença de código, liberdade de operação e eventual patenteabilidade são avaliações separadas. A emulação não constitui decisão de fabricar a tag clínica. [R1–R2; nota anterior de propriedade intelectual do projeto]

Próxima etapa recomendada: comparar em bancada uma captura óptica real com a família escolhida e um enlace BLE em ambiente não assistencial, com critérios de identificação, troca de sala e perda de observação definidos previamente. Para o caminho óptico, dimensionar marcador e câmera com medidas físicas e testar fundo, luz, perspectiva e oclusão. Para rádio, selecionar conjunto e configuração exatos e depois definir com TI/engenharia clínica as áreas e testes de coexistência/EMC. Uma reprodução clínica ou compra não foi autorizada por este relatório.

No caminho essencial local, receptores, motor, banco, autenticação, mapas e licenças precisam funcionar sem WAN, inclusive após reinício. Sincronização externa pode ser opcional. Falha de energia, LAN, servidor ou bateria exige comportamento próprio; independência de internet não significa imunidade geral a falhas. [Proposta de arquitetura; comparação de R6 com dossiê anterior de modo offline]

No caminho óptico físico, sensores de imagem podem capturar pessoas mesmo sem reconhecimento facial. Campo de visão restrito, processamento local, descarte de quadros e retenção apenas de eventos são propostas a avaliar com o hospital; não foram demonstrados como solução completa de privacidade. Nesta emulação todas as cenas são sintéticas e não contêm imagens de pacientes.

## Limitações e integridade

A pesquisa não é exaustiva, não auditou todos os modelos do hospital e não produz autorização de RF nem classificação MR. Algumas fontes são históricas, institucionais ou parcialmente acessadas; os limites e conflitos de interesse estão nos registros. O experimento é sintético e tem cobertura deliberadamente limitada. As revisões por agentes de IA não substituem revisão técnica humana ou ensaio acreditado. Não houve paciente, instalação assistencial, contratação ou contato comercial.

## Referências verificadas e artefatos

- R1. Calvet, L., Gurdjos, P., Griwodz, C., & Gasparini, S. (2016). Detection and Accurate Localization of Circular Fiducials Under Highly Challenging Conditions. CVPR. https://doi.org/10.1109/CVPR.2016.67 ; implementação https://github.com/alicevision/CCTag .
- R2. Bergamasco, F., Albarelli, A., Rodolà, E., & Torsello, A. (2011). RUNE-Tag: A High Accuracy Fiducial Marker With Strong Occlusion Resilience. CVPR. https://doi.org/10.1109/CVPR.2011.5995544 .
- R3. Martinez, D. A., et al. (2020). Where is my infusion pump? Harnessing network dynamics for improved hospital equipment fleet management. JAMIA. https://doi.org/10.1093/jamia/ocaa033 ; https://pmc.ncbi.nlm.nih.gov/articles/PMC7647311/ .
- R4. Østbye, T., et al. (2003). Evaluation of an infrared/radiofrequency equipment-tracking system in a tertiary care hospital. Journal of Medical Systems. https://doi.org/10.1023/A:1023709421380 ; https://scholars.duke.edu/publication/742794 .
- R5. UC Davis Health. (2026). RTLS Preventive Maintenance Support Services, RFP 10152025, reemitido em 12 de janeiro. https://health.ucdavis.edu/media-resources/supply-chain/documents/fy26/10152025_BJ_RFP_RTLS_Preventive_Maintenance-12.2026_Final.pdf .
- R6. NHS England Digital. (2025). Implementing a Real Time Location Service for medical device tracking. https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/innovation-and-strategy/wireless-trialist-case-studies/mid-cheshire-hospitals-nhs-foundation-trust/ .
- R7. Radboudumc. (2021). ICT, huisvesting en bedrijfsvoering. https://www.radboudumc.nl/over-het-radboudumc/impact-2021/organisatie/bedrijfsvoering-2021 .
- R8. Pendrill, L., et al. (2021). Reducing search times and entropy in hospital emergency departments with real-time location systems. IISE Transactions on Healthcare Systems Engineering. https://doi.org/10.1080/24725579.2021.1881660 .
- R9. American College of Radiology. (2026). ACR Manual on MR Safety. Página oficial e versão atual verificadas no dossiê: https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Radiology-Safety/MR-Safety .
- R10. GE HealthCare. RF Shielded Room Preinstallation Requirements for MR Systems, 5850260-1EN, Rev. 9. https://www.gehealthcare.com/content/dam/gehc/global/support/site-planning/documents/RF-Shielded-Room-Preinstallation-Requirements-for-MR-Systems-PIM-5850260-1EN-9-ds-en.pdf .
- R11. NHS England Digital. Lessons learned, seção Technical. https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/knowledge-products-and-artefacts/advice-and-guidance/internet-of-things-implementation-lessons-learned/lessons-learned/ .
- R12. Hamilton Medical. HAMILTON-MR1, manual v2.2.x, 624495.04. https://www.hamilton-medical.com/dam/jcr%3Aabaa4d6d-b577-4ecd-adee-39896d7bf527/HAMILTON-MR1_ops-manual_v2.2.x_en_624495.04.pdf .
- R13. Bluetooth SIG. Direction Finding. https://www.bluetooth.com/learn-about-bluetooth/feature-enhancements/direction-finding/ .
- R14. FiRa Consortium. (2023). UWB Asset Tracking. https://www.firaconsortium.org/sites/default/files/2023-12/FiRa-Asset-Tracking-Leaflet.pdf .
- E1. Experimento computacional Consta, código, dicionário, imagens, resultados e verificação em `experiments/optical-tags/` na raiz deste repositório. Entrada recomendada: `experiments/optical-tags/index.html`.

Notas de acesso, financiamento e limites completos: `sources/international_cases.md`, `sources/ble_zones_safety.md` e `sources/optical_identity.md`, no diretório de trabalho desta pesquisa.
