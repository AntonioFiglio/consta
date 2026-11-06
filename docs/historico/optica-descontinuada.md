# Etiqueta óptica — descontinuada

**Fora do produto e do backlog ativos.** Não há detector óptico, catálogo de marcadores, galeria ou benchmark para executar na árvore atual. A direção vigente é [BLE para ativos móveis](../adr/0001-rastreamento-ble.md).

## O que foi explorado

Foram criados marcadores visuais individuais, detectores em Python, cenas sintéticas e revisões adversariais. A versão final explorava correção de perspectiva e oclusões delimitadas. Os testes também preservavam rejeições em condições difíceis.

Esse trabalho demonstrou comportamentos de software em imagens geradas, não leitura em hospital, funcionamento de câmeras reais, ausência de interferência ou viabilidade de cobertura. Oclusão, orientação e necessidade de visibilidade foram limitações relevantes para a proposta.

## O que saiu da árvore atual

- `experiments/optical-tags/`: código, catálogos, imagens, galerias, replays e benchmarks.
- `outputs/researchwrite/consta-optica-ble/`: rascunhos, relatórios de revisão e exportações da comparação histórica.
- Documentos de `docs/project/` e `docs/research/` que apresentavam caminhos de arquitetura superados. As fontes úteis foram consolidadas em [referências](../referencias/README.md).

Nenhum desses materiais é dependência do CRM, dos contratos ou do hardware BLE.

## Consulta histórica

O último estado completo anterior à reorganização está no commit **`057add0c05d835680769a3c1aa9e0a3747f15030`**. Consulte sem restaurar arquivos sobre a árvore atual:

```sh
git show 057add0:experiments/optical-tags/v2/README.md
git show 057add0:docs/project/CONSTA_PROJETO_HACKATHON.md
git log --all -- experiments/optical-tags
```

Também é possível navegar pela [árvore histórica no GitHub](https://github.com/matheusbgodoi/consta/tree/057add0c05d835680769a3c1aa9e0a3747f15030/experiments/optical-tags). Documentos dessa revisão podem conter recomendações já superadas. Reintroduzir a óptica exigiria nova decisão explícita; não é uma alternativa ativa esperando implementação.

O pacote original de transferência em `archive/` permanece preservado localmente e ignorado pelo Git. A reorganização não altera esse material de origem.
