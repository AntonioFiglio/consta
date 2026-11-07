# Demonstração do Consta

Roteiro para quando as capacidades forem implementadas. Confira o [estado atual](../estado-atual.md) antes de apresentar: hoje o repositório contém especificações, marca e dados fictícios, sem CRM executável ou hardware BLE validado.

## História principal

Use uma bomba de infusão fictícia. Mostre a identificação do ativo, um documento sintético, a obrigação encontrada com página/trecho e a revisão do responsável. Em seguida, apresente a tarefa, a janela combinada, a localização do equipamento e o registro de execução com comprovante.

Se a localização vier de um simulador, a interface e a fala devem identificá-la como **simulada**. Quando houver hardware em bancada, descreva exatamente o cenário testado; uma demonstração de recepção BLE não comprova localização correta no hospital ou compatibilidade com aparelhos médicos.

## Mensagens essenciais

- **Problema:** documentos e cobertura precisam virar manutenção executada, com responsabilidade e evidência.
- **Proposta:** o Consta conecta documentos, planos, tarefas e localização dos ativos móveis.
- **IA:** sugere dados e mostra a fonte; a equipe técnica aprova o plano.
- **BLE:** automatiza a coleta de presença em áreas delimitadas, com processamento local previsto.
- **Benefício:** medir tempo de cadastro/revisão e busca, cumprimento de tarefas e gastos documentados.
- **Pedido:** parceiro e ambiente autorizado para validar o fluxo e, separadamente, a instalação de rastreamento.

## Infraestrutura BLE no pitch

Usar a [pesquisa sobre BLE em APs](../referencias/ble-aps-e-pitch.md) para fundamentar esta formulação:

> O Consta conecta a manutenção à localização dos equipamentos. Propomos usar tags BLE para identificar automaticamente o último setor em que cada ativo foi detectado, com receptores fixos e processamento na rede local. Podemos aproveitar APs compatíveis e complementar a cobertura com gateways dedicados. Começamos por um piloto delimitado, integrado ao CRM, e ampliamos conforme os resultados.

Para a banca, a mensagem central é o fluxo completo: encontrar o equipamento, executar a manutenção e registrar o comprovante. Se perguntarem sobre segurança: **“A implantação será avaliada com TI e engenharia clínica, por equipamentos e áreas.”** A pesquisa técnica fica como apoio para perguntas; os resultados da demonstração devem ser descritos conforme o que estiver funcionando.

Não apresentar troca de todos os APs como pré-requisito, nem BLE como garantia de ausência de interferência ou conformidade automática com IEC 60601-1-2. Reaproveitar APs é possibilidade a verificar; a direção de hardware próprio permanece registrada. Não há fornecedor ou implantação selecionados.

## Recorte executável para o hackathon

- **Fluxo principal:** ativo fictício → documento sintético → sugestão com evidência e revisão → tarefa → último setor detectado → execução e comprovante.
- **Localização:** integrar um cenário delimitado ao CRM. Se houver hardware disponível, demonstrar recepção e mudança de setor em bancada; caso contrário, usar simulação identificada e explicar a arquitetura prevista.
- **Evidência da demo:** mostrar origem e horário da localização, além do estado quando a leitura ficar desatualizada. Informar qual parte foi executada com hardware, IA real ou simulação.
- **Próximo passo:** piloto em área acordada com o hospital para medir localização e atualização e avaliar a instalação. Autonomia prolongada, escala hospitalar e implantação assistencial serão verificadas nessa evolução.

A demonstração entrega evidência do cenário apresentado. A validação hospitalar acompanha a implantação; não é requisito para apresentar a proposta e o protótipo no hackathon.

## Abertura com notícias

Uma abertura possível, acompanhada das fontes e datas:

> Equipamento indisponível e manutenção pendente já viraram notícia em hospitais brasileiros. No seu hospital, quem acompanha cada pendência até a execução e a comprovação?

O [dossiê de notícias](../referencias/noticias-para-pitch.md) reúne G1, UOL e outros veículos, com respostas institucionais e limites. O caso de Piracicaba conecta reparo, laudo e retorno ao serviço; o do Hospital de Base contextualiza controle patrimonial. Equipamento fixo ilustra manutenção, não necessidade de BLE. Não prever uma crise em outro hospital nem prometer que o Consta impediria os episódios.

## Respostas para perguntas recorrentes

| Pergunta | Resposta coerente com a fase atual |
| --- | --- |
| Já existem sistemas de manutenção e localização? | Sim. A hipótese é reduzir o trabalho entre documento e execução; a diferenciação ainda precisa ser demonstrada. |
| É uma AirTag? | A analogia é uma tag a bateria detectada automaticamente. Nossa arquitetura prevê receptores e servidor próprios na LAN. |
| Precisa de funcionário escaneando? | Não para movimentações. Associação inicial, troca de bateria e conferência antes da manutenção continuam processos próprios. |
| Pode entrar na ressonância? | A implantação inicial exclui áreas especiais de RM; o conjunto tag/ativo exigiria avaliação específica para ampliar esse escopo. |
| Não interfere em nada? | Essa garantia não existe por escolher BLE. O conjunto e a instalação precisam de avaliação e ensaios. |
| Quanto economiza? | Ainda não foi medido. Cenários fictícios não são previsão ou resultado do produto. |
| Funciona sem internet? | É requisito do caminho local de localização e consulta, ainda pendente de implementação e ensaio. IA externa pode depender da internet. |

As [fontes e limites](../referencias/README.md) orientam as afirmações. Evite números de economia, precisão ou autonomia sem evidência produzida para o Consta.

O [pacote auditado](../referencias/estudo-pacote-pesquisas.md) acrescenta precedentes de RFID no InCor e retoma a gestão de engenharia clínica já documentada no HCFMUSP. Apresente a lacuna que será investigada e o fluxo proposto; não parta de ausência de sistemas no complexo. Os casos de documentos reais servem à avaliação da extração, enquanto a história operacional da demo continua sintética.
