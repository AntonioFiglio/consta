# Smart Agenda — cenário de planejamento

Este é um exemplo sintético separado do contrato de cinco equipamentos usado na demo da API. Não escreve no CRM e não demonstra um motor de otimização integrado.

Entradas explícitas: vinte equipamentos identificados como EQ-01 a EQ-20, uma preventiva por equipamento, todos inicialmente no mesmo dia05/02/2027. O exemplo admite antecipação dentro da janela01–05/02/2027 e capacidade de quatro serviços por dia. A duração e disponibilidade da equipe são hipóteses para a apresentação, não desempenho medido.

A proposta distribui as vinte tarefas igualmente pelos cinco dias: `20/5=4`, conferido com SciMath. Nenhuma tarefa é deslocada para depois do prazo05/02. Se a janela, capacidade, cobertura, disponibilidade assistencial ou restrição técnica não permitir, o planejamento precisa mudar ou permanecer concentrado. A Engenharia Clínica confirma antes de alterar um plano real.

Smart Day é a visão da carga diária. A distribuição automática no slide é coreografia frontend para explicar a proposta; o CRM existente mostra calendário e agendamentos, mas não foi encontrado um escalonador automático com capacidade/janelas nesta revisão. Código de outros integrantes não foi alterado. As cinco previsões reais da demo permanecem inalteradas no seu caso de teste.
