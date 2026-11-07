# Estado atual do projeto

Este é o registro do que está decidido, do que existe no repositório e do que ainda precisa ser entregue. Atualize esta página ao implementar capacidades ou concluir uma validação. Documentos de especificação, por si só, não mudam o estado para implementado.

## Direção definida por Matheus

- Nome **Consta** e identidade visual em azul profundo, azul gelo, preto e branco.
- Construir o CRM neste repositório com a equipe de software.
- Núcleo: gestão de ativos, documentos e manutenção preventiva, acompanhada até execução e comprovante.
- Localização automática de equipamentos móveis por **BLE**, com tags a bateria e receptores distribuídos. Sem QR ou escaneamento para atualizar movimentações.
- Caminho essencial de localização pela rede local, independente da internet.
- Escopo de uso limitado a equipamentos e áreas aprovados; sem ingresso inicial em áreas especiais de RM.
- Desenvolvimento de tag e receptor próprios é a direção de hardware. Componentes e montagem ainda dependem de seleção e ensaios.
- Etiqueta óptica descontinuada, com experimentos retirados da árvore atual. [Decisão](adr/0001-rastreamento-ble.md).

## O que existe

| Área | Entrega disponível | Evidência e limite |
| --- | --- | --- |
| Documentação | Escopo, fluxos, arquitetura proposta, fontes e backlog | Descreve o projeto; não demonstra software em operação |
| Marca | SVGs, PNGs, fonte, tokens, galeria e gerador | [Kit da marca](../brand/README.md); não comprova registro de marca |
| Dados | Cenários financeiros fictícios e metadados de documentos públicos auditados | [Dados](../data/README.md); distinguir cenário simulado, documento real e resultado operacional ainda não medido |
| Verificação | Validador de referências locais e configuração para CI | `python3 scripts/verificar_repositorio.py`; não testa comportamento de CRM ou hardware |
| Histórico | Experimentos ópticos e pesquisa anterior no Git | Apenas registro; sem integração com a arquitetura vigente |

O [estudo do pacote de pesquisas](referencias/estudo-pacote-pesquisas.md) acrescentou inventário público, auditorias e casos esperados de extração. São referências para desenvolver e avaliar o CRM, não integração com uma LLM ou execução de manutenção. O fluxo de colaboração segue [Gitflow](../CONTRIBUTING.md).

## O que ainda não existe

- Aplicação executável do CRM, API, banco, autenticação e armazenamento de documentos.
- Extração de documentos integrada a uma LLM ou motor de prazos implementado.
- Serviço de localização, firmware, placas fabricadas ou receptores instalados.
- Ensaio BLE em bancada, teste de perda de internet ou teste com equipamentos hospitalares.
- Aprovação de compatibilidade eletromagnética, de áreas hospitalares ou de uso em RM.
- Medição de precisão, atualização, autonomia, capacidade, economia ou impacto operacional do Consta.
- Deploy, integração hospitalar contratada ou aprovação institucional.

## Recomendações, ainda não decisões de implementação

- Aplicação web com TypeScript e PostgreSQL; backend do CRM inicialmente junto da aplicação quando suficiente.
- Interface de localização desacoplada para desenvolver o CRM com simulação explícita.
- Localização inicial por setor; RSSI como abordagem de protótipo e AoA como alternativa se o requisito e os ensaios justificarem.
- Receptores cabeados, alimentação PoE quando adequada e armazenamento/processamento locais.
- Chip ou módulo BLE comercial como base do hardware próprio; nRF52833 é um candidato, não uma peça selecionada.

## Decisões abertas

Stack e gerenciador de pacotes; autenticação; armazenamento de arquivos; provedor/modelo de extração; execução da IA com internet indisponível; protocolo de transporte dos receptores; componentes, bateria e gabinete; critério de localização e metas de aceitação; instalação piloto e custos; licença do projeto e disponibilidade jurídica da marca.

As interfaces de [packages/contratos](../packages/contratos/README.md) são propostas para coordenar a primeira implementação. O [backlog](desenvolvimento/backlog.md) organiza a sequência de construção.
