# Sistema VMO — Frontend

Frontend do Sistema VMO: React 19 + TypeScript + Vite + Tailwind CSS v4.

Para visão geral do sistema completo (backend, banco de dados, configuração de ambiente), veja o [README na raiz do repositório](../README.md).

## Rodando localmente

```bash
npm install
npm run dev
```

O servidor de desenvolvimento sobe em `http://localhost:5173` e faz proxy de `/api` para a API em `http://localhost:4000` (veja `vite.config.ts`). É necessário ter o backend (`server/`) rodando à parte.

## Scripts

- `npm run dev` — servidor de desenvolvimento com HMR
- `npm run build` — typecheck (`tsc -b`) seguido do build de produção
- `npm run lint` — lint com [oxlint](https://oxc.rs)
- `npm run preview` — serve o build de produção localmente

## Estrutura

```
src/
  pages/          uma página por rota (ex.: ProdutosListagemPage.tsx)
  features/       componentes e hooks específicos de cada módulo de negócio
  components/ui/  componentes de UI reutilizáveis (Button, TextField, DateField, ...)
  lib/             clientes de API e utilitários (formatação, máscaras, PDF)
  routes/         definição de rotas e guards (autenticação, papel do usuário)
  hooks/          hooks compartilhados (auth, toasts)
```

Tipos e schemas de validação usados tanto aqui quanto no backend ficam em `../shared/src`, importado diretamente por caminho relativo (não é um pacote npm instalado).
