# O que o pacote de pesquisas agrega ao Consta

**Agrega principalmente ao CRM e ao desenho da validação.** O pacote fornecido por Matheus reúne documentos públicos reais e fontes econômicas/técnicas rastreáveis. A auditoria encontrou casos que um protótipo simplificado de extração não trataria bem. Isso melhora os critérios de construção; não demonstra desempenho do produto ou compatibilidade do BLE.

Análise em 06/11/2026. Os originais de `consta-pesquisas` foram preservados. Trabalhamos com cópias e publicamos apenas metadados, casos de avaliação e sínteses; PDFs, textos extraídos e tabelas brutas não foram importados indiscriminadamente para o repositório.

## Resultado por frente

| Frente | O que acrescenta | Destino no projeto |
| --- | --- | --- |
| Documentos de aquisição/fornecimento | Obrigações reais de garantia, preventiva, instalação, treinamento, relatório, SLA e comodato | [Auditoria documental](auditoria-corpus-documental.md), [inventário público](../../data/referencias/corpus-documental-auditado.csv) e [casos de extração](../../data/referencias/casos-avaliacao-extracao.json) |
| Rastreabilidade e extravio | Estudos, documentos institucionais e referências comerciais, com modalidades e limites diferentes | [Auditoria de rastreabilidade](auditoria-rastreabilidade.md); precedentes não substituem ensaio do Consta |
| Economia da indisponibilidade | Fontes de preços e perguntas para medir impacto no hospital | [Auditoria econômica](auditoria-economia-ociosidade.md); não importar totais como perdas ou ROI |
| RDC 509/2021 | Contexto de gestão, responsabilidade, registro e rastreabilidade | Leitura abaixo; não equivale a obrigação de instalar RTLS |

## Quantos contratos há, de fato?

O pacote tem **25 registros documentais**, que se vinculam a **23 PDFs principais e 8 PDFs adicionais de contratos publicados como assinados**. São **31 PDFs vinculados ao corpus principal**. As contagens e os critérios foram conferidos na [auditoria documental](auditoria-corpus-documental.md), com agregações por SciMath.

Não são 25 contratos assinados, 25 processos individuais ou 25 compras concluídas. Há linhas com vários processos; um mesmo extrato mensal fundamenta várias linhas. Há edital com abertura futura na data da consulta, TR, minuta, contrato e relação mensal de pagamentos. Nenhum deles, isoladamente, comprova entrega, instalação ou manutenção executada.

O contrato do HC-UFPE identificado na pesquisa anterior é outra referência, fora deste recorte do HCFMUSP e vinculadas. A descrição anterior de “um contrato público identificado” relatava aquele levantamento limitado; não descreve mais todo o material disponível após esta auditoria.

## Sistemas existentes e posicionamento

O pacote acrescenta um [release da Zebra sobre RFID no InCor-HCFMUSP](https://www.zebra.com/br/pt/about-zebra/newsroom/press-releases/2024/instituto-do-coracao-do-brasil-improves-asset-management-with-zebras-rfid-solutions.html), publicado em 11/11/2024. Descreve RFID passivo por portais entre zonas e leitores portáteis, não BLE nem cobertura contínua comprovada de todo o complexo. É relato comercial, sem mensuração independente de perdas ou preventiva. O material também revisita o relato histórico de CMMS do HCFMUSP já registrado no repositório.

Essas evidências tornam inadequado dizer que o HC não tem gestão ou rastreabilidade. A descoberta com o hospital deve levantar o sistema efetivamente usado, suas lacunas atuais e interfaces autorizadas. A proposta de valor continua sendo uma hipótese sobre documentos, coordenação e execução; integração e diferenciação precisam ser demonstradas. A [auditoria de rastreabilidade](auditoria-rastreabilidade.md) separa essas fontes dos estudos novos e dos números não confirmados.

## O ganho mais concreto: avaliar a revisão, não só o preenchimento

O caso 36318/2025 mostra **12 meses no TR** e **mínimo de 24 meses no contrato**, que também contém regra de prevalência sobre os anexos. O resumo original destacava apenas o TR. A expectativa correta de extração é apresentar valores, instrumentos, evidências e regra de precedência para revisão humana; não escolher silenciosamente um prazo. [Contrato oficial, cláusulas 1.3 e 6.1.16](https://www.fz.org.br/wp-content/uploads/2025/07/contrato-philips-medical-system-ltda.pdf).

O ICESP 2406/2023 usa **48 horas corridas** no memorial e **48 horas úteis** na minuta. Além do número, é preciso extrair o calendário e a natureza do prazo: atendimento não equivale automaticamente a solução. [Edital/memorial/minuta](https://editais.icesp.org.br/uploads/Edital%202406.pdf).

Outros casos preservam marco de instalação, manual ausente, periodicidade condicionada, identificador divergente e distinção entre rastreabilidade de reagente e ativo. Os [casos estruturados](../../data/referencias/casos-avaliacao-extracao.json) referenciam hash, URL, página física e saída esperada. São material de avaliação proposto, **ainda sem execução de uma LLM do Consta**.

## Leitura regulatória conferida

A [listagem AnvisaLegis](https://anvisalegis.datalegis.net/action/ActionDatalegis.php?acao=recuperarTematicasCollapse&co_tematica=24361943&cod_menu=8542&cod_modulo=310&letra=2021+%2879%29) classifica a RDC 509/2021 como vigente na consulta. O [texto consolidado](https://anvisalegis.datalegis.net/action/ActionDatalegis.php?acao=abrirTextoAto&codTipo=&cod_menu=1696&cod_modulo=134&desItem=&desItemFim=&numeroAto=00000509&orgao=RDC%2FDC%2FANVISA%2FMS&pesquisa=true&seqAto=000&tipo=RDC&valorAno=2021) diferencia:

- Plano de Gerenciamento institucional, responsáveis, acompanhamento e registros de execução: arts. 4º–8º.
- Terceirização mediante contrato formal, quando admitida, sem afastar a responsabilidade do estabelecimento: art. 6º.
- Rastreabilidade por informações registradas: art. 3º, XIX, e art. 15. O texto não exige BLE, QR ou localização em tempo real.
- Arquivamento conforme a legislação citada e, na ausência, mínimo previsto no art. 16. Não interpretar esse mínimo como autorização automática para apagar arquivos.

Um plano preventivo por ativo não equivale ao PGTS institucional. A norma não estabelece periodicidade universal de manutenção nem compra obrigatória de pacote junto a todo equipamento. O software pode apoiar os registros; a conformidade depende do processo real e do escopo aplicável.

A cópia local traz “26 de março de 2021” no preâmbulo; o consolidado indica “26 de maio de 2021” e registra retificação em 02/06/2021. Isso reforça a necessidade de identificar versão e consultar o texto consolidado. Não é auditoria de conformidade do hospital.

## O que não levar diretamente para o pitch

Os horizontes de hora/dia/semana/mês na planilha econômica são cenários, não perdas medidas. Preço de procedimento não é lucro, custo de ociosidade ou receita necessariamente incremental. A portaria usada tem escopo de um componente do Agora Tem Especialistas; tabelas locais, agendas assumidas e pacotes comerciais não se tornam automaticamente remuneração do HC.

Também não usar número de arquivos como número de compras, requisito contratual como manutenção executada, relato comercial como eficácia independente ou fonte de RFID/CMMS como comprovação de BLE. A pesquisa não autoriza dizer que o HC não tem gestão, que há manutenção vencida ou que a solução evitará extravio.

## Aplicação imediata recomendada

Usar o corpus para a primeira avaliação documental do CRM: classificar instrumento e estágio, apresentar evidência por campo, tratar divergências entre versões e exigir decisões registradas. Medir correção e esforço de revisão com saídas esperadas independentes. Guardar datas de instalação, execução, relatório e aceite como fatos distintos.

Para rastreamento, manter BLE no escopo delimitado e verificar infraestrutura existente antes de instalar ou propor integração. O pacote não altera os [ensaios necessários](../rastreamento/validacao.md). Para economia, usar as perguntas da auditoria para obter dados operacionais autorizados e acompanhar atendimentos remarcados, alternativas e custos efetivos.

## Reprodução e limites

O [manifesto de identidade](../../data/referencias/manifesto-pacote-pesquisas.json) registra hashes dos ZIPs e PDFs, inclusive adendos fora do manifesto original. O CSV avulso coincide em bytes com a cópia no ZIP. Metadados e hash não verificam assinatura ou autenticidade jurídica, e a checagem online foi seletiva. Cada auditoria informa documentos efetivamente lidos, falhas de acesso e limites; não foi realizado censo do hospital ou revisão sistemática de toda a literatura.
