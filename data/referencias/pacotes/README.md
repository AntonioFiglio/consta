# Pacote de pesquisas fornecido por Matheus

[consta-pesquisas.zip](consta-pesquisas.zip) é o pacote vigente, atualizado a partir da pasta `CONSTA-pesquisas-hackathon` fornecida por Matheus em 7 de novembro de 2026. Substitui o ZIP anterior no mesmo caminho, agora com PDFs organizados e nomes descritivos, contratos de manutenção com série/patrimônio e materiais auxiliares. A estrutura interna usa a raiz `CONSTA-pesquisas-hackathon/`; scripts que extraíam os ZIPs internos da versão anterior precisam ajustar seus caminhos.

SHA-256: `06b0263db6b02425273309229effc9a105d1c6c2a59076495bbeddeb092ef3c3`.

O conteúdo fornecido foi preservado, exceto metadados do macOS (`.DS_Store` e `._*`). A versão anterior permanece no histórico Git/LFS. O [manifesto atual](manifesto-atual.json) identifica cada arquivo por SHA-256 e registra os nomes anteriores quando o conteúdo é idêntico. O [manifesto anterior](../manifesto-pacote-pesquisas.json) continua válido para a auditoria histórica; não foi sobrescrito.

## Encontrar documentos

| Pasta interna | Conteúdo |
| --- | --- |
| `01-contratos-manutencao-com-serie-patrimonio/` | Contratos, aditivo e termos de referência com identificação dos equipamentos |
| `02-contratos-aquisicao-InCor/` | Contratos de aquisição antes presentes no pacote anterior |
| `03-editais-e-termos-de-referencia/` | Editais, TRs e relação de contratos |
| `04-normas-e-tabelas-SUS/` | Normas e tabelas de referência |
| `05-planilhas-e-relatorios/` | Levantamentos, custos e referências de rastreabilidade |
| `06-textos-extraidos-e-auxiliares/` | Textos extraídos e registros auxiliares da pesquisa |

O [índice de manutenção com caminhos atuais](indice-manutencao.csv) relaciona os nomes do índice original aos PDFs efetivamente presentes, preservando as URLs e classificações fornecidas. O índice original dentro do ZIP usa nomes de download antigos e inclui também uma referência ao contrato de aquisição FZ-19; essa linha foi mapeada para a pasta de aquisições, sem tratá-la como contrato de manutenção com série.

Os PDFs de manutenção foram submetidos a extração textual independente: foi conferida a presença de série/patrimônio nos trechos de identificação. Isso não é um inventário completo dos equipamentos nem avaliação integral de cláusulas, assinatura ou vigência. As URLs públicas constam no índice fornecido; não houve nova conferência online de todos os documentos. Identificadores públicos reais servem à avaliação documental; a demonstração operacional continua com dados sintéticos.

## Baixar

O arquivo permanece em **Git LFS**, como a versão anterior. Com Git LFS instalado, atualize a branch com as mudanças da equipe e execute na raiz do clone:

```sh
git lfs install --local
git lfs pull --include="data/referencias/pacotes/consta-pesquisas.zip"
unzip -tq data/referencias/pacotes/consta-pesquisas.zip
shasum -a 256 data/referencias/pacotes/consta-pesquisas.zip
```

Quem trabalha apenas no CRM não precisa baixar o pacote: pode clonar com `GIT_LFS_SKIP_SMUDGE=1`. A configuração LFS se aplica exclusivamente a esse ZIP, sem alterar fontes, contratos, dependências ou execução da aplicação. Extraia o conteúdo fora da árvore versionada para evitar inclusão acidental de cópias e metadados do macOS.

Os relatórios originais do pacote são fontes de pesquisa e podem conter resumos já corrigidos na auditoria, como a divergência de garantia no FZ-24. Para conclusões já auditadas, consulte o [estudo](../../../docs/referencias/estudo-pacote-pesquisas.md) e a [auditoria documental](../../../docs/referencias/auditoria-corpus-documental.md). O novo material não substitui silenciosamente essas correções.
