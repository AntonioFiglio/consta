# Implementação local — documentos, equipamentos e manutenção

**Status: especificação consolidada para aprovação. Atualizada em 07/11/2026. Nenhuma funcionalidade deste roteiro foi implementada nesta entrega documental.**

## Goal

Permitir que a equipe envie um grande conjunto de PDFs desorganizados em pacotes compactados, acompanhe seu processamento local e obtenha contratos correlacionados, a quantidade correta de equipamentos e previsões contratuais de manutenção rastreáveis no calendário e no dashboard, com revisão humana e uso de IA restrito às interpretações que as ferramentas locais não resolverem.

O objetivo desta etapa é especificar e estudar a implementação. Construir o fluxo no produto permanece dependente de aprovação. Manter React/Vite, Express, SQLite e a configuração existente do SDK; não incluir deploy nem novos serviços externos.

## Documento principal e leitura de apoio

Este README é o ponto de entrada e a referência das decisões consolidadas. O envio compactado substitui a proposta anterior de uploads individuais no novo fluxo de lote; o cadastro individual existente permanece disponível. Não alterar contratos de manutenção, datas ou equipamentos por simples resultado de IA.

| Documento | Detalhamento |
| --- | --- |
| [Plano completo](../produto/plano-implementacao-documentos-em-lote-e-manutencao.md) | Domínio, ferramentas, prompt, regras, migrações e etapas |
| [Estudo de impacto](../desenvolvimento/estudo-impacto-documentos-em-lote-e-manutencao.md) | Evidências no código, arquivos afetados, incompatibilidades e validação da base |
| [Frontend: copy e progresso](../produto/experiencia-importacao-em-lote-copy-e-progresso.md) | Diálogo, duas entradas, acompanhamento, estados, acessibilidade e componentes |

## Copy aprovada como direção

Os dois botões globais — lateral e cabeçalho de Contratos — e o título do diálogo usam **Enviar documentos**.

O único texto explicativo inicial é:

> Envie TCs, contratos de manutenção, termos aditivos e anexos juntos.

Área de seleção: **Selecione ou arraste seus PDFs.** Exibir formatos/limites efetivos e a quantidade selecionada. A confirmação mostra **Enviar 1 arquivo** ou **Enviar 100 arquivos**, conforme a seleção válida. A ação de Equipamentos continua sendo **Novo equipamento**.

Não expor compactação, regex, tokens, OCR, filas ou ferramentas na explicação inicial. Orientações de erro, revisão ou dado faltante aparecem quando forem necessárias à ação da pessoa.

## Fluxo esperado de ponta a ponta

1. **Selecionar:** abrir o diálogo pelos dois botões e escolher os PDFs juntos, sem organizar nomes ou grupos previamente.
2. **Preparar:** validar arquivos e gerar manifesto com ID estável, nome, tamanho e hash de cada original. Compactar no navegador, em rotina fora da thread da interface, um ou mais pacotes ZIP com limites definidos.
3. **Enviar:** criar lote, enviar pacotes com concorrência limitada e acompanhar confirmações reais. Reenviar um pacote não duplica documentos.
4. **Descompactar:** backend recebe o pacote, verifica integridade, extrai para área temporária privada e valida os PDFs originais antes de persistir os itens e agendar análise.
5. **Processar:** extrair/indexar texto por página, aplicar OCR seletivo e buscar identificadores, datas, cláusulas e remissões com ferramentas locais; usar IA somente quando necessária.
6. **Correlacionar:** propor contratos principais, manutenção, aditivos, anexos e referências cruzadas, com evidências e ambiguidades explícitas.
7. **Conferir equipamentos:** reconhecer os já existentes e criar/vincular o conjunto confirmado com a quantidade correta, sem multiplicar itens por número de documentos.
8. **Revisar manutenção:** confirmar regras, escopo, instalação/data-base, primeira ocorrência, periodicidade e cobertura. Dados faltantes geram pendência.
9. **Aprovar:** salvar versões dos planos selecionados e calcular suas previsões por código. Publicar no calendário e dashboard o resultado aprovado.
10. **Atualizar:** um documento posterior gera proposta de revisão, preservando fontes, decisões, unidades e histórico.

## Transporte compactado

### Preparação no frontend

- A pessoa seleciona PDFs; o frontend produz ZIP internamente. Não exigir que ela prepare arquivos compactados nem aceitar ZIP arbitrário como entrada de seleção nesta primeira versão.
- Agrupar por limite de bytes e quantidade de entradas, não por número fixo de PDFs. Cem arquivos podem exigir vários pacotes; não criar obrigatoriamente um ZIP gigante em memória.
- Usar Web Worker e biblioteca a selecionar por prova técnica, com processamento incremental e memória limitada. Medir também o custo do hash e da compactação no navegador.
- Preservar bytes dos PDFs; não recomprimir imagens, reduzir resolução ou reescrever documentos. A identidade do original deve sobreviver ao transporte.
- PDFs frequentemente já contêm conteúdo comprimido: não prometer redução de tamanho. A biblioteca pode armazenar entradas sem deflate quando isso evitar expansão/custo excessivo; o transporte continua sendo um pacote ZIP.
- Atribuir nomes de entrada técnicos e únicos; preservar o nome original como metadado. Dois PDFs chamados `contrato.pdf` não podem sobrescrever um ao outro.
- Manifesto versionado vincula lote, pacote, item, nome original, tamanho e hash. O backend valida seus valores; não confia no manifesto para impor limites.
- Persistir o manifesto no lote; manter arquivos locais em memória até confirmação. Após recarga do navegador, pacotes não confirmados podem exigir selecionar novamente os originais e recompor o pacote com IDs do manifesto.

### Recepção e descompactação no backend

- Criar rota específica para pacotes. Não elevar simplesmente o limite do `multer.memoryStorage` atual para acomodar todo o lote.
- Receber em streaming com limite para arquivo compactado e área temporária privada, sem carregar o ZIP inteiro em RAM.
- Validar contagem de entradas, bytes descompactados por item/pacote/lote, caminhos, tempo e espaço disponível. Medir os bytes efetivamente extraídos, mesmo quando o cabeçalho informa outro tamanho.
- Recusar entradas com caminhos absolutos, `..`, links, arquivos criptografados, ZIPs aninhados e entradas incompatíveis com o manifesto. Esses limites evitam sobrescrita de arquivos e descompactação sem limite.
- Validar hash e conteúdo de cada PDF; CRC do ZIP não substitui SHA-256 dos originais. Derivar identificação e tipo no servidor.
- Marcar pacote confirmado somente após extração/validação completa e persistência transacional dos seus itens. Falha de integridade ou validação não deixa o pacote parcialmente importado; outros pacotes confirmados permanecem salvos.
- Chave única por lote/pacote e identidade por hash/item garantem reenvio idempotente. Duas requisições simultâneas do mesmo pacote não gravam duas vezes.
- Liberar temporários após confirmação/erro e recuperar operações interrompidas após reinício. Não remover arquivos referenciados por trabalhos ativos.
- Selar o lote após conferir todos os pacotes e itens do manifesto. Por padrão, iniciar a análise após descompactar e confirmar o conjunto. Exclusões para continuar parcialmente precisam de decisão explícita e ficam visíveis na revisão.

A compactação otimiza o transporte e pode reduzir requisições. A redução de tokens é uma estratégia separada, descrita abaixo. Tamanho máximo por PDF, pacote, lote, número de arquivos e orçamento de descompactação devem ser configuráveis e validados antes de anunciar capacidade de 100 PDFs.

## Ferramentas e economia de IA

Executar no backend, sem rodada de IA: hashes e cache, texto por página, OCR necessário, índice/busca, regex registrada, validação de datas, extração de identificadores, seleção de candidatos, verificação de evidências, expansão de unidades e cálculo do calendário.

Usar as ferramentas propostas no plano: `extract_document_pages`, `search_document_evidence`, `read_document_context`, `extract_contract_identifiers`, `match_document_candidates`, `extract_installation_candidates`, `extract_maintenance_candidates`, `validate_evidence_references`, `validate_plan_requirements` e `preview_maintenance_schedule`.

As ferramentas alimentam candidatos com referência ao documento/página/trecho. Um caso inequívoco chega à revisão sem chamar IA. Um caso ambíguo recebe contexto adicional limitado; somente então o SDK interpreta os trechos relevantes. O modelo não recebe o ZIP nem o lote inteiro por padrão.

Cache por hash e versões de extrator/OCR/regras/prompt; orçamento por item e lote; retomada apenas da etapa afetada; reavaliação apenas de grupos atingidos por documento novo. Busca incompleta não comprova ausência de regra. Nenhuma otimização pode eliminar condições, negações ou anexos necessários.

Medir chamadas, tokens reportados, tamanho dos contextos, duração, memória, acertos e omissões contra gabarito. Não prometer porcentagem de economia antes do ensaio.

## Correlação, quantidade e consistência

Tratar separadamente **arquivos**, **instrumentos documentais**, **equipamentos físicos**, **serviços** e **ocorrências**. Cem PDFs não significam cem contratos ou cem equipamentos.

- Extrair série/patrimônio e escopo por documento; vincular ocorrências documentais da mesma unidade sem criar outra ficha.
- Quantidade explícita gera unidades provisórias somente quando representa equipamentos, preservando a expansão local existente. A soma não pode incluir novamente um total repetido em aditivo ou anexo.
- Sem identificadores individuais, não somar nem fundir grupos parecidos automaticamente. A proposta deve mostrar quantidade, origem e possível sobreposição para confirmação.
- Após a revisão, associar cada unidade a uma origem canônica estável. IDs de pacote e posição na lista de PDFs não são identidade física do equipamento.
- TC principal, contrato de manutenção, aditivo e anexo são documentos relacionados; um contrato pode abranger várias unidades e um serviço pode abranger unidades de vários TCs.
- Um aditivo pode alterar preço, prazo, quantidade ou regra; não aplicar indiscriminadamente ao grupo inteiro.
- Vínculo documental não comprova cobertura, execução ou instalação. Data de compra, assinatura ou entrega não vira instalação automaticamente.
- Inspeção mensal e preventiva semestral são serviços independentes. Calendário, próxima manutenção e dashboard devem consumir o mesmo cálculo; IDs de ocorrências incluem equipamento, serviço e versão.

Ao confirmar equipamentos, salvar criação/vínculos de maneira transacional e idempotente. Ao aprovar planos, publicar apenas regras completas e resolver o impacto sobre previsões futuras. Inventário, árvore documental, agenda e totais devem ser consultados da versão persistida; resposta antiga de processamento não pode sobrescrever revisão mais recente.

## Progresso no frontend

Manter a interface curta e informativa:

| Etapa | Exemplo de texto | Medição |
| --- | --- | --- |
| Preparar | Preparando 100 arquivos | Entradas/pacotes concluídos; indeterminado se não houver total confiável |
| Enviar | Enviando documentos | Pacotes confirmados; bytes apenas se medidos por adaptador de upload |
| Abrir pacote | Recebendo documentos | PDFs extraídos, validados e persistidos, com total do manifesto |
| Analisar | 62 de 100 arquivos analisados | Itens com análise completa, sem contar falhas como sucesso |
| Relacionar | Organizando documentos | Etapa persistida; atividade indeterminada sem denominador confiável |
| Revisar | Pronto para conferir | Resultados e pendências persistidos |

Uma confirmação de transferência não significa que todos os PDFs foram extraídos ou analisados. Mostrar falhas de preparação, upload, descompactação e análise com ações distintas. Revisão parcial identifica os arquivos ausentes. O usuário pode deixar a página após a recepção; o processamento continua enquanto o servidor local executa.

## Impacto adicional em arquivos

Os mapas completos estão no estudo e na especificação do frontend. O transporte compactado acrescenta estas responsabilidades propostas em `apps/crm/`:

| Arquivo | Mudança |
| --- | --- |
| Novo `src/document-package.worker.ts` | Preparar hashes/manifesto/pacotes sem bloquear a interface |
| Novo `src/document-package.ts` | Particionamento, limites e contrato de transporte |
| Novo `src/useDocumentUpload.ts` | Ciclo de preparação, envio e confirmação por pacote |
| Novo `server/document-packages.ts` | Recepção temporária, descompactação limitada, integridade e confirmação |
| `server/document-routes.ts`, `server/document-store.ts` e `server/document-jobs.ts` propostos | Estado de pacotes, selamento, reservas e recuperação |
| Tipos compartilhados propostos | Manifesto versionado, pacote, confirmações e falhas |
| `package.json` e lockfile | Biblioteca de ZIP/streaming e PDF/OCR após prova técnica; nenhuma instalada nesta etapa |

## Etapas e critérios de conclusão

1. Aprovar a especificação unificada e selecionar dependências por prova local.
2. Validar extração de evidências e ferramentas determinísticas em corpus com gabarito.
3. Entregar compactação/transporte/extração, fila e retomada com migrações seguras.
4. Entregar organização de documentos e revisão de equipamentos/quantidades.
5. Entregar planos versionados, aprovação e integração com calendário/dashboard.
6. Ensaiar lotes de 50/100 PDFs e registrar limites reais de volume, memória, latência e custo.

Critérios observáveis:

- Os dois botões abrem o mesmo diálogo com a copy curta definida acima.
- Grande seleção não bloqueia a interface; o original mantém seu hash após ZIP/descompactação.
- Pacote inválido não produz importação parcial silenciosa. Reenvio/reinício não duplicam arquivos, equipamentos, vínculos ou previsões.
- Testar nomes iguais, arquivos duplicados, pacotes fora de ordem, hash divergente, interrupção, limites e entradas malformadas.
- Corpus com uma aquisição de seis unidades repetida em TC/aditivo/anexo resulta em seis unidades, com pendências quando as fontes não permitem concluir que são as mesmas.
- Caso inequívoco chega à revisão sem IA; caso ambíguo preserva contexto/evidência e pendência.
- Marco e periodicidade completos geram as datas esperadas; marco desconhecido não cria evento fictício.
- Dashboard, ficha e calendário coincidem por equipamento/serviço/período e preservam reparos existentes.
- A validação cobre múltiplos serviços no mesmo dia, aditivo parcial, vigências e revisão concorrente.

## Limites da entrega atual

Foram atualizados documentos e estudos. Não houve implementação, instalação de dependências, migração de banco, envio de documentos ao provedor nem medição de economia de tokens ou taxa de compressão. O [estado atual](../estado-atual.md) continua sendo a referência para capacidades existentes.
