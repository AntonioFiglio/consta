# Rastreamento automático com BLE

**Direção vigente:** tag BLE a bateria em equipamento móvel, receptores fixos nas áreas aprovadas e processamento na rede local. O hardware próprio será desenvolvido com componentes comerciais. Não há protótipo BLE construído nem instalação hospitalar validada neste repositório.

## Como funcionará

1. A tag é provisionada e associada ao ativo no CRM. A identidade transmitida deve ser resolvível de forma estável, sem depender de um endereço de rádio que possa mudar.
2. A tag transmite anúncios de identificação automaticamente. Estado de bateria e sensor de movimento são recursos a avaliar, não requisitos já implementados.
3. Receptores cadastrados em pontos conhecidos observam os sinais. Para o caminho de transporte, a direção é Ethernet, com PoE quando adequado ao projeto elétrico e à infraestrutura.
4. Observações seguem pela LAN ao serviço local. Reenvio, buffer e falhas ficam explícitos no protocolo.
5. O serviço combina observações, resolve a associação temporal e estima a área. O CRM mostra origem, horário, qualidade disponível e atualização.

É uma experiência semelhante à ideia de uma AirTag: prender uma tag ao objeto e encontrá-lo sem registrar cada movimento. O Consta prevê sua própria infraestrutura; não depende de funcionários portando iPhones, da rede Buscar ou de um celular próximo para cada atualização.

## Identificação e localização são funções distintas

Cada tag terá identidade provisionada e cadastro controlado. Isso permite distinguir equipamentos sem padrões ópticos. O serviço precisa administrar associação, substituição, colisão de cadastro e risco de falsificação/replay; um identificador único não demonstra posição verdadeira.

Receber o sinal identifica que uma tag foi observada. Localizar exige um método e validação no ambiente. O equipamento pode ser visto por receptores de salas vizinhas, especialmente com portas abertas ou reflexões.

## Método de estimativa

| Caminho | Uso proposto | Limite |
| --- | --- | --- |
| RSSI, intensidade recebida | Primeiro protótipo de presença por setor, com múltiplas observações e calibração | Paredes, pessoas, metal e reflexões afetam o sinal; receptor com maior RSSI não garante sala correta |
| AoA, ângulo de chegada | Evolução se o requisito exigir direção/posição e os ensaios justificarem | Exige sinal compatível, conjunto de antenas, amostragem, calibração e algoritmo adequados |

O [Bluetooth SIG](https://www.bluetooth.com/learn-about-bluetooth/feature-enhancements/direction-finding/) descreve AoA com uma antena na tag e múltiplas antenas no receptor. Um chip que suporte o recurso não entrega, sozinho, um localizador pronto. A seleção de RSSI ou AoA como primeira implementação ainda será registrada após definição do requisito de área.

O [nRF52833](https://www.nordicsemi.com/Products/nRF52833) é um candidato de componente com BLE e Direction Finding. Esta referência não é seleção de BOM, prova de autonomia ou recomendação de uso assistencial.

## Energia e atualização

A tag terá alimentação própria, sem consumir a alimentação do equipamento médico ou se conectar a seus circuitos. Isso separa o caminho elétrico funcional, mas não elimina emissões de rádio nem outras interações possíveis.

Bateria, tamanho, potência e intervalo de anúncios devem ser dimensionados juntos. A equipe medirá consumo, atraso de atualização e perdas com a configuração real. Não há promessa de duração de bateria, intervalo ou quantidade de tags suportadas.

Receptores e servidor dependem de energia e LAN. Buffer pode recuperar histórico dentro de seus limites; não mantém localização ao vivo durante uma falha de rede. A ausência de internet será tratada separadamente de queda de energia ou da rede local.

## Escopo físico

- Equipamentos móveis de famílias selecionadas e previamente avaliadas.
- Corredores, enfermarias e outras áreas aprovadas pelo hospital.
- Sem ingresso inicial de tags não avaliadas em áreas especiais de RM.
- Grandes equipamentos fixos podem ter sala cadastrada no CRM, sem tag móvel.
- Fixação e gabinete precisam ser compatíveis com operação e limpeza do ativo.

As restrições do host não eliminam a avaliação da tag e dos receptores. Um alerta de área restrita é apoio operacional; não constitui barreira física ou intertravamento de segurança. Veja [segurança hospitalar](seguranca-hospitalar.md).

## Próxima evidência a produzir

Recepção física com identidades distintas, associação correta, persistência e consulta pelo CRM; depois, medir acerto de setor e comportamento de falha em cenários controlados. O [plano de validação](validacao.md) separa bancada, localização, operação local e compatibilidade hospitalar.
