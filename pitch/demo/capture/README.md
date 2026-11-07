# Captura da interface real — demonstração simulada

Estes arquivos mostram o CRM real executado localmente, com resposta de extração preparada à mão e servida por um endpoint HTTP de teste. **Não houve execução de IA externa.** Não são uma gravação da demo final: câmera e mapa aguardam suas entregas verificáveis.

## Reproduzir

Na raiz do repositório, com as dependências existentes:

```sh
npm run build
node --import tsx pitch/demo/capture/run-capture.mts
```

Por padrão, novas execuções geram apenas PNGs e prova JSON. `CONSTA_CAPTURE_VIDEO=1` habilita registro técnico opcional.

O script usa o Playwright/WebKit já instalado nesta máquina. Para outro ambiente existente, informe `CONSTA_PLAYWRIGHT_MODULE` com o caminho do módulo Playwright e `CONSTA_WEBKIT_EXECUTABLE` com o executável WebKit. Não instala dependências.

## Isolamento e origem

- Express/API reais do CRM e SQLite `:memory:`, sem seed e sem senha, somente em loopback e portas efêmeras.
- Endpoint compatível com Responses API em loopback, chave/modelo sintéticos. Não lê `.env` nem o banco do usuário.
- Upload real da cópia pública tratada do contrato HCFMUSP 05/2026; gabarito documental da página 2 fornece as cinco séries, tombamentos, marcas e modelos.
- Periodicidade, datas de manutenção e vigência ficam ausentes. Os cadastros são salvos pendentes e não geram previsões. Autoclaves não são apresentadas como ativos BLE móveis.
- O rótulo de simulação é uma sobreposição exclusiva da captura, injetada no navegador. O marcador de cursor fica oculto nos PNGs para permitir sua composição no pitch. Essas sobreposições não modificam arquivos nem regras da aplicação.

## Saídas

`current-*.png` mantêm viewport lógico de 1920×1080, com `deviceScaleFactor: 2` por padrão: os arquivos têm 3840×2160 pixels para preservar a nitidez quando ampliados no pitch. `capture-actions.json` mantém coordenadas em pixels CSS lógicos de 1920×1080, independentemente da densidade. `capture-result.json` registra a escala e as dimensões efetivamente lidas de cada PNG. `CONSTA_CAPTURE_SCALE=1` permite reproduzir a densidade anterior; a cópia preservada dessa captura está em `/tmp/consta-capture-dpr1`.

`current-real-crm-simulated.webm` é apenas registro técnico bruto já produzido, sem edição ou aceleração; não deve ser integrado ao pitch. `fixture-extraction-v2.json` contém a resposta preparada; `capture-result.json` registra as verificações da execução.

A duração de processamento do mock é deliberada para tornar o estado visível. Não representa latência de IA ou benchmark. O script verifica uma chamada ao mock, cinco ativos, ausência de intervalo/data no resultado persistido e ausência de erros JavaScript.

WebKit pode exibir a data corrente como apresentação nativa de um campo `date` vazio. O script verifica seu `value` vazio antes de salvar e confirma os campos nulos na API; essa aparência não deve ser narrada como uma previsão extraída.
