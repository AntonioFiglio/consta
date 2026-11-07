# Impacto no paciente e BLE: texto defensável para o palco

Verificação em 07/11/2026. Complementa [notícias de 2026](noticias-palco-2026.md), [justificativa BLE](ble-seguranca-palco.md) e [segurança hospitalar](../rastreamento/seguranca-hospitalar.md). Esta rodada alterou somente este documento; nenhuma fonte de terceiro comprova benefício ou segurança do Consta.

## Consequência assistencial: o que podemos dizer

**Texto visual sugerido:** “O equipamento para. O cuidado também pode esperar.”

**Fala sugerida:** “A máquina quebrada é a ponta do iceberg: o impacto chega a quem espera atendimento.”

A segunda frase é uma síntese editorial do problema, não uma descrição de desfecho comprovado em todos os hospitais das imagens. Nos três cards atuais, Natal, Araras e Florianópolis, o impacto documentado é mudança do fluxo e encaminhamento a outras unidades. Não trocar esse fato por “cirurgias canceladas”, “diagnóstico atrasado”, lesão ou morte. Para mencionar cancelamento concreto, acrescentar a fonte específica abaixo na fala e no apoio, com cidade/data próprias.

### Fonte brasileira direta para adiamento de cirurgias

[JB Litoral — Hospital Regional do Litoral, Paranaguá/PR](https://jblitoral.com.br/cidades/cirurgias-eletivas-estao-suspensas-ha-mais-de-uma-semana-no-hrl-por-problemas-com-esterilizacao-de-instrumentos/), publicado em **21/12/2025, 20h38**, atualizado às 20h46; corpo integral consultado. A reportagem descreve suspensão de eletivas desde 13/12. Reproduz comunicado da direção técnica sobre autoclaves paradas e esterilização externa. A **nota da Secretaria de Estado da Saúde**, enviada ao veículo em 19/12, reconhece adiamento de eletivas por problemas nas autoclaves, contratação de conserto e serviço terceirizado de esterilização.

**Frase factual pronta:** “Em Paranaguá, problemas nas autoclaves adiaram cirurgias eletivas.”

**Fonte curta:** “JB Litoral · 21/12/2025 · nota da Sesa/PR”.

Limites: reportagem brasileira com resposta oficial reproduzida, não documento primário de prontuário ou laudo. Não informa total de cirurgias canceladas. A previsão de retorno em 22/12 não comprova retomada. Não demonstra falta de preventiva nem que um CRM evitaria a pane. Autoclave contextualiza manutenção e continuidade assistencial; não demonstra necessidade de rastrear equipamento móvel.

### Fonte alternativa centrada na pessoa

[Terra — cirurgia cancelada em Maracanaú/CE](https://www.terra.com.br/noticias/paciente-espera-12-horas-por-cirurgia-e-tem-procedimento-cancelado-por-falha-em-equipamento-no-ceara,f9082151546c469f88c145be663e411d4muurtde.html), Karoline Calumbi, **12/11/2025, 17h07**, corpo consultado; atribui entrevistas à TV Verdes Mares. Paciente relata espera e cancelamento de cirurgia de vesícula. A direção atribui cancelamento a falha de autoclave, afirma problema resolvido e informa contato para remarcação. A explicação inicial da paciente sobre falta de avental diverge da explicação técnica do hospital; preservar ambas. Não há comprovação da cirurgia posteriormente realizada nem de dano clínico. Não usar nome, fotografia ou fala pessoal se basta a síntese institucional.

### Diagnóstico atrasado: manter como possibilidade

“Equipamento indisponível pode atrasar exames e decisões clínicas” é uma hipótese causal geral. Não atribuir atraso diagnóstico efetivo aos três episódios sem dado clínico ou relato explícito verificável. Com os cards atuais, a formulação factual é: **“Pacientes precisaram fazer exames em outras unidades.”** Não apresentar transferência como abandono ou atendimento não realizado.

## BLE: explicação e segurança

**Duas frases orais prontas:**

“Propomos etiquetas Bluetooth de baixo consumo, detectadas por receptores do hospital.”

“A instalação será avaliada com a Engenharia Clínica, antes do uso assistencial.”

**Linha visual:** “Bluetooth de baixo consumo · receptores no hospital”.

**Linha de condição:** “Implantação a validar com a Engenharia Clínica”.

Essas frases descrevem proposta e condição de implantação. Não escrever “validado”, “sem interferência”, “mais seguro” ou “compatível com todos os equipamentos”. Consumo de energia, potência radiada, coexistência de redes e compatibilidade eletromagnética são propriedades diferentes. O Consta ainda não demonstrou conjunto físico integrado ou segurança clínica.

### Precedente brasileiro mais próximo: FMUSP

[Barbosa — dissertação FMUSP](https://teses.usp.br/teses/disponiveis/5/5174/tde-30112023-155658/pt-br.html), defesa **28/08/2023**, publicação **08/12/2023**; [PDF original](https://teses.usp.br/teses/disponiveis/5/5174/tde-30112023-155658/publico/SilvioTaclaAlvesBarbosa.pdf) obtido e texto integral consultado nesta rodada.

- p. 15: etiquetas BLE ativas pequenas, baixo consumo e receptores.
- p. 23: alinhamento com Engenharia Clínica e higienização com CCIH.
- pp. 24–25: potência inicial de testes em 0 dBm; 30 etiquetas reutilizadas em três setores, 90 medições.
- p. 29: setor correto em todos os testes; resultado por sala limitado.
- p. 35: arquitetura, piso único e testes com menor circulação limitam generalização.

**Fonte curta:** “Barbosa · FMUSP · 2023 · p. 29”.

Não localizei protocolo/resultados de ensaio de EMI sobre desempenho essencial de equipamentos médicos. “Interferência” no método e na discussão refere principalmente propagação e localização RSSI. O estudo valida seu resultado de localização nas condições descritas; não valida ausência de EMI nem a instalação do Consta. Não converter dBm ou comparar potências sem cálculo e configuração do produto final.

### Anvisa e Anatel: funções distintas

[Anvisa — RDC 848/2024, cópia oficial na Sesa/ES](https://saude.es.gov.br/Media/sesa/Legisla%C3%A7%C3%A3o/Outros/Resolu%C3%A7%C3%A3o%20da%20Diretoria%20Colegiada%20-%20RDC%20n%C2%BA%20848,%20de%2006_03_2024.pdf), **06/03/2024**, texto integral acessível. Arts. 47–48 tratam de reduzir riscos de interferência e de funcionamento satisfatório diante de perturbações eletromagnéticas nos dispositivos abrangidos. Isso sustenta a necessidade de avaliar ambiente e desempenho; não enquadra automaticamente o software administrativo ou a tag como dispositivo médico e não certifica o Consta. A fonte não é evidência de cumprimento desses requisitos pelo projeto.

[Anatel — declaração de conformidade para uso próprio](https://www.gov.br/anatel/pt-br/regulado/certificacao-de-produtos/declaracao-de-conformidade/), corpo integral disponível em consulta de 07/11/2026. Explica avaliação aplicável a produtos de telecomunicações e exemplifica Bluetooth no regime de radiação restrita. Não importar exceções de uso próprio para fabricação/comercialização; o produto final precisa de análise específica. A [página geral de certificação](https://www.gov.br/anatel/pt-br/regulado/certificacao-de-produtos/) apresentou bloqueio antiautomação nesta rodada. Não declarar que houve conferência integral por essa página.

Homologação de rádio e liberação hospitalar têm escopos distintos. Não apresentar “Anatel” como prova de compatibilidade universal com equipamentos médicos. Não usar limite genérico de emissão como potência real da tag ou distância clínica segura.

## Como usar a comparação com AirTag

A intenção comunicativa é explicar **uma etiqueta de proximidade por Bluetooth**. Se mantida a referência de marca pedida por Matheus, a frase editorial pode ser: **“Bluetooth de proximidade, como nas AirTags, com receptores próprios do hospital.”** A semelhança proposta é restrita ao princípio de rádio; não identifica um produto Apple no projeto.

Não dizer que o Consta usa a rede Buscar, celulares pessoais, GPS, precisão equivalente, firmware Apple, autonomia idêntica ou certificação herdada. Não descrever o produto como AirTag clonada. Não usar a popularidade de um acessório como prova de segurança clínica.

**Limite da pesquisa:** não foi encontrada nesta rodada fonte técnica primária brasileira que documente diretamente o AirTag e sustente a comparação. Páginas de fabricante estrangeiro em português não atendem ao recorte de instituição brasileira; anúncios de marketplace e resultados suspeitos em domínios universitários foram descartados. Portanto, para uma versão de palco com fonte brasileira primária imediatamente verificável, preferir a explicação sem a marca e citar a dissertação da FMUSP. A comparação é uma analogia editorial solicitada, não evidência técnica nova.

## Agenda da demonstração

Uma distribuição de equipamentos ao longo da semana é **cenário sintético**, não produtividade medida, recomendação clínica universal ou plano de manutenção real. O cálculo e a capacidade diária devem ser conferidos pelo responsável pela integração antes de aparecerem como números. Não derivar da distribuição menos cirurgias canceladas, menos panes ou economia observada. As datas e o plano continuam sujeitos à conferência humana e às condições documentais.
