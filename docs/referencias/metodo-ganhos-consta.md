# O que o Consta propõe, de onde vêm os números e como medir

Revisão: 07/11/2026. O pitch não contém cinco projeções numéricas de ganhos do Consta. Contém cinco frentes de produto, mecanismos propostos e critérios de medição. O CRM e o hardware ainda não foram implementados ou validados neste repositório. A validação de layout não demonstra eficácia operacional.

## Correção da ligação com o produto

O caso HCPA/RFID foi retirado dos slides principais: repor materiais de hemodinâmica em armários não é uma função do Consta. Inventário de estoque não é cadastro de equipamentos. Seus resultados continuam como referência complementar identificada, sem gerar estimativa para o produto. Os números publicados de outros hospitais não são nosso baseline, uma meta escolhida ou uma promessa de economia.

| Frente | Mecanismo proposto | Evidência usada e limite | Como verificar no Consta |
| --- | --- | --- | --- |
| Localização | Tag vinculada ao ativo → receptores → último setor e horário | FMUSP/2023: os mesmos 30 beacons em três setores, 90 medições com setor correto. Acerto de sala limitado; não mediu tempo de procura | Comparar área conhecida com leitura, registrar erros/desconhecidos e atraso. Cronometrar tarefas equivalentes de busca, com e sem consulta ao sistema |
| Cadastro | IA sugere campos com fonte → revisão humana → cadastro | Documentos públicos têm obrigações reais; o corpus oferece casos de avaliação, não desempenho já medido de IA | Comparar cadastro manual e assistido nos mesmos tipos de documento, incluindo tempo de revisão; conferir campos e páginas com gabarito revisto por pessoa responsável |
| Manutenção | Obrigação → plano revisado → tarefa com responsável e prazo | HC-UFG/2025: 13 → 34 endoscópios disponíveis após trabalho da equipe. Não efeito isolado de software | Conferir regras e marcos das tarefas, depois observar conclusão no prazo e horas indisponíveis. Falta de marco ou manual bloqueia data definitiva |
| Execução | Pendência → serviço → comprovante e decisão técnica | HC-UFG/2025: 4.128 ordens atendidas. Volume de trabalho, não ganho | Medir tempo até encerramento e pendências sem comprovante; registro de aviso ou leitura BLE não encerra a tarefa nem libera equipamento |
| Contratos | Documento e anexos → conflito visível → revisão de cobertura | FZ-C-0177/25: 24 meses no contrato e 12 reproduzidos no anexo, com regra de prevalência. Não redução de custo | Conferir sugestões com gabarito documental e decisão humana; só registrar gasto evitado com cobertura, cobrança e alternativa documentadas |

## Fontes originais

- [Barbosa, FMUSP, 2023](https://teses.usp.br/teses/disponiveis/5/5174/tde-30112023-155658/pt-br.html): método pp. 24–25, resultados p. 29. Leitura dez segundos após movimentação; medições dependentes com os mesmos beacons. Não prova desempenho contínuo, latência do Consta ou segurança clínica.
- [HC-UFG, Relatório de Gestão 2025](https://www.gov.br/hubrasil/pt-br/hospitais-universitarios/regiao-centro-oeste/hc-ufg/governanca/gestao-estrategica/relario_gestao_2025_v07.pdf): p. 87 endoscópios, p. 89 ordens de serviço. Relato institucional sem controle independente. O relatório atribui os resultados à atuação das equipes e processos.
- [FZ, edital 43644/2026](https://www.fz.org.br/wp-content/uploads/2026/07/edital-completo-processo-no-43644-26.pdf), p. 31: garantia com marco de instalação e exigência de manutenção. Documento de obrigação não comprova execução.
- [FZ-C-0177/25](https://www.fz.org.br/wp-content/uploads/2025/07/contrato-philips-medical-system-ltda.pdf), pp. 2, 5 e 35: regra de prevalência, garantia e anexo. A [auditoria documental](auditoria-corpus-documental.md) descreve as divergências e o [corpus](../../data/referencias/README.md) oferece casos propostos.
- [HCPA, Packeiser et al., 2025](https://cqh.org.br/ojs-2.4.8/index.php/ras/article/view/418/618), método e tabela 1: referência complementar retirada da narrativa de benefícios do Consta. Coleta antes em março–junho/2023 e depois em novembro/2023–janeiro/2024.

## Contas: descrição de terceiros, sem extrapolação

Conferidas com SciMath.calculate em 07/11/2026, percentuais com seis algarismos significativos. Registros estruturados em [evidencias.json](../../pitch/data/evidencias.json). São operações sobre valores publicados, não análise dos dados brutos.

| Caso | Valores publicados | Operação conferida | O que permite dizer |
| --- | --- | --- | --- |
| Setor BLE | 90 medições corretas de 90 | 90 / 90 × 100 = 100% | Setor correto nessas medições; não acerto universal ou 90 ativos independentes |
| Endoscópios | 13 → 34 disponíveis | 34 − 13 = 21 aparelhos adicionais | Aumento no relato institucional, sem atribuição ao Consta |
| Inventário RFID, complementar | 720 → 12 min | 720 − 12 = 708 min; (720 − 12) / 720 × 100 ≈ 98,3333% | Diferença no caso HCPA, sem transferência ao nosso cadastro |
| Reposição RFID, complementar | 210 → 25 min | 210 − 25 = 185 min; (210 − 25) / 210 × 100 ≈ 88,0952% | Diferença no mesmo caso HCPA, fora do escopo atual do Consta |

No HCPA, inventário significa conferir fisicamente o estoque e compará-lo ao sistema; com RFID, comparar os relatórios. Reposição inclui gerar lista, separar materiais, registrar a transferência, etiquetar na etapa pós e guardar os itens. O artigo relata amostragem cronometrada pela equipe, sem informar quantidade de observações ou dispersão. Houve mudança de fluxo e disposição dos armários; os autores participaram da implantação. Não é ensaio controlado isolando o efeito do rádio.

## Piloto proporcional ao hackathon

A primeira pergunta é: consultar o último setor ajuda a encontrar um equipamento e concluir a tarefa? Registrar configuração, versões, área, ativos permitidos, participantes, critérios e tarefas antes de testar. Usar referência de posição independente da tela. Incluir portas, pessoas, metal, ausência de sinal e dados desatualizados. Contar erros e desconhecidos, sem descartar as tentativas difíceis. Leituras repetidas não equivalem a equipamentos independentes.

Para busca e cadastro, comparar tarefas equivalentes com e sem o fluxo assistido, alternar a ordem quando viável e registrar os tempos individuais. Incluir revisão/correção e tentativas sem sucesso. Relatar quantidade de tarefas, condições, mediana, dispersão e falhas; não declarar economia com apenas um exemplo favorável. A quantidade e as metas serão combinadas com o hospital antes do piloto, sem inventar percentuais de aceitação agora.

Para prazos, usar tarefas que vencem no período como denominador, incluindo as não concluídas; manter horas de calendário e de funcionamento distintas. Separar manutenção executada de liberação técnica. Validar lógica com cenários sintéticos ajuda a verificar o software, mas não prova redução real de falhas ou indisponibilidade.

O piloto pode mostrar associação e viabilidade naquele cenário. Sem controle de orçamento, peças, equipe, demanda e outras mudanças, não demonstra que o software causou toda diferença. Testes de localização e aprovação da instalação hospitalar são trabalhos separados, conforme o [plano BLE](../rastreamento/validacao.md).

## Quando será possível estimar dinheiro

Ainda não existem entradas verificadas para um ROI do Consta. Tempo liberado não vira automaticamente redução de folha. Um custo evitado exige evidência da despesa que ocorreria, da cobertura/decisão que a evitou e validação financeira, sem contar o mesmo benefício duas vezes. A conta líquida também precisa incluir tags, receptores/APs, rede, implantação, software, baterias, treinamento e operação. Não multiplicar o gasto de uma notícia por meses ou ativos para criar mercado ou economia do produto.

No palco: “Temos precedentes e um mecanismo claro. Vamos medir tempo de busca, cadastro com revisão e execução das tarefas no nosso piloto.”
