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

O calendário usa uma apresentação compacta, sem cabeçalho promocional no conteúdo principal, com grade ajustada à altura da janela em desktop (a partir de 1024 × 650). A sidebar mantém o mesmo padrão entre as telas, incluindo a ação de cadastrar equipamento. A agenda e os eventos extensos têm rolagem interna; telas menores preservam rolagem para manter a leitura. Build/TypeScript e verificação do repositório passaram; conferência visual desta alteração ficou pendente por indisponibilidade do acesso ao navegador.

O usuário delimitou a primeira entrega a cadastro por contrato/número de tombamento e calendário, com React 19 e Vite. Há [aplicação executável](../apps/crm/README.md), API Express, SQLite, upload PDF/TXT, revisão manual, edição, busca e projeções mensais. Logo/tokens são os existentes; fontes são locais. A [decisão da stack](adr/0004-crm-fase-1.md) registra escopo e limites.

O SDK OpenAI está integrado no backend com URL, chave e modelo configuráveis pelo usuário. Não foi criada chave nem executada chamada real. Sem configuração, a leitura automática fica desabilitada e o preenchimento manual funciona. Não há extração fictícia apresentada como leitura de documento.

Verificações realizadas: build e TypeScript; testes de calendário, validação, SQLite após reabrir e SDK com transporte simulado; prévia no Chrome com edição, revisão pendente/confirmada e recarregamento. A suíte HTTP isolada encontrou `EPERM` ao abrir portas e ficou explicitamente marcada como não executada nesse ambiente. Servidor de desenvolvimento e interface responderam HTTP normalmente. Integração com provedor real e implantação hospitalar seguem pendentes.

O banco inicial tem três equipamentos/contratos sintéticos identificados. O aplicativo é um espaço local único, com senha opcional e escuta em loopback; não implementa autorização multi-instituição ou papéis. Planos versionados, tarefas até execução, comprovantes, rastreamento e operação hospitalar permanecem no backlog.

O diálogo foi reduzido a equipamentos/números de tombamento, intervalo e primeira manutenção. Configurações avançadas reúnem vigência, evidências, dados opcionais e renovação. Há cadastro de várias unidades sob o mesmo documento e novas coberturas por equipamento, com documentos anteriores preservados. A migração aditiva cria `asset_contracts` no SQLite (`user_version=2`), sem limpar os dados existentes.

Testes de comportamento cobrem vários equipamentos por contrato, vencimento, renovação sem duplicação, lacuna de cobertura, substituição pendente, rollback do lote e migração legada. O SDK também extrai sugestões de início/fim de cobertura, sem execução real contra provedor. Isso não implementa registro de execução nem histórico imutável de toda edição de plano.

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


## Extração e gestão de múltiplos equipamentos

A resposta do SDK passou a `version: 2` com `equipments[]`, campos/evidências/avisos próprios por item, incluindo número de tombamento, série, setor, observações e cobertura. O formulário cria uma linha editável na tabela para cada item e preserva regras distintas; quantidades sem identificação não viram ativos fictícios. Leituras antigas continuam acessíveis e podem ser reprocessadas. O inventário ganhou último contrato/cobertura, série, próxima manutenção e busca por contrato.

O lote admite criação/edição/renovação explícita por unidade, com validação antes da transação. Testes sintéticos verificam dois equipamentos com dados e periodicidades diferentes desde o schema, passando pelo preenchimento até persistência e calendário. Não foi executada extração com contrato real ou provedor real nesta entrega.

A segunda tela do cadastro usa tabela editável, uma linha por equipamento, e Detalhes abre a edição da unidade em uma janela flutuante sobre a tabela, com abas Identificação, Contrato e Dados da IA; retornar preserva os valores. O scroll fica restrito à área de trabalho, com cabeçalho e ações fixos e Adicionar equipamento no topo direito. A interface usa “Número de tombamento”; o identificador interno `patrimony` permanece compatível. Verificação: tabela e detalhes conferidos no Chrome com rascunhos sintéticos, build e checagem TypeScript aprovados, 14 testes aprovados e um teste HTTP integrado ignorado por restrição de abertura de portas do ambiente.

Os detalhes agora são uma janela não modal sobreposta à tabela, reposicionável pelo cabeçalho e pelas setas, com limites de movimento e posição fixa em telas pequenas. A tabela mantém seu scroll e os campos do rascunho; Esc e Concluir edição fecham os detalhes. Exibição sobreposta e retorno à tabela conferidos no Chrome com rascunho sintético; o arraste e o comportamento em tela pequena ainda exigem conferência manual completa.

## Consulta de contratos e ficha do equipamento

Implementadas área de Contratos com busca, prévia digital de PDF/TXT e consulta das unidades vinculadas, incluindo coberturas anteriores. O inventário e os eventos do calendário abrem a ficha de consulta do equipamento; edição permanece uma ação explícita. O cadastro permite consultar o arquivo enviado e os documentos anteriores sem sair do sistema. A listagem autenticada `GET /api/contracts` retorna somente metadados, sem bytes ou extração, incluindo arquivos ainda sem vínculo.

Verificação: PDF sintético de uma página renderizado no leitor do Chrome; TXT sintético, navegação contrato → equipamentos → ficha e listagem sem vínculo conferidos na interface. Teste de armazenamento verifica listagem sem conteúdo/extração, deduplicação e persistência após reabrir. Build/TypeScript aprovados, 14 testes aprovados e um teste HTTP isolado ignorado pela restrição de abertura de portas do ambiente. Nenhuma chamada real à IA foi feita. A compatibilidade do leitor PDF depende do navegador; há acesso direto ao arquivo.

A consulta do contrato agora inicia em Equipamentos, com Documento como segunda aba. A ficha da unidade é uma janela não modal sobreposta ao contrato, movível pelo cabeçalho e pelas setas, com limites no diálogo e layout fixo em telas pequenas. O contrato e a lista permanecem montados ao abrir/fechar a ficha; fechar devolve o foco ao equipamento e a linha selecionada fica destacada. A ficha do inventário/calendário também aceita reposicionamento. Ordem inicial e sobreposição conferidas no Chrome com dados sintéticos; build e TypeScript aprovados.
