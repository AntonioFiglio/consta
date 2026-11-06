# CONSTA — Identidade Visual

A marca usa o nome em caixa alta **CONSTA** com um ponto final que muda de cor conforme o estado do equipamento. Fonte DM Mono weight 500. Sem símbolo — wordmark pura.

## Paleta

| Cor       | Hex       | Aplicação                                   |
|-----------|-----------|---------------------------------------------|
| Black     | `#0A0A0A` | Wordmark, texto principal, fundos escuros   |
| Orange    | `#F97316` | Ponto da marca, alertas, manutenção próxima |
| Vermilion | `#E63946` | Crítico, equipamento parado, urgente        |
| White     | `#FAFAF9` | Fundos claros, wordmark invertida           |
| Gray 100  | `#F5F5F4` | Fundos secundários                          |
| Gray 200  | `#E7E5E4` | Divisores, bordas                           |
| Gray 500  | `#78716C` | Texto secundário, labels                    |

### Sistema de status

| Estado   | Cor       | Hex       | Quando usar                        |
|----------|-----------|-----------|------------------------------------|
| Positivo | Verde     | `#22C55E` | Manutenção em dia, operacional     |
| Atenção  | Orange    | `#F97316` | Manutenção ativada automaticamente |
| Crítico  | Vermilion | `#E63946` | Equipamento parado, urgente        |

## Tipografia

| Papel    | Fonte   | Peso | Uso                         |
|----------|---------|------|-----------------------------|
| Wordmark | DM Mono | 500  | Apenas o logotipo           |
| Headings | Inter   | 700+ | Títulos de página e seção   |
| Body     | Inter   | 400  | Todo texto de interface     |
| Dados    | DM Mono | 400  | Nº de série, datas, códigos |

## Wordmark

- ALL CAPS, DM Mono 500, letter-spacing 0.06em
- O ponto (`.`) é parte integrante da marca — muda de cor por status
- Nunca usar em caixa baixa ou misturada

## Arquivos


| Arquivo                                 | Descrição                              |
|-----------------------------------------|----------------------------------------|
| `identity.html`                         | Brand sheet completo — abre no browser |
| `logo/svg/consta-wordmark-on-white.svg` | Wordmark fundo branco                  |
| `logo/svg/consta-wordmark-on-black.svg` | Wordmark fundo preto                   |
| `logo/svg/consta-wordmark-black.svg`    | Wordmark transparente, texto preto     |
| `logo/svg/consta-wordmark-on-gray.svg`  | Wordmark fundo cinza                   |
| `logo/svg/consta-wordmark-critical.svg` | Ponto vermilho — estado crítico        |
| `tokens.css`                            | Tokens de cor e fonte para UI          |

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
