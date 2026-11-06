# ADR 0002 — Repositório único com fronteiras por responsabilidade

**Status: aceita para a organização do repositório; stack de implementação em aberto.**

O CRM será construído aqui pela equipe de software, junto das interfaces e do hardware de rastreamento. Mantemos um único repositório para revisar mudanças coordenadas de produto, contrato e integração, com `apps/crm`, `services/localizacao`, `packages/contratos` e `hardware` separados por responsabilidade.

A separação de pastas não impõe microserviços, múltiplos bancos ou publicação de pacotes. O CRM pode começar com backend integrado, e a localização pode usar adaptador simulado identificado. A stack será registrada quando a implementação começar. Essa organização exige revisão coordenada de interfaces, mas evita que documentação, firmware e aplicação evoluam sem referência compartilhada.
