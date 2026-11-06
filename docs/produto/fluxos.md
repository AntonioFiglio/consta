# Fluxos operacionais

Estas são as regras propostas para implementar o produto. O [modelo de dados](../arquitetura/dominio-e-dados.md) organiza as entidades correspondentes.

## Do documento à manutenção

1. Cadastrar o ativo físico ou importar seu inventário. Identificar instituição, setor cadastrado, patrimônio e série quando disponíveis.
2. Vincular contrato, manual, plano ou outro documento. Um contrato de lote não identifica sozinho cada unidade.
3. Extrair campos e mostrar evidências. Documento sem periodicidade, marco ou condição suficiente permanece incompleto.
4. O responsável revisa lacunas/conflitos e aprova uma versão do plano. A decisão fica registrada.
5. Regras determinísticas calculam obrigações conforme calendário, horímetro ou ciclos. Sem dado de uso confiável, a obrigação por uso permanece pendente de informação.
6. Criar tarefa com ativo, versão do plano, prazo e responsável. Confirmar janela com o setor e com o prestador quando aplicável.
7. Consultar localização estimada, recolher o ativo e conferir patrimônio/série antes da intervenção. Isso é conferência técnica, não atualização manual do rastreamento.
8. Registrar execução, comprovante e eventuais pendências. A liberação técnica é uma decisão própria do responsável autorizado.
9. Preservar histórico e gerar o próximo ciclo segundo a regra aprovada. A data de conclusão só muda o próximo marco quando essa for a regra explícita do plano.

## Estados da tarefa

Proposta inicial: **pendente → atribuída → agendada → em execução → concluída**. Durante a execução, registrar espera por peça, prestador ou liberação com motivo e responsável. Cancelamento exige motivo e histórico.

Transições permitidas, responsáveis e requisitos de encerramento deverão ser implementados e testados no domínio. **Atrasada** é uma condição derivada do prazo, não um estado que apaga o andamento; uma tarefa concluída fora do prazo continua identificável no histórico.

## Da tag à localização no CRM

1. Associar uma tag a um ativo e cadastrar a posição dos receptores.
2. Tag transmite identificação; receptores recebem o sinal automaticamente.
3. Serviço recebe observações autenticadas e preserva horário de observação e de recebimento.
4. Serviço valida identidade, associação temporal, duplicatas e ordem; estima área com o método configurado.
5. CRM consulta a projeção com área, origem, idade e estado. Observação insuficiente admite **desconhecido**.
6. Expirada a validade configurada, a informação passa a **desatualizada**. A última detecção continua consultável.

Paredes, metal, pessoas e cobertura podem afetar a estimativa. Receptor mais próximo em intensidade de sinal não demonstra, sozinho, a sala correta. O algoritmo será avaliado com posições de referência independentes.

## Falhas e revisão

| Situação | Comportamento esperado |
| --- | --- |
| PDF com instrução maliciosa | Tratar como conteúdo; não conceder comando sobre ferramentas ou regras |
| Documento e aditivo em conflito | Preservar versões e exigir decisão de revisão |
| Job ou evento repetido | Reexecutar sem duplicar tarefa, comprovante ou notificação |
| Tag substituída | Encerrar associação anterior, iniciar nova e preservar o passado |
| Receptor volta com observações antigas | Persistir histórico sem substituir estado mais recente |
| Sem localização atual | Manter tarefa acessível e informar desconhecido/desatualizado |
| Sem internet | Manter caminho local; mostrar extração externa pendente, quando houver |
| Notificação entregue | Registrar entrega; tarefa continua no estado real de execução |
