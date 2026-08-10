# Sistema VMO

Sistema de gestão de clientes, produtos, estoque, fornecedores e pedidos/orçamentos para a VMO Distribuidora. Full-stack: API em Express + TypeScript, frontend em React + Vite, banco de dados Supabase (Postgres).

## Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, React Router
- **Backend**: Express 5, TypeScript, sessão via cookie httpOnly (autenticação própria, não Supabase Auth)
- **Banco de dados**: Supabase (Postgres), acessado pelo servidor com a `service_role key`
- **Validação**: Zod v4, com schemas compartilhados entre frontend e backend
- **PDF**: jsPDF (gerado no navegador, sem dependência de servidor)
- **Senha**: argon2id

## Estrutura do repositório

```
server/           API Express — rotas, regras de negócio, acesso ao Supabase
  src/modules/    um módulo por domínio (auth, admin, clientes, produtos, fornecedores, estoque, pedidos)
  supabase/migrations/   migrações SQL, numeradas e idempotentes
meu-projeto/      Frontend React (Vite)
  src/pages/      páginas (uma por rota)
  src/features/   componentes e hooks específicos de cada módulo
  src/components/ui/   componentes de UI reutilizáveis
  src/lib/        clientes de API e utilitários do frontend
shared/           tipos, schemas Zod e validadores usados por server e frontend
```

`server` e `meu-projeto` são projetos npm independentes (cada um com seu próprio `package.json`/`node_modules`); `shared` é consumido via import relativo direto do código-fonte, sem instalação própria.

## Módulos do sistema

1. **Usuários** — papéis (ADMIN/GERENTE/FUNCIONARIO/FARMACEUTICO), cadastro via chave de acesso temporária, gerenciamento de contas.
2. **Clientes** — cadastro com CPF ou CNPJ, upload opcional de documento.
3. **Produtos** — catálogo com categoria, código de barras, registro ANVISA, sinalização de Controlado/Auditado.
4. **Fornecedores** — cadastro com busca automática de dados por CNPJ (BrasilAPI).
5. **Entrada de Estoque** — notas de entrada vinculadas a um fornecedor, com itens por produto (lote, validade, custo, unidade CX/UN); só aceita produtos auditados; atualiza o estoque de forma atômica.
6. **Pedidos e Orçamentos** — geração de pedido (baixa estoque ao salvar) ou orçamento (não baixa estoque), com margem sobre o custo de entrada, e impressão em PDF com os dados da empresa.

## Pré-requisitos

- Node.js 20 ou superior
- Um projeto no [Supabase](https://supabase.com)

## Configuração

### 1. Banco de dados

Crie um projeto no Supabase e rode, em ordem, todas as migrações em `server/supabase/migrations/` pelo SQL Editor do Supabase (Database → SQL Editor). Cada arquivo é idempotente — pode ser executado novamente sem erro.

### 2. Variáveis de ambiente do servidor

```bash
cp server/.env.example server/.env
```

Preencha em `server/.env`:

- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` — em Project Settings → API do seu projeto Supabase
- `COOKIE_SECRET` — uma string longa e aleatória
- Os demais valores já vêm com padrões razoáveis para desenvolvimento local

### 3. Instalar dependências

```bash
cd server && npm install
cd ../meu-projeto && npm install
```

### 4. Rodar em desenvolvimento

Em dois terminais separados:

```bash
cd server && npm run dev        # API em http://localhost:4000
cd meu-projeto && npm run dev   # Frontend em http://localhost:5173
```

O Vite já faz proxy de `/api` para `http://localhost:4000` em desenvolvimento.

### 5. Primeiro acesso

A primeira conta cadastrada na tela de login vira automaticamente ADMIN. Depois disso, novas contas exigem a chave de acesso gerada pelo painel de Usuários.

## Deploy (demonstração)

O frontend vai para o **GitHub Pages** e o backend para o **Render** — são hospedagens separadas porque o Pages só serve arquivos estáticos, e nossa API (sessão via cookie, upload de arquivo, etc.) precisa de um servidor Node de verdade. O banco continua sendo o mesmo projeto Supabase de sempre.

### 1. Backend no Render

1. Em [render.com](https://render.com), **New +** → **Blueprint**, selecione este repositório. O Render lê o `render.yaml` da raiz e propõe o serviço `sistema-vmo-server`.
2. Preencha as variáveis pedidas (nada disso fica no repositório):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — as mesmas do seu `.env` local
   - `COOKIE_SECRET` — pode ser um valor novo, só precisa ser longo e aleatório
   - `CORS_ORIGIN` — a URL do GitHub Pages, algo como `https://SEU-USUARIO.github.io` (sem o `/Sistema-VMO` no final)
3. Depois do primeiro deploy, copie a URL pública do serviço (ex.: `https://sistema-vmo-server.onrender.com`) — ela é usada no passo 2.

O plano gratuito do Render "dorme" depois de um tempo sem uso: a primeira requisição depois disso demora alguns segundos para acordar o servidor. Normal para demonstração, não use esse plano em produção real.

### 2. Frontend no GitHub Pages

1. Em **Settings → Pages** do repositório no GitHub, em "Build and deployment", mude **Source** para **GitHub Actions** (só precisa fazer isso uma vez).
2. Em **Settings → Secrets and variables → Actions → Variables**, crie a variável `VITE_API_URL` com o valor `https://sistema-vmo-server.onrender.com/api` (a URL do Render do passo anterior, com `/api` no final).
3. Dê push na branch `main` (ou rode manualmente o workflow em **Actions → Deploy frontend to GitHub Pages → Run workflow**). O site fica disponível em `https://SEU-USUARIO.github.io/Sistema-VMO/`.

Se mudar `VITE_API_URL` depois, é preciso rodar o workflow de novo (o valor é embutido no build, não lido em tempo de execução).

## Scripts disponíveis

| Local | Comando | Descrição |
| --- | --- | --- |
| `server/` | `npm run dev` | API com reload automático |
| `server/` | `npm run build` | Compila TypeScript para `dist/` |
| `server/` | `npm start` | Roda a API compilada |
| `meu-projeto/` | `npm run dev` | Servidor de desenvolvimento do Vite |
| `meu-projeto/` | `npm run build` | Typecheck + build de produção |
| `meu-projeto/` | `npm run lint` | Lint com oxlint |
| `meu-projeto/` | `npm run preview` | Serve o build de produção localmente |

## Segurança

O projeto usa o [Lagune](meu-projeto/.claude/skills/lagune/SKILL.md) como processo de desenvolvimento seguro por padrão: toda alteração de código passa por hooks determinísticos que verificam padrões inseguros (regex catastrófico, segredos expostos, CORS permissivo, chamadas de rede). O charter de segurança do projeto está em `meu-projeto/.lagune/memory/charter.md`.

Pontos centrais:

- Sessões são cookies httpOnly/Secure/SameSite com token opaco (CSRNG), não JWT.
- A `service_role key` do Supabase só existe no servidor; o frontend nunca a recebe.
- Toda regra de negócio sensível (ex.: produto precisa estar auditado, estoque suficiente) é reforçada no banco de dados (funções `plpgsql`), não só na camada de aplicação.
