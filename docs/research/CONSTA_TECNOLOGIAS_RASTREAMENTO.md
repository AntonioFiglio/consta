# Consta — tecnologias de rastreamento e proposta de dispositivo

Pesquisa em 6 de novembro de 2026. Este documento complementa as notas exploratórias e o projeto consolidado. **Recomendação de engenharia a investigar; não é especificação aprovada nem laudo de segurança.**

## Decisão que faz sentido neste momento

A necessidade inicial é localizar um ativo móvel por **setor/sala**, com identidade, horário da observação e indicação de desatualização. Não foi demonstrada necessidade de coordenadas centimétricas. A escolha deve partir da infraestrutura e das restrições reais do hospital.

**Caminho operacional preferencial:** integrar RTLS existente; na ausência dele, avaliar tags comerciais BLE e, se a identificação de sala exigir, uma solução híbrida comercial. É um caminho de integração e validação, não uma autorização de instalação. BLE simples por intensidade de sinal não deve ser apresentado como identificação infalível da sala.

**Caminho de pesquisa se houver requisito explícito de não acrescentar transmissores de rádio:** uma tag óptica ativa infravermelha com receptores fixos e rede cabeada pode cumprir essa restrição arquitetural. Isso não prova que seja mais segura no conjunto nem que seja a implantação mais econômica ou robusta. É desenvolvimento de hardware e infraestrutura, com risco técnico maior que integrar uma plataforma existente.

## Comparação fundamentada

| Tecnologia | Como o movimento vira informação | Limite principal para o Consta | Atende ausência de rádio intencional na tag? |
| --- | --- | --- | --- |
| BLE com RSSI | Tag transmite seu identificador; receptores estimam proximidade pela intensidade recebida | Não presumir que o receptor mais forte esteja na mesma sala; avaliar ambiente e algoritmo | Não |
| BLE com AoA | Tag transmite; conjuntos de antenas nos localizadores medem direção; o motor estima posição | Requer infraestrutura e hardware específicos; não é apenas uma antena BLE comum | Não |
| UWB | Tags emitem mensagens; âncoras medem tempos de chegada; motor estima posição | Sincronização e infraestrutura; desempenho real depende do cenário | Não |
| RFID passivo | Leitor emite RF, energiza a tag e recebe sua resposta | Boa opção para identificação/eventos de passagem; passivo não significa sistema sem RF | Não; há comunicação por RF e emissão pelo leitor |
| IR ativo com receptores cabeados | Tag emite ID em luz infravermelha; receptor fixo conhecido registra presença | Oclusão, luz ambiente, orientação, portas abertas, cobertura e infraestrutura por ambiente | Sim, se o hardware realmente não incluir rádio |
| Ultrassom puro com receptores cabeados | Emissor móvel transmite código acústico; receptores fixos reconhecem ID ou medem chegada | Ruído, reflexões, obstáculos, orientação, sincronização e avaliação acústica específica | Possível; verificar sincronização e retorno de dados |
| Soluções híbridas IR/RF ou US/RF | Óptica/acústica indica ambiente; rádio transporta a informação | Não podem ser descritas como livres de rádio | Não |

Fontes do mecanismo: [Bluetooth SIG — Direction Finding](https://www.bluetooth.com/learn-about-bluetooth/feature-enhancements/direction-finding/), [Silicon Labs — Location Finding](https://docs.silabs.com/rtl-lib/10.0.1/bluetooth-direction-finding-fundamentals/04-location-finding), [FiRa — UWB Asset Tracking](https://www.firaconsortium.org/sites/default/files/2023-12/FiRa-Asset-Tracking-Leaflet.pdf), [FDA — RFID](https://www.fda.gov/radiation-emitting-products/electromagnetic-compatibility-emc/radio-frequency-identification-rfid). A coluna de adequação ao Consta é inferência de engenharia, não resultado de ensaio do nosso sistema.

## Precedentes experimentais: o que os artigos sustentam

**Want et al., 1992 — The Active Badge Location System.** O trabalho descreve tags que enviam identificadores por infravermelho a sensores conectados a uma estação central. A localização é de ambiente; reflexões podem permitir recepção sem linha direta em salas pequenas, enquanto paredes contêm o sinal. O artigo dá precedente concreto para tag emissora e infraestrutura receptora. Não é um estudo de segurança hospitalar nem prova de desempenho do Consta. [Artigo original completo](https://www.cs.columbia.edu/~drexel/CandExam/ActiveBadge92.pdf). O arquivo histórico de Cambridge confirma que os sensores usavam [rede cabeada](https://www.cl.cam.ac.uk/research/dtg/attarchive/thesensor.html).

O material técnico de Cambridge também registra falhas por luz solar forte e por roupas cobrindo a tag. Portanto, “IR não atravessa parede” ajuda a separar ambientes, mas não resolve disponibilidade de sinal. [Cambridge — Tracking](https://www.cl.cam.ac.uk/teaching/1112/TopIssues/Files/TI_L1_Tracking_ho.pdf).

**Pan et al., 2023 — Indoor tracking for smart hospital by a hybrid visible light positioning system.** DOI `10.32629/jai.v6i3.576`. Propõe e experimenta uma infraestrutura com luminárias transmitindo por luz visível, tags respondendo por IR e comunicação pela rede elétrica (PLC). O artigo demonstra mecanismo óptico e protótipo; a proposta é orientada a hospitais, mas não apresenta validação clínica ampla de ausência de interferência em equipamentos/exames. Reconhece problemas com luz intensa e obstrução do caminho óptico. “RF-free” usado pelos autores não deve ser convertido em “livre de toda interferência eletromagnética”. Para o Consta, preferir cabeamento de dados dedicado à adoção de PLC seria uma escolha de engenharia ainda a avaliar, pois não exige injetar comunicação na alimentação elétrica. [Artigo original completo](https://pdfs.semanticscholar.org/83f0/4eed60c2870cdd509dee0d6e8d46a24db98d.pdf) · [Registro institucional de trabalho correlato na IEEE ICCE](https://cris.technion.ac.il/en/publications/design-implementation-of-a-hybrid-vlpplc-based-indoor-tracking-sy/).

**Aparicio-Esteve et al., 2023 — Combined Infrared-Ultrasonic Positioning System to Improve the Data Availability.** DOI `10.1109/JSEN.2023.3301219`. Experimento combina medidas ópticas e acústicas com filtro de Kalman e rejeição de observações inadequadas. Mostra que modalidades complementares podem melhorar disponibilidade no arranjo ensaiado. Não demonstra que qualquer tag IR/US seja segura em qualquer hospital ou que seja possível importar sua precisão para outro projeto. O resumo foi acessado no repositório institucional; acesso direto ao PDF ficou bloqueado, portanto não foi feita auditoria integral da implementação. [Registro e resumo dos autores](https://ebuah.uah.es/dspace/handle/10017/59643).

**Harle e Hopper, 2005 — Deploying and Evaluating a Location-Aware System.** O sistema Bat mede propagação de ultrassom, porém o comando de emissão usa rádio. Esse artigo é contraexemplo importante para a inferência “localiza com ultrassom, logo não transmite RF”. Também mostra que implantação e manutenção de infraestrutura exigem avaliação operacional além do erro geométrico. [Artigo original MobiSys](https://static.usenix.org/events/mobisys05/tech/full_papers/harle/harle_html/index.html).

## O que fornecedores reais fazem

**SonitorONE:** a plataforma atual declara combinar ULE/ultrassom, BLE, baixa frequência, RFID, GPS e telefones como tags. Isso descreve família multimodal; é preciso obter diagrama e ficha do modelo efetivamente ofertado para saber o papel de cada canal. Não usar o nome Sonitor para sustentar arquitetura puramente acústica sem rádio. [Documentação do fabricante](https://sonitor.com/platform/) · [Folheto oficial de 2024 com Wi-Fi/BLE/ULE/LF](https://static1.squarespace.com/static/635b76233daff54c9f23f767/t/665873b61fe4e65774a937ca/1717072823592/Sonitor-One-Flyer.pdf).

**CenTrak:** a documentação de dispositivos lista opções BLE, Wi-Fi, UHF, baixa frequência e Gen2IR. Há modelos exclusivamente BLE e modelos multimodais. Assim, a capacidade de precisão por IR não implica que a tag ou sistema inteiro opere sem rádio. A configuração concreta e sua documentação são decisivas. [Dispositivos oficiais](https://centrak.com/our-process/iot-devices).

Esses materiais demonstram existência e arquitetura anunciada pelo fornecedor, não validação independente de desempenho ou segurança no ambiente do Consta.

## Arquitetura óptica proposta, caso não adicionar RF seja requisito

Tudo nesta seção é **proposta própria**, ainda não construída/validada.

```mermaid
flowchart LR
    A[Ativo com patrimônio] --> B[Tag: MCU sem rádio + bateria + LED IR]
    B -->|Pacote óptico com ID| C[Receptor IR fixo: sala conhecida]
    C -->|Rede cabeada| D[Gateway autenticado]
    D --> E[Motor de localização do Consta]
    E --> F[Última sala + horário + fonte + estado de atualização]
```

A tag seria fixada externamente ao equipamento, sem ligação a circuitos, portas de serviço ou alimentação do dispositivo médico. Teria microcontrolador sem transceptor de RF, bateria, emissor IR, invólucro higienizável e identificação visual para conferência do patrimônio. A ausência de rádio viria da seleção dos componentes, não de apenas desligar Wi-Fi num módulo que continua contendo RF.

A tag enviaria periodicamente um identificador de dispositivo e informação de integridade do pacote. Receptores com posição cadastrada encaminhariam observações ao gateway por cabeamento. A instalação precisaria de receptores em todas as áreas cobertas; pontos de sombra podem exigir outra posição ou mais receptores. Intervalo de atualização, capacidade de tags, consumo e alcance seriam definidos por ensaio, sem prometer autonomia ou precisão antes da medição.

O servidor associaria `tag_id` ao `asset_id`, registrando `receiver_id`, `location_id`, `observed_at`, `received_at`, `source` e indicadores de qualidade disponíveis. A presença de leituras em ambientes distintos exigiria regra explícita de ambiguidade e transição. Perder sinal não comprova saída da sala: a interface conservaria a última observação e a marcaria como desatualizada. O mapa não converteria ausência de sinal em posição inventada.

Segurança digital também seria necessária: controle de cadastro/vínculo da tag, autenticação dos gateways, proteção contra repetição de eventos e trilha de auditoria. Um ID luminoso simples pode ser copiado; não deve virar prova isolada de execução de manutenção nem mecanismo de liberação clínica.

## Por que isso não permite prometer exames intactos

**IR é radiação eletromagnética óptica.** Remover o rádio intencional elimina um canal de comunicação por RF, mas não elimina emissões parasitas de eletrônica/cabos, interferência óptica ou riscos físicos da tag. Tampouco resolve compatibilidade com ressonância magnética.

Há contraexemplo clínico direto: Mathes et al. avaliaram oxímetros sob um sistema de neuronavegação e relataram interferência de pulsos IR na qualidade de sinal e na detecção de saturação. O estudo não testa a futura tag Consta e não quantifica seu risco; demonstra que o argumento geral “infravermelho não interfere em equipamento médico” é falso. [Estudo original — PMID 18633032](https://pubmed.ncbi.nlm.nih.gov/18633032/).

A aprovação deve considerar dispositivo médico, local de montagem, modalidade de exame, sensores próximos e configuração real. Retirar o tag da sala de exame pode ser opção operacional, com registro de última localização na entrada, porém não equivale a rastrear durante o exame. Sem avaliação própria, não colocar protótipo em sala de RM, no campo de aquisição de imagem ou sobre paciente/sensor.

## Próximo passo concreto

Preparar uma demonstração de bancada em ambiente não assistencial: identificar o ativo fictício, detectar transição entre áreas instrumentadas, simular oclusão, mostrar horário e sinal desatualizado. Em paralelo, solicitar ao hospital o inventário de RTLS/rede e restrições por área. Se RF for permitida sob avaliação, comparar uma solução BLE/híbrida comercial com o custo e disponibilidade reais da arquitetura óptica. Se RF for vedada, prosseguir como pesquisa óptica com plano específico de compatibilidade, sem anunciar produto hospitalar pronto.
