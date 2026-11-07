# Registro de quebra: pesquisa e integração do fluxo

Pesquisa documental em 07/11/2026, nas centrais de ajuda dos produtos. A comparação identifica padrões de interação; não constitui avaliação prática dos produtos nem evidência de adequação clínica.

## Referências de mercado

| Produto | Padrão documentado | Aplicação no Consta |
| --- | --- | --- |
| [MaintainX — About Assets](https://help.getmaintainx.com/about-assets) | O ativo conecta manutenção, fornecedores e equipes; seu estado distingue funcionamento e parada planejada/não planejada. | A ocorrência pertence ao equipamento e usa o atendimento já identificado, sem pedir os mesmos dados novamente. |
| [Limble — Workflow Automations](https://help.limblecmms.com/en/articles/8729391-workflow-automations) | O início e a conclusão de manutenção não planejada podem atualizar o estado do ativo. | Registrar, agendar e concluir reparo atualizam os mesmos dados consumidos pela lista, ficha e calendário. |
| [Click Maint — Asset Downtime Process](https://help.clickmaint.com/en/articles/9773883-asset-downtime-process) | A parada registrada aparece no trabalho e na listagem; há acesso pela ficha do ativo e preservação do histórico. | Entradas diferentes abrem o mesmo fluxo, com confirmação visível e histórico preservado. |

A escolha de manter um diálogo curto e não criar uma ordem de serviço completa é uma adaptação ao escopo da fase 1, não uma funcionalidade copiada dos produtos.

## Problemas encontrados

- A ação principal de Equipamentos direcionava para a responsabilidade contratual; o registro de quebra só era acessível após abrir a ficha.
- Um equipamento com quebra podia ser filtrado pela situação contratual, enquanto a linha apresentava outro status.
- A janela de quebra era controlada localmente pela ficha; consultas abertas a partir de outras janelas dependiam de callbacks opcionais para propagar a atualização.
- A agenda aguardava a recarga para refletir a ocorrência, e a confirmação podia ficar atrás de outras janelas.

## Fluxo implementado

1. **Equipamentos → Registrar quebra** abre a janela compartilhada; a ficha e as consultas de contrato usam a mesma entrada.
2. A janela identifica equipamento/tombamento e mostra quem atende e os contatos existentes. O agendamento continua opcional.
3. Salvar atualiza o equipamento e o evento de reparo imediatamente; a API reconcilia os dados persistidos em seguida. A confirmação aparece acima das janelas.
4. Sem data, mostrar **Aguardando agendamento**. Com data, mostrar o agendamento. Data passada ainda não encerrada aparece como **Reparo em atraso**, sem inferir que a manutenção foi ou não realizada.
5. A ação muda para **Agendar reparo** ou **Atualizar reparo**. O mesmo fluxo permite informar o reparo concluído; o histórico permanece salvo.
6. A confirmação de um agendamento oferece **Ver no calendário**, abrindo mês e dia correspondentes. Esse atalho não aparece sobre um cadastro com edição em andamento, para não descartá-lo.

Os filtros acompanham a situação exibida: quebra aberta entra em Equipamento quebrado, e não nas situações contratuais. Encerrar a ocorrência volta a mostrar a situação contratual anterior. A configuração do atendimento permanece em uma ação secundária própria.

A fila prioriza reparos atrasados, quebras sem agendamento e reparos agendados, seguidos das pendências contratuais. O registro de reparo é uma informação do usuário; não representa liberação técnica ou atestado automático de condição de uso.

## Validação

Testes verificam a sequência registro → agendamento → reagendamento → reparo, a concordância entre filtros/ficha/eventos, a preservação das preventivas e de ocorrências de outras unidades, e a retirada de um evento reagendado fora do mês consultado. O servidor e a atualização imediata no navegador usam o mesmo projetor de reparos.
