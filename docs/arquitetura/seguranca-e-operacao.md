# Segurança e operação

Requisitos de implementação e implantação, não garantias já demonstradas. O escopo do produto permanece administrativo e operacional.

## Acesso e dados

- Autorizar no backend por instituição, papel e recurso. A UI não é a fronteira de autorização.
- Armazenar documentos de forma privada; acesso autenticado e temporário quando aplicável. Controlar exportação, versões, retenção e auditoria.
- Proteger credenciais fora do repositório, com exemplos de ambiente sem valores reais. Logs não devem revelar segredos ou conteúdo integral de documentos restritos.
- Usar dados sintéticos em desenvolvimento e demonstração. Informações de contratos podem ser pessoais ou comercialmente restritas, mesmo sem prontuário.
- Não incluir dados de pacientes quando identificadores de ativos/setores forem suficientes. Integração futura com leitos exige finalidade e autorização próprias.

## Documentos e IA

Arquivos recebidos são entradas não confiáveis. Aplicar limites de tamanho/tipo, processamento isolado conforme a stack e controle dos arquivos servidos. Texto de um PDF não concede instruções, permissões ou ferramentas à LLM.

A extração devolve sugestões estruturadas com evidência; validação de esquema não demonstra correção factual. O plano depende de revisão humana. Dados ausentes ou conflitantes devem permanecer visíveis. Escolher provedor/modelo após avaliação com documentos representativos, considerando precisão, latência, custo e tratamento dos dados.

Jobs devem registrar estado e falha, permitir reexecução e manter idempotência. Uma falha de extração não pode deixar um plano aprovado pela metade. Integrações de mensagens começam em modo simulado; envio real exige configuração e autorização operacional.

## Rede local e disponibilidade

O requisito sem internet cobre o caminho de rastreamento e a consulta/gestão local previamente disponíveis. A implantação deve avaliar:

- autenticação e resolução de nomes locais;
- relógios e qualidade dos timestamps;
- dependências de licença e chamadas externas;
- persistência e buffer dos receptores, com limites e política de descarte explícitos;
- backup, restauração e migrações;
- energia do servidor, switches e receptores;
- monitoramento de falhas e recuperação da LAN.

Uma VLAN organiza tráfego e acesso; não elimina interferência de rádio. Ethernet/PoE no receptor reduz dependência de Wi-Fi para transporte, mas as tags continuam transmitindo BLE.

Se a IA depender de nuvem, documentos aguardam processamento quando a WAN falhar; cadastro e revisão manual continuam sendo o caminho de contingência previsto. O funcionamento deve ser ensaiado com a WAN efetivamente desligada e com reinicialização dos componentes relevantes.

## Receptores e observações

Autenticar o receptor e vinculá-lo à instituição pelo cadastro autorizado, em vez de confiar somente no campo enviado. Definir proteção de transporte, rotação de credenciais, atualização de firmware e revogação. Identidades de tag, mensagens repetidas e relógios anormais exigem validação.

Uma observação válida no protocolo não prova origem física autêntica ou sala correta. A interface precisa distinguir sinal observado, estimativa e liberação técnica. O [contrato proposto](../../packages/contratos/README.md) explicita essas fronteiras.

## Implantação hospitalar

O ensaio de rádio e o uso em área assistencial seguem autorização e avaliação próprias de engenharia clínica, TI, infraestrutura e responsáveis locais. Os limites estão em [segurança hospitalar](../rastreamento/seguranca-hospitalar.md). A homologação do produto não substitui a avaliação da instalação; o enquadramento regulatório depende da finalidade e do conjunto final.
