# ABP-4dsm

--- 

## Backend

### `.env`:
```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/medsalus_db"
#Gere com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=uma_chave_longa_e_aleatoria_aqui
PORT=3000
```
### Para Inicializar:
```
npm run dev
```

---

## Frontend

### `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```
### Para Inicializar:
```
npx expo start
```
