# Contratos de integração

**Situação: proposta inicial, sem API, pacote de tipos ou esquema executável implementados.** Esta é a referência de interface entre receptores, serviço de localização e CRM. A equipe deverá revisar e versionar o contrato junto da primeira implementação.

## Receptor → serviço: observação

Uma observação representa sinal recebido, não uma localização já confirmada. O receptor informa sua identidade e a da tag; a associação ao ativo é resolvida pelo cadastro autorizado.

| Campo proposto | Significado |
| --- | --- |
| `schema_version` | Versão do contrato; exemplos usam uma versão de proposta |
| `event_id` | Identificador estável da observação, preservado em reenvio |
| `institution_id` | Contexto informado; o servidor confirma a instituição pelo receptor autenticado |
| `receiver_id` | Receptor cadastrado e autorizado |
| `tag_id` | Identidade provisionada da tag; não presumir que o endereço MAC será a identidade estável |
| `observed_at` | Momento da recepção no receptor, com fuso explícito |
| `clock_status` | Condição conhecida do relógio do receptor; política de tolerância ainda a definir |
| `source` | Adaptador de origem: BLE físico ou simulação |
| `simulated` | Marcação persistente de dado simulado |
| `measurements` | Medidas disponíveis e unidades; RSSI em dBm quando utilizado |

O serviço atribui `received_at` na ingestão. Sequência/identidade de boot, deduplicação após reinício, autenticação do sinal da tag e identificação de um mesmo anúncio recebido por receptores diferentes ainda precisam de desenho. Um ID legível de tag não é garantia contra clonagem.

Exemplo exclusivamente sintético: [observacao-simulada.json](exemplos/observacao-simulada.json). Valores e horários foram escolhidos para explicar a forma, não medidos.

## Serviço → CRM: localização estimada

| Campo proposto | Significado |
| --- | --- |
| `institution_id`, `asset_id` | Ativo resolvido na instituição correta |
| `location_id` | Área estimada; admite ausência quando desconhecida |
| `observed_at`, `received_at` | Momento da observação relevante e da ingestão |
| `state` | `current`, `stale` ou `unknown`; a UI traduz para pt-BR |
| `method`, `source`, `simulated` | Procedência e método preservados até a interface |
| `quality` | Indicador definido pelo método; não apresentar como probabilidade calibrada sem validação |
| `evidence_event_ids` | Referências às observações que sustentam a estimativa |

Exemplo exclusivamente sintético: [localizacao-simulada.json](exemplos/localizacao-simulada.json). A validade depende de política configurada e será recalculada na consulta; o exemplo não representa uma localização atual no mundo real.

## Comportamentos obrigatórios na implementação

- Autenticar receptor e autorizar contexto; rejeitar identidades ou vínculos inconsistentes.
- Preservar o ID de observação em retransmissões e impedir efeitos duplicados.
- Usar associação tag–ativo válida no momento observado, mantendo histórico de reassociações.
- Definir política para relógio incorreto, eventos atrasados e empates antes de manter a projeção atual.
- Persistir observações antigas sem substituir uma estimativa comprovadamente mais recente.
- Expor desconhecido/desatualizado, falhas de receptor e limites de buffer. Silêncio do rádio não é confirmação de saída ou presença em outro setor.
- Preservar a marcação simulada em armazenamento, API e UI. Ambientes de teste não devem contaminar a projeção física de produção.
- Não vincular automaticamente localização a disponibilidade, higiene, leito ou liberação técnica.

HTTP, MQTT, nomes de rotas/tópicos, erros, esquema de autenticação e política de compatibilidade estão em aberto. Não criar consumidores com base em um endpoint presumido. A primeira implementação deverá incluir esquemas validáveis e testes de produtor/consumidor na fronteira real.
