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

Abra [identity.html](identity.html) para consultar a identidade vigente de Pedro. O [index.html](index.html) encaminha para essa apresentação.

## Uso e reprodução

Use as wordmarks listadas acima e os [tokens atuais](tokens.css). A marca não possui símbolo floral, composições horizontais com flor ou assinatura em caixa baixa. O nome do produto em texto pode aparecer como Consta; o logotipo é **CONSTA.**.

Os SVGs atuais usam texto com DM Mono e fallback monoespaçado; não são vetores com letras convertidas em curvas. O renderizador precisa da fonte para reproduzir exatamente a tipografia. A apresentação HTML carrega DM Mono e Inter pelo Google Fonts; sem conexão, usa os fallbacks definidos. Para distribuição offline, incluir as fontes e licenças correspondentes ou produzir exportações em curvas revisadas.

As cores de status são informação visual complementar; a interface deve apresentar também rótulos e estado explícito. A cor do ponto não comprova condição técnica ou liberação do ativo.

## Histórico

Os arquivos da identidade floral azul, PNGs antigos, Manrope e o gerador anterior foram removidos da árvore atual. Permanecem recuperáveis no histórico do Git. O gerador antigo não deve ser usado: ele sobrescrevia arquivos com a identidade superada. O arquivo raiz [consta-logo.svg](../consta-logo.svg) já contém a wordmark de Pedro.

Esta identidade não representa registro de marca ou aprovação institucional do HCFMUSP.
