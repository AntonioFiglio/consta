# Consta — rastreamento, interferência e qualidade dos exames

Pesquisa de fontes primárias consultadas em 6 de novembro de 2026. Este documento fundamenta a escolha e o plano de validação; não é laudo EMC, autorização para teste assistencial ou comprovação de segurança de um dispositivo Consta. Não foi ensaiado nenhum protótipo.

## Conclusão para a decisão

**Não há base para prometer “sem interferências eletromagnéticas” em todo o hospital.** Há base para projetar a redução de mecanismos de interferência, escolher o ambiente de implantação e demonstrar compatibilidade no conjunto exato de dispositivo, equipamento, montagem e condições de uso. A explicação defensável é: “A localização é independente do funcionamento clínico do equipamento. A tecnologia e a montagem são selecionadas por área, e a compatibilidade é verificada antes do uso.”

Para uma arquitetura que dispense transmissores de rádio intencionais, a comunicação óptica com receptores fixos e rede cabeada é uma candidata de engenharia, não uma solução já validada. **Infravermelho também é radiação eletromagnética**, embora não seja radiofrequência. Portanto, o termo preciso seria “sem transmissão intencional de RF”, quando verdadeiro para o sistema completo. Ultrassom transporta energia mecânica; a eletrônica do emissor, os receptores e a rede ainda precisam de avaliação. Essas distinções físicas não demonstram, por si, segurança clínica.

A proposta deve começar em áreas de armazenamento, engenharia clínica e circulação autorizada. A extensão a UTI, centro cirúrgico e salas de exame exige avaliação própria. A FDA recomenda gestão do ambiente eletromagnético, identificação de áreas críticas e avaliação local dos transmissores próximos de equipamentos críticos; as decisões devem usar evidência objetiva e o transmissor com potência suficiente para a finalidade. Isso não cria distância universal segura. [FDA — recomendações a estabelecimentos](https://www.fda.gov/radiation-emitting-products/electromagnetic-compatibility-emc/fdacdrh-recommendations-emcemi-healthcare-facilities).

## O que precisa ser separado

| Aspecto | Pergunta de engenharia | Consequência para Consta |
| --- | --- | --- |
| Emissões e imunidade EMC | O rastreador perturba outro equipamento? O ambiente perturba o rastreador? | Ensaiar os dois sentidos; não apenas medir se o servidor recebe o ID. |
| Coexistência de rádio | Os enlaces continuam entregando dados no ambiente compartilhado? | Perda de pacotes e localização desatualizada precisam aparecer na interface; isso difere de falha clínica. |
| Qualidade da imagem | A presença, a emissão ou a posição da tag altera o exame? | Comparar com e sem o conjunto em protocolo de qualidade por modalidade. |
| Segurança de RM | Materiais, bateria, condutores e fixação são adequados ao ambiente MR? | Um rádio desligado não resolve atração, torque, aquecimento ou artefatos. |
| Interferência óptica/acústica | A energia de localização alcança um sensor sensível? | Uma solução sem rádio também pode perturbar uma medição. |
| Montagem e uso | A tag tampa ventilação, trava, botão, alarme, identificação ou área de limpeza? | Avaliar fixação e limpeza com a equipe de engenharia e o fabricante. |

A orientação FDA de EMC abrange dispositivos médicos com alimentação elétrica ou funções/sensores implementados por circuitos, incluindo produtos sem comunicação sem fio. É evidência de que remover o rádio não elimina a análise de emissões e imunidade. Não significa que uma tag de inventário seja automaticamente um dispositivo médico ou que todo software Consta esteja sujeito à IEC 60601-1-2. O enquadramento depende da finalidade e arquitetura. [FDA — EMC, junho de 2022](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/electromagnetic-compatibility-emc-medical-devices).

Para tecnologia RF, qualidade de serviço, coexistência, segurança e EMC são dimensões distintas e complementares. Um teste de comunicação bem-sucedido não substitui um teste do desempenho essencial do equipamento médico. [FDA — tecnologia sem fio em dispositivos médicos](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/radio-frequency-wireless-technology-medical-devices-guidance-industry-and-fda-staff).

## O que os experimentos realmente mostram

### RFID: risco experimental demonstrado, sem generalizar para qualquer rádio

Van der Togt et al., *JAMA*, 2008, DOI `10.1001/jama.299.24.2884`, estudaram sistemas RFID ativo e passivo próximos de equipamentos de cuidados críticos, sem paciente conectado. Observaram incidentes de EMI, inclusive classificados como perigosos. A conclusão sustenta ensaios locais antes de implantação; não sustenta proibição universal de RFID, nem extrapolação direta para BLE, UWB ou uma tag atual. [Registro e resumo do artigo original](https://pubmed.ncbi.nlm.nih.gov/18577733/).

Seidman e Guag, *BioMedical Engineering OnLine*, 2013, DOI `10.1186/1475-925X-12-71`, expuseram bombas, desfibriladores e ventilador a diferentes leitores RFID e uma tag ativa. Identificaram alarmes, alterações de telas, falhas operacionais e um desfibrilador permanentemente danificado. Certas combinações não apresentaram EMI nos ensaios. O próprio artigo trata a combinação específica como unidade de avaliação e recomenda testes locais. O trabalho não permite declarar que uma banda é universalmente segura. [Artigo completo](https://pmc.ncbi.nlm.nih.gov/articles/PMC3716957/).

Importante para a fala: a FDA descreve leitores RFID como emissores de rádio e tags passivas como alimentadas pelo leitor. “Passivo” não significa ausência de RF no sistema. A página informa não ter conhecimento de eventos adversos associados a RFID, mas reconhece o potencial de EMI; isso não contradiz experimentos controlados sem pacientes. Não converter achado de bancada em afirmação de dano clínico ocorrido. [FDA — RFID](https://www.fda.gov/radiation-emitting-products/electromagnetic-compatibility-emc/radio-frequency-identification-rfid).

### Bluetooth: coexistência possível, sem certificado universal para BLE

O estudo *Evaluation of Bluetooth as a replacement for cables in intensive care and surgery*, 2004, utilizou um enlace Bluetooth e encontrou compatibilidade com os equipamentos testados em laboratório e no ambiente clínico. É evidência positiva de viabilidade sob condições delimitadas. Foi Bluetooth de sua época, não validação de todas as tags BLE, densidades de tags, receptores, potências, posições ou equipamentos do HCFMUSP. A apresentação correta é: “Há demonstrações experimentais de compatibilidade; nossa configuração precisa ser verificada.” [Resumo original](https://pubmed.ncbi.nlm.nih.gov/14980934/).

### Infravermelho: não trocar EMI por interferência óptica desconhecida

Mathes et al., *Anesthesia & Analgesia*, 2008, DOI `10.1213/ane.0b013e31817e6778`, avaliaram oxímetros na presença de neuronavegação infravermelha. A ativação do sistema perturbou qualidade do sinal e detecção de saturação, com diferenças entre monitores; a blindagem óptica melhorou os resultados. Isso não prova que uma tag IR de baixa emissão causará o mesmo problema. Prova que “é infravermelho, então não interfere nos aparelhos” é raciocínio insuficiente. Avaliar espectro, potência óptica, modulação, direção, reflexos e exposição dos sensores. [Estudo original](https://pubmed.ncbi.nlm.nih.gov/18633032/).

Um relato clínico posterior também associou navegação óptica à perda da leitura de oximetria, revertida com proteção óptica. Serve como evidência de um mecanismo plausível em uso, sem fornecer prevalência ou taxa de risco de um rastreador. A blindagem citada nos estudos não deve ser improvisada no paciente como parte do protótipo; qualquer intervenção segue fabricante e protocolo institucional. [Relato original](https://pubmed.ncbi.nlm.nih.gov/29492445/).

## Qualidade de exames: resposta por modalidade

### Ressonância magnética

A FDA destaca atração e torque em materiais magnéticos, aquecimento por RF e campos variáveis, mau funcionamento de circuitos e degradação da imagem. **Desligar uma tag não elimina sua composição material.** Dispositivos sem informação de segurança MR devem ser considerados inseguros; produtos MR Conditional dependem de todas as condições de uso indicadas. Uma bomba compatível com RM não transmite automaticamente sua condição para uma tag colada nela. [FDA — profissionais](https://www.fda.gov/radiation-emitting-products/mri-magnetic-resonance-imaging/information-professionals), [FDA — indústria e mecanismos de risco](https://www.fda.gov/radiation-emitting-products/mri-magnetic-resonance-imaging/mri-information-industry).

A avaliação MR precisa contemplar o conjunto tag, bateria, carcaça, adesivo/suporte e ativo, com configuração e posição de uso. A referência oficial de teste e rotulagem é a orientação FDA de outubro de 2023; consultar também os protocolos do serviço e o responsável por segurança de RM. Não colar “MR Safe” ou “MR Conditional” no protótipo por analogia. [FDA — teste e rotulagem MR](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/testing-and-labeling-medical-devices-safety-magnetic-resonance-mr-environment).

Há estudos específicos que chegaram a resultados favoráveis para certos RFID, mas também identificaram artefatos. Steffen et al., 2010, investigaram etiquetas passivas em RM e TC: os resultados de integridade e imagem valem para as etiquetas e condições testadas, e os autores recomendam não colocar a tag diretamente sobre a região de interesse em RM. Não validar outra tag por semelhança. [Artigo completo](https://pmc.ncbi.nlm.nih.gov/articles/PMC2825188/).

Outro experimento avaliou um port implantável com RFID e o considerou MR Conditional nas condições estudadas, embora com artefatos. A coexistência de segurança condicionada e artefato demonstra por que “não machuca”, “não estraga o dispositivo” e “não altera a imagem” são perguntas diferentes. [Estudo original, 2013](https://pubmed.ncbi.nlm.nih.gov/23684963/).

**Proposta Consta:** manter eletrônica não avaliada fora da sala de exame e do fluxo que permita entrada inadvertida. Rastrear em pontos anteriores à entrada, segundo a delimitação local do ambiente MR, com registro de entrada/saída e perda esperada de visibilidade. A posição exata do leitor e a alternativa de identificação no equipamento precisam de aprovação local. Esta é uma restrição de projeto proposta, não comprovação de segurança de um portal.

### Tomografia e radiografia

**Inferência de engenharia:** fora da região imageada, uma tag pode reduzir o problema de sobreposição/atenuação direta; isso não prova ausência de EMI da eletrônica nem dispensa orientação do fabricante. Componentes no caminho do feixe podem modificar a imagem. O estudo de Steffen acima não encontrou degradação de TC na configuração testada, mas não cobre toda carcaça, bateria, material, posição ou protocolo de outra tag. Ensaiar a montagem representativa com fantoma e revisão do físico/radiologista; avaliar também se a radiação altera a tag.

### Ultrassom diagnóstico

**Inferência de engenharia:** um transmissor acústico de localização no ar e uma sonda diagnóstica acoplada ao corpo podem operar por caminhos e características diferentes. A diferença não constitui ensaio de não interferência. Verificar conteúdo espectral, harmônicos, vibração mecânica, acoplamento à carcaça e suscetibilidade elétrica. Nesta pesquisa não foi identificado experimento primário suficiente para declarar que um protótipo Consta ultrassônico é compatível com todos os ultrassons diagnósticos. O resultado da pesquisa é uma lacuna de validação, não uma prova de incompatibilidade.

## Como demonstrar o argumento antes de uso real

Plano proposto, a ser definido por engenharia clínica, física médica, TI e fabricantes:

- Fixar arquitetura completa: tag, receptor, alimentação, rede, rádio habilitado/desabilitado e montagem; descrever ambientes autorizados e excluídos.
- Levantar modelos e instruções dos equipamentos próximos, sensores mais suscetíveis, desempenho essencial e protocolos de exame.
- Verificar documentação do fornecedor e ensaios aplicáveis ao produto; certificação de rádio isolada não comprova compatibilidade do conjunto hospitalar.
- Em bancada sem paciente, comparar comportamento com localização desligada/ligada e nas condições de pior caso previstas: proximidade, orientação, tráfego simultâneo, alimentação e montagem reais.
- Registrar parâmetros funcionais relevantes com simuladores/analisadores apropriados: não basta observar se a tela permanece ligada. Interromper diante de alteração e investigar.
- Em exames, usar fantomas e protocolo definido pelo físico médico; avaliar artefatos e métricas de qualidade adequadas à modalidade. Não realizar experiências exploratórias durante atendimento.
- Repetir a avaliação quando mudar hardware, firmware, montagem ou contexto que altere os riscos. Registrar condições aprovadas e desvios.
- Exibir última observação, fonte, horário e indisponibilidade; localização não comprova que o ativo esteja disponível, calibrado ou liberado clinicamente.

O plano acima é uma síntese de engenharia proposta a partir das orientações de gestão EMC e segurança MR citadas, não um procedimento de certificação completo. No Brasil, aplicar o enquadramento vigente e os protocolos institucionais; FDA e artigos internacionais não substituem autorização local.

## Texto pronto para apresentação

“Queremos localizar o equipamento sem interferir em sua função clínica. A tag só identifica o ativo; ela não controla a máquina nem acessa sinais do paciente. Podemos evitar transmissores de rádio usando comunicação óptica e receptores cabeados, mas isso ainda exige avaliar eletrônica e sensores ópticos próximos. Em áreas críticas, a tecnologia e a montagem serão verificadas com os equipamentos do hospital. Ressonância terá tratamento separado: nada entra na sala sem avaliação específica. Por isso, nossa promessa é compatibilidade demonstrada nas condições de uso, e não risco zero por escolher uma tecnologia.”

Essa fala descreve uma arquitetura e um compromisso de validação. Substituir “podemos” por afirmação de implementação somente após construir e verificar o sistema. A posição de pesquisa não altera a decisão anterior do hackathon de demonstrar software e simulação sem implantação em área assistencial.

## Limites de acesso e força da revisão

Esta foi uma pesquisa dirigida, não revisão sistemática nem leitura integral de todos os artigos. Os registros PubMed de JAMA 2008, Bluetooth 2004, Mathes 2008, relato de oximetria e port RFID 2013 forneceram resumos originais e metadados; seus textos integrais não foram examinados nesta etapa. Os artigos abertos de Seidman/Guag 2013 e Steffen 2010 permitiram consultar métodos/resultados/discussão. As páginas oficiais FDA de EMC, RF, RFID e RM foram consultadas; não se presume leitura de todas as normas citadas nem de todo PDF normativo associado.

Consequentemente, detalhes necessários a um protocolo real — modelos exatos, configurações de emissão, montagens e critérios de aprovação — devem ser recuperados no texto integral, na documentação atual do fabricante e com especialistas. As recomendações de Consta marcadas como proposta ou inferência são síntese do pesquisador, não resultados dos artigos.
