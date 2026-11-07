# Fixação e desenho do protótipo Consta

Pesquisa complementar de fontes primárias em 07/11/2026; proposta para bancada. Sem alterações no repositório, CAD ou imagens.

## Resposta direta

**Sim, a tag pode ser grudável**, por uma base adesiva separada do corpo eletrônico. Para o primeiro protótipo, recomendo **um berço removível preso por cinta/abraçadeira a uma alça ou estrutura adequada de um objeto de bancada**. A mesma interface do berço poderá receber uma base adesiva depois de verificar material, limpeza, remoção e retenção. Não escolher uma fita universal para todos os equipamentos hospitalares.

A direção atual usa **CR2032 primária, PCB própria proposta e corpo nominal de 52 × 36 × 12 mm**, conforme a [pesquisa de componentes](tag-prototipo-cr2032.md) e o [modelo virtual](../../pitch/assets/tag/README.md). Ela substitui o conceito anterior XIAO/LiPo. Não há evidência de que seja o melhor desenho final: geometria, RF, consumo, montagem, retenção e manutenção ainda exigem amostras e ensaios. O berço acrescenta volume não incluído nessas dimensões.

## Conceito de fixação recomendado

- **Corpo eletrônico removível:** cápsula de cantos arredondados, tampa de manutenção e retenção positiva em berço externo; liberação deliberada, sem abertura acidental no transporte. O mecanismo precisa de teste mecânico; encaixe impresso por atrito sozinho não comprova retenção.
- **Berço de bancada:** base com passagens para cinta/abraçadeira e interface comum para a cápsula. A cinta deve prender uma parte rígida apropriada, sem apertar cabos, mangueiras, comandos ou elementos móveis. Posicionar o conjunto sem impedir manuseio, manutenção, leitura de identificação ou acesso a superfícies necessárias à limpeza. Evitar tecido poroso como escolha inicial para uma futura versão hospitalar; a higienização da cinta também precisará ser avaliada.
- **Base adesiva candidata:** verso plano contínuo no berço, com fita identificada por fabricante e código após ensaiar o par de materiais. A eletrônica sai do berço para manutenção; a base adesiva permanece. Ser removível do berço **não torna o adesivo removível sem resíduos/danos**.
- **Antena:** orientar a zona de antena para fora e manter metal, bateria e elementos de fixação afastados conforme projeto RF. A estrutura metálica do ativo e a posição final precisam entrar no ensaio. Não usar ímãs, furos no equipamento ou integração elétrica neste conceito.

Não há suporte para escolher já largura de cinta, espessura de fita, força de remoção ou carga admissível: dependem da geometria, massa final, materiais e ensaio. A base acrescenta volume ao gabinete proposto; não está incluída nas dimensões acima.

## O que os fabricantes realmente documentam

**Cisco Asset Tag:** o guia oficial documenta montagem em suporte com almofada adesiva e também abraçadeira pelas ranhuras do suporte em poste, alça ou quadro. O corpo da tag é inserido no suporte e retido. Isso sustenta a viabilidade do conceito base + tag removível; não qualifica nossa montagem nem um equipamento hospitalar específico. [Guia oficial de montagem](https://www.cisco.com/c/en/us/td/docs/wireless/antenna/installation/cisco-asset-tag/cisco-asset-tag-hardware-installation-guide/mount-the-asset-tag.html).

**Kontakt.io Asset Tag 2 Mini:** a ficha técnica do fabricante prevê ranhuras traseiras para abraçadeira ou cinta. É evidência de uma solução comercial BLE com fixação mecânica alternativa, não ensaio do Consta. [Ficha técnica oficial](https://store.kontakt.io/app/uploads/2023/10/Kontakt.io_-Asset-Tag-2-Mini_Technical-Specification.pdf).

**3M VHB:** as instruções vinculam adesão à condição do substrato, superfície limpa/seca, pressão e desenvolvimento de adesão ao longo do tempo; plásticos, pinturas e materiais com aditivos podem exigir preparação específica. O procedimento de remoção pode envolver corte da espuma e tratamento da linha adesiva. Consequência para o Consta: selecionar a fita somente depois de verificar o material do berço e do ativo e fazer prova de aplicação/remoção. As instruções industriais da 3M **não autorizam lixar, aplicar primer ou solvente numa carcaça médica**. [Boletim técnico oficial de preparação](https://multimedia.3m.com/mws/media/873133O/surface-preparation-for-3m-vhb-tape-applications.pdf), [aplicação e remoção oficiais](https://www.3m.com/3M/en_US/vhb-tapes-us/resources/applying-3m-vhb-tapes/).

**Anvisa:** o manual de limpeza e desinfecção de superfícies trata de compatibilidade entre materiais/equipamentos e produtos/processos de limpeza e da rotina institucional. É orientação geral publicada pela agência, **não aprovação desta fita, gabinete ou tag**. A decisão prática ainda depende das instruções do fabricante do equipamento e do protocolo do hospital. Não transportar automaticamente uma recomendação de preparo industrial de adesivo para a limpeza assistencial. [Manual oficial disponibilizado pela Anvisa](https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/servicosdesaude/publicacoes/manual-de-limpeza-e-desinfeccao-de-superficies.pdf/@@download/file).

## Antes de uma base adesiva em ativo real

Confirmar material/acabamento e local permitido pelo fabricante do ativo; conferir produtos, concentração, tempo de contato e frequência de limpeza reais; testar corpo/base/fita com esses ciclos; verificar retenção com transporte, esbarrão e puxões representativos; observar bordas levantadas, resíduos, danos, retenção de sujidade e remoção. A equipe hospitalar responsável deve avaliar interferências no uso e na higienização. Ensaiar também RF na posição montada.

A versão impressa permanece protótipo: não há validação de impermeabilidade, resistência a desinfetantes, limpeza clínica, retenção em serviço, autonomia, RM ou desempenho de localização. Um render futuro deve mostrar o conceito aprovado como ilustração; não pode comprovar essas propriedades.
