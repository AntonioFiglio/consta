# RMN — valor da capacidade por hora e projeção anual

## Versão atual solicitada por Matheus

Após o cenário semanal, Matheus pediu novamente o equivalente anual e números visualmente maiores. O slide atual usa **capacidade integral anual**, explicitamente como projeção, não uma perda real nem um benefício já obtido pelo Consta. O modelo não multiplica o valor horário arredondado pelas horas totais do calendário.

Entradas das mesmas fontes primárias abaixo: 1.050 exames/mês, ritmo anunciado de 44 exames em uma janela de 12 horas e R$ 537,50 por exame. Contas conferidas no SciMath:

| Expressão | Resultado |
| --- | --- |
| `44/(19-7)*537.5` | `11825/6` reais/h; aproximadamente R$ 1.970,83; palco ≈ R$ 2 mil/h, precisão 2 |
| `1050*12` | 12.600 atendimentos/ano |
| `1050*12/(44/(19-7))` | `37800/11` horas equivalentes/ano, aproximação 3436.36363636; não jornada anual observada |
| `(44/(19-7)*537.5)*(1050*12/(44/(19-7)))` | R$ 6.772.500/ano; palco ≈ R$ 6,8 milhões, precisão 2 |

A forma mais simples da última expressão é `1050*12*537.5`. Manter a capacidade mensal constante por doze meses é premissa do cenário. O preço de outro município é referência, não tarifa recebida pelo serviço de São Caetano.

**Vermelho:** receita em risco por hora e teto equivalente se a capacidade anual inteira ficasse indisponível. Não é perda observada, indisponibilidade provável ou gasto operacional. **Verde:** capacidade e receita bruta potenciais com agenda ocupada. Não são valores somáveis nem ganho garantido do Consta. O ganho atribuível exige evidência de horas e agenda recuperadas, demanda e recebimento, descontando custos. A projeção não é uma semana de parada convertida automaticamente em um ano.

A seguir, ficam fontes e cálculo semanal como apoio, sem substituir o modelo anual atual.

# RMN parada — cenário de uma semana de agenda

Pesquisa assistida por IA em 07/11/2026. Na etapa anterior, Matheus definiu apresentar horas e uma semana de parada, sem anualizar. O cenário substitui os destaques anteriores de endoscopia e locação de tomógrafo no slide de impacto; as referências anteriores permanecem históricas.

## Fontes primárias

- [Prefeitura de São Caetano do Sul, 15/06/2026](https://www.saocaetanodosul.sp.gov.br/noticia/6689): expansão da agenda do Atende Fácil Saúde aos fins de semana, das 7h às 19h, com capacidade de 44 procedimentos por dia. O texto se refere ao aparelho de RM instalado em fevereiro. É capacidade anunciada de um serviço municipal, não produção auditada de hospital nem média nacional. A jornada dos dias úteis não é explicitada. A abertura direta sofreu timeout; o texto integral foi conferido no resultado indexado do domínio oficial.
- [Prefeitura de Campinápolis/MT, homologação de 18/08/2026](https://www.campinapolis.mt.gov.br/publicacoes/publicacao/18817): inclusão da PRIME LAB no credenciamento da Inexigibilidade 15/2025; itens de RM de crânio, abdome, coluna e outras regiões adjudicados/credenciados por R$ 537,50 por exame. Página oficial lida integralmente. É remuneração de exame, não custo operacional, margem ou preço do serviço de São Caetano.

Combinar as duas referências gera uma simulação com capacidade e preço de locais distintos. Não atribuir o valor resultante a perdas observadas de qualquer instituição.

## Premissas do exemplo

Uma RM indisponível por sete dias em que haveria agenda ocupada de 12 horas/dia, ao ritmo médio da janela anunciada. Aplicar esse ritmo a todos os sete dias é uma hipótese explícita, não uma constatação da rotina de São Caetano. Supõe equipe, insumos, pacientes agendados, autorização clínica e possibilidade de cobrança pelo preço de referência. Não é sete dias de operação ininterrupta de 24 horas.

## Contas verificadas em SciMath

| Grandeza | Expressão | Resultado exato / apresentação |
| --- | --- | --- |
| Receita bruta equivalente por hora de agenda | `44/(19-7)*537.5` | `11825/6` reais/h; aproximação R$ 1.970,83/h; palco ≈ R$ 2 mil/h (precisão 2) |
| Horas de agenda na semana | `7*12` | 84 horas |
| Atendimentos na semana | `44*7` | 308 exames/atendimentos |
| Receita bruta equivalente na semana | `44*7*537.5` | R$ 165.550; palco ≈ R$ 166 mil (precisão 3) |

O total semanal usa a expressão exata, não o horário arredondado multiplicado pelas horas. Não converter uma única semana em valor anual ou presumir recorrência mensal. Dados estruturados em [rmn-capacidade.json](../../pitch/data/rmn-capacidade.json).

## Leitura do slide

**Vermelho, à esquerda:** RM parada → receita bruta de agenda em risco por hora e na semana. **Seta:** se a semana de agenda for recuperada. **Verde:** os mesmos 308 atendimentos e R$ 165.550 tornam-se capacidade e receita bruta preserváveis. Vermelho e verde não se somam: são duas leituras do mesmo cenário.

Não chamar essa remuneração bruta de custo operacional, lucro perdido, economia líquida ou retorno financeiro comprovado do Consta. Exames não representam necessariamente pacientes únicos. Exames remarcados ou transferidos podem reduzir a perda definitiva de receita, embora a interrupção permaneça. O ganho atribuível ao Consta só pode ser medido por horas efetivamente recuperadas e seus atendimentos/recebimentos, descontando custos incrementais e alternativas.

RM é exemplo da frente documental, contratual e de manutenção. Não há proposta de colocar tags BLE em sala de ressonância. A gestão apoia acompanhamento; não substitui manutenção, peças, equipe ou liberação técnica.

## Critério de seleção

Preferidas fontes públicas brasileiras atuais, com capacidade/jornada e preço explícitos. O caso histórico HC-UFG de 2017 e relatos individuais de perdas em sites de reclamação foram excluídos do cálculo atual. Não escolher um número apenas por ser maior que o cenário anterior. Não há alegação de perda anual observada.
