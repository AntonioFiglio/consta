# Segurança e limites hospitalares do BLE

**BLE pode ser usado em uma proposta hospitalar, mas não garante ausência de interferência.** A compatibilidade é do conjunto: tag, receptor, firmware, potência, antenas, fixação, equipamentos próximos, rede e área de instalação. Este documento descreve perigos e avaliação necessária; não é laudo ou autorização de uso.

## Mecanismos que precisam ser separados

| Tema | O que pode acontecer | Como avaliar |
| --- | --- | --- |
| Coexistência de comunicações | BLE e parte do Wi-Fi compartilham espectro; comunicação de equipamentos dependentes da rede pode ser afetada | Levantamento de rede, tráfego representativo e medição de comunicação/telemetria com TI e engenharia clínica |
| Perturbação da eletrônica médica | Suscetibilidade depende de modelos, modos de operação, proximidade e configuração do emissor | Manuais, recomendações do fabricante e ensaio do desempenho essencial nos cenários definidos |
| Propagação na estrutura | Paredes, metal, blindagens e pessoas podem degradar leitura ou confundir áreas | Percursos de referência independentes, portas em posições distintas, orientação e ocupação representativas |
| Instalação e energia | Fontes, cabos, switches e montagem acrescentam requisitos de infraestrutura | Projeto aprovado, energia/cabeamento adequados, inspeção e plano de manutenção |
| Fixação e limpeza | Tag pode obstruir controles, ventilação, sensores, identificação ou dificultar higienização | Avaliação por modelo de ativo, materiais/gabinete e rotina de limpeza validada |

O NHS relata um caso em que pontos BLE afetaram equipamentos médicos dependentes de Wi-Fi, restringindo a implantação do RTLS. A explicação pública é de coexistência de comunicações; não demonstra dano físico, lesão de paciente ou artefato em exame. A mitigação relatada naquele local não é uma receita universal. [NHS — lições aprendidas](https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/knowledge-products-and-artefacts/advice-and-guidance/internet-of-things-implementation-lessons-learned/lessons-learned/)

A FDA trata qualidade de serviço, coexistência e compatibilidade eletromagnética como aspectos a avaliar. Usar baixa potência e rádio moderno pode ajudar no projeto, mas não demonstra compatibilidade com todos os dispositivos. [Orientação sobre rádio](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/radio-frequency-wireless-technology-medical-devices-guidance-industry-and-fda-staff) · [Orientação EMC](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/electromagnetic-compatibility-emc-medical-devices)

## Ressonância magnética

A implantação inicial exclui áreas especiais de RM. Campo magnético, gradientes, RF, materiais, aquecimento, funcionamento eletrônico e artefatos são problemas distintos. Uma tag adicionada não herda a classificação MR Safe/MR Conditional do ativo. Desligar o rádio não elimina bateria, materiais ou circuitos.

Parede ou corredor não definem, sozinhos, uma fronteira segura. Blindagem de RF e limite do campo magnético são coisas diferentes. O hospital precisa definir as áreas e a instalação permitida; não atravessar blindagens com cabos ou modificar a sala sem projeto aprovado.

Cilindros, carros e equipamentos móveis precisam ser avaliados pelo modelo e pela classificação real, em vez de presumir que toda uma categoria é proibida ou permitida. Controle de acesso e procedimentos locais devem impedir entrada indevida; geofence do software não substitui esse controle. [FDA — riscos do ambiente de RM](https://www.fda.gov/radiation-emitting-products/mri-magnetic-resonance-imaging/benefits-and-risks)

## Outros equipamentos e exames

Restringir RM não resolve todo o risco hospitalar. Monitores, ECG/EEG, bombas, ventiladores e sistemas sem fio também entram no levantamento. Ultrassom, raio X, tomografia e demais modalidades devem ser avaliados pelos modelos e condições de instalação; dizer que o princípio físico do exame é diferente do BLE não demonstra ausência de interferência.

Manter tags fora de sensores, superfícies de aquisição, campo de imagem, feixe, controles e partes móveis. Para qualquer proposta de uso nesses ambientes, o protocolo deve avaliar funções e, quando pertinente, imagem com fantomas, sem pacientes, sob os responsáveis competentes. Excluir um equipamento ou uma área da implantação continua sendo uma solução válida quando não houver evidência suficiente.

## Controles previstos para o Consta

- Tag de bateria própria, sem ligação elétrica ao equipamento clínico.
- Receptores com transporte cabeado; BLE continua no enlace da tag.
- Lista de famílias de equipamentos, configurações e áreas aprovadas, com restrições explícitas.
- Inventário dos modelos próximos, instruções dos fabricantes e avaliação conjunta de engenharia clínica, TI, infraestrutura e segurança de RM quando pertinente.
- Ensaios controlados antes de uso assistencial, liberação progressiva, acompanhamento e possibilidade de desligamento/retirada.

Não há distância universal de segurança definida para o Consta. Respeitar condições específicas do fabricante e do ensaio. VLAN não é blindagem de rádio, e homologação de módulo não aprova automaticamente a montagem final nem a instalação hospitalar.

## Enquadramento

Tratar conformidade de telecomunicações no Brasil, enquadramento do produto final e autorização hospitalar como frentes distintas. A [Anatel](https://www.gov.br/pt-br/servicos/homologar-produtos-de-telecomunicacoes-anatel) descreve a homologação aplicável a produtos de telecomunicações. Normas de equipamento/sistema eletromédico não se aplicam automaticamente a todo software administrativo; a análise depende da finalidade e integração finais. Fontes FDA/NHS são referências técnicas, não legislação brasileira.

Os ensaios e suas saídas estão no [plano de validação](validacao.md). Uma boa taxa de leitura BLE não é evidência de segurança clínica.
