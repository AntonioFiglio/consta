# CONSTA — Identidade Visual

A marca usa o nome em caixa alta **CONSTA** com um ponto final que muda de cor conforme o estado do equipamento. Fonte DM Mono weight 500. Sem símbolo — wordmark pura.

## Assinatura e mensagem do produto

**Assinatura padrão:** Gestão de ativos e manutenção hospitalar.

**Texto de apoio:** Documentos, equipamentos e prazos em um só lugar.

Use a assinatura na capa do pitch, no encerramento e no rodapé do CRM. O texto de apoio explica a proposta sem competir com a assinatura. Preserve a wordmark **CONSTA.**, as fontes e a paleta; a assinatura usa Inter, não a tipografia do logotipo.

A comunicação descreve cadastro, contratos e acompanhamento da manutenção. Ao falar de IA, explicite a conferência humana; ao falar de localização BLE, distinga a proposta e a demonstração simulada da integração física ainda não validada. Não prometa equipamentos sempre operacionais, previsão de falhas ou manutenção que se ativa sozinha.

A identidade original de Pedro usava “Seus equipamentos, sempre constando positivo.” Essa frase e suas alternativas foram substituídas nesta revisão de mensagem, a pedido de Matheus. “Clareza para cuidar do que importa”, usado no CRM, e “Ativos, documentos e manutenção”, usado na capa, deixam de ser assinaturas concorrentes.

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
| Wordmark | DM Mono | 500 | Apenas o logotipo |
| Títulos | Inter | 600 | Páginas, diálogos e seções |
| Interface | Inter | 400/500/600 | Texto, campos, tabelas, datas e códigos |
| Arquivo técnico | DM Mono | 400 | Texto original na prévia TXT |

### Padrão visual da aplicação

Os [tokens compartilhados](tokens.css) são a fonte dos estilos do CRM. Use Inter em todas as telas e controles; datas, contagens e números de tombamento usam a mesma família com algarismos tabulares. DM Mono fica restrita à wordmark e à leitura de arquivos técnicos. As fontes do CRM são empacotadas localmente.

| Papel | Tamanho padrão | Peso |
| --- | --- | --- |
| Título de página | 24 px | 600 |
| Título de diálogo | 20 px | 600 |
| Título de seção | 16 px | 600 |
| Corpo, campos e navegação | 14 px | 400/500 |
| Rótulos e ações compactas | 13 px | 500/600 |
| Metadados e calendário | 12 px | 400/500 |

Os tamanhos são definidos em `rem`, respeitando o tamanho de texto configurado no navegador. Evite textos abaixo de 12 px, inclusive em telas pequenas. Use entrelinha de 1,6 para leitura e 1,35 para títulos; reserve 1,8 para texto documental extenso. O peso 600 estabelece hierarquia sem espalhar negrito pelo corpo.

Use texto principal `--consta-text-primary` e secundário `--consta-text-secondary` sobre fundos claros. O laranja da marca continua em acentos e seleção; botões de ação usam o tom mais escuro `--consta-action`, com texto branco legível. Vermelho e demais cores semânticas continuam associados a rótulos explícitos.

Mantenha superfícies claras, bordas discretas e sombra apenas onde ajuda a distinguir sobreposições. Use raios de 4 px para detalhes, 8 px para campos/botões/cards e 12 px para diálogos. O espaçamento segue múltiplos de 4 px, com 16–24 px entre blocos e 24 px no conteúdo dos diálogos. Os tokens de espaço não substituem medidas específicas de grades e posicionamento.

Controles comuns têm altura mínima de 40 px; ações compactas podem usar 32 px. Preserve foco visível por teclado, estados selecionados, rótulos de status e rolagem interna das tabelas e leitores. Em telas pequenas, reorganize ou permita rolagem do conteúdo em vez de reduzir a fonte. Não adicione cards, efeitos ou novos controles quando texto e as ações existentes resolverem a tarefa.

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
