# Síntese dos impactos e auditoria contábil da tese

Consulta: **07/11/2026**. Esta síntese separa capacidade demonstrada, precedente externo e cenário financeiro prospectivo. Não altera o pitch. O cenário sintético atual substituiu a captura documental incompleta do HC na apresentação; a referência pública original permanece um caso separado.

## Correção central: ainda não existe um total de ganho do Consta

- **R$ 75 mil/mês em Natal** é locação anunciada, atribuída pela reportagem à Sesap. É despesa de um caso externo, não economia do Consta.
- **R$ 41.190,95/mês em Suzano** é item contratual de locação de tomógrafo. Sua anualização é **R$ 494.291,40**, aproximadamente meio milhão. Essa conta representa doze mensalidades dessa referência, não ganho total, mercado, orçamento do HC ou economia projetada do produto.
- **Não somar Natal e Suzano.** São instituições, objetos e contextos diferentes. Também não somar preço mensal e sua própria anualização.
- Uma hipótese prospectiva distinta e permitida é: **se uma mensalidade de contratação equivalente for efetivamente dispensada, R$ 41.190,95 de despesa bruta potencialmente evitada, antes dos custos**. O cenário não prova que o software evita uma falha ou que qualquer locação pode ser cancelada por mês.

SciMath conferiu `41190.95*12 = 494291.40`. O valor “R$ 500 mil” é arredondamento aproximado da referência anual; sua dimensão é **custo de locação anualizado**, nunca “total de benefícios”. A ambiguidade merece ser eliminada da fala e da legenda.

## Matriz para sustentar a história

| Frente | O que existe ou foi observado | O que isso sustenta hoje | Benefício a testar e sua medida |
| --- | --- | --- | --- |
| Automação cadastral | [Captura atual](../../pitch/demo/native/capture-result.json): fonte `entirely-synthetic`, extração HTTP preparada, API real, SQLite em memória, cinco ativos salvos, revisão confirmada e cinco previsões | Prova funcional do caminho documento → conferência → cadastro e projeção determinística. Não é execução de IA externa, medição de velocidade ou validação de qualidade da extração | Menos esforço com qualidade equivalente: minutos-pessoa do lote completo, conferência/correção, erros e retrabalho |
| Busca | [FMUSP/Barbosa, 2023](https://teses.usp.br/teses/disponiveis/5/5174/tde-30112023-155658/pt-br.html): 100% por setor nos testes; 90 medições, mesmas trinta etiquetas em três setores | Precedente externo no HC. O mapa Consta é simulado; acerto por setor não mede minutos poupados | Tempo até encontrar ativo em tarefa comparável; erros, leitura ausente/desatualizada e atraso de atualização |
| Manutenção/disponibilidade | [HC-UFG, relatório 2025, p. 87](https://www.gov.br/hubrasil/pt-br/hospitais-universitarios/regiao-centro-oeste/hc-ufg/governanca/gestao-estrategica/relario_gestao_2025_v07.pdf#page=87): treze → trinta e quatro endoscópios disponíveis, mesmo parque de quarenta e dois | Resultado de equipe e manutenção de outra instituição; não redução de corretivas causada por sistema | Prazos cumpridos, indisponibilidade, tempo até liberação e custos completos em exposição equivalente |
| Pacientes | [ALRN, 15/10/2025](https://www.al.rn.leg.br/noticia/32840/comissao-de-saude-da-alrn-volta-ao-walfredo-gurgel-e-cobra-solucao-para-tomografos): visita ao Walfredo registra equipamentos parados e encaminhamentos a outras unidades | Consequência assistencial documentada no caso. Não informa número de pacientes cujo encaminhamento o Consta evitaria | Encaminhamentos por indisponibilidade, exames efetivamente adiados/cancelados e espera, com registros institucionais e causas |
| Financeiro | Preço primário de Suzano, caso anunciado de Natal e custos operacionais a levantar | Bases de cenário, sem total de economia demonstrado | Despesas efetivamente dispensadas, custo incremental integral e capacidade de trabalho liberada, com categorias separadas |

As previsões da demo são tarefas futuras, não serviços concluídos nem equipamentos tecnicamente liberados. “Zero pendência” no exemplo significa cenário sintético completo e conferido, não operação sem revisão. A [fonte sintética](../../pitch/demo/synthetic-contract.txt) informa esse limite.

## Fontes financeiras e escopos reconferidos

**Suzano, primária:** [Contrato 042/2026-C, p. 12](https://hmsuzano.ints.org.br/wp-content/uploads/2026/03/ASAV_CTR-042.2026-C.pdf#page=12), Hospital e Maternidade de Suzano/INTS. Item mensal de um tomógrafo: R$ 41.190,95; tabela distingue RH e exames sob demanda. Objeto inclui manutenção e peças. A p. 19 prevê aviso de rescisão, mas não dispensa automática de um item isolado. A fonte foi baixada diretamente do domínio institucional e a tabela conferida visualmente; a ferramenta web retornou 502. Não foi constatada economia nem manutenção evitável nesse contrato.

**Natal, jornalística atribuída à Sesap:** [Agora RN, 19/06/2026](https://agorarn.com.br/ultimas/walfredo-gurgel-recebe-novo-tomografo/) e [edição 28/11/2025](https://edicaodigital.agorarn.com.br/wp-content/uploads/2025/11/Agora-RN_ED-2.215-28-11-25.pdf). R$ 75 mil mensais de locação anunciada após falhas. O contrato original, escopo completo e condições de redução do pagamento não foram localizados. O caso não é controle do Consta e envolve substituição de ativos; evitar associar todas as falhas a prazo perdido.

Detalhes e cenário condicional: [modelo financeiro prospectivo](cenario-financeiro-pitch.md). A referência de preço prova que a despesa pode ser material; a hipótese de dispensá-la exige sua própria demonstração.

## Pacientes: fonte primária adicional, sem ganho importado

[Hospital da Baleia — Cotação 085/2026, datada de 20/02/2026, pp. 9–10 do PDF](https://hospitaldabaleia.org.br/wp-content/uploads/2026/02/termo-de-Cotacao-85-2026-.pdf#page=9): documento institucional relata disputa pelo único tomógrafo entre diagnóstico e planejamento de radioterapia, com casos urgentes por vezes tratados no dia seguinte. Na página seguinte, informa fila aproximada de quinhentos pacientes aguardando tomografia diagnóstica. A ampliação prevista de exames é **estimativa ligada à aquisição de equipamento dedicado**, não resultado medido nem efeito de manutenção ou software. Não usar como pacientes beneficiados pelo Consta ou como cancelamentos evitados. Texto integral e localização foram reconferidos online nesta revisão.

Essa evidência fortalece a relação entre disponibilidade de recursos e acesso, mas é menos comparável à tese operacional da Consta. Para os três minutos, a ALRN e os episódios já presentes comunicam a consequência sem acrescentar um número que precisaria de longa qualificação. A [Santa Casa de Araras, 09/06/2026](https://iscma.com.br/2026/06/09/tomografo-entra-em-operacao-na-santa-casa-marcando-inauguracao-do-novo-parque-de-imagens-da-instituicao/) confirma retomada da tomografia em 08/06; não apresentar o episódio anterior como indisponibilidade atual.

## Contabilidade: cada benefício precisa de unidade e evento próprios

### Capacidade de trabalho

`H_liberadas = (T_manual_lote − T_assistido_lote) / 60`, com tempos em minutos-pessoa, mesma qualidade e inclusão de revisão, falhas e retrabalho. A valoração `H_liberadas × custo_hora` é capacidade econômica, não redução de folha automática. Se a pessoa continuar contratada, o caixa pode ficar igual. Se houver redução real de horas extras/terceirização, registrar esse desembolso no grupo financeiro correspondente e não somar novamente sua valoração como outro ganho de caixa.

### Caixa e investimento

Para horizonte explícito e mesmo escopo:

`C_total = I_implantacao + C_operacao + C_preventiva_incremental + C_outros_incrementais`.

`G_caixa_condicional = D_evitable_unica − C_total`.

`D_evitable_unica` reúne somente despesas dispensáveis sem sobreposição: mensalidades de contratação efetivamente evitadas, reparo adicional comprovadamente já coberto, horas extras dispensadas ou outro gasto documentado. Não preencher custos desconhecidos com zero. Investimento inclui hardware, instalação, integração e treinamento; operação inclui software, IA, infraestrutura, suporte, energia/rede, revisão e troca de baterias quando aplicável. Preventiva incremental é o gasto adicional necessário ao resultado, comparado com a alternativa, não toda a manutenção que já existiria.

Para comparar realização, preferir o total das despesas da alternativa sem intervenção versus o total com intervenção no mesmo período, ajustando escala, uso, idade e gravidade. Se a preventiva antecipa uma despesa sem eliminá-la, explicitar o deslocamento temporal; não chamar redução do gasto de um mês de economia definitiva.

### Sobreposições que invalidam a soma

- **Corretiva e locação:** se a locação já inclui peças/manutenção, somar “corretiva evitada” pode contar novamente parte da mensalidade. Se o reparo foi pago para dispensar locação, ele entra como custo da intervenção.
- **Busca e cadastro:** são tarefas distintas, mas minutos sobrepostos de uma mesma pessoa no mesmo fluxo não devem ser somados. Contar a jornada completa ou fronteiras sem sobreposição.
- **Disponibilidade e pacientes:** equipamento disponível, capacidade de exames e exames realizados não são unidades intercambiáveis. Demanda, equipe e agenda limitam o atendimento; não multiplicar tempo de máquina por produção habitual para inventar pacientes atendidos.
- **PIX/desembolso:** registrar pagamento/transferência comprova movimentação financeira, não causalidade nem economia líquida. O valor pago por uma corretiva não é automaticamente o valor que preventiva ou software poderia dispensar.
- **Contratos:** conferência de cobertura pode impedir pagamento duplicado; exige obrigação vigente e prestação realmente incluída. Não supor que todo reparo está coberto.
- **Dois hospitais:** Natal contextualiza uma crise; Suzano fornece outro preço. Nenhum deles é uma linha de receita ou de economia do Consta; não agregá-los em um total.

## Duas telas de impacto dentro dos três minutos

**Estado de impacto operacional:** “No nosso ensaio: cinco cadastros e cinco previsões, com extração simulada. Na prática, queremos menos redigitação e mais manutenção acompanhada.” O precedente HC-UFG pode permanecer visualmente, identificado como externo; não recitar toda a matriz.

**Estado financeiro:** “Uma mensalidade equivalente dispensada representa cerca de R$ 41 mil brutos. O piloto verificará se a ação oportuna dispensa esse gasto e quanto custa produzir o resultado.” Legenda: “Cenário condicional · preço Suzano/2026 · antes dos custos”.

Frase curta para evitar a confusão atual: **“Os R$ 75 mil são uma despesa do caso de Natal. O cenário do Consta é reduzir gastos dispensáveis, depois de contar todo o investimento e a operação.”**

Não colocar “ganho total R$ 500 mil” nem “economizamos R$ 75 mil”. Sem piloto há tese e cenários condicionais, não benefício líquido realizado. A prova funcional da demo e os precedentes tornam essa tese examinável; não a transformam em causalidade demonstrada.

## Evidência da revisão

Captura nativa reconferida: `sourceKind: entirely-synthetic`, `realExternalAI: false`, `database: :memory:`, cinco ativos e cinco previsões, `reviewed: true`, `attentionRows: 0`. As contagens são observações diretas do registro, não estimativas de produtividade. SciMath validou a anualização; não foram calculados ROI, pacientes poupados ou efeito causal. Verificação local: `python3 scripts/verificar_repositorio.py` **aprovado** para referências locais, marca e sintaxe de exemplos; não valida links externos nem causalidade das alegações.
