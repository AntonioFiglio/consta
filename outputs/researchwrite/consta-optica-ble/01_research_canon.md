# Cânone de pesquisa

## Fatos de literatura e fontes

- C1: padrões circulares podem codificar identidades individuais; a implementação CCTag trata geometria projetiva e tem licença MPL-2.0. Fonte: https://github.com/alicevision/CCTag e Calvet et al. (2016), DOI 10.1109/CVPR.2016.67.
- C2: Johns Hopkins estudou bombas móveis com RF+IR; não era evidência de BLE. Fonte: Martinez et al. (2020), DOI 10.1093/jamia/ocaa033.
- C3: NHS Mid Cheshire documenta tags/infraestrutura mistas e caminho com Cisco DNA Spaces na nuvem, mesmo tendo banco local. Fonte: NHS England, caso institucional listado em sources/international_cases.md.
- C4: Lund/Skåne descreve estudo BLE com observadores fixos e serviço cloud; é estudo de viabilidade com participação industrial. Fonte: Pendrill et al. (2021), DOI 10.1080/24725579.2021.1881660.
- C5: ACR 2026 e GE separam segurança de acesso/campo e blindagem RF. Não há distância BLE universal dedutível do corredor. Fontes: sources/ble_zones_safety.md, S1 e S2.
- C6: NHS MKUH documenta problema de coexistência BLE/Wi-Fi com impacto em dispositivos dependentes da rede; não documenta ali dano ao paciente ou artefato de RM. Fonte: NHS Lessons learned, S4 no dossiê.

## O que foi e não foi medido

- Não existe protótipo físico Consta validado com câmera, scanner, paciente ou infraestrutura hospitalar nesta pesquisa.
- Os resultados em experiments/optical-tags/results.json são observações computacionais de imagens sintéticas. verification.json verifica outra sequência sintética e o dicionário; não são resultados físicos.

## Restrições de Matheus

Sem QR/escaneamento humano; identidade de cada unidade; localização automática próxima do tempo real; LAN sem internet no caminho essencial; comparar óptica e BLE para ativos móveis em circulação; projeto autoral sem copiar indevidamente terceiros.

## Termos

ID único = atribuição distinta no catálogo; identificação = estimativa a partir da observação; localização = associação espacial da observação; detecção = encontrar candidato no quadro; rejeição = nenhum ID aceito; segurança = avaliação separada de função/imagem/ambiente.

## Proibido afirmar

Detecção perfeita, N ilimitado, zero confusão real, intervalo físico seguro genérico, ausência universal de EMI, hospital-wide desde uma cena sintética, todos os casos internacionais são BLE, banco local significa offline, geofence impede fisicamente entrada em RM, hardware próprio herda conformidade comercial.

## Questões abertas

Dicionário escalável à população real com resolução física suficiente; eficácia em baixa luz/oclusão; regiões permitidas e modelos clínicos; interface definitiva BLE/autoral; orçamento; propriedade intelectual; controle de entrada nas zonas excluídas.

## Fontes técnicas adicionais verificadas

- C7: Bluetooth AoA usa transmissor e receptor fixo com arranjo de antenas para direção de chegada; não equivale a estimar sala pelo maior RSSI. Fonte primária: https://www.bluetooth.com/learn-about-bluetooth/feature-enhancements/direction-finding/ .
- C8: FiRa descreve rastreamento UWB com tags/âncoras e medições temporais; a fonte é consórcio técnico, não validação hospitalar. Fonte: https://www.firaconsortium.org/sites/default/files/2023-12/FiRa-Asset-Tracking-Leaflet.pdf .
