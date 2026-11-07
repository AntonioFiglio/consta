# Modelo de domínio e dados

Modelo conceitual, ainda sem esquema de banco implementado. O [glossário](../../GLOSSARY.md) define os termos e os [fluxos](../produto/fluxos.md) definem o comportamento esperado.

A implementação local do CRM armazena nome, marca (`brand`) e modelo separadamente no ativo. A marca é opcional para compatibilidade com registros/documentos anteriores; dados ausentes ou conflitantes não são inferidos. O restante deste documento descreve o modelo conceitual do produto completo.

## Entidades e relações

| Entidade | Identidade e relações essenciais |
| --- | --- |
| Instituição | Limite de acesso de usuários, setores, ativos, documentos e eventos |
| Setor/local | Pertence à instituição; pode compor hierarquia; distingue local cadastrado e observado |
| Ativo | Unidade física; instituição, patrimônio/série quando disponíveis, marca, modelo, setor e responsáveis |
| Documento/versão | Arquivo privado, hash, origem, versão e vínculos com ativos ou contratos |
| Contrato | Fornecedor, vigência, condições e cobertura; vínculo explícito com cada ativo abrangido |
| Extração/campo | Valor, unidade, encontrado/ausente/conflitante, documento/versão, página, trecho e revisão |
| Plano/versão | Ativo, gatilho, periodicidade, marco, referências, aprovação e vigência |
| Tarefa | Ativo, versão do plano, ocorrência, prazo, responsável, janela e estado |
| Execução | Tarefa, autor, datas, relato, comprovantes e pendências |
| Liberação técnica | Ativo/intervenção, decisão e responsável autorizado; distinta do encerramento administrativo |
| Fornecedor | Cadastro e contatos com escopo de acesso separado |
| Tag/associação | Identidade da tag e vínculo com ativo em intervalo de validade |
| Receptor | Identidade, instituição, posição cadastrada, configuração e estado operacional |
| Observação | Evento de recepção, tag, receptor, horários, método/origem e medidas disponíveis |
| Localização estimada | Projeção por ativo com local provável, horário, método, qualidade e atualização |
| Auditoria | Autor/origem, ação, entidade, momento e referência da alteração |

## Invariantes para a implementação

- Toda leitura e escrita respeita instituição e autorização. Chaves e referências devem impedir vínculos entre instituições diferentes.
- Um ativo representa uma unidade física. Patrimônio/série ausentes devem ser visíveis; não criar uma identidade de ativo a partir de nome de modelo.
- Documento é versionado; hash ajuda a identificar duplicatas. Vincular o mesmo arquivo a ativos diferentes é distinto de criar arquivos duplicados. Registrar natureza e estágio: edital/TR, minuta, contrato publicado como assinado ou extrato não demonstram o mesmo fato; verificação jurídica/digital de assinatura é uma etapa distinta.
- Relações entre processo, contrato e arquivos não são necessariamente individuais: um documento pode agrupar processos e um extrato pode listar contratos diferentes. Garantia, vigência, SLA e periodicidade têm campos e evidências próprios; regra de precedência identificada não deve ocultar conflito entre instrumentos. Veja os [casos auditados](../../data/referencias/casos-avaliacao-extracao.json).
- Plano só fica operacional após aprovação registrada. Tarefas apontam para a versão que as originou; alterar o plano não reescreve o passado.
- Gerar a mesma ocorrência de manutenção repetidamente não cria tarefas extras. A chave da ocorrência deve ser definida e persistida junto da primeira implementação.
- Tarefas mantêm transições e motivos. Atraso deriva do prazo e dos registros de execução; não desaparece ao concluir.
- Associações de uma tag a ativos não se sobrepõem de modo ambíguo. Reassociação preserva início/fim; observação atrasada usa o vínculo válido no momento observado.
- Identidade anunciada por BLE não é prova criptográfica de autenticidade. Possibilidade de clonagem ou replay deve ser considerada no protocolo; localização não será usada como autorização de operação clínica.
- Repetição e reordenação de observações preservam histórico sem regredir a localização atual.
- Observação tem horário de recepção pelo receptor e de entrada no serviço. Relógio não confiável precisa ser indicado; não ordenar cegamente por data enviada.
- Localização não altera automaticamente disponibilidade, higiene, liberação técnica ou associação ao leito.

## Datas e prazos

Definir fuso da instituição, política de calendário e arredondamento de vencimentos ao implementar o motor de prazos. Intervalo em meses não deve ser convertido silenciosamente em quantidade fixa de dias. Fim de mês, anos bissextos, revisão de marco e obrigações por uso precisam de exemplos e testes próprios.

O upload não é marco de manutenção. Se o marco ou a periodicidade estiverem ausentes, apresentar pendência de revisão. Dado conflitante não é resolvido pela confiança declarada pela LLM.

## Dados financeiros

Valores precisam de moeda, natureza, período e documento de origem. Separar gastos evitados de capacidade de trabalho recuperada e capacidade operacional. Os [cenários existentes](../../data/README.md) são fictícios e não devem alimentar indicadores apresentados como reais.

## Ainda a decidir

Tipos e índices do banco, chaves de idempotência por operação, política de retenção, exclusão lógica, migrações, papéis/permissões e regras exatas de transição. Este modelo não substitui um esquema revisado nem autoriza coletar dados de pacientes.

## Implementação: ocorrências e contatos da manutenção

`Asset.breakdowns[]` guarda `id`, `reportedAt`, `scheduledDate` opcional e `resolvedAt` opcional no payload SQLite. Uma ocorrência aberta por unidade; reportar não altera contrato/planos, reagendar mantém o ID e encerrar preserva o registro. `PATCH /api/assets/:id/breakdown` valida ação/data e autorização da sessão. A consulta de eventos projeta reparos abertos agendados como `kind: corrective`, com ID distinto da preventiva, sem tabela duplicada de eventos.

`maintenanceCompany`, `maintenancePhone` e `maintenanceEmail` são extraídos com evidência por equipamento e persistidos no cadastro/cobertura. O histórico documental expõe os contatos da extração correspondente à unidade. Para identificação de quem atende, vale o vínculo de manutenção mais recente; contato ausente não volta ao valor de uma empresa anterior. Isso é uma regra de apresentação e contato, independente da aprovação e vigência da cobertura. O prestador não é inferido do fabricante, vendedor ou hospital. Oficina interna exige definição explícita.

## Resumo persistido por arquivo — implementação local

`contract_briefs` guarda a síntese do arquivo imutável, sem alterar seus vínculos ou planos. Estados: `pending`, `ready` e `failed`; origem `simulated` ou `ai`. A reserva tem token e horário; só o token ativo pode concluir a geração. Requisições concorrentes não geram duas sínteses. Falhas e reservas expiradas não são repetidas automaticamente. Resumo de simulação pode ser promovido uma vez para IA; resumo real pronto é reutilizado sem depender da configuração posterior do modelo. O hash registra o arquivo resumido. A migração aditiva para versão 5 preserva os cadastros e históricos existentes.

A fonte/página de cada ponto é sugestão do modelo, não citação verificada por um parser independente. A saída estruturada não comprova correção factual nem substitui revisão humana.
