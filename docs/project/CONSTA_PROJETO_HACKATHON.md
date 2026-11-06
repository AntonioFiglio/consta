# Consta — projeto consolidado para o hackathon HCFMUSP

Versão de trabalho: 6 de novembro de 2026. Documento de transferência para o Codex CLI. Nenhum software ou hardware descrito aqui foi implementado ou validado nesta conversa.

## 1. Resumo executivo e decisões

**Consta transforma documentos de ativos hospitalares em planos de manutenção revisados e tarefas acompanhadas até a conclusão, conectando prazos, responsáveis, fornecedores e localização.**

Assinatura proposta: **Manutenção em dia. Operação sob controle.**

O cliente inicial é o hospital. Os usuários principais são engenharia clínica e manutenção/engenharia hospitalar. O benefício procurado é operacional e econômico: menos trabalho de coordenação, menos despesas emergenciais e maior disponibilidade. O paciente é beneficiário indireto; o produto inicial não faz diagnóstico, tratamento ou decisão clínica.

### O que está decidido, recomendado e aberto

| Status | Item |
|---|---|
| Escolhido pelo usuário | Nome Consta; marca/domínio ainda não verificados juridicamente |
| Direção acordada na conversa | B2B; hospitais primeiro; manutenção preventiva como núcleo; localização como suporte |
| Visão de expansão | Laboratórios e ativos prediais, incluindo climatização e aquecimento |
| Recomendação deste documento | MVP documental + revisão humana + tarefa + execução/evidência + localização com procedência |
| Recomendação deste documento | Uma bomba de infusão móvel como fio condutor da demonstração; um ar-condicionado como exemplo secundário de abrangência |
| Recomendação técnica | Aplicação web TypeScript, PostgreSQL, arquivos privados, extração estruturada por IA, motor determinístico de prazos e tarefas |
| Decisão de escopo recomendada | Não desenvolver hardware proprietário nem implantar rádio no hospital durante o hackathon |
| Em aberto | Fornecedor RTLS, tecnologia definitiva de localização, preço, integração real, economia, aderência do mercado e regularização aplicável |

**Resposta honesta sobre a pesquisa:** há evidência suficiente para sustentar a relevância do problema e desenhar um MVP. Não há inventário do hospital-alvo, contratos reais autorizados, baseline de perdas, cotação de implantação RTLS ou ensaio de compatibilidade. Não foi pesquisado exaustivamente todo o mercado nem provada exclusividade.

## 2. Origem e contexto

Matheus participa de hackathon no HCFMUSP e relata formação em engenharia biomédica pela PUC-SP e experiência em engenharia clínica na Secretaria Municipal da Saúde de São Paulo. Esse conhecimento é uma competência da equipe, não evidência automática de validação comercial.

As conversas com mentores pediram: simplificar a proposta, nomear a dor, mostrar processo atual e futuro, escolher um caso demonstrável, quantificar perdas antes de prometer ganhos e evitar adicionar IA ou IoT sem necessidade.

A [síntese das duas gravações do hackathon](CONSTA_NOTAS_DOS_AUDIOS.md) detalha os novos aprendizados e indica as passagens de origem. As falas são relatos e sugestões, com confirmação externa indicada separadamente.

Relatos qualitativos da conversa incluem dificuldade de encontrar equipamentos e uma busca de aproximadamente uma hora por um gerador no HC. Tratar como relato anedótico não verificado, sem extrapolar frequência, custo ou desempenho institucional.

## 3. Dor e público

**Hipótese de dor:** informações sobre manutenção, contratos, responsáveis e localização podem estar dispersas entre documentos, sistemas e pessoas. A equipe gasta tempo conciliando dados e cobrando ações. Quando a coordenação falha, preventivas podem atrasar, ativos ficam indisponíveis e surgem despesas emergenciais.

Não afirmar que hospitais não possuem sistemas ou desconhecem todos os seus prazos. O problema pode ser cadastro desatualizado, baixa adesão, dificuldade de integrar documentos, falta de capacidade de execução, falta de orçamento ou dificuldade de localizar o ativo. O Consta não resolve todas essas causas apenas com alertas.

| Papel | Necessidade e hipótese de valor |
|---|---|
| Engenharia clínica | Organizar equipamentos médicos, programação, evidências e liberação técnica |
| Manutenção/engenharia hospitalar | Gerenciar ativos prediais com planos e atribuições próprios |
| Administração/operações | Visibilidade de pendências, capacidade, gastos e fornecedores |
| Compras/contratos | Identificar cobertura, vencimentos e execução contratual |
| Enfermagem/setores | Informar movimentação ou receber solicitação de recolhimento com pouco trabalho adicional |
| Prestador | Receber escopo, ativo, janela e documentação necessários; acesso limitado |
| TI | Integrar sistemas e preservar controle de acesso e dados |

Comprador econômico e patrocinador do piloto precisam ser identificados em cada instituição. Hospitais são identificáveis, mas contratação, implantação e acesso aos dados não são presumidamente fáceis.

## 4. Evidências que podem entrar no pitch

| Evidência publicada | Uso permitido | Limite |
|---|---|---|
| HCX informa mais de 40 mil equipamentos no complexo HCFMUSP [S1] | Mostrar escala do parque tecnológico | Não é média por hospital nem inventário confirmado em 6/11/2026 |
| HCX relata mais de R$ 1 milhão de custo evitado pelo Labec com internalização de manutenções [S1] | Mostrar relevância econômica da gestão/manutenção | Não é perda atual, economia anual presumida ou resultado de software/Consta |
| HRBA divulgou 3.096 equipamentos em 7/6/2023 [S2] | Exemplo de milhares de ativos em uma instituição | Não representa todos os hospitais; unidades físicas, não tipos distintos |
| OMS descreve a preventiva como voltada a prolongar vida útil e reduzir taxas de falha [S3] | Fundamentar manutenção planejada | Não implica evitar toda quebra nem um percentual universal de economia |
| OMS publicou orientação sobre sistemas de inventário e manutenção em 2025 [S4] | Fundamentar o enquadramento do produto em gestão de ativos | Não valida o Consta |
| GETS já cobre inventário, manutenção, contratos e custos [S5] | Reconhecer soluções existentes e orientar diferenciação | Não dizer que ninguém faz gestão de manutenção |

Não foi encontrada média nacional defensável de tipos distintos de equipamentos por hospital. Não usar “18 equipamentos por leito”, número de UTIs, diária de UTI ou receita perdida sem fonte e escopo. Tipos, modelos, unidades físicas, leitos e procedimentos são grandezas diferentes.

## 5. Processo atual e processo proposto

O “atual” é uma hipótese a confirmar com a instituição, não descrição universal.

| Etapa | Atual a validar | Consta | Benefício a medir |
|---|---|---|---|
| Cadastrar ativo | Digitação e consulta em documentos distintos | Importação de inventário + identidade única + documentos associados | Tempo e completude do cadastro |
| Descobrir obrigações | Buscar contrato, manual e histórico | Extração com página/trecho de origem, seguida de revisão | Tempo de revisão e taxa de correção |
| Definir plano | Interpretar periodicidade, marco inicial e cobertura | Plano aprovado pelo responsável técnico | Planos sem informação faltante |
| Programar | Cruzar operação, reserva e agenda do prestador | Tarefa com prazo, responsável, janela e dependências | Tempo para confirmar agendamento |
| Encontrar móvel | Consultar setores e procurar fisicamente | Última localização, fonte e horário; RTLS quando integrado | Tempo de busca e taxa de localização correta |
| Executar | Cobranças e comprovantes dispersos | Estados de execução e evidências vinculadas | Cumprimento no prazo e retrabalho |
| Encerrar | Atualização manual e inconsistente | Revisão da conclusão, liberação e próxima obrigação | Rastreabilidade e pendências |
| Gerir custos | Informações sem vínculo ao ativo | Histórico de gastos, contingências e cobertura | Gastos emergenciais e custos duplicados |

### Fluxo principal

Documento/inventário → identificação do ativo → extração de obrigações → revisão humana → plano aprovado → cálculo de vencimentos → tarefa atribuída → confirmação/agendamento → localização e recolhimento → execução → evidência e liberação → próximo ciclo.

Estados da tarefa: pendente, atribuída, agendada, em execução, aguardando peça/prestador/liberação, concluída, cancelada com motivo. Atraso é uma condição derivada do prazo, preservada mesmo depois da conclusão para medir cumprimento.

Uma notificação enviada não equivale a tarefa recebida, agendada ou concluída. Uma localização detectada não equivale a equipamento disponível ou liberado.

Tratar **cobertura contratual** e **execução** como estados independentes. Uma preventiva prevista pode ficar sem solicitação, sem janela confirmada ou sem evidência de execução. Um plano validado sem cobertura identificada continua visível como necessidade da equipe. Para coordenar a parada, o Consta propõe ou registra a janela aprovada pelo setor responsável. A agenda assistencial permanece sob controle do hospital.

## 6. Documentos, IA e regras

Entradas: contratos, aditivos, manuais, notas/documentos de aquisição quando úteis, planos existentes, ordens de serviço e inventário CSV. Contrato de aquisição pode não conter periodicidade, procedimento ou preço da preventiva.

Na tela de inventário, **Adicionar ativo** oferece cadastro manual e preenchimento assistido por documento. Vincular contrato ou lote ao ativo físico usando patrimônio e número de série quando disponíveis. Se o documento identificar apenas um modelo ou lote, pedir associação explícita antes de gerar a tarefa. A ficha da intervenção mostra o identificador para conferência no próprio equipamento.

IA serve para extrair e sugerir preenchimento. A engenharia aprova o plano. Nenhum agente inventa intervalos, decide reparos ou declara segurança de uso.

Campos propostos: identificação/modelo/serial quando presentes, documentos aplicáveis, fornecedor, vigência, cobertura, exclusões, preços e unidades monetárias, periodicidade, tipo de gatilho (calendário/horímetro/ciclos), marco inicial, próxima data explícita, SLA, condições de execução e contato de serviço.

Para cada campo: valor, unidade, status (encontrado/ausente/conflitante), documento, versão, página, trecho e revisão. Não substituir ausência por estimativa silenciosa. Não tratar uma pontuação do próprio modelo como confiança calibrada.

Casos essenciais:

- “Semestral” sem marco inicial: pedir decisão registrada; não calcular a partir do upload.
- Contrato com vários ativos: associação explícita; não criar uma tarefa coletiva sem identificar abrangência.
- Documento e aditivo em conflito: revisão; preservar ambos e a decisão.
- Preventiva por uso: sem horímetro/ciclos confiáveis, mostrar falta de dado; não converter para meses por conta própria.
- PDF duplicado: detectar hash e evitar duplicação de plano/tarefa.
- Documento é dado não confiável: instruções inseridas no PDF não podem comandar ferramentas ou alterar regras.
- Atualização do plano: versionar; não apagar execução passada ou reescrever datas históricas.

## 7. MVP e demonstração

### Incluir no MVP

1. Cadastro/importação de ativos, setor e responsável.
2. Upload de PDF e extração estruturada revisável, com evidência visível.
3. Confirmação de plano e lista/calendário de próximas manutenções.
4. Responsável, agendamento, execução e comprovação.
5. Localização por setor, horário e fonte; tela distinguindo manual, QR, sensor e simulação.
6. Painel de vencidas, próximas, sem plano validado e aguardando confirmação.
7. Indicadores de tempo, cumprimento e despesas; nenhuma economia inventada no painel.

### Demonstração de 60–90 segundos, com dados fictícios declarados

Ativo principal: bomba de infusão BI-0234. Documento sintético declara manutenção a cada seis meses, marco de 10/5/2026 e próxima data de 10/11/2026. Esta é uma regra fictícia da demonstração, não recomendação clínica ou do fabricante.

1. Enviar PDF sintético. Mostrar campo extraído junto da página/trecho.
2. Responsável aprova associação e regra. A tarefa vence em quatro dias na data de referência da demo, 6/11/2026.
3. Sistema mostra setor e último evento de localização. Se evento for simulado, selo permanente “localização simulada”.
4. Registrar recolhimento e janela acordada com o setor, sem cancelar pacientes automaticamente.
5. Registrar execução/laudo fictício e conclusão aprovada. Preservar o histórico.
6. Mostrar um ativo fixo, ar-condicionado AC-001, apenas para ilustrar que a mesma estrutura aceita outra categoria. Não inventar plano técnico de climatização.

**Exemplo documental complementar:** o PNCP publica um contrato de preventiva e corretiva do HC-UFPE para um angiógrafo identificado por modelo, série e patrimônio [S17]. Pode servir como referência para demonstrar o vínculo entre contrato e ativo fixo. A publicação não comprova frequência, execução ou pendências atuais. Para calcular vencimentos, obter cláusula e marco inicial verificáveis ou usar o exemplo sintético já previsto. A bomba continua como caso principal para demonstrar localização.

Fora do MVP: marketplace, negociação automática, previsão de falhas por IA, compra/substituição autônoma, prontuário, decisão de disponibilidade clínica de leito, integração hospitalar não contratada, rastreamento de pacientes e hardware proprietário.

## 8. Localização indoor: decisão técnica

**Necessidade funcional:** identificar automaticamente em qual setor/sala o ativo móvel foi detectado, com timestamp e indicação de atualização/qualidade. Histórico de movimento é desejável; coordenadas centimétricas não são requisito inicial demonstrado.

| Opção | Entrega | Limite e decisão |
|---|---|---|
| QR/DataMatrix | Identidade e última localização registrada | Não atende sozinho ao requisito de movimento automático; manter como alternativa/manual e vínculo de identidade |
| RFID passivo | Inventário e eventos de passagem por leitores | Leitor transmite RF; evento não prova presença contínua; não assumir leitura perfeita em metal |
| BLE | Detecção/proximidade ou posicionamento com receptores adequados | Candidato a primeiro piloto automático se rádio permitido e infraestrutura viável; RSSI simples não garante sala correta |
| UWB | Posicionamento por tags/âncoras | Avaliar só se precisão maior trouxer valor; custo/instalação precisam de orçamento |
| Infravermelho | Identificação óptica de ambientes | Cobertura/oclusão e arquitetura importam; produtos podem usar RF para enviar dados |
| Ultrassom | Identificação/posicionamento acústico | Alternativa de sinal sem RF; produtos podem usar BLE/Wi-Fi no restante do sistema |

Referências: NHS [S6], FDA RFID [S7], CenTrak [S10], Sonitor [S11], FiRa [S12].

### Recomendação firme para o hackathon

Implementar adaptador de localização, planta/setores e eventos com fonte explícita. Usar simulação honesta ou hardware demonstrado fora da área assistencial. Isso prova o fluxo de software, não precisão, escalabilidade ou compatibilidade clínica.

### Recomendação condicionada para piloto real

1. Verificar se o hospital já tem RTLS ou infraestrutura compatível; integrar antes de instalar.
2. Se RF for permitida após avaliação: cotar BLE e medir acerto de sala/setor, atualização, bateria e tempo de busca. Não adquirir hardware só pela promessa de “baixo consumo”.
3. Se a restrição for literalmente não adicionar transmissores RF: investigar óptica/acústica com comunicação cabeada e confirmar cada etapa da arquitetura. Não declarar um fornecedor híbrido como “sem rádio”.
4. Restringir a piloto controlado, com engenharia clínica, TI e fabricantes envolvidos. Não testar interferência em equipamentos em uso com pacientes.

Não existe decisão responsável de “BLE não interfere no hospital” sem avaliação do ambiente, dos equipamentos e da instalação. Compatibilidade eletromagnética e coexistência de comunicações são análises relacionadas, mas diferentes [S8]. Homologação Anatel não é liberação universal de uso hospitalar [S9]. RM exige avaliação específica de tags/fixação e conjunto, não apenas do protocolo de rádio [S13].

O AirTag citado no brainstorming transmite sinal Bluetooth detectável pela rede Buscar [S18]. A analogia ajuda a explicar uma rede de receptores. Para o Consta, a confirmação da identidade física por patrimônio, série ou etiqueta é uma etapa distinta da estimativa de localização.

## 9. Arquitetura recomendada para implementação

Estas são escolhas de projeto, não descrição de um sistema já construído. O CLI deve preservar uma stack existente viável; não reinstalar ou migrar por preferência estética.

- **Interface e API:** Next.js/React com TypeScript, aplicação web responsiva. Fluxo de tarefas deve funcionar em celular.
- **Dados:** PostgreSQL; IDs estáveis por instituição e ativo, integridade referencial e histórico de eventos. Se não houver serviço disponível, usar ambiente local autorizado; não criar conta ou serviço pago automaticamente.
- **Arquivos:** armazenamento privado compatível com objetos; acesso autenticado/temporário; hash, versão e associação ao ativo.
- **Extração:** adaptador de provedor; candidato OpenAI API com saída por JSON Schema [S14]. PDF textual primeiro; OCR/visão quando necessário. Modelo específico escolhido após ensaio com documentos representativos, considerando erro, latência e custo. Estrutura correta de JSON não prova veracidade.
- **Regras:** cálculo determinístico de prazos e estados no backend. Calendário, fuso do hospital, versão de plano e tipo de periodicidade explícitos; sem LLM decidindo agenda a cada execução.
- **Tarefas em background:** worker/job runner + fila/outbox persistente. Notificações idempotentes, reexecução e registro de falhas. Evitar um processo de navegador como agendador.
- **Notificações:** caixa interna e e-mail como primeiras integrações. SMS/voz são evolução com custo e aprovação operacional. Demo usa caixa de saída simulada; nenhuma mensagem real para terceiros sem autorização.
- **Localização:** endpoint de eventos + adaptadores de sensores. MQTT pode ser usado pelo gateway se o fornecedor exigir, mas não é requisito do núcleo. MQTT é protocolo de comunicação, não tecnologia de localização.
- **Integração:** CSV e API primeiro; adaptador para CMMS/ERP/RTLS quando interfaces e permissões estiverem disponíveis. Não pressupor API pública no GETS.
- **Acesso:** papéis por instituição, setor e responsabilidade; auditoria. Não incluir dados de paciente no MVP.

Não há necessidade demonstrada de banco vetorial, chatbot, fine-tuning, blockchain ou treinamento de modelo preditivo para este MVP.

### Entidades essenciais

Hospital, setor/local, ativo, documento/versão, contrato e vínculo contrato–ativo, extração/evidência, plano/versão, tarefa, atribuição, fornecedor, evento de localização, registro de execução, custo, notificação e evento de auditoria.

Evento de localização: instituição, ativo/tag, setor, observed_at, received_at, fonte, identificador único, qualidade quando fornecida e indicador simulado. Eventos antigos ou duplicados não podem sobrescrever uma detecção mais recente. “Desconhecido/desatualizado” é um estado válido.

### Verificação proporcional ao risco

- PDF com campo ausente ou conflito não gera plano aprovado silenciosamente.
- Prazos respeitam o marco de referência, calendários e revisão técnica; casos de fim de mês devem ter regra explícita.
- Repetir upload/job/evento não duplica tarefa ou mensagem.
- Um usuário de outra instituição não lê arquivos/ativos.
- Localização vencida ou simulada não aparece como confirmação atual.
- Conclusão requer evidência/decisão conforme plano; notificação não encerra tarefa.
- Integrações reais, quando usadas, precisam de evidência real; mocks devem estar identificados.

## 10. Modelo econômico sem promessas indevidas

Separar três livros: **caixa**, **capacidade da equipe** e **capacidade operacional**.

### Caixa

Benefício bruto mensal = locações emergenciais evitadas + adicionais emergenciais evitados + outros gastos efetivamente evitados e não sobrepostos.

Benefício líquido mensal = benefício bruto − custo recorrente total da solução.

ROI em 12 meses = (12 × benefício bruto − 12 × custo recorrente − implantação) / (12 × custo recorrente + implantação).

Payback simples = implantação / benefício líquido mensal, apenas se líquido positivo. Sem desconto financeiro; estes cálculos são exemplos de avaliação operacional, não resultados do Consta.

### Capacidade de trabalho

Horas recuperadas = horas antes − horas depois. Valor equivalente = horas recuperadas × custo/hora. Não somar ao caixa a menos que haja gasto realmente reduzido e não contado em outro item.

### Capacidade operacional

Medir horas de indisponibilidade e serviços afetados. Quando houver demanda definitivamente perdida, estimar margem de contribuição perdida, não faturamento bruto. Não contar receita recuperada quando o serviço apenas foi reagendado sem perda. Não somar custos fixos outra vez se já refletidos no cálculo.

### Simulação para explicar o método — números inteiramente fictícios

Premissas comuns: custo recorrente total R$ 1.500/mês, implantação R$ 6.000, custo de trabalho R$ 50/h. Não são preço proposto nem orçamento de RTLS. Inserir custos reais de tags, instalação, integração, suporte, baterias, nuvem e mensagens antes de avaliar um piloto.

| Mensal | Conservador | Central | Otimista |
|---|---:|---:|---:|
| Horas recuperadas | 20 | 40 | 70 |
| Equivalente de capacidade, fora do caixa | R$ 1.000 | R$ 2.000 | R$ 3.500 |
| Locação emergencial evitada | R$ 300 | R$ 1.000 | R$ 2.400 |
| Adicionais emergenciais evitados | R$ 400 | R$ 1.200 | R$ 2.400 |
| Benefício bruto de caixa | R$ 700 | R$ 2.200 | R$ 4.800 |
| Custo recorrente | R$ 1.500 | R$ 1.500 | R$ 1.500 |
| Benefício líquido de caixa | **−R$ 800** | **R$ 700** | **R$ 3.300** |
| Saldo em 12 meses, incluindo implantação | −R$ 15.600 | R$ 2.400 | R$ 33.600 |
| ROI em 12 meses | −65% | 10% | 140% |
| Payback simples | Não ocorre neste cenário | 8,6 meses | 1,8 mês |

O cenário conservador explicita que a solução pode não se pagar. Antes de ter dados, não usar o cenário central como previsão. Para pitch de três minutos, é melhor mostrar o método e um dado local real do que esses três cenários fictícios.

Ponto de equilíbrio recorrente ilustrativo: R$ 1.500/mês de gastos evitados. Para recuperar também R$ 6.000 em 12 meses: R$ 2.000/mês. Desconsidera efeitos de ramp-up, impostos e custo de capital; adaptar à avaliação real.

## 11. Piloto e validação

Escopo proposto: uma instituição, uma área, uma família de ativos móveis, por exemplo 20–50 bombas conforme disponibilidade. Quantidade e duração são recomendações de planejamento, não amostra estatisticamente validada.

No diagnóstico do piloto, acompanhar uma preventiva real com o gestor e o técnico. Identificar quem confere o plano, pede a intervenção, aprova a parada e valida o comprovante. Usar o processo atual como referência, inclusive planilha e checklist, e medir tempo de conciliação e cobrança sem pressupor eliminação de postos de trabalho.

1. Levantar 30–90 dias de histórico disponível e observar o processo atual. Estender quando o ciclo de manutenção exigir.
2. Associar ativos/documentos e obter revisão técnica.
3. Rodar inicialmente em paralelo ao controle existente; divergências são investigadas, não sobrescritas.
4. Medir 4–8 semanas para usabilidade, tempo de cadastro/busca e cumprimento das tarefas que vencerem. Falhas raras, vida útil e retorno financeiro podem exigir meses adicionais.
5. Comparar denominadores, complexidade, demanda, equipe e manutenção programada. Antes/depois sozinho não prova causalidade; usar grupo comparável ou implantação escalonada quando viável.

Indicadores: tempo mediano de cadastro/revisão, proporção de campos corretos antes da revisão, completude de planos, tarefas concluídas no prazo/total devido, tempo mediano de busca, acerto de setor, atualização de localização, indisponibilidade não planejada, gastos emergenciais por ativo-mês e custo total da solução.

Critérios de aceitação devem ser pactuados antes do piloto. Sugestões exploratórias: redução de 30% no tempo de cadastro/revisão e de 30% no tempo de busca, sem piorar completude ou segurança; acerto de setor ≥95% em percurso controlado. São metas propostas, não capacidades comprovadas nem promessas comerciais. Mensurar custo de revisão e falsos alertas.

## 12. Mercado, diferenciação e modelo de negócio

GETS demonstra que o mercado não começa do zero [S5]. A hipótese de diferenciação é **reduzir o esforço entre documentos e execução**, com extração rastreável, tratamento de lacunas, responsáveis e integração da localização. Não está provado que concorrentes não ofereçam essas funções. Fazer comparação funcional antes de alegar exclusividade.

Posicionamento recomendado: começar como camada que complementa o sistema existente quando necessário; evitar exigir substituição completa do CMMS para provar valor. Em hospitais sem solução adequada, oferecer o fluxo básico completo.

Modelo comercial a validar: assinatura por instituição/faixa de ativos + implantação; localização e integrações precificadas separadamente conforme custo. Não cobrar comissão sobre manutenção como premissa inicial; não há marketplace validado. Disposição a pagar e ciclo de venda ainda desconhecidos.

Mercado inicial: hospitais com equipe responsável e dor documentada no fluxo documental/execução. Expansão para rede hospitalar, predial e laboratórios só após comprovação. Dimensionamento futuro: número de instituições compatíveis com o perfil × contrato anual validado; não usar todo gasto brasileiro em saúde como mercado endereçável.

## 13. Integração com monitoramento de leitos

O contato do hackathon relatou um protótipo de monitoramento de leitos. Não conhecemos API, dados, finalidade ou disponibilidade para parceria.

Possível troca: Consta recebe vínculo ativo–local/leito e informação operacional autorizada; fornece manutenção programada, recolhimento e estado técnico registrado. A equipe define consequências. Localização de uma bomba próxima de um leito não prova associação ao leito; ocupação não prova disponibilidade técnica.

Não decidir automaticamente liberação de UTI, cancelamento de pacientes ou tratamento. Não incluir dados de pacientes se IDs operacionais e ativos forem suficientes.

## 14. Limites de segurança, dados e regulação

Intenção inicial é administrativa/operacional. Isso não autoriza declarar “sem regulação”: enquadramento depende da finalidade e arquitetura final [S15]. Se o produto passar a controlar dispositivos ou fazer decisão clínica, reavaliar. IEC 60601-1-2 não deve ser atribuída automaticamente a software puro.

A RDC Anvisa nº 509/2021 trata do gerenciamento e da rastreabilidade das tecnologias em saúde abrangidas, exige plano de gerenciamento e permite terceirização, quando cabível, mediante contrato formal (arts. 1º, 4º–6º e 16) [S16]. A norma fundamenta a necessidade de gestão e documentação. O texto não estabelece compra obrigatória de um pacote de manutenção junto com todo equipamento, nem certifica o Consta.

Documentos de contratos podem conter dados pessoais e condições comerciais. Demo usa dados sintéticos; documentos reais só com autorização e ambiente definido. Implantação exige política de acesso, retenção, processamento por terceiros e incidentes. Não prometer conformidade integral só por usar nuvem ou criptografia.

Tags/fixações também precisam considerar limpeza, materiais, ventilação, controles e identificações do fabricante; RM tem exigências próprias. Este documento não é laudo de segurança, ensaio EMC ou parecer jurídico.

## 15. Roteiro inicial de pitch — alvo de três minutos

Ensaiar e cronometrar; ajustar ao que estiver realmente implementado. Não dizer “nosso sistema faz” se só houver mock.

**0:00–0:30 — dor e escala.** “Um hospital pode administrar milhares de equipamentos. O HCX informa mais de 40 mil no complexo HCFMUSP. Cada ativo tem documentos, responsáveis e necessidades de manutenção. Quando essas informações não viram ações coordenadas, a equipe perde tempo e a operação fica exposta a atrasos e despesas emergenciais.”

**0:30–0:50 — proposta.** “O Consta transforma documentos dos ativos em planos revisados e tarefas acompanhadas: o que precisa ser feito, quando, por quem e onde encontrar o equipamento.”

**0:50–1:40 — demonstração.** “Neste exemplo fictício, enviamos um documento de uma bomba de infusão. O sistema apresenta os dados e a origem de cada informação. A engenharia confirma o plano. A tarefa recebe responsável, prazo e localização. Depois do agendamento, a execução e o comprovante ficam no histórico.” Se localização simulada: dizer explicitamente; não sugerir sensor implantado no hospital.

**1:40–2:10 — benefício e medição.** “Vamos medir tempo de cadastro e busca, cumprimento de preventivas e gastos emergenciais. Horas recuperadas serão separadas de economia de caixa. Queremos demonstrar retorno com dados do hospital, incluindo o custo de implantação.”

**2:10–2:35 — diferencial e viabilidade.** “Sistemas de manutenção já existem. Nossa hipótese é facilitar a passagem dos documentos para uma execução verificável e integrar a localização quando ela resolve a busca. Começamos com um fluxo e uma família de ativos; podemos integrar a infraestrutura existente.”

**2:35–3:00 — equipe e pedido.** “Nossa equipe combina conhecimento de engenharia biomédica e experiência de engenharia clínica na SMS de São Paulo com desenvolvimento de software. Buscamos um hospital parceiro para testar esse fluxo, medir a linha de base e validar o resultado.” Só mencionar competências dos demais integrantes após confirmação.

### Perguntas previsíveis da banca

- “Já existe?” Sim, CMMS/GETS e RTLS existem. Validaremos menor esforço documental e execução integrada; não alegamos exclusividade.
- “Quanto economiza?” Ainda não foi medido. Temos métricas e modelo de custos; qualquer cenário mostrado é simulação.
- “A IA pode errar?” Sim. Mostramos fonte e conflitos; plano só entra em operação após revisão.
- “E se contrato não tiver a preventiva?” Usamos manual/plano e sinalizamos ausência; não inventamos.
- “E interferência?” Não existe hardware liberado por este projeto. Integração RTLS é separada e exige avaliação local.
- “Precisa de IoT para funcionar?” O núcleo documental e de manutenção funciona sem ele; a localização automática depende de infraestrutura adequada.
- “Serve para ar-condicionado?” O cadastro e fluxo podem servir; planos, equipes e exigências técnicas permanecem específicos.

## 16. Pendências prioritárias, sem bloquear o protótipo

1. Um exemplo autorizado ou sintético de documento e inventário.
2. Um hospital/setor e responsável que confirmem a dor principal.
3. Sistema usado hoje e barreira concreta que o Consta remove.
4. Histórico de horas de busca, manutenção e despesas emergenciais.
5. Requisito de localização: setor, sala ou coordenada; atualização necessária; restrição real a RF.
6. Infraestrutura disponível, orçamento de RTLS e responsável por avaliação.
7. Formato do pitch, critérios do hackathon e tempo restante.
8. Disponibilidade da marca Consta no INPI e domínio; ainda não verificada.

## 17. Fontes principais

Consultadas nesta pesquisa em 6/11/2026. Datas de consulta não substituem datas dos fatos. Referências FDA/NHS são técnicas, não legislação brasileira. Material de fabricantes descreve produtos e não valida nossa implantação.

- **S1 — HCX FMUSP:** https://hcxfmusp.org.br/portal/engenharia-clinica/ — escala do complexo e caso Labec; não atribuir ganhos ao Consta.
- **S2 — Governo do Pará, 7/6/2023:** https://agenciapara.com.br/noticia/44370/hospital-do-baixo-amazonas-tem-parque-tecnologico-com-mais-de-3-mil-equipamentos — 3.096 ativos.
- **S3 — OMS, 2011:** https://www.who.int/publications/i/item/9789241501538 — finalidade da manutenção preventiva.
- **S4 — OMS, 4/6/2025:** https://www.who.int/publications/i/item/9789240111257 — sistema de informação de inventário/manutenção.
- **S5 — CEB Unicamp, GETS:** https://www.ceb.unicamp.br/pesquisa/laboratorios/laboratorio-nacional-para-gerenciamento-de-tecnologia-em-saude-lngts/ — funcionalidades existentes.
- **S6 — NHS England, infraestrutura RTLS:** https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/knowledge-products-and-artefacts/advice-and-guidance/rtls-guidance/overview-of-infrastructure-required-to-provide-location-data/ — alternativas e infraestrutura.
- **S7 — FDA, RFID:** https://www.fda.gov/radiation-emitting-products/electromagnetic-compatibility-emc/radio-frequency-identification-rfid — leitores emitem RF, inclusive com etiquetas passivas.
- **S8 — FDA, EMC no hospital:** https://www.fda.gov/radiation-emitting-products/electromagnetic-compatibility-emc/fdacdrh-recommendations-emcemi-healthcare-facilities — avaliação e gestão local; complementar: https://www.fda.gov/medical-devices/digital-health-center-excellence/wireless-medical-devices.
- **S9 — Anatel:** https://www.gov.br/anatel/pt-br/regulado/certificacao-de-produtos/ — conformidade de produtos de telecomunicações.
- **S10 — CenTrak:** https://centrak.com/solutions/safety — exemplo de infravermelho com envio por RF.
- **S11 — Sonitor, material do fabricante de 2024:** https://static1.squarespace.com/static/635b76233daff54c9f23f767/t/665873b61fe4e65774a937ca/1717072823592/Sonitor-One-Flyer.pdf — plataforma combina tecnologias, incluindo ultrassom, BLE e Wi-Fi.
- **S12 — FiRa:** https://www.firaconsortium.org/sites/default/files/2023-12/FiRa-Asset-Tracking-Leaflet.pdf — arquitetura UWB.
- **S13 — FDA, RM:** https://www.fda.gov/regulatory-information/search-fda-guidance-documents/testing-and-labeling-medical-devices-safety-magnetic-resonance-mr-environment — avaliação específica no ambiente de RM.
- **S14 — OpenAI, saída estruturada:** https://developers.openai.com/api/docs/guides/structured-outputs — aderência a esquema não garante correção factual.
- **S15 — Anvisa, SaMD:** https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/produtos-para-a-saude/manuais/software-como-dispositivo-medico-perguntas-e-respostas — referência para análise do enquadramento, sem conclusão jurídica automática.
- **S16 — Anvisa, RDC 509/2021:** https://bvsms.saude.gov.br/bvs/saudelegis/anvisa/2020/rdc0509_27_05_2021.pdf — plano de gerenciamento, rotinas e documentação das tecnologias abrangidas.
- **S17 — PNCP, contrato 00020/2023 do HC-UFPE:** https://pncp.gov.br/app/contratos/15126437000143/2023/007439 — exemplo público de objeto contratual vinculado a um angiógrafo identificado.
- **S18 — Apple, AirTag:** https://www.apple.com/uk/airtag/ — o dispositivo transmite Bluetooth para detecção pela rede Buscar.

Este documento prevalece como síntese atual sobre as notas exploratórias anteriores, preservadas como histórico. Dados históricos de subconjuntos do HC não devem ser somados ou confundidos com o total divulgado pelo HCX.
