# Tag BLE a bateria

Especificação inicial, não hardware já produzido.

## Função

Identificar automaticamente um ativo móvel por transmissões BLE recebidas pela infraestrutura Consta. A associação tag–ativo é cadastrada e versionada; cada movimentação é observada sem escaneamento.

## Requisitos de projeto

- Bateria própria e nenhuma conexão com alimentação ou circuitos do equipamento médico.
- Identidade provisionada e recuperável pela infraestrutura; comportamento em reinício e substituição definido.
- Potência e intervalo de anúncios configuráveis dentro dos limites aprovados para o produto.
- Telemetria de bateria avaliada com o circuito real; sensor de movimento é opção para estudo de consumo.
- Gabinete, fixação e materiais compatíveis com limpeza e operação dos modelos de ativos escolhidos.
- Montagem fora de controles, sensores, ventilação, etiquetas obrigatórias e partes móveis.
- Procedimento de provisionamento, atualização de firmware, substituição e descarte da bateria.

## Componentes e escolhas pendentes

O [nRF52833](https://www.nordicsemi.com/Products/nRF52833) é candidato por suportar BLE e Direction Finding. Chip/módulo, antena, bateria, pacote de anúncios, proteção contra falsificação/replay, vedação, materiais e método de atualização ainda serão selecionados. O formato físico semelhante a uma AirTag é uma referência de experiência, não uma especificação mecânica fechada.

Se a direção de localização exigir AoA, a tag e o receptor deverão usar o sinal apropriado; um beacon BLE genérico não atende automaticamente. A autonomia será medida com a configuração real de rádio, sensores e bateria.

## Critério para a primeira bancada

Produzir observações físicas distinguíveis para as tags provisionadas, preservar identidade após reinício e permitir associação correta no serviço. Registrar consumo e falhas. Isso demonstra a comunicação testada; não libera uso hospitalar ou ingresso em RM. Seguir o [plano de validação](../../docs/rastreamento/validacao.md).
