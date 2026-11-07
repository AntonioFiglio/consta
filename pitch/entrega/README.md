# Entrega do pitch — HCFMUSP

- [PDF para envio](CONSTA-Pitch-Hackathon-HCFMUSP.pdf): 17 páginas, com agenda completa, mapa completo, documentos visíveis na gaveta e etapas principais da demonstração.
- [Versão animada independente](CONSTA-Pitch-Animado.html): baixe e abra no navegador. Imagens, fontes e scripts incorporados; funcionamento offline conferido. O PDF é estático.

## Reprodução

Os scripts em `pitch/tools` capturam estados completos do deck com Playwright/WebKit, montam o PDF com PyMuPDF/Pillow e incorporam os recursos do HTML com BeautifulSoup. Os quadros intermediários e imagens de QA são gerados localmente e não integram a entrega versionada. Configure `CONSTA_PLAYWRIGHT_MODULE` e `CONSTA_WEBKIT_EXECUTABLE` conforme a instalação local; a montagem usa Arial do macOS.

```sh
node pitch/tools/exportar_pdf_evento.cjs
python3 pitch/tools/gerar_html_autossuficiente.py
python3 pitch/tools/montar_pdf_evento.py
```

A exportação preserva o deck animado original. As páginas do contrato inicial da agenda e do primeiro setor do mapa foram omitidas do PDF a pedido de Matheus.
