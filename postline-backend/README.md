# PostLine Backend

Express + PostgreSQL API для PostLine.

## Швидкий запуск

1. Встановити залежності:

```bash
npm install
```

2. Створити `.env` за прикладом `.env.example`.

3. Запустити API:

```bash
npm run dev
```

API стартує на `http://localhost:3000/api`, якщо `PORT=3000`.

## Основні env-змінні

```env
PORT=3000
JWT_SECRET=replace_with_strong_secret_key
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postline_db
DB_USER=postgres
DB_PASSWORD=1111
MAPBOX_TOKEN=replace_with_mapbox_token
MAPBOX_MONTHLY_REQUEST_LIMIT=15000
MAPBOX_QUOTA_FILE=.mapbox-quota.json
```

`JWT_SECRET` у реальному середовищі має бути довгим випадковим значенням, а не прикладом із репозиторію.
`MAPBOX_TOKEN` потрібен тільки для оптимізації кур'єрських маршрутів і не передається на frontend.
`MAPBOX_MONTHLY_REQUEST_LIMIT` локально обмежує кількість Mapbox-запитів за календарний місяць. Значення не може перевищити 15000, навіть якщо в `.env` випадково вказати більше.
