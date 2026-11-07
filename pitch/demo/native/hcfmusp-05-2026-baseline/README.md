# Reprodução HTML da interface real

Os estados foram extraídos do DOM do CRM compilado após a integração `de5e84f`, usando o contrato público tratado HCFMUSP 05/2026. CSS e fontes do próprio build ficam embutidos em `crm-dom.js`. O pitch reproduz esses estados dentro de um `iframe srcdoc` responsivo, sem rede, React, API ou gravação durante a apresentação.

A captura exerceu upload, processamento com resposta HTTP preparada, revisão e salvamento na API real com SQLite `:memory:`. `capture-result.json` registra os cinco ativos, campos de periodicidade/data nulos e ausência de erros do navegador. Não houve IA externa, câmera física ou integração BLE nessa execução.

A coreografia em `../../product-demo.js` é de GPT-6 Astra, autorizado por Matheus após o limite da conta Opus. É HTML/CSS/JS nativo, sem vídeo, som ou dependências adicionais. A seleção de arquivo é um seletor demonstrativo; o restante da interface vem do DOM real. Os campos de data vazios recebem apenas na apresentação o placeholder `dd/mm/aaaa`, evitando o preenchimento visual enganoso do WebKit. O código do CRM não é alterado.

O link real **Fotografar tombamento** aparece na revisão atualizada. Sua presença não demonstra captura por outro celular, OCR correto ou acesso remoto. A demonstração mantém a conferência humana e não abre câmera nem gera QR. Sem periodicidade explícita, nenhuma previsão de manutenção é produzida.

## Reproduzir

Na raiz, após o build do CRM:

```sh
node --import tsx pitch/demo/native/capture-dom.mts
python3 pitch/demo/native/bundle-dom.py
```

O capturador usa os caminhos locais Playwright/WebKit já existentes, substituíveis por `CONSTA_PLAYWRIGHT_MODULE` e `CONSTA_WEBKIT_EXECUTABLE`. Ele abre apenas portas efêmeras em `127.0.0.1`, fecha os processos e não lê banco nem configuração pessoal. `snapshots.json` preserva os estados extraídos; o bundle incorpora estilos e fontes locais.

## Comportamento no pitch

- Beat 7: visão geral → Enviar contrato → seleção do PDF → documento pronto.
- Beat 8: Continuar → processamento identificado como demonstrativo → campos reais preenchidos → rolagem pelas unidades.
- Beat 9: confirmação humana → salvamento demonstrativo → inventário e rolagem da lista.

O relógio é cancelado ao mudar de beat. Voltar reinicia o estado correspondente; salto direto e movimento reduzido exibem o estado final. `window.constaProductDemo.restart()` permite repetir o beat atual em QA. O controlador não escreve na bolinha global do pitch.

## Complementação documental

A fixture foi revisada contra o PDF público: inclui a empresa responsável **PHOENIX LUFERCO LTDA** (página1) e observações por unidade com TAG documental, Instituto ICHC e vigência condicionada ao termo de início (página2). Instituto não foi convertido em setor/localização, nem TAG documental em etiqueta Bluetooth. A versão anterior permanece em `baseline/` para auditoria.

Os estados `05d-identity` e `05e-coverage` mostram as abas reais Identificação e Contrato durante a conferência. Periodicidade, primeira manutenção, início/fim de vigência, telefone/e-mail técnicos e setor específico continuam sem valores não fornecidos. A assinatura do documento não foi usada como início da vigência.

A coreografia não é benchmark de dez segundos: o ensaio comparativo continua sem resultados preenchidos. Dados preparados e duração da animação não medem desempenho de uma IA externa.
