# Prompt de transferência — Consta

Copie o bloco abaixo para o Codex CLI. Se os arquivos forem transferidos para outro computador, ajuste os caminhos e mantenha os documentos juntos.

---

Você vai me ajudar a elaborar o pitch e preparar a solução Consta para um hackathon no HCFMUSP. Sou Matheus, engenheiro biomédico formado pela PUC-SP, com experiência em engenharia clínica na Secretaria Municipal da Saúde de São Paulo. Essas informações foram fornecidas por mim; não invente outras credenciais da equipe.

Leia primeiro estes arquivos:

1. `docs/project/CONSTA_PROJETO_HACKATHON.md`
2. `docs/project/CONSTA_FONTES_E_LIMITES.md`
3. `data/CONSTA_CENARIOS_SIMULADOS.csv`
4. `docs/project/CONSTA_NOTAS_DOS_AUDIOS.md`

O documento principal é a síntese atual. Não recomece a entrevista e não me peça que repita tudo. Inspecione o contexto e a stack do projeto em que estiver rodando antes de sugerir alterações. Preserve minhas instruções locais e o trabalho já existente.

## Objetivo imediato

Transforme o material em um pitch claro, defensável e demonstrável de três minutos. Entregue:

1. Proposta de valor em uma frase e problema em um parágrafo.
2. Roteiro oral de aproximadamente 330–390 palavras, a ser cronometrado em ensaio.
3. Estrutura de cinco slides: dor/evidência, processo atual, solução/demo, benefícios e validação, equipe/pedido.
4. Demo de 60–90 segundos compatível com o tempo do pitch, evitando repetir toda a explicação nos slides.
5. Respostas curtas a perguntas da banca sobre concorrentes, economia, IA, localização e implantação.
6. Backlog priorizado de construção, identificando o que está implementado, o que falta e o que será simulado. Não afirme ter construído algo só por planejar.

Use o material existente e produza a primeira versão completa sem esperar respostas opcionais. Se houver decisões realmente bloqueantes, reúna as dúvidas e continue o restante. Não publique slides, crie contas, envie mensagens ou contrate serviços.

## Direção do produto

Consta transforma documentos de ativos hospitalares em planos de manutenção revisados e tarefas acompanhadas até a conclusão. Núcleo: manutenção preventiva. Localização indoor apoia encontrar os ativos móveis. Público inicial: hospitais; laboratório é expansão. Equipamentos médicos e infraestrutura compartilham o fluxo, com planos/responsáveis próprios. Nome escolhido: Consta; não confirmado no INPI ou em domínio.

Fluxo: documento/inventário → extração com evidência → revisão técnica → plano → tarefa → responsável/janela → localização/recolhimento → execução/comprovante → histórico e próximo ciclo.

Use uma bomba de infusão fictícia na história; ar-condicionado apenas como extensão. Contrato pode não ter periodicidade; manual, plano e histórico também são entradas. Campo ausente/conflictante precisa de revisão, não de invenção pela IA. Upload não define o marco inicial de manutenção.

Trate cobertura contratual e execução como estados independentes. Mostre cadastro manual e importação assistida, conferência de patrimônio ou série no ativo e aprovação da janela pelo setor. Há um exemplo público de contrato para angiógrafo no HC-UFPE. Use o documento para ilustrar vínculo e cobertura, com dados operacionais sintéticos para a demonstração de prazos e conclusão. A RDC 509/2021 embasa o contexto de gestão do hospital.

## Tecnologia e limites

Arquitetura recomendada: web TypeScript, PostgreSQL, arquivos privados, extração estruturada, motor determinístico de prazos, worker/outbox e adaptador de localização. Preserve stack existente viável. Não fixe modelo de IA por suposição; avalie capacidade, custo e precisão com documentos. O núcleo não exige hardware novo.

Movimentação automática indoor não é QR. RTLS real precisa de infraestrutura. BLE é candidato condicionado, não escolha clinicamente validada. Ultrassom/infravermelho podem fazer parte de sistemas que também usam rádio. Não alegue “sem interferência”. Não implante rádio ou faça testes em área assistencial nesta fase. Identifique localização simulada na interface e na fala.

## Disciplina de evidência

O HCX informa >40 mil equipamentos no complexo HCFMUSP. O >R$1 milhão do Labec é custo evitado com internalização de manutenção, não perda atual nem resultado do Consta. Não usar médias de equipamentos por leito ou hospital sem evidência. GETS já faz gestão de inventário, contratos e manutenção; não alegar mercado vazio. A diferenciação proposta é hipótese a validar.

Todos os números da planilha de cenários são fictícios. Separar caixa de capacidade da equipe. Não multiplicar indisponibilidade por faturamento e chamar isso de lucro perdido. Não somar custos fixos novamente. Não converter cenário em promessa de ROI. No pitch, prefira métrica e plano de piloto a percentuais inventados.

Não afirmar dispensa regulatória absoluta, compatibilidade eletromagnética, precisão de localização, economia ou eficácia clínica sem validação. Dados reais de contratos exigem autorização; use documentos sintéticos na demo. Integração com leitos é possibilidade, não parceria fechada, e não decide automaticamente liberação clínica.

Escreva em pt-BR, com linguagem direta. Separe fatos citados, hipóteses, recomendações e pendências. Nosso diferencial deve ser compreensível em uma frase; não acrescente marketplace, chatbot ou previsão de falhas para impressionar.

---

## Arquivos de apoio

- `CONSTA_PROJETO_HACKATHON.md`: projeto, decisões técnicas, economia, piloto, roteiro e referências.
- `CONSTA_FONTES_E_LIMITES.md`: auditoria de alegações.
- `CONSTA_CENARIOS_SIMULADOS.csv`: números ilustrativos recalculáveis.
- As notas anteriores são histórico, não especificação definitiva.
