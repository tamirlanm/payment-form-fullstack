# Система управления платежами

[English](README.md) | **Русский**

Полноценное веб-приложение для управления записями о платежах, разработанное с использованием **ASP.NET Core 10, React, TypeScript, PostgreSQL и Docker**.

Приложение позволяет создавать платежи, просматривать историю операций и получать агрегированную статистику через REST API и веб-интерфейс.

> **Важно:** это демонстрационный проект. Он не выполняет реальные денежные переводы и не интегрирован с платёжными системами.

## Возможности

- Создание и сохранение записей о платежах
- Валидация данных на frontend и backend
- Просмотр истории операций
- Статистика платежей по валютам и датам UTC
- Защита REST API с помощью API Key
- Централизованная обработка ошибок
- Хранение информации в PostgreSQL
- Запуск всего приложения одной командой через Docker Compose

## Используемые технологии

| Компонент | Технологии |
|-----------|------------|
| Backend | C#, .NET 10, ASP.NET Core Web API |
| Frontend | React 19, TypeScript, Vite, CSS |
| База данных | PostgreSQL 18 |
| ORM | Entity Framework Core, Npgsql |
| Валидация | FluentValidation |
| Инфраструктура | Docker, Docker Compose |
| Безопасность | API Key Middleware |

## Архитектура

Backend разделён на четыре слоя:

- **Domain** — сущности, перечисления и бизнес-правила
- **Application** — DTO, валидаторы, интерфейсы и сервисы
- **Infrastructure** — EF Core, конфигурация базы данных, репозитории и миграции
- **API** — контроллеры, middleware и настройка Dependency Injection

### Структура проекта

```text
payment-form-fullstack/
├── backend/
│   ├── PaymentService.Api/
│   ├── PaymentService.Application/
│   ├── PaymentService.Domain/
│   ├── PaymentService.Infrastructure/
│   ├── DockerFile
│   └── PaymentService.slnx
├── frontend/
│   ├── src/
│   ├── DockerFile
│   └── package.json
├── docker-compose.yml
├── .env.example
├── README.md
└── README_RU.md
```

## Быстрый запуск через Docker Compose

**Рекомендуемый способ запуска проекта.**

### Требования

- Docker Desktop
- Docker Compose
- Git

**При использовании Docker не нужно отдельно устанавливать .NET SDK, Node.js или PostgreSQL.**

### 1. Клонирование репозитория

```bash
git clone https://github.com/tamirlanm/payment-form-fullstack.git
cd payment-form-fullstack
```

### 2. Настройка переменных окружения

Создайте `.env` на основе файла `.env.example`.

Для Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Для Linux / macOS:

```bash
cp .env.example .env
```

Откройте `.env` и укажите значения:

```dotenv
POSTGRES_PASSWORD=your_local_database_password
API_SECURITY_KEY=your_long_random_demo_key
```

Где:

- `POSTGRES_PASSWORD` — пароль пользователя PostgreSQL.
- `API_SECURITY_KEY` — демонстрационный ключ для доступа к REST API.

**Не добавляйте настоящий `.env` с секретами в публичный репозиторий.**

### 3. Сборка и запуск контейнеров

В корне проекта выполните:

```bash
docker compose up -d --build
```

Docker Compose соберёт и запустит три сервиса:

| Контейнер | Назначение | Адрес |
|-----------|------------|-------|
| frontend | React + Vite Preview | http://localhost:4173 |
| api | ASP.NET Core Web API | http://localhost:8080 |
| db | PostgreSQL 18 | localhost:5433 |

Для PostgreSQL настроен `healthcheck`. Backend ожидает готовности базы данных перед запуском.

При запуске API автоматически применяет необходимые миграции Entity Framework Core.

**При запуске через Docker вручную применять миграции не требуется.**

### 4. Открытие приложения

Откройте в браузере:

**http://localhost:4173**

В интерфейсе:

1. Введите API Key из вашего файла `.env`.
2. Нажмите кнопку **Connect**.
3. Создайте тестовый платёж.
4. Откройте историю операций и статистику.

### 5. Проверка состояния контейнеров

```bash
docker compose ps
```

Просмотр логов backend:

```bash
docker compose logs -f api
```

Просмотр логов frontend:

```bash
docker compose logs -f frontend
```

### 6. Остановка приложения

```bash
docker compose down
```

Данные PostgreSQL сохраняются в Docker Volume после остановки контейнеров.

**Внимание:** команда `docker compose down -v` удалит также Volume с данными базы.

---

## Локальная разработка без полной контейнеризации

Этот способ подходит для разработки и отладки backend и frontend напрямую на компьютере.

### Требования

- .NET 10 SDK
- Node.js 22 и npm
- Docker Desktop
- EF Core CLI версии 10.x

### 1. Запуск только PostgreSQL

Убедитесь, что корневой `.env` настроен.

Выполните:

```bash
docker compose up -d db
```

База данных будет доступна по адресу:

`localhost:5433`

### 2. Настройка backend

Создайте локальную конфигурацию:

```powershell
Copy-Item backend/PaymentService.Api/appsettings.Development.example.json backend/PaymentService.Api/appsettings.Development.json
```

Настройте подключение к PostgreSQL и API Key:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=payment_service_db;Username=payment_user;Password=your_local_database_password"
  },
  "ApiSecurityKey": {
    "Key": "your_long_random_demo_key"
  }
}
```

Пароль должен совпадать с паролем PostgreSQL, указанным при создании базы данных.

### 3. Применение миграций

При необходимости установите EF Core CLI:

```bash
dotnet tool install --global dotnet-ef --version 10.*
```

Примените миграции:

```bash
dotnet ef database update --project backend/PaymentService.Infrastructure --startup-project backend/PaymentService.Api --context PaymentDbContext
```

### 4. Запуск backend

Из корня репозитория:

```bash
dotnet run --project backend/PaymentService.Api --launch-profile http
```

Backend будет доступен по адресу:

`http://localhost:5190`

### 5. Запуск frontend

В отдельном терминале:

```bash
cd frontend
npm ci
```

Создайте `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:5190
```

Запустите Vite Dev Server:

```bash
npm run dev
```

Откройте:

`http://localhost:5173`

Введите API Key, указанный в локальной конфигурации backend.

---

## REST API

Все эндпоинты платежей защищены API Key.

Для выполнения запросов требуется заголовок:

```http
X-API-Key: your_long_random_demo_key
```

| Метод | Маршрут | Назначение |
|-------|---------|------------|
| POST | `/api/payments` | Создание платежа |
| GET | `/api/payments` | Получение истории платежей |
| GET | `/api/payments/stats` | Получение статистики |

### Пример создания платежа

Для Docker:

```http
POST http://localhost:8080/api/payments
Content-Type: application/json
X-API-Key: your_long_random_demo_key
```

Тело запроса:

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

При успешном выполнении возвращается HTTP `201 Created` и информация о созданном платеже.

### Поддерживаемые валюты

- RUB
- USD
- EUR

### Валидация

Backend проверяет:

- Наличие обязательных полей
- Номер кошелька, состоящий из цифр `0–9`
- Корректность email
- Формат необязательного номера телефона
- Положительную сумму с точностью до двух знаков после запятой
- Поддерживаемую валюту
- Ограничения на длину полей

Некорректные запросы возвращают HTTP `400 Bad Request`.

При отсутствии или неправильном API Key возвращается HTTP `401 Unauthorized`.

## Статусы платежей

В доменной модели предусмотрены:

- `Created` — платёж создан
- `Rejected` — платёж отклонён

При успешном создании новой записи устанавливается статус `Created`.

Отдельный бизнес-сценарий для перевода платежа в `Rejected` в текущей реализации отсутствует.

## Статистика

API предоставляет:

- Общее количество платежей
- Количество платежей по каждой валюте
- Общую сумму отдельно для каждой валюты
- Ежедневное количество и суммы платежей по датам UTC

**Суммы разных валют не складываются**, так как в проекте нет механизма конвертации валют.

## Проверка сборки

Проверка backend:

```bash
dotnet build backend/PaymentService.slnx
```

Проверка frontend:

```bash
cd frontend
npm ci
npm run build
npm run lint
```

## Решение распространённых проблем

### Ошибка 401 Unauthorized

Проверьте правильность API Key.

Для Docker ключ задаётся через `API_SECURITY_KEY` в `.env`.

Для локальной разработки используется `ApiSecurityKey:Key` в `appsettings.Development.json`.

### Ошибка подключения к PostgreSQL

Проверьте контейнеры:

```bash
docker compose ps
```

Просмотрите логи:

```bash
docker compose logs db
```

Обратите внимание: изменение `POSTGRES_PASSWORD` в `.env` не изменяет пароль пользователя уже инициализированной базы PostgreSQL в Docker Volume.

### Backend не запускается

Просмотрите логи API:

```bash
docker compose logs api
```

При запуске Docker API применяет EF Core Migrations, если включена настройка `Database__ApplyMigrations=true`.

### Frontend показывает "Failed to fetch"

Проверьте доступность backend:

- Docker: `http://localhost:8080`
- Локальная разработка: `http://localhost:5190`

При локальном запуске также проверьте `VITE_API_BASE_URL` и настройки CORS.

## Безопасность и ограничения

- Приложение предназначено для демонстрации и тестирования.
- Реальные платежи не выполняются.
- Интеграции с платёжными шлюзами отсутствуют.
- API Key используется для простой защиты запросов, но не заменяет полноценную аутентификацию пользователей.
- Ввод API Key в браузере подходит только для локальной демонстрации, а не для защиты production-секретов.
- История загружается в память приложения, а статистика рассчитывается через LINQ. При больших объёмах данных предпочтительнее агрегация в PostgreSQL и пагинация.
- В контейнере frontend используется Vite Preview, предназначенный для проверки собранного приложения, а не для полноценного production-хостинга.

## Назначение проекта

Проект разработан для демонстрации навыков full-stack разработки с использованием ASP.NET Core, React, PostgreSQL, REST API, валидации, многослойной архитектуры и Docker Compose.
