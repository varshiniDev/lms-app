# LMS - ready for an education / training institute

Dashboard, Students (Excel import), Instructors, Courses & Syllabus, Batches, Enrollment, Class schedule (join links), Attendance, Assignments, Assessments (auto-grade), Study materials, Fees & payments (instalments), Certificates (PDF download), Announcements, 7 reports.

Backend: **Django + Django REST Framework + JWT**. Frontend: **React + Vite + Tailwind**, one component per screen.
**No demo data** - the database starts empty; everything you see comes from the database.
This project is fully independent (own database, own login). It does not need any other system.

## 1. Backend (port 8002)
    cd backend
    python -m venv venv
    venv\Scripts\activate            (Mac/Linux: source venv/bin/activate)
    pip install -r requirements.txt
    copy .env.example .env            (Mac/Linux: cp .env.example .env)
    python manage.py migrate          (creates all tables AND the first administrator)
    python manage.py runserver 8002

First administrator (from `.env`): **VarshiniShan / VarshiniShan**. Change `ADMIN_PASSWORD` in `.env` before the first `migrate`, or change the password later on the Users screen.

## 2. Frontend (port 5174)
    cd frontend
    npm install
    copy .env.example .env            (Mac/Linux: cp .env.example .env)
    npm run dev                       -> http://localhost:5174

In `frontend/.env` set `VITE_COMPANY_NAME` to your company name and `VITE_API_URL` to the backend address. Replace `frontend/public/logo.svg` with your logo (shown on the login page, sidebar and browser tab).

## 3. Users, user levels and screen access (built into the same app - no separate admin site)
Log in as the administrator, then use the **Admin** menu:
1. **User levels** - create a level (for example *Manager*, *Sales Executive*, *Front Desk*). A matrix lets you choose, for every screen, whether that level can **View / Add / Edit / Delete**. (Add/Edit/Delete automatically include View.)
2. **Users** - create a login (username, password) and assign it a user level. You can disable a login or reset its password at any time.
3. Everyone then sees only the screens their level allows, and buttons (Add / Edit / Delete / Import) appear only if permitted. The same rules are enforced by the API, so typing a URL or calling the API directly is refused (403).
- **Administrator** is a built-in level with full access and cannot be edited or deleted. Nobody can delete or disable their own account.
- Dropdown lists (for example account or course lists) are readable by every login so forms work. Dashboard / Reports access also allows reading the underlying numbers (read-only).
- Screen keys: dashboard, students, staff (Instructors), courses, batches, enrollment, schedule, attendance, assignments, assessments, materials, fees, certificates, announcements, reports.

## Database
Default is SQLite (no setup). For **MySQL**:
1. Create the database and a user:
       CREATE DATABASE lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
       CREATE USER 'lmsuser'@'%' IDENTIFIED BY 'your-password';
       GRANT ALL PRIVILEGES ON lms_db.* TO 'lmsuser'@'%';  FLUSH PRIVILEGES;
2. In `backend/.env`: `DB_ENGINE=mysql`, then remove the `#` from `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` and fill them in.
3. `python manage.py dbinfo` shows which database Django really uses (it must say mysql and "Connected"), then `python manage.py migrate`.
PostgreSQL works the same way (`DB_ENGINE=postgresql`, `pip install psycopg2-binary`).

## Every screen
Responsive (sidebar becomes a drawer on mobile), full-width content, tables scroll inside their own box with a sticky header, search + sort + pagination (10/25/50/100), and **Download -> PDF / Excel** on every list, report and dashboard (dashboards also Print).

## Folder structure
    backend/
      config/       settings (database, CORS, screen list), urls
      core/         login (JWT), user levels, users, permission checks, shared API helpers
      lms/          models.py  views.py  urls.py  migrations/
    frontend/
      public/logo.svg     <- your logo
      src/config/         brand.js  navigation.js  collections.js (screen -> API endpoint)  constants.js
      src/services/       api.js (JWT + auto refresh)  store.js  exporters.js (PDF/Excel)
      src/components/     common (DataTable, EntityPage, ReportsPage, ImportModal, PermissionMatrix ...)  charts  layout
      src/modules/        auth  dashboard  lms  general (Users, User levels, Settings)

## Add a screen
Backend: model in `lms/models.py`, then in `views.py` add `build_serializer(Model)` + `make_viewset(Model, Serializer, "screenkey")`, register it in `urls.py`, add the key to `SCREENS` in `config/settings.py`, run `makemigrations` + `migrate`.
Frontend: add the endpoint to `collections.js`, create `modules/lms/MyScreen.jsx` with `<EntityPage .../>`, add a route in `App.jsx` and a link (with the same key) in `navigation.js`.

## Going live
`DJANGO_DEBUG=False`, a real `DJANGO_SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ORIGINS` (your frontend URL), strong `ADMIN_PASSWORD`, MySQL/PostgreSQL, gunicorn + HTTPS for the backend, `npm run build` for the frontend.
Lists load in full and are paginated in the browser (fine for thousands of rows per list).

