# Hardware Consta

**Direção:** desenvolver tag BLE a bateria e receptor fixo próprios, usando componentes comerciais. Ainda não há esquemático, PCB, BOM, firmware, gabinete fabricado ou hardware validado neste repositório.

| Parte | Documento | Escopo |
| --- | --- | --- |
| Tag | [Especificação inicial](tag/README.md) | Identidade, alimentação, transmissão, montagem e manutenção |
| Receptor | [Especificação inicial](receptor/README.md) | Recepção, posição conhecida, rede cabeada e observações |

A referência de sistema é a [arquitetura BLE](../docs/rastreamento/arquitetura-ble.md). O [contrato de integração](../packages/contratos/README.md) especifica as observações, ainda como proposta. Segurança e ensaios ficam em [segurança hospitalar](../docs/rastreamento/seguranca-hospitalar.md) e [validação](../docs/rastreamento/validacao.md).

## Organização quando começar a implementação

Adicionar esquemáticos, placas, lista de materiais, firmware e desenhos de gabinete dentro da parte correspondente, com revisão, licença dos componentes e instruções de reprodução. Arquivos de fabricação e relatórios devem indicar a versão exata do projeto. Não adicionar pastas vazias nem copiar SDKs completos sem necessidade.

Usar kits ou módulos na bancada é compatível com desenvolver um produto próprio. A escolha não autoriza uso clínico, e certificações de componentes não devem ser apresentadas como conformidade automática da montagem final.
