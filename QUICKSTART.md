# ⚡ Quick Start - Valtrix com Supabase

Guia de início rápido para configurar o projeto em 5 minutos.

## 1️⃣ Criar Supabase

- Acesse https://supabase.com
- Crie uma conta (Google/GitHub)
- Crie um novo projeto
- Copie a URL de conexão em **Settings → Database → URI**

## 2️⃣ Clonar e Configurar

```bash
# Clone o repo
git clone <seu-repo>
cd Affiliedx

# Execute o setup interativo
python setup.py
```

Ou manualmente:

```bash
# Copiar env
cp .env.example .env

# Editar .env com suas credenciais
# DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres
```

## 3️⃣ Instalar Dependências

```bash
# Backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# Frontend
npm install
```

## 4️⃣ Migrar Banco de Dados

```bash
# Criar tabelas no Supabase
flask db upgrade

# Verificar conexão
python test_supabase.py
```

## 5️⃣ Executar

**Terminal 1:**
```bash
.venv\Scripts\activate
python -m flask run
```

**Terminal 2:**
```bash
npm run dev
```

Abra: http://localhost:5173

---

## 🔗 Variáveis de Ambiente

Essencial em `.env`:
```env
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres
SECRET_KEY=sua-chave-secreta-aqui
JWT_SECRET_KEY=seu-jwt-secret-aqui
```

## 🧪 Testes

```bash
# Backend
pytest backend/tests

# Frontend
npm run build
```

## 📚 Documentação Completa

- [README.md](README.md) - Overview do projeto
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Setup detalhado do Supabase
- [backend/](backend/) - API routes e lógica

## ❓ Problemas?

### Connection refused
```bash
# Verifique DATABASE_URL em .env
echo %DATABASE_URL%  # Windows
echo $DATABASE_URL   # macOS/Linux
```

### Tabelas não encontradas
```bash
# Rode migrações novamente
flask db upgrade
```

### Dependências faltando
```bash
# Instale tudo
pip install -r requirements.txt
npm install
```

---

**Sucesso!** 🚀 Agora você pode começar a desenvolver.
