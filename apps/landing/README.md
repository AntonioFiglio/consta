# Landing page — Consta

Aplicação pública de apresentação e lista de interesse, independente do CRM, feita com Vite e JavaScript. Usa a identidade e os tokens de [brand](../../brand/README.md), fontes locais e somente conteúdo sintético no exemplo visual.

## Executar

Na raiz do monorepo, com Node.js 22.17 ou posterior:

```sh
npm install
npm run dev:landing
```

Acesse `http://127.0.0.1:5174`. O CRM conserva os comandos existentes e sua porta própria.

```sh
npm run test:landing
npm run build:landing
npm run preview --workspace @consta/landing
```

O build estático fica em `apps/landing/dist/` e não exige backend. A publicação deve servir esse diretório; não publique arquivos de ambiente nem os dados do CRM. Publicação e domínio não fazem parte desta entrega local.

## Contato e lista de interesse

Todos os CTAs de contato são links diretos para `https://wa.me/5516991001262`, com a mensagem “Olá, equipe Consta! Quero conhecer o projeto e entrar na lista de interesse.” codificada. Abrem o WhatsApp em outra aba, sem formulário, cadastro ou preenchimento. O visitante confirma o envio da mensagem no WhatsApp. Os links também funcionam sem JavaScript.

A página não coleta nem armazena dados de contato, usa cookies ou chama a API do CRM. Não há conta, analytics ou serviço externo de captura. Destino e mensagem estão nos links de contato em [index.html](index.html).

## Conteúdo e limites

O produto é apresentado como em desenvolvimento. Cadastro, documentos e calendário são protótipo local; IA segue em validação. BLE é direção futura, com hardware e ensaios pendentes. Não há números de economia, clientes, depoimentos ou garantias de implantação. O exemplo de contrato/equipamento está identificado como ilustrativo.

Os testes verificam todos os CTAs, o número de destino, a mensagem codificada e a ausência de formulário ou campos de preenchimento. Não enviam mensagens e não comprovam entrega pelo WhatsApp. A verificação visual em navegador permanece pendente caso a ferramenta de acesso esteja indisponível.

## Alinhamento com o pitch

A revisão da LP segue o [deck](../../pitch/deck.html) e a [fala de palco](../../pitch/fala-palco.txt): pressão sobre paciente/gestor → informação dispersa → Entrada/IA organiza/Gestão → prova funcional → propostas de agenda e localização → piloto → equipe e modelo comercial.

A abertura agora usa “Quando o equipamento para, a rotina não espera.”, com fundo escuro e colagem de notícias brasileiras, recortes inclinados, sobreposição e acentos vermelhos inspirados no primeiro slide de notícias. Título, descrição e CTA ficam fora das sobreposições. Ao passar o ponteiro ou focar um recorte, ele vem para frente; em telas pequenas os recortes se organizam em sequência. A entrada animada ocorre uma vez e respeita movimento reduzido. A seção do produto conserva a prova do ensaio de cinco cadastros e cinco previsões da [execução isolada do cenário sintético](../../pitch/demo/native/capture-result.json), sem IA externa real nem benchmark de velocidade. A proposta Smart Agenda preserva o [cenário sintético de vinte serviços](../../pitch/demo/smart-agenda-cenario.md), com quatro por dia dentro da janela autorizada; não programa manutenções reais.

O [Plano Business](../../docs/referencias/precos-business-consta.md) aparece como proposta em validação, com licença anual por unidade hospitalar, nas faixas de R$ 20 mil, R$ 60 mil e R$ 180 mil, com 20 tags na contratação inicial, sem reposição anual automática. Tags extras, receptores e implantação têm orçamento separado; hardware segue em desenvolvimento e validação; não há compra nem promessa de disponibilidade na página.

Os convites para conhecer o produto, piloto e Plano Business abrem diretamente o mesmo WhatsApp, sem etapa de formulário. O encerramento usa “Conheça o Consta. Conte o que sua equipe precisa.”, com a ação “Falar com a equipe” e identificação visível do canal WhatsApp. O visitante confirma o envio da mensagem na conversa.

### Procedência visual

As quatro fotos da equipe derivam dos [originais fornecidos para o pitch](../../pitch/assets/team/README.md). As cópias JPEG locais foram reduzidas a 640 px no lado maior e comprimidas para uso web; enquadramento é por CSS, sem alterar os originais. A imagem da bomba/etiqueta deriva do [conceito gerado por IA](../../pitch/assets/tag/PROMPT-tag-instalada.md), em versão adesiva, e mantém indicação de conceito sem protótipo físico validado. O arquivo local foi reduzido a 1.000 px no lado maior. Os recursos ficam em `src/assets` para o Vite empacotar sem depender do diretório do pitch em produção.

A abertura reutiliza duas fotografias do pitch: técnicos no tomógrafo de Natal (Divulgação / Agora RN) e o aparelho sem uso da UPA Mandic, citado na reportagem sobre a Santa Casa de Araras (RCA1, autoria não informada). As cópias JPEG foram reduzidas para web, sem alterar os originais. O recorte de Florianópolis usa somente texto. As chamadas são paráfrases editoriais com links e datas, seguindo o [dossiê verificado](../../docs/referencias/noticias-palco-2026.md) e os [créditos do pitch](../../pitch/assets/SOURCES.md). Os episódios de 2025–2026 não são apresentados como estado atual dos serviços nem como resultados que o Consta teria evitado. Não há alegação de economia ou produtividade medida.

Verificação da abertura: build, testes de contato, links locais e diff aprovados; aparência desktop conferida na aba local do Chrome. Interação dos recortes, layout móvel e preferência de movimento reduzido seguem sem teste visual nesta rodada.

## Pitch HTML no navegador

O CTA e o QR code dentro do pitch apontam para `https://consta2.vercel.app`, com o texto visível `consta2.vercel.app ↗`. A geração do QR foi conferida por decodificação; a disponibilidade do deploy não foi verificada nesta alteração.

O link **Ver o pitch**, na barra superior (inclusive em telas pequenas), leva a `./pitch/deck.html#b=0` em uma nova aba. Em desenvolvimento, a URL padrão é `http://127.0.0.1:5174/pitch/deck.html#b=0`; em produção, use `/pitch/deck.html#b=0` no domínio que hospeda a LP.

Antes de iniciar, testar ou gerar o build, o script [copiar-pitch.mjs](scripts/copiar-pitch.mjs) copia a pasta original `pitch/` para `public/pitch/`, preservando o conteúdo dos arquivos. A configuração [static-copies.json](static-copies.json) declara a origem. Documentos públicos referenciados pelos HTMLs de apoio também são copiados. O Vite inclui esses arquivos em `dist/`, mantendo a demo, fontes, estilos, imagens e scripts. As cópias são geradas e ignoradas pelo Git; edite o pitch original para atualizar a apresentação. Nenhum serviço adicional é necessário.

Verificação: quatro testes da landing aprovados, incluindo igualdade do deck/demonstração copiados e existência das dependências estáticas; build e verificador do repositório aprovados. Isso não valida o avanço de slides nem integrações físicas.

### Sincronização com o pitch mais recente

A versão atual preserva o cenário de capacidade anual de RMN do pitch e seus limites (projeção com fontes distintas, sem receita ou resultado medidos pelo Consta). A LP não reproduz esses valores como benefícios próprios. A especialidade de Nicolas foi alinhada a engenheiro de software. O link da topbar, a cópia de produção e os recursos do pitch permanecem sincronizados pelo processo de build. Conflitos da reaplicação local foram resolvidos mantendo HTML/QR mais recentes; o stash original foi preservado.

## Cores compartilhadas com o pitch

A paleta do Plano Business tem origem em [pitch/business-colors.css](../../pitch/business-colors.css). O deck carrega esse arquivo e a LP importa a mesma fonte no Vite: verde `#166534`, destaque `#14532d`, menta `#dcfce7` e borda `#d6e5d9`. A seção da LP usa cards Entrada, Expansão e Hospital com os mesmos benefícios e destaque central do pitch, sem alterar os valores. Preto e vermelho da abertura usam os tokens da marca, como na apresentação.

Verificação: quatro testes da landing, build e referências locais aprovados; cards conferidos visualmente no Chrome desktop. Layout móvel desta alteração ainda não foi conferido visualmente.
