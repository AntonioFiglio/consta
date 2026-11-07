# Estado atual do projeto

Este é o registro do que está decidido, do que existe no repositório e do que ainda precisa ser entregue. Atualize esta página ao implementar capacidades ou concluir uma validação. Documentos de especificação, por si só, não mudam o estado para implementado.

## Direção definida por Matheus

- Nome **CONSTA.** na marca, com o rebranding de Pedro: preto, laranja, vermelho e branco; DM Mono e Inter.
- Construir o CRM neste repositório com a equipe de software.
- Núcleo: gestão de ativos, documentos e manutenção preventiva, acompanhada até execução e comprovante.
- Localização automática de equipamentos móveis por **BLE**, com tags a bateria e receptores distribuídos. Sem QR ou escaneamento para atualizar movimentações.
- Caminho essencial de localização pela rede local, independente da internet.
- Escopo de uso limitado a equipamentos e áreas aprovados; sem ingresso inicial em áreas especiais de RM.
- Desenvolvimento de tag e receptor próprios é a direção de hardware. Componentes e montagem ainda dependem de seleção e ensaios.
- Etiqueta óptica descontinuada, com experimentos retirados da árvore atual. [Decisão](adr/0001-rastreamento-ble.md).

## O que existe

### Fase 1 do CRM — implementação local em 07/11/2026

O usuário delimitou a primeira entrega a cadastro por contrato/patrimônio e calendário, com React 19 e Vite. Há [aplicação executável](../apps/crm/README.md), API Express, SQLite, upload PDF/TXT, revisão manual, edição, busca e projeções mensais. Logo/tokens são os existentes; fontes são locais. A [decisão da stack](adr/0004-crm-fase-1.md) registra escopo e limites.

O SDK OpenAI está integrado no backend com URL, chave e modelo configuráveis pelo usuário. Não foi criada chave nem executada chamada real. Sem configuração, a leitura automática fica desabilitada e o preenchimento manual funciona. Não há extração fictícia apresentada como leitura de documento.

Verificações realizadas: build e TypeScript; testes de calendário, validação, SQLite após reabrir e SDK com transporte simulado; prévia no Chrome com edição, revisão pendente/confirmada e recarregamento. A suíte HTTP isolada encontrou `EPERM` ao abrir portas e ficou explicitamente marcada como não executada nesse ambiente. Servidor de desenvolvimento e interface responderam HTTP normalmente. Integração com provedor real e implantação hospitalar seguem pendentes.

O banco inicial tem três equipamentos/contratos sintéticos identificados. O aplicativo é um espaço local único, com senha opcional e escuta em loopback; não implementa autorização multi-instituição ou papéis. Planos versionados, tarefas até execução, comprovantes, rastreamento e operação hospitalar permanecem no backlog.

O cadastro separa envio do contrato e configuração em duas telas, sem indicador de etapas ou numeração. Os campos opcionais ficam recolhidos em Mais informações. Verificação no Chrome: avanço bloqueado antes do upload, envio de contrato sintético, navegação até os campos e retorno preservando arquivo e preenchimento; edição existente começa nos campos. A leitura real da IA continua sem validação, pois não há credencial configurada.

| Área | Entrega disponível | Evidência e limite |
| --- | --- | --- |
| Documentação | Escopo, fluxos, arquitetura proposta, fontes e backlog | Descreve o projeto; não demonstra software em operação |
| Marca | Wordmarks SVG, tokens e apresentação da identidade | [Kit atual da marca](../brand/README.md); versões anteriores preservadas no Git |
| Dados | Cenários financeiros fictícios e metadados de documentos públicos auditados | [Dados](../data/README.md); distinguir cenário simulado, documento real e resultado operacional ainda não medido |
| Verificação | Validador de referências locais e configuração para CI | `python3 scripts/verificar_repositorio.py`; não testa comportamento de CRM ou hardware |
| Histórico | Experimentos ópticos e pesquisa anterior no Git | Apenas registro; sem integração com a arquitetura vigente |

O [estudo do pacote de pesquisas](referencias/estudo-pacote-pesquisas.md) acrescentou inventário público, auditorias e casos esperados de extração. Esses casos ainda não foram avaliados com uma LLM real. O fluxo de colaboração segue [Gitflow](../CONTRIBUTING.md).

## O que ainda não existe

- Autorização por usuário/papel/instituição, isolamento institucional e implantação hospitalar do CRM.
- Extração validada com provedor real; motor completo de obrigações condicionais/por uso, planos versionados e execução até comprovante.
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

Stack/armazenamento para expansão além do protótipo local; autorização institucional; provedor/modelo e avaliação da extração; execução da IA com internet indisponível; protocolo de transporte dos receptores; componentes, bateria e gabinete; critério de localização e metas de aceitação; instalação piloto e custos; licença do projeto e disponibilidade jurídica da marca.

As interfaces de [packages/contratos](../packages/contratos/README.md) são propostas para coordenar a primeira implementação. O [backlog](desenvolvimento/backlog.md) organiza a sequência de construção.
