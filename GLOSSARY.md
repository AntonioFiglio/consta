# Glossário do Consta

Vocabulário do produto e da engenharia clínica. As regras de implementação ficam na documentação de arquitetura.

## Gestão e manutenção

**Ativo:** unidade física individual administrada pelo hospital, identificada por cadastro, patrimônio ou número de série. Modelo ou lote não equivale a um ativo.

**Instituição:** organização responsável por um conjunto de ativos, pessoas, documentos e permissões.

**Setor/local:** área identificada da instituição, como enfermaria, corredor ou sala. O local cadastrado de um ativo pode diferir do local observado.

**Cobertura contratual:** serviços, condições e período abrangidos por um contrato para os ativos vinculados. Cobertura não comprova execução.

**Plano de manutenção:** conjunto revisado de obrigações, procedimentos, gatilhos e referências aplicáveis a um ativo.

**Marco inicial:** acontecimento ou data a partir do qual se calcula uma obrigação. O envio de um documento não define esse marco.

**Tarefa de manutenção:** ocorrência concreta de trabalho, com ativo, plano de origem, prazo, responsável e estado de execução.

**Janela:** período acordado com o setor para executar uma intervenção ou recolher um ativo.

**Evidência documental:** página, trecho e versão de um documento que sustentam um dado extraído.

**Comprovante de execução:** registro que sustenta a realização de uma tarefa; é distinto da evidência usada para criar o plano.

**Liberação técnica:** decisão registrada pelo responsável autorizado sobre a condição técnica de um ativo. Localizar o ativo ou encerrar uma notificação não equivale a liberá-lo.

## Rastreamento

**Tag:** dispositivo fixado ao ativo para transmitir sua identificação por BLE. Sua associação ao ativo tem início e fim registrados.

**Receptor:** dispositivo fixo que observa sinais das tags a partir de um ponto conhecido da instituição.

**Observação:** registro de uma recepção de sinal por um receptor. Isoladamente, não estabelece a sala correta do ativo.

**Localização estimada:** interpretação das observações que indica a área provável de um ativo, com horário, origem e estado de atualização.

**Última detecção:** observação mais recente conhecida; pode estar desatualizada e não comprova presença atual.

**Área aprovada:** área cujo uso com uma configuração específica de rastreamento foi avaliado e autorizado pelos responsáveis do hospital.

**Dado simulado:** dado criado para desenvolver ou demonstrar um fluxo, sem representar uma observação física real.
