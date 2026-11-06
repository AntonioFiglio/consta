# Consta — identidade visual

A marca usa o símbolo floral enviado por Matheus e o nome em caixa baixa, **consta**. A escrita usa Manrope no peso 650: formas abertas, geometria suave e presença sóbria. A flor mantém o desenho vetorizado da referência.

## Paleta

| Cor | Hexadecimal | Aplicação |
| --- | --- | --- |
| Azul profundo | `#154F6F` | Marca principal, títulos e fundos escuros |
| Azul gelo | `#D3EFFF` | Fundos claros e símbolo sobre azul profundo |
| Preto | `#000000` | Reprodução monocromática e texto |
| Branco | `#FFFFFF` | Fundos e escrita invertida |

Preferir azul profundo sobre gelo ou branco. Em fundo profundo ou preto, usar símbolo gelo e escrita branca. Evitar gelo sobre branco em textos e marcas pequenas.

## Arquivos

Abra [index.html](index.html) para visualizar e baixar todas as versões. [brand-overview.png](brand-overview.png) oferece uma prancha resumida.

- `logo/svg/`: vetores finais com escrita em curvas, sem dependência de fonte instalada.
- `logo/png/`: versões raster em resolução dupla e com os mesmos nomes dos vetores.
- `fonts/`: fonte variável original e licença SIL Open Font License.
- `reference/`: primeiro desenho do símbolo, preservado como origem.
- `tokens.css`: cores e fonte para implementação de interfaces.

## Composições e nomes

`symbol` = símbolo; `wordmark` = escrita; `horizontal` = símbolo à esquerda; `stacked` = símbolo em cima.

Sufixos `navy`, `ice`, `black` e `white` indicam versões transparentes de uma só cor. `on-ice`, `on-navy`, `on-white` e `on-black` incluem o fundo correspondente. PNGs brancos transparentes precisam ser visualizados sobre fundo escuro.

## Uso

A horizontal é a assinatura principal para cabeçalhos e apresentações. A vertical atende capas e áreas quadradas. O símbolo sozinho serve para avatar, ícone e favicon. A escrita sozinha atende espaços estreitos quando a marca já estiver identificada.

Preservar proporção, espaçamento e orientação. Reservar ao redor uma área livre equivalente a uma pétala. Evitar sombras, contornos, rotação, alongamento e outras cores. Em tamanhos onde a assinatura completa perde legibilidade, usar apenas o símbolo e conferir a renderização na aplicação real.

## Fonte e reprodução

Fonte: [Manrope no repositório Google Fonts](https://github.com/google/fonts/tree/main/ofl/manrope). Licença em [fonts/OFL.txt](fonts/OFL.txt). O nome em curvas preserva o peso escolhido; a fonte é incluída para materiais futuros.

Os arquivos finais já estão prontos para uso; reconstruí-los é opcional. O gerador e suas dependências ficam nesta pasta, separados do futuro CRM.

Para reconstruir, é preciso Python 3 e `rsvg-convert` disponível no sistema. Na raiz do repositório:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r brand/requirements.txt
.venv/bin/python brand/scripts/gerar_marca.py
```

O gerador reescreve os SVGs, PNGs, a prancha e o atalho `consta-logo.svg` na raiz. Confira o diff antes de integrar mudanças. A galeria HTML usa recursos locais e funciona sem conexão; ela é uma entrega estática de consulta da marca. O gerador não implementa nenhuma funcionalidade do CRM.

Esta entrega define a identidade visual inicial. Não representa registro de marca, aprovação institucional ou vínculo com o HCFMUSP.
