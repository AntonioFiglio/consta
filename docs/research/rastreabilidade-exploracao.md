# Rastreabilidade hospitalar — exploração, não decisão de produto

Contexto: brainstorming de Matheus no hackathon HCFMUSP, 6/11/2026. Prioridade: manutenção preventiva; localização apoia encontrar e recolher equipamentos. Foco B2B e resultado operacional. Não fechar pitch ou tecnologia nesta etapa.

## Distinções

- Identificação: qual ativo é.
- Rastreabilidade: histórico de movimentação, responsáveis, manutenção e liberação.
- Localização automática: posição estimada por infraestrutura de sensores/leitores, com horário e limites de precisão.
- Localizado não significa disponível, higienizado ou liberado para uso.

## Hipóteses de solução

1. Etiqueta impressa QR/DataMatrix e registro de equipamento + setor. A etiqueta não transmite RF. O leitor/celular e a rede devem seguir as regras do hospital. Dá última localização confirmada, não localização contínua. Vincular leitura a transferência, recebimento e manutenção, evitando uma tarefa paralela sem responsável.
2. RFID passivo para inventário/pontos de passagem. Ausência de bateria na etiqueta não elimina RF: leitores emitem. Passagem registrada não demonstra posição contínua.
3. BLE para localização automática, com tags, gateways e validação da precisão por setor. Baixa potência não prova compatibilidade eletromagnética.
4. UWB quando precisão maior justificar infraestrutura e custo. Resultado depende da instalação e do ambiente; não prometer centímetros sem teste.

Sugestão exploratória: identidade e histórico independentes do hardware; começar com registro óptico e avaliar automação onde tempo de busca e perdas justificarem. Se localização automática for requisito de entrada, QR sozinho não atende.

## Critérios antes de um piloto real com rádio

Mapear equipamentos e zonas; consultar fabricantes; avaliar emissões/imunidade e coexistência de redes; verificar potência, frequência, distância e montagem; testar em ambiente controlado sem pacientes; estabelecer implantação, monitoramento e retirada. Não afirmar risco zero ou distância universal. RM demanda avaliação própria do conjunto etiqueta/fixação/equipamento. Verificar também limpeza, materiais e não obstrução de controles, ventilação ou identificação original.

## Fontes primárias

- FDA, RFID: https://www.fda.gov/radiation-emitting-products/electromagnetic-compatibility-emc/radio-frequency-identification-rfid — funcionamento das etiquetas/leitores e possibilidade de interferência.
- FDA, recomendações para estabelecimentos: https://www.fda.gov/radiation-emitting-products/electromagnetic-compatibility-emc/fdacdrh-recommendations-emcemi-healthcare-facilities — avaliação local, coordenação e testes.
- FDA, dispositivos sem fio: https://www.fda.gov/medical-devices/digital-health-center-excellence/wireless-medical-devices — coexistência e compatibilidade são considerações distintas.
- NHS England, infraestrutura RTLS: https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/knowledge-products-and-artefacts/advice-and-guidance/rtls-guidance/overview-of-infrastructure-required-to-provide-location-data/ — infraestrutura Wi-Fi, BLE e RFID, limitações de localização.
- FiRa Consortium, UWB: https://www.firaconsortium.org/sites/default/files/2023-12/FiRa-Asset-Tracking-Leaflet.pdf — tags e âncoras para posicionamento; fonte da indústria, não garantia de desempenho num hospital específico.
- FDA, ambiente RM: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/testing-and-labeling-medical-devices-safety-magnetic-resonance-mr-environment — avaliação específica de segurança/compatibilidade.

As orientações FDA/NHS são referências técnicas; não são apresentadas como legislação brasileira nem como aprovação de qualquer produto deste brainstorming.
