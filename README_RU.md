# Система управления платежами

[English](README.md) | **Русский**

Веб-приложение для создания, хранения и просмотра записей о платежах. Система предоставляет REST API, историю операций и агрегированную статистику по валютам и датам.

> **Демонстрационный проект:** приложение не проводит реальные денежные операции, не интегрируется с платёжными шлюзами и не предназначено для хранения настоящих платёжных реквизитов.

## Возможности

- Создание платежа через веб-форму.
- Проверка входных данных на frontend и backend.
- Просмотр истории операций с датой, аккаунтом, email, суммой, валютой и статусом.
- Статистика: общее количество операций, суммы и количество по валютам, ежедневные агрегаты по UTC.
- Защита API-запросов заголовком `X-API-Key`.
- Централизованная обработка ошибок.
- Хранение данных в PostgreSQL через Entity Framework Core.

## Технологии

| Компонент | Технологии |
| --- | --- |
| Backend | C# / .NET 10, ASP.NET Core Web API |
| Архитектура | Domain, Application, Infrastructure, API |
| Работа с данными | Entity Framework Core, Npgsql, PostgreSQL 18 |
| Валидация | FluentValidation |
| Frontend | React, TypeScript, Vite, CSS |
| Инфраструктура | Docker Compose (PostgreSQL), EF Core Migrations |

## Структура проекта

```text
payment-form-fullstack/
├── backend/
│   ├── PaymentService.Api/             # Контроллеры, middleware, настройка DI
│   ├── PaymentService.Application/     # DTO, валидаторы, интерфейсы, сервисы
│   ├── PaymentService.Domain/          # Сущности и бизнес-правила
│   ├── PaymentService.Infrastructure/  # EF Core, репозитории, миграции
│   └── PaymentService.slnx
├── frontend/                           # React + TypeScript
├── docker-compose.yml
├── .env.example
├── README.md
└── README_RU.md
```

## Требования для запуска

- .NET 10 SDK.
- Node.js и npm, совместимые с установленным Vite.
- Docker Desktop с Docker Compose.
- Инструмент командной строки `dotnet-ef` версии 10.x для применения миграций.

Порт API по существующему профилю запуска — `5190`, frontend по умолчанию использует `5173`, PostgreSQL доступен с компьютера через `5433`.

## Быстрый запуск

Все команды ниже выполняются из **корня репозитория**, если не указано иное. Примеры рассчитаны на PowerShell в Windows.

### 1. Скачать проект

```powershell
git clone https://github.com/tamirlanm/payment-form-fullstack.git
cd payment-form-fullstack
```

### 2. Запустить PostgreSQL

Создайте локальный `.env` на основе `.env.example`:

```powershell
Copy-Item .env.example .env
```

Впишите в `.env` свой локальный пароль:

```dotenv
POSTGRES_PASSWORD=replace_with_local_password
```

Если в репозитории ещё нет `.env.example`, создайте его с такой же переменной и **без настоящего пароля**.

Запустите контейнер:

```powershell
docker compose up -d
docker compose ps
```

Конфигурация проекта использует:

- Базу данных: `payment_service_db`.
- Пользователя: `payment_user`.
- Адрес подключения с компьютера: `localhost:5433`.

**Примечание:** PostgreSQL внутри Docker и PostgreSQL, установленный непосредственно на компьютере, — разные экземпляры. Данные контейнера хранятся в Docker Volume.

### 3. Настроить backend

В каталоге `backend/PaymentService.Api/` создайте локальный файл `appsettings.Development.json` (его нельзя коммитить с секретами):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=payment_service_db;Username=payment_user;Password=replace_with_local_password"
  },
  "ApiSecurityKey": {
    "Key": "replace_with_long_random_demo_key"
  }
}
```

Укажите тот же пароль, который использовали при инициализации базы. Для демонстрационного API-ключа задайте отдельное длинное случайное значение.

> **Важно:** в текущем опубликованном `ApiKeyMiddleware` ключ читается по пути `ApiSecurityKey:Key`. Если вы изменили этот путь локально, название секции в JSON должно совпадать с ним. Не кладите секрет в `frontend/.env.local` или переменные с префиксом `VITE_`.

### 4. Применить миграции

Проверьте наличие EF CLI:

```powershell
dotnet ef --version
```

Если команда отсутствует, установите инструмент версии 10.x:

```powershell
dotnet tool install --global dotnet-ef --version 10.0.15
```

Примените существующие миграции:

```powershell
dotnet ef database update --project backend/PaymentService.Infrastructure --startup-project backend/PaymentService.Api --context PaymentDbContext
```

Команда создаст структуру таблиц в PostgreSQL. Вручную выполнять `CREATE TABLE` не требуется.

### 5. Запустить backend

```powershell
dotnet run --project backend/PaymentService.Api --launch-profile http
```

По текущим настройкам HTTP API доступен на `http://localhost:5190`. Фактический адрес проверьте по строке `Now listening on:` в терминале.

### 6. Запустить frontend

Откройте **новый терминал**:

```powershell
cd frontend
npm install
```

При необходимости создайте файл `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:5190
```

Запустите интерфейс:

```powershell
npm run dev
```

Откройте `http://localhost:5173`.

В поле подключения введите **демонстрационный** API Key, соответствующий конфигурации backend, и нажмите **Connect**. После этого можно создавать платежи, просматривать историю и статистику.

## REST API

Все маршруты требуют заголовок `X-API-Key`.

| Метод | Маршрут | Назначение |
| --- | --- | --- |
| `POST` | `/api/payments` | Создание платежа |
| `GET` | `/api/payments` | История платежей |
| `GET` | `/api/payments/stats` | Статистика по валютам и дням |

Пример запроса:

```http
POST http://localhost:5190/api/payments
Content-Type: application/json
X-API-Key: your_demo_api_key
```

```json
{
  "walletNumber": "00123456789",
  "account": "testuser1",
  "email": "test@example.com",
  "phone": "+77771234567",
  "amount": 1500.50,
  "currency": "USD",
  "comment": "Test payment"
}
```

При успешном создании API возвращает данные платежа, включая идентификатор, статус и дату создания. Набор поддерживаемых валют: `RUB`, `USD`, `EUR`.

### Валидация

Проверяются обязательные поля, корректность email, формат телефона при наличии, положительная сумма, допустимая валюта, а также ограничения на длину строк. Для кошелька в текущей версии предполагается строка из цифр — обязательно сохраните соответствующее правило валидатора до сдачи.

### Статистика

API выдаёт общее число платежей и отдельные группы для каждой валюты. Внутри валютной группы содержатся сумма, количество и агрегаты по календарным дням UTC. **Суммы разных валют не складываются** без обменного курса.

## Проверка сборки

Из корня репозитория:

```powershell
dotnet build backend/PaymentService.slnx
```

Для frontend:

```powershell
cd frontend
npm run build
npm run lint
```

При наличии тестового проекта его можно запустить через `dotnet test` с путём к соответствующему `.csproj`.

## Остановка сервисов

Остановить контейнер базы данных:

```powershell
docker compose down
```

Эта команда сохраняет именованный Docker Volume. Команда `docker compose down -v` удаляет Volume с данными — **не используйте её, если данные нужно сохранить**.

## Безопасность и ограничения

- Не отправляйте `.env`, `appsettings.Development.json` и `frontend/.env.local` с настоящими секретами в публичный репозиторий.
- Форма ввода API Key во frontend предназначена только для локальной демонстрации. **Постоянный серверный секрет нельзя считать защищённым, если он передаётся браузеру.** Для публичной эксплуатации требуется отдельная схема авторизации / серверный посредник.
- Сервис не выполняет реальные платежи и не содержит интеграций с платёжными системами.
- Для больших объёмов данных статистику стоит рассчитывать запросами в PostgreSQL, а не загружать всю историю в память.

## Типичные проблемы

**`500 Internal Server Error` при сохранении:** убедитесь, что Docker-контейнер PostgreSQL запущен (`docker compose ps`) и база доступна, а затем проверьте лог backend.

**Ошибка авторизации `401`:** проверьте заголовок `X-API-Key` и совпадение с `ApiSecurityKey:Key` в локальной конфигурации.

**Ошибка подключения к PostgreSQL:** убедитесь, что используется `Host=localhost;Port=5433` и что пароль соответствует пользователю контейнера. Изменение `POSTGRES_PASSWORD` в `.env` **не меняет автоматически** пароль уже инициализированной базы в Docker Volume.

**Ошибки CORS:** проверьте, что backend разрешает источник `http://localhost:5173`, а политика CORS выполняется до middleware проверки API Key.
