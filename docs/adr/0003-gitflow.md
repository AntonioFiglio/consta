# ADR 0003 — Gitflow para colaboração

**Status: aceita por orientação de Matheus durante a auditoria do pacote de pesquisas.**

O repositório passou a receber alterações de outros integrantes, e Matheus pediu Gitflow para esta etapa. Usaremos `develop` como base de integração, `feature/<tema>` para entregas revisadas por PR e `main` como linha estável promovida por release aprovada. Hotfix parte da linha estável e retorna também à integração.

A primeira `develop` foi criada a partir de `48e83de`, que já inclui o branding enviado por Pedro. A pesquisa desta tarefa está em `feature/auditoria-pesquisas-hospitalares`. O [guia de contribuição](../../CONTRIBUTING.md) define a operação; a aprovação de release e os controles técnicos de branch permanecem coisas distintas. Não houve implantação nem mudança de permissões como parte desta decisão.
