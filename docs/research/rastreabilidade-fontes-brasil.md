# Rastreabilidade hospitalar sem interferência — referências e limites

## 1. Homologação Anatel: o que ela demonstra

A Anatel informa que a certificação e a homologação de **produtos para telecomunicações** verificam requisitos técnicos que incluem uso eficiente do espectro, segurança e compatibilidade eletromagnética. A Lei Geral de Telecomunicações veda o uso, no Brasil, de equipamentos emissores de radiofrequência sem certificação expedida ou aceita pela Agência.

- Fontes primárias: [Base legal da certificação](https://www.gov.br/anatel/pt-br/regulado/certificacao-de-produtos/base-legal) e [Certificação de Produtos — Anatel](https://www.gov.br/anatel/pt-br/regulado/certificacao-de-produtos/).
- Para um dispositivo médico com módulos Wi‑Fi, Bluetooth ou outra radiofrequência sujeitos à Anatel, a própria Anvisa responde que o certificado de homologação deve ser apresentado na regularização do dispositivo médico, conforme a RDC nº 546/2021: [Perguntas e respostas sobre a RDC nº 751/2022](https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/produtos-para-a-saude/manuais/perguntas-respostas-rdc-751-de-2022).

**Limite:** homologação Anatel comprova conformidade do produto de telecomunicações com os requisitos aplicáveis à sua categoria. Ela não equivale, sozinha, a uma declaração de que uma solução será imune a toda interferência ou compatível com qualquer UTI, centro cirúrgico ou equipamento médico já instalado. O ambiente, a integração, as frequências, potências, distâncias e o desempenho essencial do sistema continuam relevantes.

## 2. IEC 60601-1-2: escopo hospitalar

A Anvisa descreve a série IEC 60601 como aplicável à segurança básica e ao desempenho essencial de **equipamentos eletromédicos e sistemas eletromédicos**. A ABNT NBR IEC 60601-1-2:2017 é a norma colateral de **perturbações eletromagnéticas — requisitos e ensaios**; a IN Anvisa nº 29/2018 passou a exigi-la compulsoriamente no regime então aplicável a partir de 1º de dezembro de 2019.

- Fontes primárias: [Manual de Tecnovigilância da Anvisa](https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/servicosdesaude/publicacoes/MANUALTECNOVIGILANCIA2021v43.pdf), especialmente a explicação de que a aplicabilidade deve ser decidida pelo item “Escopo” de cada norma; e [IN Anvisa nº 29/2018](https://bvsms.saude.gov.br/bvs/saudelegis/anvisa/2018/int0029_27_11_2018.pdf).

**Limite:** a IEC 60601-1-2 não deve ser atribuída automaticamente a qualquer software de rastreabilidade. Ela incide sobre equipamento ou sistema eletromédico dentro do seu escopo. Um aplicativo ou serviço puramente de software, sem controlar desempenho essencial nem incorporar rádio/hardware, não recebe por simples associação uma obrigação de certificação de equipamento. A classificação depende da arquitetura final, da finalidade pretendida, da integração com dispositivos médicos e do marco regulatório vigente na data do produto.

## Leituras exploratórias para uma solução de rastreabilidade

- Uma etiqueta ou gateway com rádio pode partir de módulos já homologados pela Anatel, mas o produto final e sua integração precisam ser enquadrados conforme a categoria e as regras aplicáveis.
- “Sem interferência” é uma promessa absoluta difícil de sustentar. Uma formulação verificável seria reduzir e controlar o risco de interferência, documentando potência, bandas, coexistência, distâncias de uso, zonas críticas e testes no ambiente representativo.
- Se a solução apenas localiza ativos e não altera o funcionamento clínico, convém manter essa separação arquitetural explícita. Caso passe a comandar, alarmar ou influenciar desempenho essencial, o enquadramento e a validação mudam.
- Antes de fechar um pitch, vale distinguir três camadas: conformidade do rádio perante a Anatel; compatibilidade eletromagnética do equipamento/sistema médico quando aplicável; e validação operacional da instalação no hospital. Uma não substitui automaticamente as outras.

Esta nota é uma leitura inicial das fontes citadas, não uma conclusão de enquadramento regulatório para uma arquitetura específica.
