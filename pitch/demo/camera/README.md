# Captura móvel para o pitch

`framing.png` e `received.png` vêm da página `CapturePage` do CRM, com seu CSS real, renderizada em WebKit headless. Não há uma reconstrução da interface com estilos do pitch. A moldura usa um viewport de 393 × 852; a página ocupa 393 × 690, entre a barra de estado e os controles ilustrativos do Safari. A ampliação no palco é uniforme.

Apenas os pixels da câmera e as respostas HTTP são simulados. O ensaio não acessa câmera física, OCR, IA externa, credenciais ou banco do usuário. O patrimônio CST0001 e a etiqueta são sintéticos. `capture-result.json` registra o viewport, a posição real do botão e erros do navegador.

Para refazer, com o build atual do CRM disponível, execute na raiz:

```sh
node pitch/demo/camera/capture.cjs
```

É possível apontar Playwright e WebKit existentes com `CONSTA_PLAYWRIGHT_MODULE` e `CONSTA_WEBKIT_EXECUTABLE`. A captura abre somente um servidor temporário em loopback, encerrado ao terminar.

Validação desta correção: carregamento offline das imagens, proporção preservada, estado inicial/recebido, retorno e reinício, movimento reduzido e ausência de erros em WebKit nos viewports 1920 × 1080, 1440 × 900 e 1280 × 720. O verificador documental também passou. Não representa teste em iPhone físico.

A prévia usa `etiqueta-patrimonial-realista.png`, gerada pela ferramenta integrada imagegen a pedido de Matheus. Foto sintética de etiqueta CST0001 sobre aço escovado; texto e leitura continuam simulados. Prompt completo em `PROMPT-etiqueta.md`.
