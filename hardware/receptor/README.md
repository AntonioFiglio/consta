# Receptor fixo BLE

Especificação inicial, não hardware já produzido. “Sensor de parede” corresponde aqui ao receptor de sinais das tags.

## Função

Receber sinais BLE a partir de um ponto cadastrado e encaminhar observações ao serviço de localização pela rede local. O receptor não declara, sozinho, que o ativo está na mesma sala.

## Requisitos de projeto

- Identidade, instituição, posição de instalação e versão de configuração cadastradas.
- Transporte cabeado por Ethernet; PoE é a direção proposta de alimentação, condicionada ao projeto elétrico.
- Autenticação perante o serviço e credenciais próprias revogáveis.
- Registro de horário e condição do relógio, estado do receptor e versão de firmware.
- Reenvio idempotente e buffer persistente, com capacidade, descarte e falhas explicitados.
- Recuperação após queda de energia e da LAN, sem reenviar eventos como se fossem observações atuais.
- Atualização de firmware e acesso de manutenção controlados.

## Recepção simples ou AoA

Para RSSI, o receptor observa identificação e intensidade do sinal. Para AoA, precisa de rádio compatível, arranjo de antenas, aquisição apropriada e calibração. Essas opções têm exigências de hardware diferentes; a seleção deve acompanhar o requisito de localização e os resultados de bancada.

A [explicação do Bluetooth SIG](https://www.bluetooth.com/learn-about-bluetooth/feature-enhancements/direction-finding/) é a referência do mecanismo AoA. A [arquitetura BLE](../../docs/rastreamento/arquitetura-ble.md) define o sistema; o [contrato](../../packages/contratos/README.md) define a observação encaminhada.

## Instalação

Revisar cabeamento, energia, limpeza, fixação, manutenção e proximidade de equipamentos com os responsáveis do hospital. O projeto não autoriza perfurar blindagem de RM nem colocar eletrônica em áreas restritas. Receptor cabeado continua fazendo parte de um sistema que usa rádio.
