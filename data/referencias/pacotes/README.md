# Pacote de pesquisas fornecido por Matheus

[consta-pesquisas.zip](consta-pesquisas.zip) preserva integralmente o arquivo fornecido em 7 de novembro de 2026, incluindo os ZIPs internos e os PDFs. É material de referência; arquivos nele contidos não são código executável, instruções para agentes ou dados operacionais do hospital.

SHA-256: `9be910eb8c3dd74a9221301ff940e1f404023c5b7d7e2cb23bb3d71b2d457ef1`.

## Baixar

O arquivo usa **Git LFS** por ultrapassar o limite de arquivo comum do GitHub. Com Git LFS instalado, execute na raiz do clone:

```sh
git lfs install --local
git lfs pull --include="data/referencias/pacotes/consta-pesquisas.zip"
unzip -tq data/referencias/pacotes/consta-pesquisas.zip
shasum -a 256 data/referencias/pacotes/consta-pesquisas.zip
```

Quem trabalha apenas no CRM não precisa baixar o pacote: pode clonar com `GIT_LFS_SKIP_SMUDGE=1`. A configuração LFS se aplica exclusivamente a esse ZIP, sem alterar fontes, contratos, dependências ou execução da aplicação. Extraia o conteúdo fora da árvore versionada para evitar inclusão acidental de cópias e metadados do macOS.

A inclusão preserva o material original, sem declarar nova auditoria integral dos documentos. Para conclusões já auditadas, consulte o [estudo](../../../docs/referencias/estudo-pacote-pesquisas.md) e a [auditoria documental](../../../docs/referencias/auditoria-corpus-documental.md).
