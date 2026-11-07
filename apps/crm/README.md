# CRM Consta — fase 1

Aplicação local com **React 19 + Vite + TypeScript**, API Express e SQLite. Três áreas: calendário, equipamentos e contratos, com formulário de cadastro/revisão que recebe contrato PDF/TXT e número de tombamento. Logo SVG e tokens são importados diretamente de `brand/`; Inter e DM Mono são distribuídas localmente via Fontsource, com licenças nos respectivos pacotes.

## Consulta de contratos e equipamentos

- **Contratos** reúne todos os documentos enviados, inclusive os ainda sem equipamentos vinculados. Busca por documento, equipamento, série ou número de tombamento.
- **Ver contrato** abre uma prévia no aplicativo: PDF no leitor nativo do navegador, com zoom/páginas/impressão conforme suporte, e TXT como texto. O arquivo é buscado pela sessão local autenticada. O PDF usa uma URL temporária de Blob, liberada ao fechar a prévia; nenhum serviço externo recebe o documento.
- A opção **Equipamentos** no contrato lista unidades vinculadas ao documento, considerando também coberturas anteriores. Cada unidade abre sua ficha de consulta com identificação, próxima manutenção, regras e histórico de contratos; a edição é uma ação separada.
- A prévia também está disponível pelo documento enviado no cadastro e pelos contratos anteriores nas configurações avançadas. Consultar o arquivo não chama a IA e não altera o documento original.

## Executar

Na raiz, com Node.js **22.17 ou posterior** e npm:

```sh
npm ci
npm run dev
```

Interface: `http://127.0.0.1:5173`. API: `http://127.0.0.1:3007`. Ambos escutam somente em loopback. A configuração é lida de `apps/crm/.env.local`; use o [exemplo sem segredos](.env.example). Nenhuma chave foi criada ou gravada nesta implementação.

Build e execução local dos artefatos:

```sh
npm run build
npm start
```

Depois do build, `http://127.0.0.1:3007` serve interface e API juntas. Para parar, use Ctrl+C. `npm run dev` observa alterações de frontend/backend.

## Configuração do SDK

Preencha as variáveis em `apps/crm/.env.local` e reinicie a aplicação:

| Variável | Uso |
| --- | --- |
| `OPENAI_BASE_URL` | URL base do endpoint, incluindo `/v1` quando aplicável; não adicionar `/responses` |
| `OPENAI_API_KEY` | Chave apenas no backend |
| `OPENAI_MODEL` | Identificador do modelo do seu provedor |
| `APP_PASSWORD` | Opcional: senha e sessão local de oito horas; reiniciar expira sessões |
| `DATABASE_PATH` | Opcional: SQLite; padrão `.data/consta.sqlite` nesta pasta |
| `SEED_DEMO` | `false` para iniciar um banco novo sem os três exemplos sintéticos |
| `PORT` | Porta da API; ao alterar em desenvolvimento, ajuste o proxy em `vite.config.ts` |

O SDK usa **Responses API**, arquivo inline em base64 e saída estruturada. Endpoint/modelo precisam suportar `POST /responses`, arquivo e JSON Schema estrito. Compatibilidade apenas com Chat Completions não basta. Usamos `store: false`, timeout de 90 segundos e nenhuma repetição automática de chamadas; políticas do provedor são próprias dele. [Arquivos na API](https://developers.openai.com/api/docs/guides/file-inputs) e [saídas estruturadas](https://developers.openai.com/api/docs/guides/structured-outputs).

Nenhuma chamada real foi executada nesta entrega. Sem chave/modelo, upload, cadastro manual, edição e calendário continuam disponíveis; leitura automática fica desabilitada. Enviar arquivo salva-o localmente; envio ao provedor ocorre somente ao clicar em **Continuar** após selecionar um contrato, quando a IA estiver configurada. Erros preservam o arquivo e permitem nova tentativa.

## Fluxo disponível

1. Enviar contrato PDF/TXT e continuar. A IA, quando configurada, retorna todos os equipamentos do documento em uma resposta estruturada versionada.
2. Conferir a tabela preenchida: cada linha tem nome, número de tombamento, intervalo e primeira manutenção próprios. Modelo, série, setor, observações, vigência e evidências ficam nas configurações avançadas de cada linha, também preenchidos pela IA quando documentados.
3. Completar somente as lacunas ou resolver conflitos e confirmar o lote. Regras incompletas permanecem pendentes; não são inventadas datas. A confirmação é a revisão humana explícita.
4. Para quantidade sem identidades, identificar cada unidade por número de tombamento; Adicionar outra unidade duplica apenas o contexto para preenchimento, sem inventar número de tombamento ou série.
5. Consultar o inventário com contrato, cobertura, próxima manutenção e busca por série/contrato. Abrir uma unidade permite ver documentos anteriores e adicionar um novo contrato.

Uma cláusula só é compartilhada quando aplicável explicitamente às unidades correspondentes. Cada ficha pode ter regra e vigência diferentes. Equipamentos conhecidos são atualizados por identidade explícita; documento diferente exige início da cobertura e renovação. O lote pode conter criação, edição e renovação, com transação única e validação de identidades, sem gravação parcial.

A extração usa `version: 2` e `equipments[]`; leituras antigas permanecem legíveis e são reprocessadas ao continuar quando a IA está configurada. Não foi executado benchmark ou chamada real com provedor nesta entrega. Os testes usam respostas sintéticas e transporte simulado. Veja o [contrato e critérios do fluxo](../../docs/produto/fase-1-cadastro-e-calendario.md).

### Fronteiras de API local

- `GET /api/contracts`: lista `{ id, name, mime, createdAt }` dos documentos enviados, inclusive sem vínculo, sem bytes ou extração. Exige a mesma sessão das demais rotas quando a senha está configurada.
- `GET /api/contracts/:id/file`: documento original protegido; a prévia usa esses bytes e não executa extração de IA.

- `POST /api/assets/batch`: até 50 fichas com regras e vigências próprias; `id` opcional em cada item identifica a unidade a atualizar; `renew: true` adiciona nova cobertura com início obrigatório quando muda o contrato. `existingId` na raiz permanece como compatibilidade para identificar apenas o primeiro item. Operação atômica.
- `POST /api/assets/:id/contracts`: adiciona cobertura com novo documento e início obrigatório; `additionalAssetIds` seleciona outras unidades existentes usando a mesma regra (rota de compatibilidade; a interface múltipla usa a regra de cada linha no lote). Não modifica identidades dessas unidades. Operação atômica.
- `GET /api/assets`: inclui `coverages`, com documentos, regras, vigência e revisão anteriores.
- `GET /api/events`: projeções com contrato de origem; vencimento e nova cobertura revisada limitam o intervalo efetivo, sem duplicações. Novo contrato pendente não ativa substituição.

`POST /api/assets` e `PUT /api/assets/:id` continuam disponíveis para uma unidade; substituir documento exige a operação explícita de renovação.

## Persistência e acesso

SQLite guarda cadastros, coberturas por equipamento, metadados, extrações e bytes dos contratos; arquivos idênticos são deduplicados por SHA-256. Previsões são projeções consultadas, não eventos duplicados no banco. Registros sobrevivem ao reinício. A migração para `user_version=2` adiciona `asset_contracts` e registra as coberturas legadas sem limpar o banco. Documentos e coberturas anteriores são preservados na renovação; alterações da cobertura mais recente ainda não constituem um histórico imutável de toda edição de plano. Não há exclusão de equipamento/arquivo nesta fase; uploads de formulário cancelado permanecem no banco. Retenção e limpeza são trabalho posterior.

Por padrão, demonstração local com três exemplos sintéticos identificados **sem senha**; use somente dados fictícios. `APP_PASSWORD` habilita proteção de API/arquivos com sessão HttpOnly/SameSite, limitação de tentativas e verificação de origem. Há um único espaço local: **não implementa usuários, papéis ou isolamento multi-instituição** e não é implantação hospitalar. Essa implantação exige controle de acesso, configuração e validação próprios.

`.data/` e `.env.local` são ignorados pelo Git. Para cópia de segurança inicial, pare o backend e copie integralmente `.data/`; restaure com o processo parado. Backup agendado e recuperação de desastre não foram implementados/validados.

## Verificação

Na raiz:

```sh
npm test
npm run build
python3 scripts/verificar_repositorio.py
```

Testes cobrem meses/bissextos, datas ausentes, múltiplas unidades por contrato, vigência, renovação, lacunas, sobreposição, rollback de lote, migração de banco legado, persistência SQLite e SDK com transporte simulado sem rede. A suíte HTTP isolada cobre sessão, autorização de arquivos, upload, edição, reinício e SDK com provedor local; marca `skip` com motivo se o ambiente nega abertura de portas (`EPERM`), sem apresentar esse caso como aprovado. A configuração real de IA depende do usuário e permanece sem validação.

Veja [diagrama e escopo da fase 1](../../docs/produto/fase-1-cadastro-e-calendario.md). Localização BLE e hardware não estão integrados.

Ao abrir um contrato, **Equipamentos** é a primeira aba e já vem selecionada; **Documento** é a segunda. A ficha abre como janela flutuante arrastável sobre a mesma consulta, sem fechar o contrato nem perder o scroll da lista. A linha selecionada fica destacada; fechar a ficha devolve o foco ao equipamento. O cabeçalho também aceita movimento pelas setas. Em telas pequenas, a janela fica fixa.
