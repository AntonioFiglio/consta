# Consta — desenvolvimento autoral, referências reutilizáveis e propriedade intelectual

Pesquisa em 6 de novembro de 2026. Esta nota responde à direção de Matheus de criar tecnologia própria, usando a literatura para inspirar e melhorar uma implementação. Não inclui engenharia reversa, cópia de firmware comercial, análise de reivindicações de uma família específica ou parecer de liberdade de operação.

## O caminho autoral é viável

O Consta pode desenvolver sua própria **tag acústica, sensores fixos cabeados, protocolo e motor local de identificação de sala**, apoiando-se em princípios físicos e publicações anteriores. Isso permite autoria real de placa, firmware, algoritmo, aplicação e validação sem inventar uma tecnologia física do zero. A existência de antecedentes deve aparecer na apresentação; diferenciação técnica e liberdade de exploração precisam ser demonstradas separadamente.

Uma formulação adequada nesta fase: “Estamos estudando o desenvolvimento de uma implementação própria de localização hospitalar por identificação acústica, com sensores fixos e processamento integral na rede local, inspirada em sistemas acadêmicos de posicionamento. Vamos avaliar disponibilidade de localização, atualização e compatibilidade no ambiente de uso.” Não afirmar ineditismo, patenteabilidade, ausência de patentes ou segurança clínica comprovada.

## O que significa aprender, reutilizar e copiar

| Ação | Tratamento recomendado |
| --- | --- |
| Ler artigo e entender seu mecanismo | Citar a referência e registrar o que foi aprendido |
| Implementar algoritmo conhecido com código próprio | Documentar origem conceitual e decisões próprias; examinar eventuais patentes aplicáveis |
| Reutilizar código de repositório | Verificar licença do arquivo, versão, dependências e obrigações; preservar avisos exigidos |
| Fabricar PCB publicada | Verificar licença de hardware, esquemas, layout, BOM e componentes; licença do software não basta |
| Usar SDK de fabricante | Seguir contrato/licença; SDK aberto não concede automaticamente direito sobre firmware ou placa |
| Melhorar produto de terceiro | A melhoria pode ser própria, mas isso não autoriza automaticamente explorar toda a solução de base |
| Reproduzir figuras/textos de artigos | Observar licença/permissões; citar não substitui autorização de reprodução quando exigida |

O CNPq explica que direitos autorais protegem a expressão concreta das obras, e não ideias como tais. Portanto, estudar o princípio e redigir código/texto próprios difere de copiar o artigo, figuras ou implementação. Ainda assim, a ausência de proteção autoral de uma ideia não afasta patentes ou obrigações contratuais. [CNPq — Direitos Autorais](https://www.gov.br/cnpq/pt-br/acesso-a-informacao/acoes-e-programas/servicos/politica-de-propriedade-intelectual-do-cnpq/4DireitoAutoral.pdf).

## Limite jurídico essencial, sem transformar pesquisa em parecer

Na LPI brasileira, a extensão da patente depende das **reivindicações**, interpretadas com relatório e desenhos (art. 41); o titular pode impedir produção/uso/exploração nas condições do art. 42. O art. 43 prevê exceção para atos experimentais ligados a estudos e pesquisas científicas/tecnológicas, mas não equivale a autorização geral de venda ou implantação comercial. Os requisitos de patenteabilidade incluem novidade, atividade inventiva e aplicação industrial (arts. 8º e 11–15). Uma implementação escrita do zero pode, ainda assim, utilizar solução abrangida por reivindicações vigentes; acrescentar melhoria não elimina esse problema. Isso é uma inferência de cautela derivada da distinção entre autoria e escopo da proteção, não avaliação da situação específica do Consta. [Texto vigente da Lei 9.279/1996](https://www.planalto.gov.br/ccivil_03/leis/l9279.htm).

O INPI esclarece que não existe patente mundial: proteção é territorial. Deve-se examinar a família, eventuais pedidos no Brasil, vigência, titularidade e reivindicações pertinentes ao produto concreto. Uma patente estrangeira isolada não comprova proteção aqui; tampouco comprova liberdade comercial. [INPI — Territorialidade](https://www.gov.br/inpi/pt-br/servicos/patentes/tutorial-de-deposito/voce-quer-patentear-so-no-brasil-ou-em-outros-paises-tambem-1).

O guia do INPI distingue busca de anterioridade de busca de **liberdade de operação**, esta mais detalhada e voltada a verificar se patentes podem impedir a exploração pretendida. Para decidir comercialização, confirmar o estado de cada processo nas fontes oficiais competentes. Um rótulo de status em agregador, como Google Patents, é pista de pesquisa, não conclusão desta análise. Não foi realizada aqui busca de liberdade de operação. [INPI — Guia 6, Conhecendo a concorrência](https://www.gov.br/inpi/pt-br/central-de-conteudo/publicacoes-de-propriedade-industrial/arquivos/Guia6Conhecendoaconcorrncia.pdf).

## Referências que ajudam e o que está efetivamente liberado

### OpenHPS: base de software com licença identificada

O projeto acadêmico OpenHPS oferece um framework de processamento de posicionamento com modelos, nós e integração de diferentes métodos. O repositório `openhps-core` publica licença **Apache-2.0**. É candidato a reaproveitamento de abstrações/processamento, mediante observância da licença e verificação individual de módulos/dependências. Não é uma tag acústica nem certificação hospitalar. A licença Apache contém condições próprias e disposições de patentes limitadas à contribuição licenciada; não equivale a liberação de qualquer patente de terceiros sobre o produto final. [Apresentação acadêmica](https://openhps.org/docs/introduction/) · [Repositório](https://github.com/OpenHPS/openhps-core) · [Licença concreta](https://github.com/OpenHPS/openhps-core/blob/master/LICENSE).

### MIT Cricket: antecedente técnico, não licença de tag Consta

O manual universitário documenta infraestrutura com beacons fixos que usam **rádio e ultrassom**, ouvintes móveis e processamento de distâncias/posição. Ajuda a entender a combinação entre identificação de espaço e coordenadas e os papéis que podem ser atribuídos aos nós. O manual indica disponibilização de software e desenvolvimento sobre TinyOS; **não foi verificada nesta pesquisa uma licença única que libere todo o hardware/firmware para reprodução comercial**. O princípio pode ser estudado e a implementação própria projetada, mas não se deve copiar o pacote e chamá-lo automaticamente de domínio público. A versão descrita também não atende sozinha ao requisito estrito de ausência de RF. [Manual original do MIT](https://people.csail.mit.edu/hari/nmsweb/projects/cricket/v2man-html/) · [Visão do sistema](https://people.csail.mit.edu/hari/nmsweb/projects/cricket/v2man-html/node4.html).

### UltraGPS: título “open-source” não substitui exame da licença

Foi identificado o artigo acadêmico **UltraGPS: A Low-Cost, Open-Source Ultrasonic Positioning System**, que descreve arquitetura educacional, receptores cabeados e presença de módulo de rádio. O servidor do artigo retornou bloqueio no acesso integral durante a pesquisa; conteúdo indexado permitiu identificar esses elementos, mas não verificar uma licença de hardware/firmware e um pacote completo reproduzível. Deve ser tratado como referência a aprofundar, não como projeto já liberado para copiar ou prova de funcionamento sem RF. [Registro ASEE](https://peer.asee.org/ultragps-a-low-cost-open-source-ultrasonic-positioning-system) · [URL do artigo, acesso bloqueado nesta consulta](https://peer.asee.org/ultragps-a-low-cost-open-source-ultrasonic-positioning-system.pdf).

### Produtos comerciais e SDKs

Marvelmind disponibiliza bibliotecas e interfaces para integração em sua página de downloads. Isso não comprova que placas, firmware e protocolo inteiro estejam disponíveis sob licença de hardware aberto. O mesmo cuidado deve ser aplicado a Pozyx: não chamar todo o sistema de open source apenas porque existe API ou biblioteca pública. Nesta pesquisa não foi estabelecida licença que autorize copiar o produto completo de nenhum dos dois. [Downloads oficiais Marvelmind](https://marvelmind.com/download/).

Não foi encontrado e integralmente auditado, neste recorte, um projeto acadêmico de tag ultrassônica hospitalar completa, sem RF e com todos os arquivos necessários sob licença confirmada. Isso é um limite da busca, não prova de inexistência.

## Onde pode estar a contribuição própria do Consta

As propostas abaixo são **hipóteses de engenharia**, sem comprovação de novidade ou patenteabilidade:

1. **Protocolo acústico de identificação de ambiente.** Priorizar saber a sala de cada ativo, com múltiplas tags e rejeição de colisões/leituras ambíguas, em vez de iniciar com coordenadas geométricas mais complexas. A contribuição pode ser implementação e ajuste ao caso hospitalar, sem afirmar invenção de identificação acústica.
2. **Detecção explícita de falta de cobertura.** Registrar observações e incerteza, distinguir imóvel, oculto e sem atualização quando a evidência permitir, e impedir que o histórico vire falsa posição atual.
3. **Tag e fixação projetadas para manutenção hospitalar.** Invólucro, higienização, bateria, materiais, posição do transdutor e montagem formam problema real de engenharia. Benefícios só serão sustentados após ensaio de limpeza, retenção e operação.
4. **Operação local completa.** Firmware, gateway, autenticação, motor e aplicação podem ser projetados para continuar pela LAN sem servidor/licença cloud obrigatória. Isso é requisito de arquitetura, não alegação de exclusividade.
5. **Integração entre localização e execução da manutenção.** Vincular a observação a patrimônio, janela, recolhimento, evidência e histórico. Localizar não prova disponibilidade, manutenção concluída ou liberação clínica.
6. **Método de avaliação reproduzível.** Montar cenários controlados de mudança de sala, portas abertas, oclusão, ruído, perda de energia/rede e funcionamento concorrente, registrando falhas e condições. Um conjunto de dados próprio e resultados auditáveis podem diferenciar o projeto sem prometer ganhos antecipados.

A melhor apresentação de autoria identifica precisamente **o que a equipe projetou, o que implementou, quais componentes reutilizou sob licença e o que ainda precisa validar**. No protótipo inicial, a reivindicação defensável é uma arquitetura e implementação próprias apoiadas em literatura; a eventual novidade técnica só será avaliada depois de busca específica e resultados.
