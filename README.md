# 🚀 Frontend Vite - Sistema de Gestão Modular

Este projeto é uma aplicação frontend de alto desempenho construída com **React 19** e **Vite**, projetada para ser escalável, testável e de fácil manutenção. A arquitetura é baseada em módulos (**Feature-based Architecture**), permitindo que o sistema cresça de forma organizada.

---

## 🛠️ Stack Tecnológica

O projeto utiliza as tecnologias mais modernas do ecossistema React:

### Core & Build
- **React 19**: Versão mais recente com suporte a melhorias de performance e hooks modernos.
- **TypeScript**: Tipagem estática para maior segurança e produtividade.
- **Vite**: Build tool extremamente rápida para desenvolvimento moderno.

### Estado & Dados
- **Zustand**: Gerenciamento de estado global leve e performático.
- **TanStack Query (React Query) v5**: Sincronização de estado do servidor, cache e fetching.
- **Axios**: Cliente HTTP para comunicação com a API.

### UI & Styling
- **Tailwind CSS v4**: Framework CSS utility-first para estilização rápida e responsiva.
- **Radix UI**: Primitives de UI acessíveis e sem estilização para componentes complexos (Modais, Selects, Toasts).
- **Lucide React**: Biblioteca de ícones moderna e leve.
- **CVA & Tailwind Merge**: Gerenciamento eficiente de classes e variantes de componentes.

### Formulários & Validação
- **React Hook Form**: Performance superior no gerenciamento de formulários.
- **Zod**: Validação de esquemas baseada em TypeScript (Single Source of Truth).

### Testes & Qualidade
- **Vitest**: Framework de testes unitários e de integração extremamente rápido.
- **React Testing Library**: Testes focados no comportamento do usuário.
- **ESLint & Husky**: Garantia de padrões de código e hooks de pre-commit.

---

## 📂 Estrutura do Projeto

A aplicação segue uma estrutura modular, onde cada funcionalidade importante reside em sua própria pasta dentro de `features`.

```text
src/
├── assets/          # Imagens, fontes e arquivos estáticos
├── components/      # Componentes UI globais e reutilizáveis (Shared UI)
├── features/        # Módulos de negócio da aplicação (Core)
│   └── [feature]/   # Ex: product, user, auth
│       ├── components/  # Componentes exclusivos da feature
│       ├── constants/   # Configurações e mapeamentos da feature
│       ├── pages/       # Páginas/Views da feature
│       └── services/    # Chamadas de API e lógica de dados (Queries/Mutations)
├── hooks/           # Hooks customizados globais
├── lib/             # Configurações de bibliotecas externas (axios, queryClient)
├── providers/       # Providers de contexto global (QueryClient, Auth, etc.)
├── routes/          # Definição de rotas e proteção de acesso
├── stores/          # Stores globais do Zustand (auth, toast, ui)
├── utils/           # Funções utilitárias helpers
└── main.tsx         # Ponto de entrada da aplicação
```

---

## 🏗️ Criação de Novos Módulos (Generate)

Para manter a consistência e acelerar o desenvolvimento, o projeto conta com um **Gerador de Módulos** automatizado.

### Como usar:
Execute o comando abaixo no terminal:

```bash
npm run generate
# ou se preferir usar bun diretamente:
bun run generate
```

### O que o gerador faz:
1. Solicita o nome do novo módulo (ex: `category`).
2. Cria automaticamente a estrutura de pastas em `src/features/category`.
3. Gera arquivos boilerplate com lógica básica e tipagem:
   - **Service**: Hook customizado com TanStack Query para CRUD.
   - **Pages**: Listagem e Formulário (Cadastro/Edição).
   - **Tests**: Suíte de testes completa para a página e para o serviço.
   - **Constants**: Mapeamento de tabelas e configurações.
   - **Components**: Filtros iniciais para a listagem.

### Próximos Passos:
Após gerar o módulo, você só precisa registrar as rotas em `src/routes/index.tsx`:

```tsx
import { CategoryListPage } from '@/features/category/pages/CategoryListPage';
import { CategoryFormPage } from '@/features/category/pages/CategoryFormPage';

// No array de rotas:
{ path: 'categories', element: <CategoryListPage /> },
{ path: 'categories/new', element: <CategoryFormPage /> },
{ path: 'categories/update/:id', element: <CategoryFormPage /> },
```

---

## 🚀 Comandos Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Cria o build de produção otimizado. |
| `npm run test` | Executa a suíte de testes com Vitest. |
| `npm run test:coverage` | Gera relatório de cobertura de testes. |
| `npm run lint` | Executa a verificação do linter. |
| `npm run generate` | Inicia o assistente de criação de novos módulos. |

---

## 🧪 Qualidade e Testes

O projeto preza por **100% de cobertura** em lógica crítica.
- Os testes ficam localizados em pastas `__tests__` próximas ao código testado.
- Utilizamos `msw` (opcional) ou mocks manuais para chamadas de API.
- Para rodar testes em modo UI: `npm run test:ui`.

---

Desenvolvido com ❤️ por [Teilor Barcelos](https://github.com/teilorbarcelos)
