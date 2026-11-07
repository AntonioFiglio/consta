# BLE no palco: justificativa curta e defensável

## Texto sugerido para a fala

“Propomos usar pequenas etiquetas Bluetooth de baixo consumo: os receptores detectam sua presença e o sistema atualiza o último setor identificado, sem alguém registrar cada mudança à mão. No próprio HC, uma pesquisa da FMUSP acertou o setor em 100% dos testes realizados — uma base concreta para desenvolver nosso piloto, com avaliação da Engenharia Clínica.”

A primeira frase descreve a arquitetura proposta do Consta; não deve ser apresentada como integração física já entregue. A segunda atribui o resultado ao estudo externo. Não acrescentar promessa de latência, autonomia ou segurança já validada.

## Versão visual, com pouca informação

**Etiquetas Bluetooth. Localização automática por setor.**

**100% de acerto por setor nos testes do HC**

Fonte curta: Barbosa · FMUSP · 2023 · p. 29.

Se houver espaço para uma única linha de segurança: **Implantação acompanhada pela Engenharia Clínica.** Não escrever “zero interferência”, “a mais segura” ou “a melhor tecnologia”.

## Evidência conferida

### USP: benefício, mecanismo e limites

[Dissertação oficial, FMUSP, 2023](https://teses.usp.br/teses/disponiveis/5/5174/tde-30112023-155658/pt-br.html). [PDF oficial](https://teses.usp.br/teses/disponiveis/5/5174/tde-30112023-155658/publico/SilvioTaclaAlvesBarbosa.pdf).

- p. 15 (página 16 do PDF): explica BLE, etiquetas ativas pequenas de baixo consumo e receptores.
- p. 23 (PDF 24): implantação alinhada à Engenharia Clínica e higienização articulada com a CCIH.
- pp. 24–25 (PDF 25–26): 30 etiquetas reutilizadas nos três setores, totalizando 90 medições; avaliações após 10 segundos de movimentação. API e mapa foram desenvolvidos.
- p. 29 (PDF 30): acerto por setor em todos os testes; acerto por sala de 60% e 76,67% nos blocos cirúrgicos.
- p. 35 (PDF 36): obstáculos, circulação de pessoas, um único piso e condições locais limitam a generalização.

A pesquisa avalia localização. Não localizei protocolo nem resultados de ensaios de compatibilidade eletromagnética que demonstrem ausência de efeitos sobre equipamentos médicos. A discussão sobre interferências de sinal se refere principalmente à precisão do rastreamento; não constitui validação clínica de EMI.

### Anvisa: segurança exige compatibilidade no ambiente previsto

[RDC 848/2024 — texto publicado no portal de legislação Anvisa](https://anvisalegis.datalegis.net/action/ActionDatalegis.php?acao=abrirTextoAto&cod_menu=9431&cod_modulo=310&link=S&numeroAto=00000848&orgao=RDC%2FDC%2FANVISA%2FMS&seqAto=000&tipo=RDC&valorAno=2024).

Art. 36: interoperabilidade e compatibilidade seguras; arts. 47–48: controlar riscos de interferência eletromagnética e assegurar funcionamento previsto. Isso respalda a necessidade de avaliação da instalação, não comprova conformidade da tag proposta nem define automaticamente seu enquadramento regulatório.

### Anatel: homologação de rádio não demonstra segurança clínica

[Página institucional sobre radiação restrita](https://www.gov.br/anatel/pt-br/regulado/radiofrequencia/radiacao-restrita). A página teve bloqueio antiautomação na consulta. O texto indexado define dispositivos sujeitos a critérios de emissão específicos.

[Resolução 680/2017](https://informacoes.anatel.gov.br/legislacao/resolucoes/2017/936-resolucao-680): o índice oficial mostra alterações/revogações parciais em 2025, e o portal retornou manutenção. Portanto não usar nesta entrega uma citação de artigo antigo como se fosse verificação integral da regra vigente. Não é necessário mencionar legislação de rádio no slide.

## Respostas simples para jurados

**O que é um beacon?** Uma pequena etiqueta Bluetooth presa ao equipamento, que emite sinais reconhecidos pelos receptores do hospital.

**É em tempo real?** A atualização é automática, conforme chegam as leituras. No Consta, mostrar horário e último setor detectado; a latência será medida no piloto. A tese não comprova atualização instantânea.

**É seguro?** “É uma tecnologia de baixo consumo já estudada no próprio HC; vamos validar a instalação com a Engenharia Clínica.” Isso é positivo e sustentado. A dissertação não permite garantir ausência absoluta de interferência ou superioridade sobre todas as alternativas.

**Saber onde está significa que pode usar?** Não. Localização, disponibilidade e liberação técnica são estados distintos.
