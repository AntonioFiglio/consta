# Consta

![Consta](brand/logo/svg/consta-horizontal-on-ice.svg)

Consta transforma documentos de ativos hospitalares em planos de manutenção revisados e tarefas acompanhadas até a conclusão.

Projeto de hackathon no contexto do HCFMUSP. A documentação descreve a proposta; funcionalidades e resultados dependem de implementação e validação. Os cenários de demonstração são fictícios.

## Rastreamento de equipamentos

**Desenvolvimento óptico atual — V2:** [abrir demonstração](experiments/optical-tags/v2/index.html) · [método, testes e reprodução](experiments/optical-tags/v2/README.md) · [catálogo de 1.024 identidades](experiments/optical-tags/v2/catalog32.json). A óptica é o caminho principal desta etapa; perspectiva e oclusões parciais delimitadas agora são tratadas pelo detector. A bateria e a validação adversarial preservam também as falhas.

**Pesquisa atual — móveis em corredores e enfermarias:** [relatório comparativo EUA/Europa, identidade óptica e BLE](outputs/researchwrite/consta-optica-ble/exports/proposal_final.md) · [versão DOCX](outputs/researchwrite/consta-optica-ble/exports/proposal_final.docx) · [emulação óptica offline](experiments/optical-tags/index.html) · [prancha de IDs](experiments/optical-tags/overview.png).

A emulação lê pixels de cenas sintéticas, distingue uma família finita de tags circulares e expõe falhas de leitura. É um spike de pesquisa, não validação hospitalar ou implementação de produto aprovada. A recomendação de avaliar BLE/AoA por áreas é proposta, sujeita à seleção e aos ensaios do conjunto.

**Direção autoral:** [proposta de pesquisa com etiqueta passiva/óptica e alternativa acústica](docs/project/CONSTA_TECNOLOGIA_AUTORAL_PROPOSTA.md), [matriz de mecanismos por modalidade](docs/research/CONSTA_MATRIZ_INTERFERENCIA_POR_MODALIDADE.md) e [autoria, referências e propriedade intelectual](docs/research/CONSTA_AUTORALIDADE_REFERENCIAS_E_PI.md). Nenhuma alternativa foi escolhida como produto clínico validado.

[Proposta atual: etiquetas automáticas, sensores fixos e Consta na rede local sem internet](docs/project/CONSTA_RTLS_AUTOMATICO_LOCAL.md). Sem QR ou escaneamento para acompanhar movimentações.

Pesquisa aprofundada: [produtos comerciais e operação offline](docs/research/CONSTA_RTLS_COMERCIAL_REDE_LOCAL.md), [evidências de compatibilidade](docs/research/CONSTA_RTLS_EVIDENCIA_COMPATIBILIDADE.md) e [alternativa ultrassônica com receptores cabeados](docs/research/CONSTA_RTLS_ULTRASSOM_OPTICA_E_LIMITES.md).

Pesquisa dirigida com artigos originais e fontes oficiais: [tecnologias](docs/research/CONSTA_TECNOLOGIAS_RASTREAMENTO.md), [proposta óptica e componentes candidatos](docs/research/CONSTA_DISPOSITIVO_SEM_RF_PROPOSTA.md) e [interferência, exames e segurança](docs/research/CONSTA_EMC_EXAMES_E_SEGURANCA.md). A proposta não foi construída ou validada; ausência de rádio não comprova ausência de interferência.

## Identidade visual

[Galeria local e downloads](brand/index.html) · [Guia da marca](brand/README.md) · [Prancha visual](brand/brand-overview.png)

Cores: `#D3EFFF` e `#154F6F`, com preto e branco. Fonte: Manrope. Kit com símbolo, escrita, assinatura horizontal e vertical, em SVG com curvas e PNG.

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `brand/` | Identidade visual, fonte licenciada, SVGs, PNGs e galeria |
| `docs/project/` | Projeto consolidado, fontes, notas e instruções de continuidade |
| `docs/research/` | Pesquisa exploratória e referências |
| `data/` | Cenários exclusivamente simulados |
| `scripts/` | Gerador dos arquivos da marca |
| `archive/` | Pacote original de transferência, preservado localmente |

Comece pelo [projeto consolidado](docs/project/CONSTA_PROJETO_HACKATHON.md) e pelos [limites das alegações](docs/project/CONSTA_FONTES_E_LIMITES.md). Para continuar o trabalho, consulte [COMECE_AQUI_CODEX_CLI.md](docs/project/COMECE_AQUI_CODEX_CLI.md).

O arquivo `consta-logo.svg` na raiz é um atalho compatível com a primeira entrega, atualizado para o azul da identidade.
