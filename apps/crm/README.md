# CRM Consta — fase 1

Aplicação local com **React 19 + Vite + TypeScript**, API Express e SQLite. Duas telas: calendário e equipamentos, com formulário de cadastro/revisão que recebe contrato PDF/TXT e patrimônio. Logo SVG e tokens são importados diretamente de `brand/`; Inter e DM Mono são distribuídas localmente via Fontsource, com licenças nos respectivos pacotes.

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

1. Abrir **Novo equipamento**: na primeira tela, arrastar ou selecionar um PDF/TXT UTF-8, até 15 MB, e continuar. O preenchimento manual sem contrato continua disponível por ação explícita.
2. Na tela de configuração, informar equipamento e patrimônio. Série do fabricante é um campo distinto e opcional. Voltar preserva o formulário; editar um cadastro existente abre diretamente esta etapa.
3. Continuar realiza a leitura com IA, quando configurada. Confira os campos; as evidências ficam em Ver informações do contrato. Sem configuração, preencha manualmente. Informações opcionais ficam recolhidas em Mais informações.
4. Informar intervalo fixo em dias/meses/anos, data e tipo de marco. Upload/assinatura não iniciam ciclos por padrão.
5. Confirmar revisão e salvar para gerar previsões. Sem revisão, o cadastro fica pendente e sem eventos.
6. Navegar no calendário, buscar por equipamento/patrimônio e clicar numa previsão para editar/ver contrato.

Ciclos partem do marco original, sem converter meses em dias: `31/jan → 28 ou 29/fev → 31/mar`. Revisão altera a projeção; ainda não há histórico imutável de planos, execução, comprovante ou liberação técnica.

## Persistência e acesso

SQLite guarda cadastros, metadados, extrações e bytes dos contratos; arquivos idênticos são deduplicados por SHA-256. Previsões são projeções consultadas, não eventos duplicados no banco. Registros sobrevivem ao reinício. Não há exclusão de equipamento/arquivo nesta fase; uploads de formulário cancelado permanecem no banco. Retenção e limpeza são trabalho posterior.

Por padrão, demonstração local com três exemplos sintéticos identificados **sem senha**; use somente dados fictícios. `APP_PASSWORD` habilita proteção de API/arquivos com sessão HttpOnly/SameSite, limitação de tentativas e verificação de origem. Há um único espaço local: **não implementa usuários, papéis ou isolamento multi-instituição** e não é implantação hospitalar. Essa implantação exige controle de acesso, configuração e validação próprios.

`.data/` e `.env.local` são ignorados pelo Git. Para cópia de segurança inicial, pare o backend e copie integralmente `.data/`; restaure com o processo parado. Backup agendado e recuperação de desastre não foram implementados/validados.

## Verificação

Na raiz:

```sh
npm test
npm run build
python3 scripts/verificar_repositorio.py
```

Testes cobrem meses/bissextos, dados ausentes, idempotência da projeção, persistência SQLite e SDK com transporte simulado sem rede. A suíte HTTP isolada cobre sessão, autorização de arquivos, upload, edição, reinício e SDK com provedor local; marca `skip` com motivo se o ambiente nega abertura de portas (`EPERM`), sem apresentar esse caso como aprovado. A configuração real de IA depende do usuário e permanece sem validação.

Veja [diagrama e escopo da fase 1](../../docs/produto/fase-1-cadastro-e-calendario.md). Localização BLE e hardware não estão integrados.
