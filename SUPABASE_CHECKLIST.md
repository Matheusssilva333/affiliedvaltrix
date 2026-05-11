# ✅ Checklist de Configuração Supabase

Siga este checklist para configurar o Valtrix com Supabase.

## 📋 Pré-Setup
- [ ] Conta Supabase criada (https://supabase.com)
- [ ] Projeto Supabase criado
- [ ] Connection string (DATABASE_URL) copiada

## 🔧 Configuração Local

### Backend
- [ ] `.env` criado com `cp .env.example .env`
- [ ] `DATABASE_URL` atualizado em `.env`
- [ ] `SECRET_KEY` alterado em `.env`
- [ ] `JWT_SECRET_KEY` alterado em `.env`
- [ ] Virtual environment criado: `python -m venv .venv`
- [ ] Ambiente ativado: `.venv\Scripts\activate`
- [ ] Dependências instaladas: `pip install -r requirements.txt`
- [ ] Migrações executadas: `flask db upgrade`

### Frontend
- [ ] Node dependencies instaladas: `npm install`
- [ ] Build testado: `npm run build` ✓

## ✨ Verificações

- [ ] Testes passando: `pytest backend/tests` ✓
- [ ] Conexão testada: `python test_supabase.py`
- [ ] Arquivo `.env` criado
- [ ] Arquivo `.env` **não** comittado no git

## 🚀 Execução
- [ ] Backend rodando: `python -m flask run`
- [ ] Frontend rodando: `npm run dev`
- [ ] App acessível em http://localhost:5173
- [ ] Backend acessível em http://localhost:5000

## 🧪 Testes Funcionais
- [ ] Página de login carrega corretamente
- [ ] Registro de novo usuário funciona
- [ ] Login com usuário registrado funciona
- [ ] Dashboard carrega após login
- [ ] Logout funciona
- [ ] Store/Loja carrega com itens
- [ ] Admin panel acessível

## 📊 Banco de Dados
- [ ] Tabelas criadas no Supabase
- [ ] Dados de teste foram inseridos
- [ ] Conexão verificada em `Settings → Database → Logs`

## 🔐 Segurança (Desenvolvimento)
- [ ] `FLASK_ENV=development` em `.env`
- [ ] `JWT_COOKIE_SECURE=False` em `.env` (desenvolvimento)
- [ ] `.env` no `.gitignore`
- [ ] Senhas não expostas em logs

## 📦 Pronto para Produção

Quando for fazer deploy:
- [ ] Gerar nova `SECRET_KEY`
- [ ] Gerar nova `JWT_SECRET_KEY`
- [ ] Definir `FLASK_ENV=production`
- [ ] Definir `JWT_COOKIE_SECURE=True`
- [ ] Obter token `MERCADOPAGO_ACCESS_TOKEN`
- [ ] Definir `BASE_URL` para seu domínio
- [ ] Definir `CORS_ORIGINS` para seu domínio
- [ ] Executar `flask db upgrade` no servidor
- [ ] Testar pagamento com MercadoPago

## 📚 Documentação

- [README.md](README.md) - Overview geral
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Guia detalhado Supabase
- [QUICKSTART.md](QUICKSTART.md) - Início rápido

## 🆘 Suporte

Se encontrar problemas:

1. Verifique `DATABASE_URL` em `.env`
2. Verifique se Supabase está ativo
3. Verifique logs: `python test_supabase.py`
4. Verifique migrações: `flask db upgrade`
5. Verifique dependências: `pip list`

---

**Nota:** Este checklist garante que tudo está configurado corretamente!
