# ABP-4dsm

--- 

## Source

### `.env`:
```
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=medsalus_db
#Gere com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=uma_chave_longa_e_aleatoria_aqui
```

### Para Inicializar:
```
# na raiz do projeto (pasta source/)
docker compose up --build
```

### Para Parar:
```
# para o docker
docker compose down
```

### Para Consultar as tabelas no Docker:
```
cd caminho/para/source
docker compose exec postgres psql -U postgres -d medsalus_db
```

---

## Frontend

### `.env`:
```
EXPO_PUBLIC_API_URL=https://projeto-salus-production.up.railway.app/api
```
### Para Inicializar:
```
cd frontend

npm install

npx expo start
```

---

## Backend (Caso não use o docker)

### `.env`:
```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/medsalus_db"
#Gere com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=uma_chave_longa_e_aleatoria_aqui
PORT=3000
```
### Para Inicializar:
```
cd backend

npm install

npm run dev
```