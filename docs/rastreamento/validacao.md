# Plano de validação do rastreamento

Plano executável por etapas, ainda sem resultados BLE produzidos. O objetivo é construir e demonstrar o sistema dentro de um escopo definido, registrando o que cada ensaio demonstra e o que permanece aberto.

Antes de cada etapa, registrar hipótese, configuração, cenário, critério de aceite e responsável. Metas de atualização, autonomia, área e escala precisam ser pactuadas; este documento não inventa desempenho de produto.

## Etapas e saídas

| Etapa | Ensaio | Evidência para concluir |
| --- | --- | --- |
| Software sem rádio | Eventos sintéticos, duplicatas, atraso, troca de tag e ausência de sinal | Testes de comportamento, registros persistidos e UI com origem/horário/estado corretos |
| Tag e receptor em bancada | Tags com identidades distintas, leitura física, reinício e transmissão ao serviço | Hardware/firmware identificados, observações reais e associação correta; consumo medido |
| Localização em ambiente controlado | Posições e trajetos conhecidos, portas, metal, pessoas e orientações distintas | Acerto/erro por setor, confusões entre áreas, perdas e distribuição de atraso contra referência independente |
| Operação local | Desconectar WAN, reiniciar componentes, degradar LAN e restaurar serviços | Consulta e ingestão locais verificadas; limites de buffer, perda, backlog e recuperação registrados |
| Compatibilidade hospitalar | Configuração específica com equipamentos representativos, sem pacientes | Protocolo aprovado e avaliação de comunicações, funções/alarmes e imagem quando aplicável |
| Piloto autorizado | Área e famílias de ativos aprovadas, com acompanhamento operacional | Registro da configuração liberada, ocorrências, métricas e critérios de interrupção |

Uma etapa não substitui outra. Resultados sintéticos da antiga óptica não validam BLE. Testar anúncios em bancada não demonstra acerto de sala, e acertar sala não demonstra compatibilidade eletromagnética.

## Casos mínimos de software

- Receptor ou tag desconhecidos; instituição inconsistente; payload inválido.
- Mesmo evento retransmitido; eventos fora de ordem; relógio do receptor incorreto; reinício do receptor.
- Tag reassociada com observação antiga chegando depois da mudança.
- Tag ausente, receptor sem comunicação e dados expirados.
- Dado simulado preservado como simulado em persistência e interface.
- Consulta de outra instituição negada.
- Falha de WAN sem perda do caminho local previsto; extração externa declarada pendente.

## Caracterização física

Registrar placa/revisão, chip/módulo, antena, bateria, gabinete, posição de fixação, firmware, potência, intervalo de anúncio e layout dos receptores. Para AoA, incluir arranjo de antenas e calibração. Preservar dados brutos e uma referência de posição obtida por método independente do algoritmo em avaliação.

Medir consumo ao longo dos estados reais, comportamento da bateria e sensibilidade à montagem em ativos metálicos. Estimativa de autonomia precisa informar método e condições; não extrapolar apenas do consumo em repouso divulgado pelo fabricante.

## Interrupção e incompatibilidades

Mudança reproduzível no funcionamento de equipamento médico, comunicação clínica prejudicada, artefato relevante ou impossibilidade de cumprir exclusões exige interromper e investigar a configuração testada com os responsáveis locais. Falha de localização exige revisar cobertura/método ou restringir a capacidade declarada; não ocultar trajetos que falharam.

Ensaios assistenciais e de interferência não serão conduzidos informalmente em pacientes. A liberação se limita às condições avaliadas e deve ser revista quando hardware, firmware, potência, montagem ou ambiente mudarem de forma relevante.

## Registro de resultado

Cada relatório deve conter: objetivo; configuração e versão; ambiente; permissões; critério previamente definido; procedimento; dados brutos; resultado; falhas; limites; responsável e conclusão. A evidência pública deve ser sintética ou anonimizada/autorizada; mapas e inventários internos ficam no ambiente autorizado do hospital.

Ao concluir uma etapa, atualizar o [estado atual](../estado-atual.md) com a evidência e manter as pendências no [backlog](../desenvolvimento/backlog.md).
