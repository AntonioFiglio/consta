# Auditoria das evidências de extravio e rastreabilidade

Consulta em 06/11/2026. Auditoria dirigida do conjunto `evidencias_extravio_rastreabilidade.csv`, `.json` e `.md` do pacote local `consta-pesquisas`, que declara 16 fontes, identificadas como E01–E16. CSV e JSON foram comparados e têm registros equivalentes; o Markdown contém os mesmos identificadores. São representações do mesmo levantamento, não replicações independentes dos resultados. Os originais foram preservados; nenhum PDF integral de terceiros foi incorporado ao repositório.

A contribuição principal é documentar melhor **a dificuldade de encontrar móveis para manutenção**, processos brasileiros de inventário e sistemas preexistentes no HCFMUSP. O conjunto não estabelece prevalência de extravio no HCFMUSP, economia do Consta ou superioridade do BLE. Não localizado, fora do setor proprietário, retido por uma equipe, em uso, indisponível para manutenção, furtado e perdido definitivamente são eventos diferentes.

## Critério e alcance da verificação

Confronto com [fontes já registradas](README.md), [catálogo de alegações](alegacoes-e-limites.md) e [estado real do projeto](../estado-atual.md). As entradas abaixo distinguem acesso ao texto, autoria primária e força do desenho. Uma página de fornecedor é primária para o que ele declara, mas não equivale a avaliação independente. Um resumo acadêmico permite verificar o resumo, não auditar integralmente métodos e denominadores.

“Íntegra disponível” significa corpo principal consultado, inclusive métodos/resultados relevantes; não significa auditoria de dados brutos, referências ou anexos. Acesso parcial e bloqueios ficam explícitos. Números abaixo são publicados pelas fontes ou declarações atribuídas ao pacote, sem novos cálculos. Percentuais de satisfação, utilização, precisão e preventiva não são intercambiáveis. CNL (*could not locate*) significa não localizado no contexto de uma ordem de serviço (OS); não significa perda definitiva do equipamento.

## Mapa das entradas

### E01 — Mid Cheshire / NHS England Digital: repetida, com detalhe útil

[Fonte institucional integral](https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/innovation-and-strategy/wireless-trialist-case-studies/mid-cheshire-hospitals-nhs-foundation-trust/), ensaio britânico 2023/24. Relato descritivo: 400 bombas etiquetadas em três meses; depois 450 dispositivos ativos. Declara estimativa de 30 minutos diários poupados por profissional e nenhum dispositivo rastreado com preventiva perdida. Faltam quantidade de preventivas devidas, janela comparável e controle; o estoque rastreado não é o denominador das preventivas.

O texto descreve RFID/BLE e comunicação por Wi-Fi; a topologia inclui Cisco DNA Spaces na nuvem, motor Aeroscout e banco local. Logo, não comprova LAN independente da internet. Treinamento, devolução à base, coleta pela engenharia e atualização de mapas acompanham a tecnologia. Há relação explícita entre busca e manutenção, sem efeito causal isolado da tag. Já consta no registro vigente; agrega mecanismos e falhas de implantação. Não adotar os códigos de barras para móveis: o Consta mantém rastreamento automático.

### E02 — Østbye / Duke: repetida

[Resumo institucional dos autores](https://scholars.duke.edu/publication/742794), artigo de 2003, DOI `10.1023/A:1023709421380`; íntegra não consultada. Avaliação prospectiva controlada nos EUA, com duas enfermarias alocadas a intervenção/controle e períodos de seis semanas. Tecnologia combinada infravermelho/RF, não BLE. Detecção acima de 80% e identificação de sala de 60–80% usam observação treinada como referência; não representam perdas patrimoniais. Houve maior utilização de bombas, sem o mesmo resultado em camas e compressores pneumáticos. Não mede preventiva perdida. Reforça a separação entre detectar presença e acertar setor/sala, já incorporada à pesquisa; não justifica reabrir a óptica nem prometer benefício uniforme.

### E03 — Tseng / Radiography: nova, evidência parcial

[Resumo PubMed e afiliações](https://pubmed.ncbi.nlm.nih.gov/40479978/), 2025, DOI `10.1016/j.radi.2025.102999`; íntegra não consultada. Afiliações identificam Cathay General Hospital, Taipei, Taiwan: corrige a ausência de país no pacote, mas afiliação não basta para confirmar todo o local de coleta. O resumo acompanha raio-X digital móvel por seis meses: programação média de 12 para 5 minutos, ociosidade de 16% para 12%, perda de dados inferior a 1% e estabilidade de sinal superior a 95% após reposicionar nós. Não informa no resumo quantidade de aparelhos, observações ou definição operacional completa dessas taxas; rádio não especificado. Agrega métricas de logística e ajuste da infraestrutura. Não mede extravio, preventiva nem redução de dano clínico; ociosidade não é equipamento perdido. Exige leitura integral antes de orientar dimensionamento.

### E04 — Huang / International Journal for Quality in Health Care: nova, com correção pendente

[Resumo e afiliações PubMed](https://pubmed.ncbi.nlm.nih.gov/39873680/), 2025, DOI `10.1093/intqhc/mzaf005`. Afiliações Cathay/Taiwan esclarecem o contexto dos autores; não confirmam sozinhas o hospital estudado. Integra RTLS, logística, despacho e dispositivos vestíveis; tecnologia de rádio não identificada no resumo. Publica entrega reduzida em 20,9%, busca 86,8% mais rápida e satisfação de 91,2%, sem tempos absolutos, amostras e denominadores suficientes nesse acesso. Não permite atribuir resultado apenas ao RTLS.

A [correção de julho de 2025](https://pubmed.ncbi.nlm.nih.gov/40642812/), DOI `10.1093/intqhc/mzaf053`, está confirmada bibliograficamente; seu conteúdo não foi obtido. A página do artigo no editor também falhou. Agrega pista de integração operacional; manter os números fora de argumentos centrais até verificar íntegra e correção. Não mede CNL ou cumprimento de preventiva.

### E05 — LoGalbo / medRxiv: nova, busca simulada

[Preprint original e resumo indexado](https://www.medrxiv.org/content/10.1101/2023.11.20.23298180v1.full.pdf), DOI `10.1101/2023.11.20.23298180`, versão de 20/11/2023. O resumo primário indexado confirma 30 profissionais como próprios controles, carrinhos deliberadamente escondidos e médias de 25 segundos com RTLS contra 92 sem, com relato subjetivo de menor frustração. PDF/HTML diretos retornaram 403; não houve leitura integral. O pacote identifica Tile e aprovação Northwell; esses detalhes não foram integralmente reauditados no original acessível.

Não é artigo certificado por revisão por pares nem observação de perdas espontâneas. A projeção econômica anual do pacote não é economia medida. Agrega um modelo de ensaio cronometrado, desde que depois inclua percursos reais e falhas de cobertura. O uso de Tile/aplicativo não demonstra receptores fixos, LAN autônoma ou adequação do hardware próprio. Não usar alegação de ausência de interferência como ensaio EMC.

### E06 — Fisher e Monahan: nova, contribuição operacional importante

[Artigo integral disponibilizado pela autora](https://www.jillfisher.net/_files/ugd/e5e1e1_34003261c771491db3e3fdcf4694bc06.pdf), 2012, DOI `10.1016/j.ijmedinf.2012.07.001`; [índice da autora](https://www.jillfisher.net/papers-on-rfid-in-hospitals). A página PubMed falhou; a cópia autoral permitiu verificar métodos e resultados. Estudo qualitativo de hospitais dos EUA visitados entre 2007 e 2010: 23 instituições e 80 entrevistas. Abrange RFID, ultrassom, infravermelho, UWB e ZigBee; não é teste de BLE próprio.

Registra desempenho insuficiente, baixa adesão, tags sem bateria, limitações prediais e conflito entre promessa e uso real. Defende cobertura compatível com os trajetos e gestão centralizada. Agrega governança pela engenharia, plano de baterias e comunicação aos profissionais. Não estima prevalência nacional nem ROI; amostragem por instituições identificadas e observações locais não autorizam generalização estatística. A recomendação histórica de cobertura hospitalar não obriga entrar em áreas não aprovadas no Consta.

### E07 — Overmann / JAMIA: nova síntese, não fonte primária de efeito

[Texto da revisão](https://pmc.ncbi.nlm.nih.gov/articles/PMC8661418/), 2021, DOI `10.1093/jamia/ocab026`. A abertura inicial encontrou desafio de navegador; a indexação da mesma página disponibilizou métodos, resultados, discussão e limites, consultados nessa forma. Revisão de aplicações em fluxos de saúde, com busca até 2019 em inglês: publica 42 artigos, classificados em 24 observacionais, 12 descritivos e 6 experimentais. Esses são estudos, não hospitais com ativos perdidos. Tecnologias e aplicações são heterogêneas, incluindo pessoas.

Agrega mapa de problemas de qualidade/transmissão de dados, integração, privacidade e inferência de atividade a partir da localização. Não é metanálise de redução de perdas nem de preventiva; as referências originais precisam sustentar alegações de efeito. Não atribuir ao conjunto estimativas comerciais de perdas nacionais ou minutos por turno. O estudo não substitui validação do Consta.

### E08 — Cavalcante / CBEB: nova e diretamente útil ao domínio

[Artigo integral dos anais, 2014](https://www.canal6.com.br/cbeb/2014/artigos/cbeb2014_submission_709.pdf), autores UFPE e Engenharia Clínica do HC de PE. Descreve RFID UHF passivo e iHospital; resultados são de protótipo, com implantação hospitalar em licitação. Os 1.500 equipamentos e 30 setores caracterizam o hospital-alvo, não uma amostra de equipamentos extraviados nem cobertura instalada.

Agrega separação entre setor proprietário e localização corrente, permissões, alertas e mediador com fila em falha de comunicação. É precedente brasileiro de integração e de localização para serviço; HC-UFPE é distinto do HCFMUSP. Não mede queda de perdas, atrasos ou economia. Seus alcances e ensaios de protótipo não são metas BLE transferíveis. As afirmações históricas sobre segurança/regulação do rádio e autenticação por MAC não devem ser copiadas como garantia ou padrão de segurança atual.

### E09 — HU-UFGD: nova, fonte institucional relevante

[Plano PL.STEC.001, versão 02, emissão 30/10/2025](https://www.gov.br/hubrasil/pt-br/hospitais-universitarios/regiao-centro-oeste/hu-ufgd/acesso-a-informacao/pops-protocolos-e-processos/gad/pl-stec-001-plano-de-gerenciamento-de-equipamentos-medico-hospitalares-hu-ufgd-v-2.pdf). PDF oficial com texto extraído consultado nas seções de inventário, histórico e movimentação; não declarado como revisão integral de todas as páginas. Página 16 prevê busca ativa e registro de não encontrado no GETS, desativação por no mínimo um ano e reativação se localizado. Página 17 documenta movimentação e responsabilidade. Não é estudo de incidência, implantação de RTLS ou prova de equipamento fisicamente perdido.

Agrega referência concreta para diferenciar ocorrência de busca, estado cadastral e movimentação patrimonial. O prazo é política daquele hospital, não regra brasileira universal a codificar no Consta. A fonte sustenta a necessidade de histórico e revisão responsável; não autoriza desativar automaticamente um ativo por falta de leitura BLE.

### E10 — Zebra / InCor-HCFMUSP: nova, proximidade institucional com limite comercial

[Release de 11/11/2024](https://www.zebra.com/br/pt/about-zebra/newsroom/press-releases/2024/instituto-do-coracao-do-brasil-improves-asset-management-with-zebras-rfid-solutions.html), corpo integral obtido por HTTP após falha 406 da ferramenta web. O corpo identifica expressamente InCor-HCFMUSP e Vanessa Santos Sallai, com relato de dificuldade de busca. Documenta RFID passivo em portais entre zonas e leitores portáteis de inventário, com FX7500/MC3300xR e 4Next ID. Não é BLE nem localização contínua garantida por sala.

Não publica quantidade de perdas, preventiva ou tempo poupado. Percentuais gerais da pesquisa comercial citada no release não são resultados do InCor. Agrega precedente nominal e alerta para sistemas preexistentes no complexo; fonte é fornecedor interessado, sem verificação independente do hospital nesta auditoria. Não sustenta cobertura atual do HCFMUSP inteiro, parceria com Consta ou eficácia medida contra extravio.

### E11 — Mota / IPH: precedente já registrado, revisitado em HTML

[Relato técnico integral](https://iph.org.br/materia/implantacao-de-sistema-integrado-de-gestao-de-engenharia-clinica/), autores ligados à implantação em ICHC, IOT, IPq, InRad, ICr e Hospital Auxiliar de Suzano/HCFMUSP. A data editorial exata desta página HTML não foi confirmada. O precedente já estava no [catálogo de alegações](alegacoes-e-limites.md), pela [Revista IPH nº 15, dezembro de 2018](https://iph.org.br/wp-content/uploads/2024/07/revista-iph-15_portugues.pdf), com implantação descrita até janeiro de 2017. A consulta HTML acrescenta formato e acesso, não descoberta institucional independente; não apresentar como inventário atual. Publica cadastro histórico de aproximadamente 17.000 equipamentos no projeto, com manutenção, contratos, OS e indicadores. Esse número é cadastro, não extravio, custo ou demanda contratante.

A etiqueta impressa chamada TAG no texto não comprova rádio ou localização automática. Agrega conhecimento sobre processos e CMMS existentes, migração e identificação patrimonial. Relato de implantação sem controle causal não prova eficácia do Consta; tampouco permite dizer que o HC não tem gestão ou que todo o complexo usa hoje a mesma solução. Qualquer proposta deve investigar integração e lacunas atuais, preservando sistemas e responsáveis existentes.

### E12 — Intelas / Iredell: nova pista comercial, não revalidada

[URL indicada no pacote](https://www.intelashealth.com/case-study/improving-medical-equipment-management-with-real-time-location-systems/). Abertura web e HTTP retornaram inacessibilidade/403; o corpo original não foi consultado. O pacote atribui ao fornecedor EquipTRAX, 250 bombas, cerca de 900 dispositivos, incidentes de não localização de 20 para zero e preventiva de 92% para 100%, além de reposição evitada estimada. Esses números ficam **não confirmados nesta auditoria**, não promovidos a evidência verificada. Não foi confirmada tecnologia de rádio.

Mesmo se confirmado o relato, faltam janela, denominador das preventivas/ocorrências e auditoria independente. Uma ocorrência não equivale a perda física definitiva; dinheiro evitado não equivale a caixa economizado. Agrega uma pista para investigar CNL durante manutenção nos EUA. Não usar seus números no pitch ou projeções do Consta enquanto não houver fonte primária legível e método verificável.

### E13 — BD / Saint Francis: nova, case comercial confirmado

[Case integral BD/Stanley](https://www.bd.com/en-us/resource-and-education/documentation-landing-page/case-studies/saint-francis-medical-center--midwestern-hospital-transforms-infusion-pump), Missouri/EUA. O próprio corpo contém referência ©2018: há referência temporal, antes não confirmada no pacote; isso não prova ano exato de cada medição. Integra BD Alaris e Stanley MobileView; o texto não identifica rádio suficiente para classificá-lo como BLE.

Publica busca anterior de até 90 minutos/dia e preventiva anual de 100% em mais de 800 dispositivos por dois engenheiros, além de US$21 mil/ano de trabalho evitado e ao menos US$60 mil em perdas prevenidas, explicitamente como feedback do cliente. Não expõe denominadores completos de OS ou controle independente. Houve nova frota, integração e processos. Agrega estados de uso obtidos da integração com bombas e problemas de fixação da tag; presença BLE isolada não informa uso ou liberação técnica. Economia e desempenho são daquele caso, não metas validadas do Consta.

### E14 — Healthcare Finance News: nova notícia, efeito primário pendente

[Notícia integral, 17/11/2009](https://www.healthcarefinancenews.com/news/study-rtls-systems-can-save-hospitals-750k-year), Southeastern Regional Medical Center, Carolina do Norte/EUA, RadarFind/RFID. A reportagem atribui à pesquisa IUPUI busca da engenharia de quatro horas/dia para menos de dez minutos e preventiva mensal de equipamentos etiquetados de 90% para 100%; não fornece quantidade de OS, desenho suficiente ou janela comparável. US$750 mil são custos indiretos estimados, não economia financeira auditada.

Não foi identificado e consultado o artigo final anunciado para o Journal of Clinical Engineering. Assim, não é fonte primária do estudo nem confirmação acadêmica independente de benefício. Agrega pista histórica explícita entre busca e preventiva; descartar os valores como fundamento quantitativo para investimento ou promessa do Consta. Não inferir BLE, LAN autônoma ou segurança clínica a partir do nome RTLS.

### E15 — Barbosa / Unifesp: nova referência bibliográfica, acesso insuficiente

[Registro indicado](https://repositorio.unifesp.br/handle/11600/60702) e [bitstream primário localizado](https://repositorio.unifesp.br/bitstreams/b05cf348-34fe-4e3e-babe-d95bdae54a20/download). O índice de busca do repositório confirma título e contexto de TCC de Engenharia Biomédica, 2021; o acesso direto ao registro e à íntegra falhou/403. Não foi consultado o corpo completo nem confirmada a data de 19/02 do pacote.

Referência conceitual brasileira, não dissertação nem piloto com retorno comprovado. O corpus não fornece taxa de extravio ou CNL. Sem método integral, não classificar a proposta como BLE validado nem incorporar especificações. Agregação menor diante de E08 e da documentação BLE já existente: manter como bibliografia a aprofundar; nenhuma decisão arquitetural decorre dela. QR ou escaneamento eventualmente discutidos no trabalho não atendem à direção operacional vigente.

### E16 — JCAHO Connection / AAMI: registro não confirmado, excluir taxa

[Coluna indicada, 2005](https://array.aami.org/doi/full/10.2345/0899-8205%282005%2939%5B436%3AJC%5D2.0.CO%3B2). A íntegra permaneceu inacessível; o alegado trecho de 1–2% de tickets mensais de preventiva como CNL foi encontrado somente no pacote nesta auditoria. Não foi confirmado diretamente. Pela descrição, trata-se de pergunta profissional de instituição não identificada e resposta editorial, sem tecnologia RTLS especificada ou amostragem epidemiológica.

Não usar a taxa como prevalência hospitalar brasileira, do HC ou de mercado; nem como exigência atual de acreditação. Como pista, diferencia CNL em OS de perda patrimonial. Essa taxonomia já pode ser discutida com engenharia clínica sem depender do número. Excluir a alegação quantitativa e qualquer suposta chancela regulatória até obter texto primário e contexto.

## O que incorporar à pesquisa do Consta

| Destino sugerido | Entradas | Agregação concreta e limite |
| --- | --- | --- |
| Novas referências brasileiras | E08, E09 | Protótipo de integração e procedimento oficial de busca/inventário. Conhecer fluxo e integração; não estimar prevalência. |
| Precedente no complexo HC | E10, E11 | E10 acrescenta relato comercial de RFID; E11 revisita implantação de CMMS já registrada. Investigar lacunas atuais antes de posicionar substituição ou ineditismo. |
| Planejamento do piloto | E06, E07 e detalhes de E01 | Cobertura de percursos aprovados, baterias, fixação, qualidade de dados, responsabilidades, adesão e tempo real de busca. São hipóteses/metodologia, não requisitos aprovados automaticamente. |
| Leituras acadêmicas a aprofundar | E03, E04, E05 | Logística, busca e experimentos; faltam íntegra e, em E04, conteúdo da correção. Não usar os percentuais como resultado esperado. |
| Referências já existentes | E01, E02, E11 | Corroboram pesquisa vigente; E11 acrescenta acesso HTML ao precedente da Revista IPH de 2018. Não contar novamente como descobertas independentes. |
| Pistas comerciais/históricas | E12, E13, E14, E15, E16 | E13 legível e atribuída; demais com limitações descritas. Não usar para ROI ou prevalência. |

Para uma futura validação autorizada, registrar tentativas de busca e seu desfecho: localizado, setor divergente, em uso, não liberado para coleta, ausência de cobertura ou ocorrência ainda aberta. Relacionar preventivas devidas às executadas no prazo, identificando motivo documentado do atraso. Separar falha da tag/receptor, falha da estimativa, cadastro incorreto e falta de ação operacional. São propostas de mensuração, não implementação entregue.

A decisão vigente continua BLE para móveis em áreas aprovadas, com caminho essencial pela LAN. Nenhuma fonte deste conjunto valida hardware, firmware, serviço de localização ou operação sem internet do Consta. RTLS de outra tecnologia, relato de hospital operando e ausência de incidentes descritos não comprovam EMC, compatibilidade de RM ou segurança clínica. Localização não equivale a disponibilidade e liberação técnica; as aprovações e [ensaios próprios](../rastreamento/validacao.md) continuam pendentes.
