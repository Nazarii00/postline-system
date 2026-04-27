# PostLine Frontend

React + TypeScript + Vite клієнт для PostLine.

## Швидкий запуск

1. Встановити залежності:

```bash
npm install
```

2. Створити `.env` поруч із `package.json`:

```env
VITE_API_URL=http://localhost:3000/api
```

3. Запустити dev-сервер:

```bash
npm run dev
```

## Перевірки

```bash
npm run lint
npm run build
```

`VITE_API_URL` має вказувати на backend API з префіксом `/api`, бо frontend викликає шляхи на кшталт `/auth/me`, `/shipments`, `/departments`.
