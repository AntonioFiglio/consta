# ADR 0001 — BLE para ativos móveis e descontinuação da óptica

**Status: aceita como direção de produto; validação física e hospitalar pendente.**

Matheus definiu rastreamento automático, sem QR ou escaneamento, com infraestrutura distribuída e operação local. Após a exploração óptica, aceitou BLE com tag a bateria e a limitação a equipamentos móveis e áreas aprovadas. O Consta seguirá nessa direção, com desenvolvimento de tag e receptor próprios a partir de componentes comerciais; peças, método de localização e configuração finais ainda serão selecionados.

A óptica exigia visibilidade e cobertura adequadas do marcador. As simulações não demonstraram uma instalação hospitalar viável, e manter o caminho óptico ativo confundiria a equipe com uma alternativa que não integra mais o produto. Seus códigos, galerias e relatórios saíram da árvore atual; o [registro histórico](../historico/optica-descontinuada.md) preserva a referência ao Git.

BLE também tem compromissos: bateria e manutenção, propagação por paredes, coexistência com outras comunicações e avaliação eletromagnética por configuração/área. Excluir RM do primeiro escopo não dispensa avaliar os outros equipamentos. O CRM consome uma interface de localização com procedência e continua utilizável quando essa informação é desconhecida. Precisão, atualização, autonomia e compatibilidade não são capacidades comprovadas nesta decisão.
