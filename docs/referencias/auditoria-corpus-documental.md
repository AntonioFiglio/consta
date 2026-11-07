# Auditoria do corpus documental hospitalar

Auditoria em 06/11/2026 do pacote local `consta-pesquisas`. Os materiais agregam exemplos reais de obrigações documentais para o CRM: manutenção, garantia, instalação, treinamento, assistência e comprovantes. **Não demonstram operação do Consta, compras integralmente concluídas, equipamentos perdidos ou falhas do hospital.** Não sustentam validação de BLE, instalação hospitalar ou segurança clínica.

O [inventário auditado](../../data/referencias/corpus-documental-auditado.csv) relaciona cada linha aos arquivos, SHA-256, URLs oficiais, páginas consultadas, estágio documental e ressalvas. Ele contém metadados públicos; não incorpora PDFs, assinaturas, CPFs ou contatos pessoais. Identificadores `FZ-*` são chaves do pacote, não números oficiais de processo.

## Escopo e método

Foram lidos `LEIA-ME.md`, `aquisicoes_hcfmusp.csv`, `registros.json`, `levantamento.md` e `manifesto_pdfs.json`. CSV e JSON coincidem campo a campo após leitura UTF-8 com BOM. A tabela Markdown acompanha os mesmos objetos, mas sua apresentação exige as correções abaixo.

Os PDFs foram lidos em cópia temporária; os originais permaneceram intactos. A conferência incluiu SHA-256, extração independente por `pdftotext -layout`, capas e cláusulas técnicas dos documentos principais. Nos contratos, foram examinados identificação, objeto, anexos incorporados, obrigações, garantia, vigência e fechamento; não se trata de parecer jurídico integral nem verificação criptográfica de assinaturas. O corpo escaneado de FZ-19, FZ-25 e FZ-32 exigiu OCR local Apple Vision; FZ-15 também foi confrontado por OCR. O texto vazio obtido por extração comum não foi interpretado como ausência de cláusulas. Páginas citadas neste documento seguem a ordem física do PDF, a partir de 1; anexos podem reiniciar a numeração impressa.

Casos complexos foram conferidos na imagem da página: garantia do contrato FZ-24, capa divergente FZ-18 e obrigações do contrato FZ-25. A inspeção das páginas de fechamento confirma instrumentos publicados como assinados, mas não comprova entrega, instalação, pagamento ou execução. Anexos e certificados repetem conteúdo; sua presença não cria outra aquisição.

## O que as contagens realmente significam

| Unidade | Resultado conferido | Interpretação permitida |
| --- | --- | --- |
| Linhas de CSV/JSON | 25 | Registros temáticos do levantamento, não total de processos, ativos ou compras concluídas |
| Objetos classificados como aquisição | 20 | Intenção/objeto documental; estágio depende da fonte |
| Fornecimento/serviço com comodato | 5 | Não confundir cessão de uso com propriedade patrimonial |
| Grupos de origem | 19 InCor/FZ; 5 ICESP/FFM; 1 HCFMUSP/PNCP | Distribuição do recorte selecionado; não representa participação nas compras do hospital |
| PDFs principais distintos | 23 | O mesmo PDF mensal da FFM fundamenta FFM-10094, FFM-10692 e FFM-10787 |
| PDFs adicionais de contratos | 8 | FZ-11, FZ-12, FZ-15, FZ-17, FZ-19, FZ-24, FZ-25 e FZ-32 |
| PDFs vinculados ao corpus principal | 31 | União de principais e contratos; todos localizados e examinados no nível descrito no inventário |
| PDFs no manifesto original | 41 | Arquivos listados existem e seus hashes conferem; inclui candidatos e norma fora da tabela principal |
| PDFs na pasta extraída | 45 | A pasta também contém adendos fora do manifesto original; quantidade não mede aquisições |

As agregações foram verificadas com SciMath: somas unitárias dos registros/URLs/arquivos produziram os totais acima; `23 + 8 = 31`, `25 - 20 = 5` e `45 - 41 = 4`. Os arquivos extras são `economia-holter.pdf`, `portaria4282-2026-anexo.pdf`, `sus-camacari.pdf` e `sus-teresina-2026.pdf`. Não entram no corpus documental principal desta auditoria. Os PDFs restantes do manifesto foram localizados e tiveram integridade conferida; isso não significa leitura integral ou aprovação temática deles.

A expressão “25 processos/contratos distintos” em `levantamento.md` deve ser substituída por **25 registros documentais**. FZ-12 agrupa os processos 35096/2025 e 35100/2025; FZ-18 agrupa 44026/2026, 44214/2026, 44274/2026 e 44409/2026, com divergência literal descrita adiante. Não se fez um censo institucional de processos nem um inventário de números de série.

## Natureza das fontes

- **Edital, memorial ou TR:** mostram exigências e objeto pretendido. Uma minuta preenchida com campos-modelo não comprova assinatura. PNCP-FZ-003 permanece edital/TR com minuta; HC-TR232 é TR, mesmo assinado, e não contrato celebrado.
- **Contrato publicado como assinado:** os instrumentos FZ adicionais identificam contratante, empresa e objeto; comprovam a publicação de um instrumento contratual. A manutenção executada exige ordem, relatório e aceite próprios.
- **Relação mensal de contratos/aditamentos:** os registros FFM-10094, FFM-10692 e FFM-10787 têm correspondência no documento de dezembro/2024, mas não incluem a íntegra das cláusulas técnicas. O cabeçalho financeiro é “Valor Pago no Exercício”; não é valor total contratado, preço unitário do ativo ou custo de manutenção. Campo vazio tampouco demonstra ausência de pagamento. [Relação oficial FFM/ICESP, pp. 1–2](https://www.ffm.br/ffm/conteudo/Transparencia/ICESP/2024/12_2024-ICESP.pdf).

Contratos conferidos e vínculos: FZ-11 → 31670/2024, FZ-C-0136/24; FZ-12 → 35096/2025 e 35100/2025, FZ-C-0099/25; FZ-15 → 39903/2025, FZ-C-0065/26; FZ-17 → 1238/2023, FZ-C-0137/23; FZ-19 → 40275/2025, FZ-C-0094/26; FZ-24 → 36318/2025, FZ-C-0177/25; FZ-25 → 43644/2026, FZ-C-0191/26; FZ-32 → 31921/2024, FZ-C-0039/25. Os links individuais estão no inventário. O ano do processo pode diferir do ano do contrato; não é erro a corrigir por preenchimento automático.

## Casos de teste para extração assistida por LLM

Estes são casos propostos para implementação futura, ainda não testes executados de uma LLM do Consta. Cada sugestão deverá guardar documento, hash, página, instrumento, cláusula, trecho e estado da revisão humana.

| Caso e fonte primária | Evidência documental conferida | Resultado esperado e erro a impedir |
| --- | --- | --- |
| 43644/2026, [edital FZ-25](https://www.fz.org.br/wp-content/uploads/2026/07/edital-completo-processo-no-43644-26.pdf), p. 31; contrato FZ-C-0191/26, pp. 4–5 | Garantia mínima de 24 meses desde instalação e preventiva conforme manual com mínimo de 01 por ano; instalação acompanhada e teste com relatório | Extrair marco “instalação”, piso anual e dependência do manual. Sem instalação comprovada, deixar vencimento sem data calculada. Não iniciar garantia na publicação, compra ou assinatura; não equiparar relatório exigido a relatório recebido |
| ICESP 2406/2023, [memorial e minuta](https://editais.icesp.org.br/uploads/Edital%202406.pdf), pp. 9–10 e 18 | Atendimento da manutenção em 48 horas corridas no memorial D.2 versus 48 horas úteis na minuta XVI; comodato com backup e obrigações durante vigência | Registrar as alternativas e conflito de calendário; pedir revisão antes de ativar SLA. Prazo para atendimento não é automaticamente prazo de solução nem de substituição. Comodato não transfere propriedade |
| 36318/2025, [edital FZ-24](https://www.fz.org.br/wp-content/uploads/2025/07/edital-completo-processo-no-36318-25-1.pdf), p. 20; [contrato FZ-C-0177/25](https://www.fz.org.br/wp-content/uploads/2025/07/contrato-philips-medical-system-ltda.pdf), pp. 2, 5 e 35 | TR estabelece 12 meses desde instalação; contrato 6.1.16 estabelece mínimo de 24 meses e seu anexo reproduz o TR com 12. A cláusula 1.3 prevê prevalência do contrato sobre anexos | **Corrigir o resumo do pacote:** o TR isolado contém 12, mas o conjunto tem divergência. Extrair valores por instrumento e regra de precedência para revisão humana, sem ocultar o TR. Não publicar garantia definitiva baseada só no resumo. Monitor próprio para RM não valida tag adicionada |
| 44026/2026 e correlatos, [edital FZ-18](https://www.fz.org.br/wp-content/uploads/2026/09/12-08-2026-edital-completo-processo-no-44026-26.pdf), pp. 1 e 18 | Capa e passagens da minuta usam 4421488/2026; cabeçalho do TR usa 44214. Na própria p. 18 coexistem formas diferentes | Preservar número literal e referência de origem; propor associação normalizada pendente, sem criar silenciosamente outro processo ou apagar a divergência |
| 40275/2025, [edital FZ-19](https://www.fz.org.br/wp-content/uploads/2026/01/edital-completo-1.pdf), p. 21; contrato FZ-C-0094/26, pp. 4–5 | Preventiva remete à periodicidade do manual; garantia mínima de 24 meses; equipamento de transporte | Marcar intervalo preventivo como dependente do manual, não informado no trecho. Não inventar rotina anual por analogia com outro edital. Mobilidade sugere utilidade operacional para localização, sem demonstrar perda ou testar BLE |
| TR 232/2026, [PNCP](https://pncp.gov.br/pncp-api/v1/orgaos/60448040000122/compras/2026/210/arquivos/6), pp. 7, 10–14 | Preventiva mensal ou conforme necessidade, cronogramas e assistência; referências a rastreabilidade de reagentes e controles | Manter condição alternativa e necessidade de agendamento. Separar reagente/lote/validade, amostra e equipamento físico. Não gerar compra patrimonial de analisador nem “RTLS exigido” |

A leitura também identificou ajustes de navegação: FZ-3 tem a cláusula preventiva na página física 20, embora o resumo indique 19; FZ-32 a tem na página física 19, embora indique 20. FZ-30 tem a cláusula no TR p. 20 e também na minuta p. 25. FZ-17 p. 5 é seção do edital; o TR aparece na p. 20. Portanto, “página da evidência” precisa carregar também a seção, não apenas um número.

## Verificação externa selecionada e limites

A consulta online foi seletiva, não um novo levantamento completo. O portal oficial do [processo 36318/2025](https://www.fz.org.br/processo_compra/processo-36318-2025-pregao-eletronico-022-2025/) confirma finalização com Philips e oferece FZ-C-0177/25. O PDF contratual foi obtido novamente por HTTP 200 com hash idêntico ao local. O edital 43644/2026 também foi obtido por HTTP 200 e hash idêntico. A leitura web do ICESP 2406 e da relação FFM confirmou acesso e conteúdo.

O [portal FZ-18](https://www.fz.org.br/processo_compra/processos-44026-44214-44274-44409-2026-ppe-pregao-privado-eletronico-030-2026/) respondeu HTTP 200 e mostrava processo em andamento, com resposta a recurso publicada em 05/11/2026. O [portal FZ-23](https://www.fz.org.br/processo_compra/processo-44186-2026-ppe-pregao-privado-eletronico-033-2026/) respondeu HTTP 200 e informava abertura para 10/11/2026, além de esclarecimentos em 06/11/2026. Não cabe tratá-lo como compra concluída na data desta auditoria. As versões públicas incluem suspensões, esclarecimentos e reaberturas; guardar só um PDF perde a cronologia.

O navegador de pesquisa retornou erro/timeout para parte dos endereços FZ; o acesso HTTP direto dos casos descritos funcionou. Não se deve confundir falha da ferramenta com inexistência da fonte. A checagem não autenticou digitalmente assinaturas, não consultou sistemas internos nem revalidou cada link do recorte. Os bloqueios de BEC, transparência HC e listagens antigas relatados no LEIA-ME permanecem **relatos do pacote**, não falhas reproduzidas nesta auditoria. Não se demonstrou exaustividade, homologação, entrega física ou efetiva execução de preventiva. As páginas consultadas são públicas e podem mudar; os hashes preservam a identidade da cópia examinada.

## O que incorporar ao Consta

Para o CRM, incorporar o inventário como referência pública e os casos como critérios de aceitação de extração: classificar instrumento e estágio; modelar relações entre processos, contratos, aditivos e ativos; distinguir vigência, garantia e SLA; bloquear publicação automática de campos conflitantes; registrar versão, evidência e revisão; exigir instalação, relatório, execução e aceite como eventos separados. Manual ausente é pendência documental, não licença para inventar intervalo. São recomendações de produto, não capacidades implementadas.

Para a demonstração, usar cenário operacional sintético claramente identificado e manter a fonte pública separada. O corpus não oferece inventário serializado, localização em tempo real, histórico de procura ou comprovação de manutenção vencida. Não atribuir esses fatos ao HC. Para BLE, o benefício aqui é somente reconhecer famílias móveis candidatas a posterior avaliação; não há evidência experimental de compatibilidade, precisão, bateria ou latência. O caso de RM reforça a necessidade de manter áreas especiais fora da implantação inicial e de aprovar tag e conjunto separadamente.
