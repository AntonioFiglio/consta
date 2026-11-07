# Cenário financeiro prospectivo para o pitch Consta

Pesquisa e consulta: **07/11/2026**. Cenários condicionais autorizados por Matheus; não são resultado medido, previsão estatística ou promessa de economia. O objetivo é quantificar a tese de gestão com uma despesa brasileira verificável e condições explícitas para convertê-la em benefício.

## Número para usar agora

**R$ 41.190,95 por mensalidade de locação de tomógrafo**: referência primária de contrato hospitalar de 2026, com item e quantidade identificados. O cenário é: **se o acompanhamento contribuir para dispensar uma mensalidade de contratação equivalente, serão R$ 41.190,95 de despesa bruta potencialmente evitada, antes dos custos adicionais.** Não é necessário inventar taxa de falhas, redução de corretivas ou minutos poupados para construir esse cenário.

Frase proposta para a apresentação:

> “Uma locação de tomógrafo custa R$ 41 mil por mês em contrato hospitalar de 2026. Se o acompanhamento permitir dispensar uma mensalidade equivalente, são R$ 41 mil de despesa bruta potencialmente evitada. Essa é a hipótese financeira que nosso piloto vai testar.”

**Qualificação visual:** “Cenário condicional · referência Suzano/2026 · antes dos custos”. A frase descreve uma condição possível, sem afirmar que o Consta já reduz paradas ou que essa despesa necessariamente ocorrerá no HC.

Para manter continuidade com a abertura em Natal, há alternativa de **R$ 75 mil por mês**, com fonte jornalística atribuindo o anúncio à Sesap. A versão primária de Suzano é documentalmente mais forte. Os valores pertencem a objetos diferentes; não formar faixa de preço de mercado nem tratar como cotações equivalentes.

## Fonte primária nova: contrato hospitalar de 2026

[Hospital e Maternidade de Suzano / INTS — Contrato 042/2026-C](https://hmsuzano.ints.org.br/wp-content/uploads/2026/03/ASAV_CTR-042.2026-C.pdf), cláusula quinta, **p. 12**: linha de um tomógrafo na tabela de locação, valor mensal de **R$ 41.190,95**. A página separa recursos humanos, locações e exames sob demanda. O objeto inclui manutenção, peças e outros serviços; portanto, não chamar o item de aluguel de hardware sem cobertura. A vigência está na p. 11, de 04/02/2026 a 03/02/2027. A p. 19 prevê rescisão mediante aviso prévio, mas não estabelece dispensa automática de um item isolado. **Não afirmar que uma parada menor cancelaria uma mensalidade deste contrato.** Usamos seu preço como referência de contratação comparável em um cenário, sujeito às condições reais do hospital parceiro.

Consulta web retornou 502, mas o PDF foi obtido diretamente no domínio institucional por `curl`, extraído com `pdftotext` e a tabela da p. 12 foi conferida visualmente nesta tarefa. Rastro local: `/tmp/consta-asav-042-2026-c.pdf`, `/tmp/consta-asav-042-2026-c.txt` e `/tmp/consta-asav-p12.png`. Não copiar dados pessoais das assinaturas para os slides.

## Modelo: da operação ao dinheiro

O mecanismo a testar é:

**Documento/prazo visível → responsável acionado → decisão e serviço no prazo → retorno técnico oportuno → contratação ou renovação dispensada → desembolso evitado documentado.**

Cada seta exige evidência. O Consta pode apoiar informação e acompanhamento; a ação técnica depende de pessoas, peças, fornecedores, segurança, orçamento e condições do ativo. Falhas imprevistas ou desgaste podem continuar ocorrendo mesmo com preventiva em dia. Localização de equipamento móvel é outra frente e não deve ser usada para explicar a localização de um tomógrafo fixo.

Definir, para o mesmo hospital e período:

- `P`: preço da mensalidade de uma contratação realmente comparável, em reais.
- `M`: número de mensalidades que poderiam ser contratualmente dispensadas no cenário.
- `D_bruta = P × M`: despesa bruta potencialmente evitada.
- `C_incremental`: implantação, software, IA, infraestrutura, suporte, treinamento, revisão adicional e custos das ações necessárias para produzir o benefício. Incluir manutenção antecipada ou substituição quando incrementais à alternativa.
- `B_liquido_condicional = D_bruta − C_incremental`.

Sem custo completo informado, apresentar **bruto antes dos custos**, sem preencher `C_incremental` com zero. A condição para saldo financeiro positivo, nesse cenário, é `C_incremental < P × M`. Isso é um limite de custo, não preço recomendado para o Consta.

### Limite de equilíbrio em horizonte anual

Se a hipótese escolhida for **uma mensalidade de locação efetivamente dispensada em doze meses**, o benefício bruto nesse horizonte é R$ 41.190,95. O custo incremental total anual teria de ficar abaixo desse valor para saldo positivo; no ponto de equilíbrio, a distribuição mensal equivalente é **aproximadamente R$ 3.432,58** (`41190.95/12`, SciMath). Isso não presume que o aluguel seja cancelável mensalmente: a mensalidade precisa ter sido de fato dispensada segundo contrato ou contratação evitada.

Esse limite cobre **todo o esforço incremental**, não somente assinatura: implantação, equipamentos/receptores quando aplicáveis, IA, suporte, operação, revisão e intervenção técnica. Se a discussão for preço de software, o orçamento remanescente seria `(41190.95 − outros custos incrementais anuais)/12`. Não publicar preço ou ROI enquanto esses custos forem desconhecidos. Não tratar como benefício recorrente anual sem nova oportunidade elegível e comprovada.

### Sensibilidade simples, sem probabilidade inventada

| Hipótese explicitamente escolhida | Mensalidades dispensáveis no cenário | Despesa bruta potencialmente evitada |
| --- | --- | --- |
| Nenhuma despesa pode ser dispensada | 0 | R$ 0,00 |
| Uma mensalidade de contratação equivalente é dispensada | 1 | **R$ 41.190,95** |
| Duas mensalidades equivalentes são dispensadas | 2 | R$ 82.381,90 |

Não são três previsões nem cenários com probabilidade conhecida. Se o contrato for fixo, indispensável por capacidade ou sem redução de faturamento, a despesa evitada pode ser zero apesar de melhor disponibilidade. Não converter horas de funcionamento recuperadas proporcionalmente em redução de aluguel mensal.

## Alternativa com o caso já usado na abertura: R$ 75 mil

[Agora RN, 19/06/2026](https://agorarn.com.br/ultimas/walfredo-gurgel-recebe-novo-tomografo/) e [edição de 28/11/2025](https://edicaodigital.agorarn.com.br/wp-content/uploads/2025/11/Agora-RN_ED-2.215-28-11-25.pdf) foram reconsultadas. O jornal atribui à Sesap a locação por **R$ 75 mil mensais**, após falhas, no contexto de substituição de aparelhos. Não localizamos contrato original da Sesap que confirme objeto completo, condições de cancelamento ou faturamento. É fonte jornalística, não preço extraído de contrato público.

Formulação condicional permitida:

> “No caso de Natal, o aluguel anunciado era de R$ 75 mil por mês. Se uma contratação equivalente puder ser dispensada por um mês com uma intervenção oportuna, são R$ 75 mil de despesa bruta potencialmente evitada, antes dos custos.”

A condição não afirma que o software impediria aquela falha ou substituição. Uma contratação por necessidade estrutural ou obsolescência pode continuar necessária. Não multiplicar o valor pelo parque hospitalar; não projetar ganho anual sem justificar eventos, prazos e contratos.

## Caminho financeiro mais próximo da função documental

Além da locação, há uma hipótese direta: **conferir uma cobertura já contratada antes de autorizar novo pagamento pelo mesmo serviço**. Nesse caso, o ganho depende da prova de cobertura e da despesa adicional efetivamente dispensada, sem depender de prometer prevenção de falha.

Referência de grandeza, sem transferência de cobertura: [Diário Oficial de Volta Redonda, 13/02/2025, edição 2171, p. impressa 10](https://www.voltaredonda.rj.gov.br/images/Documentos/VRDestaques/2024/2025-02-13_2171.pdf#page=10), processo `02.051.00000965/2025/SAH`, publica serviço emergencial de manutenção corretiva de tomógrafo por **R$ 12.064,00**. Texto reconferido online; captura visual pela ferramenta web deu timeout. A fonte prova uma contratação publicada, não pagamento nem cobertura preexistente. Não dizer que esse serviço específico foi duplicado ou evitável. A hipótese prospectiva é dispensar **um serviço adicional de valor equivalente se já estiver comprovadamente coberto**, descontando os custos de conferência e acionamento. Não somar esse valor à locação se ambos representarem o mesmo evento ou se a manutenção já estiver incluída no aluguel.

## Como validar a tese no piloto

1. Escolher com Engenharia Clínica uma família de ativos e o mecanismo de gasto: nova locação, renovação, reparo adicional ou pagamento já coberto. Registrar o custo da alternativa antes de conhecer o resultado.
2. Guardar documento/obrigação, data de disponibilidade da informação, alerta ou registro do Consta, responsável, prazo e ação executada. Registrar também quando não houve ação ou houve falha.
3. Produzir evidência técnica do serviço e do retorno ao uso. Separar tempo administrativo, espera de peça, execução e decisão de liberação.
4. Obter da gestão a contratação que seria necessária e as condições concretas para dispensá-la. Evitar pressupor que “máquina disponível” gera cancelamento automático.
5. Confirmar a despesa dispensada com registro de decisão e documentos financeiros; comparar o desembolso com a alternativa, incluindo custo incremental completo. Se a atribuição permanecer incerta, reportar associação e cenário, não economia causada pelo software.
6. Apresentar quantidade de oportunidades elegíveis, intervenções executadas, falhas e gastos evitados confirmados. Não extrapolar um único evento para toda a instituição.

O pitch pode apresentar desde já a **tese financeira quantificada e condicional**. O piloto transforma os parâmetros e a cadeia causal em evidência; não é necessário fingir que já existe ROI.

## Contas e verificação

SciMath conferiu `41190.95*0 = 0`, `41190.95*1 = 41190.95`, `41190.95*2 = 82381.90`, `75000*1 = 75000` e `41190.95/12 ≈ 3432.58`, sem advertências. Para apresentação, `41190.95/1000 = 41.19095` mil permite a expressão editorial **“aproximadamente R$ 41 mil”**, arredondada ao milhar. SciMath com precisão2 também retornou `4.1e+4` para `41190.95`, confirmando o valor de palco. A chamada inicial à função `round` não era suportada pelo servidor; a equivalência em milhares foi calculada diretamente, sem esconder a falha da ferramenta. Valores são reais nominais das referências, sem inflação, juros ou conversão cambial. As fórmulas acima são modelo contábil de cenário; não estimam probabilidade de êxito ou efeito causal do produto.

Somente este documento foi criado nesta tarefa. Deck, fala e controles não foram alterados. Verificação de referências locais: `python3 scripts/verificar_repositorio.py` **aprovado**. Links externos e comportamento do produto não são cobertos pelo verificador.

## Unidade explícita e equivalência anual no palco

A pedido de Matheus, o destaque identifica **aproximadamente R$41mil/mês pela locação de um tomógrafo**, acompanhado da equivalência **aproximadamente R$494mil/ano**. Conta exata: `41190.95*12 = 494291.40`; SciMath retornou `4.94e+5` com precisão3, sem advertências. O anual representa doze mensalidades, não economia já observada. Se somente uma mensalidade adicional puder ser dispensada, o potencial bruto permanece R$41.190,95. Doze mensalidades efetivamente dispensadas seriam condição para o potencial anual, além de comprovar causalidade e descontar custos. O serviço é locação de tomógrafo com coberturas do objeto contratual; não é um reparo avulso ou remuneração por exame.

## Destaque anual solicitado

O palco prioriza aproximadamente R$500mil/ano, arredondando a equivalência exata de R$494.291,40 para a centena de milhar mais próxima. O valor mensal exato R$41.190,95 fica menor abaixo. O anual continua representando doze mensalidades, não economia comprovada.
