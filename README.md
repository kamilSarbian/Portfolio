# Backend Portfolio App

Backend-focused portfolio application built with FastAPI, PostgreSQL, JWT authentication, external API integrations, image processing, and ML inference.

## Live Links

- Frontend: https://kamilsarbian-dev.vercel.app
- API docs: https://portfolio-api-kym0.onrender.com/docs

## What This Project Demonstrates

- REST API design with FastAPI
- JWT authentication and role-based access
- PostgreSQL integration with SQLAlchemy
- External API integration with Have I Been Pwned
- File upload and image processing
- ML inference with a CLIP-based classifier
- Deployed frontend and backend services

## Architecture

```text
React + Vite frontend
        |
        | HTTPS / JSON / file uploads
        v
FastAPI backend
        |
        | SQLAlchemy
        v
PostgreSQL database

External services:
- Have I Been Pwned API for password breach checks
- SMTP provider for contact form email delivery
- OpenCLIP/PyTorch for image classification
```

## Main Modules

### 1. Authentication and Users

User registration, login, JWT-based authentication, protected endpoints, and role-based access.

Example endpoints:

- `POST /backend/auth/register`
- `POST /backend/auth/login`
- `GET /backend/users/profile`
- `GET /backend/users`

### 2. Password Breach Checker

Checks whether a password appears in known breaches using the Have I Been Pwned k-Anonymity API flow.

Example endpoint:

- `POST /backend/password/check`

### 3. Image Processing API

Simple image upload and transformation service.

Example endpoint:

- `POST /backend/image/process`

Example capabilities:

- resize
- grayscale conversion
- rotation

### 4. Image Classifier

Image classification demo using a CLIP-based model with predefined categories.

Example endpoint:

- `POST /backend/ml/classify`

## Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT authentication
- Pillow

### Frontend

- React
- Vite
- React Router
- i18next

### ML

- PyTorch
- OpenCLIP

### Infrastructure

- Vercel
- Render
- Neon PostgreSQL

## Project Structure

```text
Portfolio/
|-- backend/
|   |-- core/         # config, database, security helpers
|   |-- models/       # SQLAlchemy models
|   |-- routers/      # API route modules
|   |-- services/     # business logic and integrations
|   |-- tests/        # backend tests
|   `-- main.py       # FastAPI app entrypoint
|-- public/           # static frontend assets
|-- src/
|   |-- components/   # reusable UI components
|   |-- pages/        # app pages
|   |-- i18n/         # translations
|   `-- App.jsx       # frontend app entry
|-- package.json
|-- vercel.json
`-- README.md
```

## API Overview

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/backend/auth/register` | No | Register a new user |
| POST | `/backend/auth/login` | No | Log in and receive token |
| GET | `/backend/users/profile` | Yes | Get current user profile |
| GET | `/backend/users` | Admin | List users |
| POST | `/backend/password/check` | No | Check password against breaches |
| POST | `/backend/image/process` | No | Process an uploaded image |
| GET | `/backend/ml/info` | No | Get ML model metadata |
| GET | `/backend/ml/examples` | No | Get example classification labels |
| POST | `/backend/ml/classify` | No | Run image classification |
| POST | `/backend/contact/send` | No | Send a contact form message |
| GET | `/health` | No | Health check |
| GET | `/version` | No | Service version |

## Run Locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Create `backend/.env` from `backend/.env.example` and set at least:

- `DATABASE_URL`
- `JWT_SECRET`
- SMTP settings if contact email is enabled

### Frontend

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` if your backend is not running on `http://127.0.0.1:8000`.

## Quality Checks

```bash
npm run check
npm run test:backend
```

You can also run backend tests directly from the project root with:

```bash
.\venv\Scripts\python.exe -m pytest -q
```

## Notes

- ML model loads on first request, so the initial classification request can be slower.
- Free hosting may cause cold starts.
- Some endpoints are demo-focused.
- The frontend is intentionally simple because this is a backend-focused portfolio project.

## Next Improvements

- Expand backend test coverage
- Add Alembic migrations for production database changes
- Add stronger validation and error handling
- Add persistent rate limiting with Redis for production
- Add Docker support
- Add demo screenshots or GIFs to this README

## Author

**Kamil Sarbian**  
Backend Developer

- LinkedIn: https://www.linkedin.com/in/kamil-sarbian-3399991ba/
- GitHub: https://github.com/kamilSarbian
