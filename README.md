# 💸 ExpenseFlow — Personal Expense Tracker

A full-stack expense tracker with a **Django REST Framework** backend and a **React + Vite** frontend.

---

## 🗂️ Project Structure

```
Expense Tracker/
├── expense-tracker-backend/       ← Django (API)
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── backend/
│   │   ├── settings.py            ← JWT, DRF, CORS config
│   │   └── urls.py                ← API routes
│   └── expenses/
│       ├── models.py              ← Expense model
│       ├── serializers.py
│       ├── views.py               ← ViewSet + MonthlyTotal
│       ├── urls.py
│       └── admin.py
│
└── expense-tracker-frontend/      ← React (UI)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                ← Routes
        ├── index.css              ← Global design system
        ├── api/
        │   └── axiosInstance.js   ← Axios + JWT interceptors
        ├── context/
        │   └── AuthContext.jsx    ← Global auth state
        ├── components/
        │   ├── ProtectedRoute.jsx
        │   ├── Navbar.jsx
        │   ├── ExpenseForm.jsx
        │   ├── ExpenseList.jsx
        │   └── MonthlyCard.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            └── DashboardPage.jsx
```

---

## 🚀 Setup & Running

### Backend (Django)

```bash
cd expense-tracker-backend

# 1. Create & activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment file (optional — defaults work for development)
copy .env.example .env

# 4. Run database migrations
python manage.py migrate

# 5. (Optional) Create a superuser for Django Admin
python manage.py createsuperuser

# 6. Start the dev server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

---

### Frontend (React + Vite)

```bash
cd expense-tracker-frontend

# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| `POST` | `/api/register/` | Public | Create a new user account |
| `POST` | `/api/token/` | Public | Login → returns `access` + `refresh` tokens |
| `POST` | `/api/token/refresh/` | Public | Exchange refresh token for a new access token |
| `GET` | `/api/expenses/` | 🔒 | List all expenses (current user only) |
| `POST` | `/api/expenses/` | 🔒 | Log a new expense |
| `GET` | `/api/expenses/<id>/` | 🔒 | Retrieve a single expense |
| `PUT` | `/api/expenses/<id>/` | 🔒 | Full update |
| `PATCH` | `/api/expenses/<id>/` | 🔒 | Partial update |
| `DELETE` | `/api/expenses/<id>/` | 🔒 | Delete an expense |
| `GET` | `/api/expenses/monthly-total/` | 🔒 | Current month's total for the current user |

---

## 🔐 Security Architecture

### Backend
- **Global permission**: `IsAuthenticated` is the default for all DRF views.
- **Data isolation**: `ExpenseViewSet.get_queryset()` always filters by `owner=request.user` — users can never see each other's data.
- **Owner auto-assignment**: `perform_create()` sets `owner=request.user` server-side, preventing client spoofing.
- **Token lifetimes**: Access token expires in **1 hour**; Refresh token expires in **1 day**.

### Frontend
- **AuthContext**: Stores decoded JWT payload globally; persists session across page reloads via `localStorage`.
- **Axios Interceptors**:
  - **Request**: Attaches `Authorization: Bearer <token>` to every request.
  - **Response**: On `401`, silently calls `/api/token/refresh/`, saves the new token, and retries the original request.
  - **Queue**: Concurrent requests during a refresh are queued and replayed after the new token arrives.
- **ProtectedRoute**: Redirects unauthenticated users to `/login`; shows a spinner during startup while checking token.

---

## 🎨 UI Features

- **Dark glassmorphism** design with violet/purple accent palette
- **Animated** expense list entries and page transitions
- **Monthly spending card** — large, prominent display of this month's total
- **Category icons** — 9 categories (Food, Transport, Shopping, Entertainment, Health, Utilities, Education, Travel, Other)
- **Hover-reveal delete** on expense items
- **Responsive layout** — works on mobile and desktop
