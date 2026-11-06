# Backlog de construção

Backlog de entregas, não lista de funcionalidades concluídas. O [estado atual](../estado-atual.md) registra o que existe. Responsáveis e datas serão combinados pela equipe; este documento não atribui trabalho nominalmente.

## Base compartilhada

| Entrega | Depende de | Pronta quando |
| --- | --- | --- |
| Escolher e inicializar stack do CRM | Revisão da arquitetura com a equipe | Decisão registrada, execução local reproduzível e comandos reais documentados |
| Modelo e autorização iniciais | Stack e requisitos de domínio | Instituição, ativo e usuário persistidos; acesso cruzado negado em teste real de API/banco |
| Versionar interfaces de localização | Revisão de `packages/contratos` | Esquemas validáveis, exemplos, política de versão e testes de fronteira definidos |

## Fluxo completo do CRM

| Entrega | Depende de | Pronta quando |
| --- | --- | --- |
| Inventário e ficha de ativo | Base de persistência/acesso | Cadastro e consulta funcionam após reinício, com identificação e setor |
| Arquivo privado e vínculo documental | Ativo e acesso | Upload, versão, consulta autorizada e duplicatas tratados na persistência real |
| Extração revisável | Documento | Valor e evidência visíveis; ausência/conflito não vira aprovação; integração simulada é identificada |
| Plano e prazos | Revisão e regras de domínio | Aprovação registrada e cálculo determinístico com casos de calendário e dado ausente testados |
| Tarefa até comprovante | Plano e prazos | Responsável, janela, execução, pendência, conclusão e histórico funcionam no fluxo integrado |
| Painel e auditoria | Tarefas persistidas | Pendências e atrasos refletem os dados; eventos relevantes têm autor/origem |

Implementar a fatia completa antes de expandir painéis, integrações e canais. A integração real de IA pode avançar em paralelo com avaliação de documentos representativos e custo; uma resposta JSON válida não basta como avaliação da extração.

## Localização em paralelo

| Entrega | Depende de | Pronta quando |
| --- | --- | --- |
| Adaptador simulado e ingestão | Contratos versionados | Eventos reproduzíveis entram na persistência; duplicatas/atraso são tratados |
| Consulta pelo CRM | Ingestão e ativo | UI mostra localização, procedência, última detecção e desconhecido/desatualizado |
| Associação temporal | Cadastro de tag/ativo | Troca de tag e evento antigo não misturam históricos |
| Operação local | Caminho integrado | WAN desligada não interrompe ingestão e consulta previstas; dependências e falhas ficam registradas |
| Receptor físico | Bancada e protocolo | Observações reais chegam pelo mesmo contrato sem simulação encoberta |

## Hardware e implantação

| Entrega | Depende de | Pronta quando |
| --- | --- | --- |
| Selecionar componentes e protocolo | Área-alvo, método e requisitos de energia | BOM candidata e escolhas justificadas; nenhuma compatibilidade hospitalar presumida |
| Tag e receptor de bancada | Componentes/protocolo | Identidades distintas, reinício, transmissão e consumo demonstrados com registros |
| Medir localização | Bancada integrada e posições de referência | Erros de setor, perdas, atraso e limites publicados, inclusive falhas |
| Validar montagem e coexistência | Configuração física e autorização | Ensaios e restrições do conjunto registrados pelos responsáveis |
| Piloto delimitado | Liberação da área e dos modelos | Plano de acompanhamento, interrupção e métricas acordados antes da implantação |

Seguir o [plano de validação](../rastreamento/validacao.md). Não existe dependência de óptica nesta sequência.

## Depois de comprovar o fluxo inicial

Integrações com sistemas existentes, notificações reais, relatórios econômicos com dados autorizados, novos tipos de ativos e refinamento de localização. Modelo comercial, preço e ROI precisam de pesquisa e medição próprias. Rastreamento de pessoas e funções clínicas continuam fora do escopo inicial.
