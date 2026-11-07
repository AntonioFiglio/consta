# Contratos reais para avaliação do CRM

O [ZIP vigente](consta-pesquisas.zip) substitui o pacote anterior e deriva da pasta `CONSTA-pesquisas-hackathon` fornecida por Matheus em 07/11/2026. Inclui os novos dossiês por contrato e o recorte HCFMUSP. Os originais permanecem intactos em Downloads; esta distribuição pública é curada, não uma cópia integral da pasta.

## O que foi preparado

- PDFs textuais, textos e índices auxiliares com nomes e organização de origem.
- Cópias com CPFs-alvo ocultados irreversivelmente no PDF e nos textos auxiliares. Séries e patrimônios não são tratados como CPF. PDFs alterados são derivados para teste: não conservam a validade da assinatura digital do original.
- Plantas internas, metadados ocultos, `_raw`, pacotes aninhados e formatos auxiliares ficaram fora. PDFs com página de imagem sem texto foram retidos na origem para revisão local, em vez de serem publicados sem triagem.

O [manifesto vigente](manifesto-atual.json) registra incluídos/excluídos, motivo, hash original e hash do derivado público. Os hashes e números nos índices internos recebidos correspondem à coleta original; não substituem este manifesto nem são gabarito de extração. O mascaramento é uma precaução automatizada específica, não auditoria integral de dados pessoais ou validade jurídica de todo o corpus.

## Documento recomendado para o primeiro ensaio

Há também um [PDF direto para o primeiro teste](../casos/hcfmusp-05-2026/README.md), sem precisar baixar todo o ZIP.

Dentro do ZIP:

`CONSTA-pesquisas-hackathon/08-hospital-unico-HCFMUSP/01-contratos-por-numero/2026_CONTRATO-00005_PNCP-40/001_CONTRATO_Contrato-00005-2026.pdf`

Contrato HCFMUSP **05/2026**, manutenção de **cinco autoclaves**. A página física 2 individualiza TAG, série, patrimônio, modelo e fabricante. A [auditoria seletiva](../../../docs/referencias/novos-contratos-demo-2026-11-07.md) conferiu a tabela visualmente e o original contra o [PDF oficial do PNCP](https://pncp.gov.br/pncp-api/v1/orgaos/60448040000122/contratos/2026/40/arquivos/1). O TXT auxiliar perde um modelo: use o PDF para o ensaio.

Não inventar a data inicial da vigência: ela depende do termo de início. Não foi encontrada periodicidade preventiva explícita nesse contrato; a palavra “PERIODICIDADE” em formulário de avaliação não autoriza criar calendário semestral/trimestral. As autoclaves sustentam o caso de cadastro, não uma demonstração de BLE em ativos móveis.

Outro caso simples: `07-dossies-por-contrato/FHEMIG-Barbacena_contrato-9519080-2026/03_CONTRATO_2026-08-04.pdf`, com identidade de um ultrassom.

## Usar no CRM

Baixe o LFS, extraia fora da árvore versionada e envie o PDF pelo cadastro do CRM. Não importe todas as linhas das planilhas como ativos: há extrações heurísticas, duplicações e colunas deslocadas. Conferir cada equipamento contra o PDF. Nenhuma execução real da LLM é demonstrada por disponibilizar este pacote.

```sh
git lfs pull --include="data/referencias/pacotes/consta-pesquisas.zip"
unzip -tq data/referencias/pacotes/consta-pesquisas.zip
unzip data/referencias/pacotes/consta-pesquisas.zip -d /tmp/consta-corpus-crm
```

Para medir ganhos, use tarefas equivalentes: os mesmos documentos e campos, tempo completo incluindo conferência/correções e número de equipamentos aceitos. Não existe baseline brasileiro recente comparável que autorize um multiplicador de velocidade sem medição própria.

O ZIP segue em Git LFS. A versão anterior e os manifestos históricos permanecem no Git/LFS para rastrear as auditorias anteriores; não são o pacote vigente para novos testes. Não foi alterado o banco de dados do CRM nem executado upload a um provedor externo de IA nesta preparação.
