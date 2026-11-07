# Auditoria dos campos da demo — HCFMUSP 05/2026

Fonte: PDF público tratado `data/referencias/casos/hcfmusp-05-2026/contrato-05-2026-autoclaves-publico.pdf`, texto extraído com pdftotext e gabarito visual existente. A tabela de equipamentos está na página física2; a contratada está na página1. A resposta continua preparada manualmente, sem execução de IA externa.

## Campos já corretos

Nome Autoclave, tombamento, número de série com zeros preservados, modelo e fabricante das cinco unidades. Cada linha corresponde à identidade individualizada na tabela da página2. Não se deve colocar quantidade5 em cada ficha.

## Lacunas da fixture corrigidas

- Empresa responsável pela manutenção: **PHOENIX LUFERCO LTDA**, qualificada como CONTRATADO na página1. O objeto da mesma página inclui assistência técnica e manutenção das autoclaves.
- Observações de cada unidade: sua TAG documental e **Instituto ICHC**, ambos na tabela da página2; vigência de cinco anos contados do termo de início, conforme cláusula2.1 na página2, sem atribuir data de início.

TAG documental não foi tratada como tag Bluetooth. Instituto não foi lançado como setor/localização operacional. Os novos campos foram realmente preenchidos pela resposta mock nas rotas do CRM, conferidos na UI e persistidos no SQLite em memória; o arquivo capture-result.json registra empresa e notas de cada ativo. Não houve montagem de campos de imagem. Os snapshots agora incluem as abas reais Identificação e Contrato; a timeline as mostra antes de salvar.

## Campos que permanecem vazios por falta de evidência

Periodicidade preventiva, primeira manutenção, data/marco inicial, início/fim calendários da vigência, setor específico, telefone e e-mail de manutenção. O PDF não traz contato técnico nessas formas. Valores mensais do contrato não representam frequência de preventiva. Datas de assinatura não equivalem ao termo de início. A palavra PERIODICIDADE aparece no formulário de avaliação do serviço, sem definir intervalo preventivo.

Portanto, “todos os campos disponíveis no documento preenchidos” é defensável como descrição da simulação enriquecida. “Todos os campos obrigatórios completos”, calendário pronto ou ausência de revisão humana não são demonstrados por esse contrato.

## Dez segundos

Não há benchmark real documentado. `pitch/data/ensaio-cadastro.csv` contém somente cabeçalho; `pitch/experimento-cadastro.md` registra ensaio ainda não executado. A duração visual é coreografia acelerada, sem latência de provedor. Não equivale a tempo medido de cadastro com extração real, revisão, correções e salvamento. Se houver frase10s, deve ser identificada como duração da demonstração ou hipótese/meta a medir, sem comparação percentual/economia inventada.

## Preservação

Versão anterior preservada em `pitch/demo/native/baseline/`: fixture, snapshots, resultado e script gerador. Versão enriquecida mantém fonte reproduzível em capture-dom.mts, snapshots.json, fixture-extraction-v2.json e bundle crm-dom.js. A API usada é `:memory:` e não acessa banco/configuração pessoal.
