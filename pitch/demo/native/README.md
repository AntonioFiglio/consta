# Demonstração HTML — cenário sintético completo

A apresentação usa **CONSTA-DEMO-2026-01**, documento inteiramente fictício em `pitch/demo/synthetic-contract.txt`, com equivalentes HTML e Markdown. Não é contrato do HCFMUSP. Todos os dados do cadastro, contatos e condições estão explicitamente documentados no cenário. Não ligar nem escrever aos contatos demonstrativos.

O capturador envia o TXT pela interface real, recebe resposta HTTP preparada, confirma o botão real **Confirmar e salvar** e grava cinco ativos numa API Express real com SQLite `:memory:`. Não usa banco/configuração pessoal nem executa IA externa. O pitch reproduz o DOM/CSS/fontes do CRM offline; não há backend, áudio ou vídeo durante a apresentação.

## Evidência desta execução

`capture-result.json` registra:

- cinco equipamentos CST0001–CST0005, séries DEMO001–DEMO005, com campos preenchidos;
- empresa, contatos, setor demonstrativo, periodicidade de90dias, primeira preventiva05/02/2027, vigência07/11/2026–06/11/2027 e marco documentados;
- `reviewed:true` após a ação real de confirmação representada na demo;
- zero linhas com pendências no inventário;
- cinco previsões retornadas pela API real `/api/events` para05/02/2027;
- uma chamada ao HTTP mock e nenhum erro de página.

O campo `simulated:false` dos eventos na API significa registro não proveniente do seed; não torna reais os dados fictícios. O artefato marca explicitamente `sourceKind: entirely-synthetic` e `simulation:true`. Cadastro/cobertura documental não equivale a execução da manutenção ou liberação técnica.

A fixture deriva os valores e trechos do TXT, sem valores ocultos adicionais. Campos `page:null` respeitam a ausência de páginas físicas no TXT. `snapshots.json` preserva os estados de interface; `crm-dom.js` contém o bundle offline. As versões anteriores do caso público permanecem em `hcfmusp-05-2026-baseline/` e `baseline/`; suas lacunas não foram preenchidas artificialmente.

## Apresentação e controle

Beat7 envia o documento; beat8 mostra identificação, contrato e todos os campos; beat9 confirma e mostra o inventário completo. A sequência avança automaticamente7→8→9 e para. O avanço manual conclui e passa no mesmo comando; saltos diretos e movimento reduzido aplicam o estado final sem emitir eventos automáticos.

O viewport panorâmico é fixo, sem zoom. Apenas paddings e largura do diálogo são compactados na apresentação para manter as cinco linhas, cabeçalhos e rodapés visíveis simultaneamente. Nenhum dado é ocultado. A legenda genérica de pendências é omitida somente quando todas as linhas exibem cobertura por contrato; os filtros do CRM permanecem. O cursor usa um único relógio RAF com `translate3d`, sem transição CSS, filtro ou animação WAAPI do cursor. O foco retorna ao palco após a abertura dos diálogos.

## Reproduzir

Na raiz, com o build atual do CRM:

```sh
node --import tsx pitch/demo/native/capture-dom.mts
python3 pitch/demo/native/bundle-dom.py
```

Playwright/WebKit usam os caminhos locais já existentes, substituíveis por `CONSTA_PLAYWRIGHT_MODULE` e `CONSTA_WEBKIT_EXECUTABLE`. As portas são efêmeras em127.0.0.1 e os processos fecham ao terminar. Não é necessária instalação adicional.

A duração da animação não é benchmark de extração real. Não há medição de dez segundos nem comparação de produtividade preenchida no ensaio.
