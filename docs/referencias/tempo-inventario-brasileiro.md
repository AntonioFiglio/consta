# Tempo de inventário de equipamentos médicos no Brasil — pesquisa para Consta

Pesquisa: 07/11/2026. Escopo: fontes primárias brasileiras, preferência por dados de 2024–2026; tempo manual observado por equipamento ou total com denominador para comparação com cadastro assistido por IA documental/foto. Não houve edição do repositório.

## Resultado útil

Não foi localizada, nas buscas realizadas, média brasileira publicada e comparável de **tempo de cadastro manual validado por equipamento médico** em 2024–2026. Isso é resultado desta busca, não prova de inexistência. Não usar média nacional, minutos inventados ou economia percentual. A entrada de dados assistida pela Consta deve ser comparada com entrada manual dos mesmos campos e documentos, incluindo revisão/correção.

A fonte recente mais pertinente encontrada é um **cronograma institucional estimado**, não uma medição. Pode apoiar a relevância operacional do problema, sem virar baseline de ganho da Consta.

## Melhor fonte institucional recente: UNICAMP/Campinas, 2024

[Contrato de licença GETS, Prefeitura de Campinas e UNICAMP, PDF oficial](https://portal-adm.campinas.sp.gov.br/sites/default/files/contratos/unicamp%20licenc%20software%20controlador.php_.pdf). Assinaturas eletrônicas em abril de 2024; Anexo I, p. 23/28, cronograma. Arquivo local de conferência: `/tmp/unicamp-campinas-gets.pdf`; texto: `/tmp/unicamp-campinas-gets.txt`.

Dados brutos do cronograma:

- Inventário propriamente dito pela equipe do NEC: **1 mês para cada ~500 equipamentos**, dedicação integral; inclui percorrer o hospital, cadastro e acesso aos dados patrimoniais.
- Conferência/aprovação do inventário pelo LNGTS: **1 dia para cada 10 equipamentos novos**, dependendo da completude/correção e resposta a dúvidas.
- O plano distingue treinamento, dados de base, inventário e conferência. P. 24 diz que os tempos dependem do parque e da estrutura/capacidade das equipes.

Limite: são previsões contratuais; não há cronometragem, jornada ou tamanho da equipe que permitam inferir minutos-pessoa por ativo. O processo é mais amplo que preencher cadastro. Não calcular ganho contra o tempo da demonstração Consta.

**Frase possível, se quiser uma única fonte no pitch:** “Em um plano de implantação da Unicamp com Campinas, de 2024, o inventário completo de equipamentos foi estimado em um mês para cerca de 500 equipamentos. A Consta atua na captura e organização dos dados; o ganho dessa etapa será medido em um piloto com revisão humana.”

É uma frase de contexto, não resultado de eficiência. Se o pitch exigir um número de ganho real, o caminho defensável é o ensaio próprio, identificado como ensaio da equipe e limitado às condições usadas.

## Fontes encontradas e excluídas como baseline comparativo

### UNIFACEAR / Hospital do Trabalhador — dados antigos, estimativa e erro aritmético

[Artigo e metadados](https://revista.unifacear.edu.br/rem/article/view/366), [PDF](https://revista.unifacear.edu.br/rem/article/download/366/360/723), “Inventário Eletrônico para Utilização Hospitalar”, Santos et al. Metadados indicam publicação em 18/11/2024, mas edição 2019 e figuras de 2018. Não apresentar como evidência empírica recente.

P. 6: entrevistas; cerca de 1.800 equipamentos/43 setores. Inventário geral por média de três funcionários: até 90 dias; só equipamentos hospitalares: estimativa de 30 dias. P. 13: usa 176 horas e declara média 6min26s/equipamento. **A conta não fecha:** SciMath calculou `176 hour / 1800 = 5.8666667 min`. A origem das horas-pessoa versus horas de equipe é incerta. Teste RFID: sete equipamentos em 2min40s, após cadastro e etiquetagem; não cadastro inicial. Excluir do comparativo Consta.

Reprodução numérica via ferramenta obrigatória SciMath: expressão `t/n`, `t="176 hour"`, `n=1800`, `output_unit="minute"`, precisão 8; resultado `5.8666667 min`. Advertência: backend Pint usa precisão numérica, precision controla algarismos exibidos.

### Agir/CRER/HUGOL — recente, mas bens mistos e manual contrafactual

[Nascimento et al., Anais da 6ª Jornada Científica Integrativa da Agir, publicado em 23/12/2025](https://www.even3.com.br/anais/6jornadacientifica-agir/1156978-a-importancia-da-tecnologia-rfid-na-gestao-hospitalar--estudo-de-caso-em-unidades-publicas-geridas-pela-agir/), [PDF original](https://static.even3.com/anais/1156978.pdf).

Relato abrange patrimônio misto, incluindo equipamentos, móveis e veículos. HUGOL: mais de 25 mil itens, inventário completo pode superar nove meses; implantação RFID iniciada em janeiro de 2025. CRER: 270 itens em uma sala, contagem RFID em menos de dois minutos; manual **exigiria** cerca de um dia. Não documenta cronometragem manual equivalente nem jornada/equipe; não é tempo observado de cadastro médico. Meta de até 15 dias para inventário não é resultado comprovado para todos os hospitais. Excluir da comparação de eficiência da IA.

### Unicamp GETS 2024 — escala e consulta gerencial, não tempo de cadastro

[CEB Unicamp, 08/10/2024](https://www.ceb.unicamp.br/inova-unicamp-programa-de-computador-gerencia-mais-de-90-mil-equipamentos-em-hospitais-universitarios-federais/). Noticia mais de 90 mil equipamentos em 59 unidades de 44 hospitais. O trecho sobre dias versus minutos refere-se a levantamento/consulta de informações gerenciais; não publica observação de cadastro por ativo. Não substituir baseline por essa frase.

### HCPA / armário OPME

Não usado. Estoque de órteses/próteses em armário RFID não equivale a cadastro de equipamento médico e não deve sustentar ganho da Consta.

## Protocolo mínimo de ensaio próprio recomendado

Tratar como ensaio da equipe, sem generalizar para hospitais. Usar pacote sintético e gabarito de campos por equipamento. Cada condição começa com registro vazio e termina com registro salvo, conferido e aprovado pelo mesmo critério; incluir extração, espera da IA, revisão, correções e tratamento de ausências. Disponibilizar os mesmos documentos/fotos e campos na condição manual e na assistida; contrabalançar a ordem para reduzir aprendizado. Identificar participantes e condições sem dados pessoais no material público.

Denominador principal: equipamentos aceitos com cadastro completo segundo gabarito; não arquivos, páginas ou cliques. Um contrato pode conter vários equipamentos: registrar vínculo documento–ativos e evitar contar o mesmo upload como vários experimentos independentes. Registrar tempo de preparação compartilhada por lote separadamente e alocar de forma explícita, além do tempo específico de cada ativo. Somar esforço de todas as pessoas envolvidas e informar também tempo decorrido, separando busca/deslocamento físico quando fora do escopo.

Registrar acerto por campo, ausências corretamente sinalizadas, dados inventados, duplicidades, associações de contrato ao equipamento errado e retrabalho até aceitação. Inspecionar número de série, patrimônio, modelo e prazos em ambos os modos. Manter tentativas com erro/timeout na análise. Não comparar rascunho IA com cadastro manual aprovado. A captura por câmera é planejada até existir implementação e ensaio; hoje validar somente fluxo realmente disponível.

Para pitch, mostrar um caso cronometrado completo ou resumo de pequeno ensaio, com n, materiais, participantes e caráter sintético explícitos. Nenhum ganho é afirmado antes de medir.
