# Serviço de localização

**Situação:** escopo e integração propostos. Ainda não há serviço, simulador ou algoritmo implementado.

## Responsabilidade

Receber observações de receptores, validar identidade e instituição, preservar histórico, deduplicar, resolver a associação temporal tag–ativo e estimar o setor/local. Expor ao CRM localização com horário, origem, método e estado de atualização.

Leia o [contrato de integração](../../packages/contratos/README.md), a [arquitetura BLE](../../docs/rastreamento/arquitetura-ble.md) e o [plano de validação](../../docs/rastreamento/validacao.md).

## Entregas iniciais

1. Adaptador simulado identificado, reproduzível e capaz de produzir duplicatas, atraso e ausência de observações.
2. Ingestão persistente e consulta de última localização, com desconhecido/desatualizado e sem regressão por eventos antigos.
3. Integração com o CRM usando associação válida no momento observado; evento sem associação confiável permanece não resolvido.
4. Adaptador físico BLE após receptor/protocolo definidos e ensaiados em bancada.

## Decisões pendentes

Runtime, transporte, armazenamento, buffer, sincronização do cadastro de associações, política de relógio e método de estimativa. A fronteira lógica pode começar no mesmo ambiente do CRM; um processo separado deverá ser justificado por execução, disponibilidade ou volume.

Ao implementar, inclua comandos de operação, verificação, replay, restauração e observabilidade. O processamento local deverá ser testado sem WAN; uma configuração de nuvem não atende a esse requisito por ter apenas o banco no hospital.
