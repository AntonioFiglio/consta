# Metadados públicos de pesquisa

Esta pasta reúne referências auditadas, distintas dos [cenários financeiros fictícios](../CONSTA_CENARIOS_SIMULADOS.csv). Ela não contém inventário operacional do HC, documentos internos, dados de pacientes ou resultados do Consta.

| Arquivo | Uso e limite |
| --- | --- |
| [corpus-documental-auditado.csv](corpus-documental-auditado.csv) | Metadados públicos do levantamento: natureza dos documentos, URLs, hashes, páginas e ressalvas. Uma linha não equivale a compra concluída, processo único ou equipamento individual |
| [manifesto-pacote-pesquisas.json](manifesto-pacote-pesquisas.json) | Identidade dos ZIPs fornecidos e dos PDFs presentes no pacote, sem publicar suas cópias integrais. Hash verifica identidade, não assinatura ou validade jurídica |
| [casos-avaliacao-extracao.json](casos-avaliacao-extracao.json) | Casos propostos para futura avaliação de extração/revisão. Referências e saídas esperadas revisadas documentalmente; nenhuma execução de LLM foi realizada |

Os PDFs e textos de origem foram lidos em uma cópia de trabalho, mantendo os originais fornecidos por Matheus. O manifesto permite conferir a mesma versão a partir do pacote local e das URLs públicas do inventário. PDFs baixados posteriormente podem mudar de hash; isso exige nova conferência e não invalida automaticamente a cópia anterior.

As conclusões e a abrangência real das leituras estão na [auditoria documental](../../docs/referencias/auditoria-corpus-documental.md). Consulte a [síntese do pacote](../../docs/referencias/estudo-pacote-pesquisas.md) antes de reutilizar as tabelas no pitch.
