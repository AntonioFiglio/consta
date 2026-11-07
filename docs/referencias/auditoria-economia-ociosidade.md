# Auditoria dos cenários econômicos de ociosidade

Pesquisa dirigida em 06/11/2026 sobre os arquivos fornecidos por Matheus. **O material agrega como levantamento de preços e roteiro de perguntas para um piloto. Não mede custo de ociosidade hospitalar, perda do HCFMUSP nem retorno do Consta.** O projeto segue sem economia ou impacto operacional medidos, conforme o [estado atual](../estado-atual.md).

## Escopo e evidência consultada

Foram lidos `custos_ociosidade.csv`, `.json` e `.md`, `precos-zdi-2026.txt`, os PDFs `economia-holter`, `portaria4282-2026-anexo`, `sus-camacari` e `sus-teresina-2026`, e os HTMLs de bloqueio. A análise ocorreu em cópia de trabalho; os originais permaneceram intactos. Esta nota não incorpora documentos integrais nem a base bruta ao repositório.

O CSV e o JSON contêm 18 registros cada, compatíveis com a declaração do pacote de nove modalidades em dois setores. As contagens foram verificadas com `scimath.statistics`, usando um marcador por registro; a relação declarada foi conferida com `scimath.calculate`, expressão `9*2`, resultado exato `18`. Isso verifica estrutura, não independência das fontes ou validade econômica. A auditoria dos preços foi dirigida a casos representativos; não certifica cada campo, a competência nacional vigente ou a equivalência clínica de todos os protocolos.

## O que agrega

- Identifica fontes primárias comerciais e públicas com preço, procedimento e contexto consultáveis. Isso é mais útil que um valor de mercado sem origem.
- Distingue receita bruta potencial de lucro e reconhece ausência de remarcação, produtividade hipotética, diferenças de protocolo e a exceção do Holter.
- Mostra perguntas que a equipe deve levar ao hospital: qual equipamento estava indisponível, por quê, em qual agenda, quais atendimentos foram afetados e quais foram recuperados?
- Permite planejar um estudo com registros operacionais reais. O valor econômico depende do processo assistencial e do contrato de financiamento, além da disponibilidade física do equipamento.

## Conferência de fontes e preços

As páginas abaixo são as páginas do arquivo PDF consultado, contadas a partir da primeira folha. Valores nominais são transcritos das fontes, sem atualização monetária.

| Caso | Evidência conferida | Resultado e limite |
| --- | --- | --- |
| Preços particulares ZDI | [Tabela do próprio prestador](https://zdidiagnosticos.com.br/diagnosticos-por-imagem/), consultada online; a página declara atualização em outubro de 2026 | Corrobora TC de crânio sem contraste por R$ 215,00 e RM de crânio sem contraste por R$ 395,00. Há condições de pagamento e preços sujeitos a alteração. O texto salvo é uma captura auxiliar, não comprovação de recebimento ou preço de operadora. |
| ECG, raio-X e Holter particulares | [SoluMedi São José dos Campos/Jacareí](https://solumedisjc.com.br/), seção de exames cardiológicos e de imagem | Corrobora ECG R$ 30,00, raio-X R$ 41,00 e Holter 24h R$ 103,00 como preços **a partir de**. Raio-X genérico não estabelece equivalência com tórax PA e perfil. A data de 12/05/2026 é declarada pelo pacote; não foi confirmada como data editorial na página consultada. |
| Cateterismo particular | [Vera Cruz — pacote de cateterismo cardíaco](https://www.areamedicaveracruz.com.br/wp-content/uploads/2023/04/Cateterismo_Cardiaco1.pdf), p. 1, aberto online como PDF legível | Confirma R$ 3.807,48, código TUSS 30911079, atendimento ambulatorial, anestesia local e sala até 2 horas. Inclui itens hospitalares e OPME especificados; exclui honorários médicos, anestesista e outros itens. Não é preço completo do cuidado nem remuneração exclusiva do aparelho. O caminho da URL contém 2023/04, mas o conteúdo remete a normas de orçamento de 2026: caminho de armazenamento não determina vigência. Não há garantia de validade comercial atual além do documento consultado. |
| Holter SUS em Corumbá | [Decreto municipal nº 2.925, de 14/02/2023](https://do.corumba.ms.gov.br/legislacao/corumba/download/41003), pp. 1 e 7; PDF legível confirmado online | Para o código 0211020044, a p. 7 separa R$ 30,00 em “Valor SIGTAP/SUS”, R$ 211,48 em complemento municipal e R$ 241,48 em valor municipal unitário. O pacote usou a coluna de base, não o total municipal. Isso não comprova tarifa nacional de novembro de 2026, pagamento efetivo ou contrato de outro hospital. |
| ECG na Paraíba | [Resolução CIB-PB nº 95, de 05/05/2026](https://cosemspb.org/wp-content/uploads/2026/05/Resolucao-CIB-PB-No-95.2026-Remanejamento-Ambulatorial-de-Bom-Jesus.pdf), pp. 1–3; PDF confirmado online | O anexo da p. 3 apresenta R$ 5,15 para 0211020036. O objeto é remanejamento de programação ambulatorial de Bom Jesus/PB. É evidência documental local do valor utilizado, não demonstra receita por exame recebido por qualquer hospital. |
| Raio-X SUS em Teresina | [Edital de credenciamento nº 009/2026 da FMS](https://site.fms.pmt.pi.gov.br/system/downloads/docs/1779/original_edital-de-credenciamento-009-2026.pdf?1772196179=), cópia fornecida, p. 4 | Confirma R$ 9,50 para 0204030153, tórax PA e perfil. A abertura online falhou por timeout/inacessibilidade; a verificação de conteúdo foi feita no PDF local legível. Credenciamento e quantitativos programados não comprovam contratação, execução ou receita realizada. |
| Camaçari | `sus-camacari.pdf`, “Anexo IX — Tabela Nacional de Procedimentos SUS”, pp. 8–9, cópia fornecida | Corrobora, no documento, tórax PA e perfil a R$ 9,50 e TC de crânio a R$ 97,44. Seus metadados registram criação em 13/04/2012; isso não prova a competência da tabela, mas impede tratá-la como confirmação atual de 2026 sem outra evidência. Não foi recuperado nesta auditoria um endereço primário verificável para esse arquivo. Usar apenas como documento histórico auxiliar. |

## A Portaria nº 4.282 exige enquadramento

O anexo fornecido não é uma tabela universal de faturamento SUS. Seu título delimita o rol à compensação financeira e aos incrementos da habilitação **38.05**, componente Créditos Financeiros do Agora Tem Especialistas. A [página oficial de legislação do Ministério da Saúde](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/componente-creditos-financeiros/legislacao) identifica expressamente esse escopo. A [explicação oficial publicada em 25/07/2026](https://www.gov.br/saude/pt-br/assuntos/noticias-ms/2026/julho/ministerio-da-saude-atualiza-valores-para-oferta-de-tomografias-e-ressonancias-na-rede-privada-pelo-sus) descreve adesão de instituições privadas e filantrópicas e créditos para abatimento de tributos federais. Não é autorização para atribuir esses valores ao HCFMUSP.

Na cópia local de `portaria4282-2026-anexo.pdf`, a p. 1 apresenta cateterismo cardíaco a R$ 730,04; a p. 2, ecocardiografia transtorácica a R$ 67,86; e a p. 3, RM de crânio a R$ 268,75. Esses são valores da coluna SIGTAP, separados dos incrementos. A opção do pacote por não aplicar incrementos evita misturar os dois campos, mas **não valida a base como receita universal nem a competência nacional atual**. O valor de cateterismo também difere da base histórica no decreto de Corumbá; não se deve reconciliar documentos de datas e regimes diferentes como se fossem uma única tarifa.

A cópia registra impressão em 24/07/2026 e contém anexos. A [referência oficial da portaria no DOU](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/legislacao/portaria-saes-ms-no-4282-de-19-de-junho-de-2026) redirecionou para endereço que a ferramenta não conseguiu abrir. O índice ministerial também lista uma retificação com ano divergente no título. Portanto, a consulta não concluiu a cadeia de publicação, republicação, retificações e efeitos por competência. Antes de qualquer cálculo contratual, conferir texto consolidado aplicável, SIGTAP da competência, modalidade assistencial, habilitação, autorização, instrumento de registro, financiamento e contrato do prestador. A auditoria não emite conclusão jurídica sobre elegibilidade.

## Método: por que multiplicar preço e horas não mede ociosidade

**Preço anunciado ou valor de tabela** é um parâmetro de uma transação ou regra. **Receita realizada** exige produção elegível, cobrança aprovada e reconhecimento conforme o regime aplicável; recebimento exige liquidação financeira. **Custo de ociosidade** exige identificar custos mantidos e custos adicionais provocados pela interrupção. **Margem e lucro** exigem descontar custos pertinentes. Essas grandezas não são intercambiáveis.

O modelo do pacote multiplica preço nominal por produtividade assumida e horas de cenário. É uma exposição teórica de produção valorizada. Mesmo o título “receita potencial não realizada” pressupõe demanda, agenda e capacidade vendável que não foram observadas. Não incorpora remarcação, absorção por outro equipamento, contratação externa, cancelamentos recuperados, glosas, descontos, teto contratual, equipe disponível ou custos variáveis que deixaram de ocorrer. O faturamento de um hospital pode depender de orçamento global, metas ou outros mecanismos: não se presume pagamento incremental linear por procedimento.

As durações divulgadas pela ZDI são intervalos por categoria. O tempo de aquisição ou exame não documenta o ciclo completo entre pacientes: preparo, transferência, limpeza, contraste, intercorrências, processamento e equipe podem limitar a agenda. “Até 2 horas” no pacote Vera Cruz é uma condição do pacote; não é medição de produtividade. As hipóteses normalizadas de ECG e raio-X são assumidas, não observadas. Aplicar tempo particular à produção SUS tampouco valida equivalência de protocolo ou organização do atendimento.

Os horizontes contínuos de 24 horas e os turnos de 8 ou 12 horas são cenários declarados. Nenhum representa agenda real, ocupação integral, demanda suficiente ou janela de indisponibilidade observada. Uma parada fora da agenda não produz automaticamente atendimento perdido. Equipamentos fixos, como TC e RM, contextualizam manutenção; esses exemplos não validam benefício de localização BLE de móveis. A implantação inicial do Consta exclui áreas especiais de RM.

Mamografia digital particular e mamografia bilateral para rastreamento SUS, raio-X genérico e tórax PA/perfil, além de códigos TUSS e SIGTAP de cateterismo, precisam de correspondência clínica e contratual explícita. Colocar preços lado a lado não demonstra diferença de rentabilidade dos setores.

### Holter e arredondamento

O gravador permanece ocupado durante a gravação de 24 horas, mesmo com a clínica fechada. O pacote reconhece isso e usa uma instalação por dia de atendimento nos cenários clínicos. Ainda faltam devolução, limpeza, descarga, nova instalação, falhas de gravação, dias sem devolução e disponibilidade de equipe. “Uma instalação por dia” é capacidade hipotética sem intervalo de giro, não média observada.

Há também uma ressalva de apresentação: `hora_brl` do Holter particular é exibida como `4.29`, enquanto os horizontes são calculados pela diária de `103`. `scimath.calculate` confirmou `103/24 = 103/24`, aproximação `4.2916666666666666667`; já `4.29*24` tem resultado exato `2574/25`, equivalente a `102.96`. São operações sobre os valores nominais expressos em reais, sem conversão monetária. A diferença decorre do arredondamento intermediário; não é, por si, erro da diária. Recalcular a partir da coluna horária arredondada não reproduz todos os campos. Preservar precisão interna e arredondar apenas a exibição caso o modelo seja refeito. Não foram certificados todos os produtos aritméticos da base.

## Arquivos bloqueados não são evidência de preço

`economia-ecg-bloqueio.html` contém mensagem “Not Acceptable” gerada por Mod_Security; `economia-hemo-bloqueio.html` contém “403 Forbidden”. Eles documentam falha de acesso, sem conteúdo técnico ou preço validável. A posterior abertura bem-sucedida da fonte Vera Cruz valida aquele conteúdo consultado, não transforma o HTML de bloqueio em PDF.

HTTP 200, extensão `.pdf` e tamanho de download não bastam: conferir tipo real, assinatura do arquivo, leitura pelo parser e presença do conteúdo pertinente. Nesta auditoria os PDFs usados foram legíveis por parser; os preços de Corumbá e Vera Cruz também foram conferidos em PDFs abertos online. Falhas de acesso são mantidas como limitações, sem inferir ausência do documento.

## Recomendação para o pitch e para validação

**Usar a pesquisa como preparação interna; retirar os totais de hora, dia, semana e mês dos argumentos de perda ou retorno.** Também não somar modalidades, extrapolar ao parque do HC ou transformar preço de tabela em custo evitado. O material atual não permite estimar ROI ou payback do Consta.

Formulação adequada:

> A indisponibilidade de um equipamento pode afetar a agenda e gerar remanejamento. O efeito financeiro depende do atendimento efetivamente perdido, do contrato e dos custos. O Consta ainda precisa demonstrar se melhora esse processo em um piloto autorizado.

Para produzir evidência, registrar ativo e causa da indisponibilidade; início e fim; agenda afetada; demanda elegível; exames realizados em alternativa, remarcados e definitivamente não recuperados; regra contratual e valor efetivamente reconhecido; custos adicionais documentados e custos variáveis evitados. Medir separadamente tempo de busca, cumprimento de manutenção e disponibilidade técnica. Depois testar a contribuição do Consta com comparação apropriada, controlando mudanças de equipe, agenda e manutenção. Localização BLE não comprova liberação técnica nem causalidade econômica.

Esta entrega é uma auditoria documental e de premissas. Não é medição hospitalar, validação física, segurança clínica ou resultado do produto. As alegações externas continuam sujeitas ao [catálogo de limites](alegacoes-e-limites.md).
