# 🔧 Configuração Completa do Supabase

Este guia detalha como configurar e migrar o projeto para Supabase.

## 📦 O que é Supabase?

Supabase é um backend open-source que oferece:
- **PostgreSQL**: Banco de dados relacional poderoso
- **API em tempo real**: Actualizações automáticas
- **Autenticação**: Gerenciamento de usuários
- **Storage**: Armazenamento de arquivos
- **Backups**: Automáticos e gratuitos

Para este projeto, usamos **apenas o banco de dados PostgreSQL**.

## 🚀 Passo 1: Criar Conta no Supabase

1. Acesse https://app.supabase.com
2. Clique em **"Sign up"**
3. Use Google, GitHub ou email
4. Confirme seu email

## 🎯 Passo 2: Criar Novo Projeto

1. No dashboard, clique em **"New project"**
2. Escolha a organização
3. Configure:
   - **Project name**: `valtrix` (ou similar)
   - **Database password**: Escolha uma senha FORTE (você precisará dela)
   - **Region**: Escolha a mais próxima (ex: São Paulo para Brasil)
4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos enquanto o banco é criado

## 🔑 Passo 3: Obter Connection String

1. Aguarde a página "Connecting to new project..." terminar
2. No menu lateral, clique em **Settings** → **Database**
3. Em **Connection strings**, clique na aba **URI**
4. Copie a string URI (será algo como):
   ```
   postgresql://postgres:[PASSWORD]@db.iyzslkmykpqqqfxghmrh.supabase.co:5432/postgres
   ```

⚠️ **IMPORTANTE**: A senha nessa URL é a que você configurou na criação do projeto!

## 📝 Passo 4: Configurar Variáveis de Ambiente

### 4a. Criar arquivo `.env`

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

### 4b. Editar `.env` com suas credenciais

Abra o arquivo `.env` e atualize:

```env
# Supabase Database URL
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.iyzslkmykpqqqfxghmrh.supabase.co:5432/postgres

# Security Keys (mude estes em produção!)
SECRET_KEY=sua-chave-secreta-muito-segura-aqui-minimo-32-caracteres
JWT_SECRET_KEY=seu-jwt-secret-muito-seguro-aqui-minimo-32-caracteres

# MercadoPago (se tiver)
MERCADOPAGO_ACCESS_TOKEN=seu_token_mercadopago

# API Base (desenvolvimento)
BASE_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
REDIS_URL=redis://localhost:6379
```

## 🔄 Passo 5: Preparar Backend

```bash
# Ativar virtual environment
.venv\Scripts\activate

# Instalar dependências (já deve estar feito)
pip install -r requirements.txt

# Verificar que psycopg2 está instalado
pip list | findstr psycopg2

# Dever retornar: psycopg2-binary
```

## 🗄️ Passo 6: Executar Migrações

As migrações criam as tabelas no Supabase:

```bash
# No diretório raiz do projeto
python -m flask db upgrade
```

**Saída esperada:**
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl()
INFO  [alembic.runtime.migration] Will assume transactional DDL is supported
INFO  [alembic.runtime.migration] Running upgrade  -> 13a990fa0709
INFO  [alembic.runtime.migration] Running upgrade 13a990fa0709 -> 2a56191ea6aa
INFO  [alembic.runtime.migration] Running upgrade 2a56191ea6aa -> 6f69379130cb
INFO  [alembic.runtime.migration] Upgrade complete
```

## ✅ Passo 7: Verificar Conexão

```bash
# Teste se a conexão funciona
python -c "from backend.app import create_app; app = create_app(); print('✓ Conectado ao Supabase!')"
```

Se ver a mensagem `✓ Conectado ao Supabase!`, está funcionando!

## 🚀 Passo 8: Iniciar Aplicação

**Terminal 1 - Backend:**
```bash
.venv\Scripts\activate
python -m flask run
```

Deve mostrar:
```
 * Running on http://127.0.0.1:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Deve mostrar:
```
➜  Local:   http://localhost:5173/
```

## 🌐 Passo 9: Testar no Browser

1. Abra http://localhost:5173
2. Teste o fluxo de registro/login
3. Monitore no Supabase em **Settings** → **Database** → **Database logs**

## 🔍 Verificar Dados no Supabase

1. No painel Supabase, clique em **SQL Editor**
2. Execute uma query simples:
   ```sql
   SELECT COUNT(*) as total_users FROM "user";
   ```
3. Deve retornar o número de usuários cadastrados

## 🛡️ Segurança em Produção

Quando for fazer deploy:

1. **Gere senhas fortes** (mínimo 32 caracteres):
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Defina em variáveis de ambiente** (não em código):
   - `SECRET_KEY`
   - `JWT_SECRET_KEY`
   - `DATABASE_URL`

3. **Ative SSL em produção**:
   ```env
   JWT_COOKIE_SECURE=True
   FLASK_ENV=production
   ```

4. **Limpe .env** (nunca commite credentials):
   ```bash
   # Adicione ao .gitignore
   echo ".env" >> .gitignore
   git rm --cached .env
   ```

## 📊 Monitoramento

**No Supabase Dashboard:**
- **Home**: Status e estatísticas
- **Logs**: Database activity
- **Backups**: Automaticamente diários
- **Performance**: Queries lentas

## ⚠️ Troubleshooting

### ❌ "connection refused"
- Verifique se a URL em `.env` está correta
- Verifique a senha
- Verifique se o projeto Supabase ainda está ativo

### ❌ "relation 'user' does not exist"
- Execute: `python -m flask db upgrade`
- As migrações devem criar as tabelas

### ❌ "Permission denied"
- Você precisa usar a senha do usuário `postgres`
- Não use a chave de serviço (service role key)

### ❌ "psycopg2 not found"
```bash
pip install psycopg2-binary
```

## 📚 Documentação Oficial

- Supabase: https://supabase.com/docs
- PostgreSQL: https://www.postgresql.org/docs/
- SQLAlchemy: https://docs.sqlalchemy.org/

## 🎓 Próximos Passos

Depois de configurado:
1. Teste todos os endpoints da API
2. Configure webhooks (se usar MercadoPago)
3. Configure backups automáticos
4. Configure alertas de monitoramento
5. Faça deploy em produção

**Sucesso!** 🎉
