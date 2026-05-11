# Valtrix - Roblox Affiliate Storefront

Um sistema completo de afiliação para Roblox com suporte a pagamentos via PIX e MercadoPago, painel administrativo e dashboard de afiliados.

## 🚀 Tecnologias

- **Backend:** Flask + SQLAlchemy + Flask-JWT-Extended
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** JWT com Cookies + CSRF Protection
- **Pagamentos:** MercadoPago + PIX

## 📋 Pré-requisitos

- Python 3.9+
- Node.js 18+
- Conta Supabase (gratuita em https://supabase.com)

## 🔧 Instalação

### 1. Clonar repositório

```bash
git clone <repository>
cd Affiliedx
```

### 2. Configurar Supabase

#### a) Criar projeto no Supabase
- Acesse https://app.supabase.com
- Clique em "New project"
- Escolha um nome e defina a senha do usuário `postgres`
- Aguarde a criação (2-3 minutos)

#### b) Obter Connection String
- No painel do projeto, vá para **Settings** → **Database**
- Em "Connection strings", selecione **URI**
- Copie a string (ela será parecida com):
  ```
  postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
  ```

#### c) Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite `.env` e atualize:
```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres
SECRET_KEY=sua-chave-secreta-aqui
JWT_SECRET_KEY=sua-jwt-secret-aqui
MERCADOPAGO_ACCESS_TOKEN=seu-token-aqui
```

### 3. Configurar Backend

```bash
# Criar virtual environment
python -m venv .venv

# Ativar virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar migrações do banco de dados
flask db upgrade

# Testar conexão
python -c "from backend.app import create_app; app = create_app(); print('✓ Banco conectado!')"
```

### 4. Configurar Frontend

```bash
npm install
npm run build
```

## 🏃 Executar Aplicação

### Terminal 1 - Backend
```bash
.venv\Scripts\activate  # Windows
python -m flask run
```

### Terminal 2 - Frontend (Desenvolvimento)
```bash
npm run dev
```

### Acessar
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/docs (se implementado)

## 📁 Estrutura do Projeto

```
backend/
├── app.py              # Aplicação Flask principal
├── config.py           # Configuração (Supabase, JWT, etc)
├── models/             # Modelos de banco de dados
├── routes/             # Blueprints (auth, affiliate, admin, store)
├── services/           # Lógica de negócio (MercadoPago, PIX)
├── utils/              # Validadores e helpers
└── tests/              # Testes unitários

src/
├── components/         # Componentes React
├── contexts/          # Context API (Autenticação)
├── lib/               # Cliente API Axios configurado
└── types.ts           # TypeScript types

migrations/            # Migrações Alembic para Supabase
```

## 🔐 Segurança

- ✅ JWT com cookies HTTP-only
- ✅ CSRF Protection
- ✅ Rate Limiting
- ✅ CORS configurado
- ✅ Content Security Policy (Talisman)
- ✅ Validação de entrada
- ✅ Bcrypt para senhas

## 📝 Variáveis de Ambiente

```env
# Flask
FLASK_ENV=production
SECRET_KEY=chave-secreta-forte

# JWT
JWT_SECRET_KEY=jwt-secret-forte
JWT_COOKIE_SECURE=True  # False em dev, True em prod
JWT_ACCESS_TOKEN_EXPIRES=15
JWT_REFRESH_TOKEN_EXPIRES=7

# Supabase PostgreSQL
DATABASE_URL=postgresql://postgres:password@host:5432/postgres

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=seu_token

# API
BASE_URL=https://api.seu-dominio.com
CORS_ORIGINS=https://seu-dominio.com

# Rate Limiting
REDIS_URL=redis://localhost:6379
RATELIMIT_DEFAULT=200 per day;50 per hour

# Comissão de afiliados
COMMISSION_RATE=0.10
```

## 🧪 Testes

```bash
# Backend
python -m pytest backend/tests

# Frontend
npm run test
```

## 🚀 Deploy

### Backend (Render, Heroku, etc)
1. Defina `DATABASE_URL` com sua URL Supabase
2. Defina `FLASK_ENV=production`
3. Defina `JWT_COOKIE_SECURE=True`
4. Execute `flask db upgrade`
5. Inicie com `gunicorn`

### Frontend
1. `npm run build`
2. Deploy a pasta `dist/` em Vercel, Netlify, etc

## 📚 Rotas da API

### Autenticação
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Renovar token

### Loja
- `GET /api/store/items` - Listar itens
- `POST /api/store/checkout` - Criar checkout

### Afiliados
- `GET /api/affiliate/dashboard` - Dashboard
- `POST /api/affiliate/withdraw` - Solicitar saque
- `GET /api/affiliate/stats` - Estatísticas

### Admin
- `GET /api/admin/stats` - Estatísticas gerais
- `GET /api/admin/withdrawals` - Gerenciar saques

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Commit: `git commit -am 'Add feature'`
3. Push: `git push origin feature/sua-feature`
4. Abra um Pull Request

## 📄 Licença

Todos os direitos reservados © 2026

## 💬 Suporte

Para dúvidas ou suporte, abra uma issue no repositório.

