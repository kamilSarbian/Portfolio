# Backend Portfolio App

Backend-focused portfolio application built with FastAPI, PostgreSQL, JWT auth, external API integration, image processing, and ML inference.

## Live Links

- Frontend: https://kamilsarbian-dev.vercel.app
- API docs: https://portfolio-api-kym0.onrender.com/docs

## What this project demonstrates

- REST API design with FastAPI
- JWT authentication and role-based access
- PostgreSQL integration with SQLAlchemy
- external API integration with Have I Been Pwned
- file upload and image processing
- ML inference with a CLIP-based classifier
- deployed frontend and backend services

## Main Modules

### 1. Authentication and Users
User registration, login, JWT-based authentication, protected endpoints, and role-based access.

Example endpoints:
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/profile`
- `GET /users`

### 2. Password Breach Checker
Checks whether a password appears in known breaches using the Have I Been Pwned k-Anonymity API flow.

Example endpoint:
- `POST /passwords/check`

### 3. Image Processing API
Simple image upload and transformation service.

Example capabilities:
- resize
- grayscale conversion
- rotation

### 4. Image Classifier
Image classification demo using a CLIP-based model with predefined categories.

Example endpoint:
- `POST /vision/classify`

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
├─ backend/
│  ├─ core/         # config, database, security helpers
│  ├─ models/       # SQLAlchemy models
│  ├─ routers/      # API route modules
│  ├─ services/     # business logic and integrations
│  └─ main.py       # FastAPI app entrypoint
├─ public/          # static frontend assets
├─ src/
│  ├─ components/   # reusable UI components
│  ├─ pages/        # app pages
│  ├─ i18n/         # translations
│  └─ App.jsx       # frontend app entry
├─ package.json
├─ vercel.json
└─ README.md


## API Overview

| Method | Endpoint            | Auth  | Purpose                          |
|--------|-------------------|-------|----------------------------------|
| POST   | /auth/register     | No    | Register a new user              |
| POST   | /auth/login        | No    | Log in and receive token         |
| GET    | /users/profile     | Yes   | Get current user profile         |
| GET    | /users             | Admin | List users                       |
| POST   | /passwords/check   | No    | Check password against breaches  |
| POST   | /images/...        | No    | Process uploaded image           |
| POST   | /vision/classify   | No    | Run image classification         |
| GET    | /health            | No    | Health check                     |
| GET    | /version           | No    | Service version                  |

## Run Locally

### Backend

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload


### Frontend

npm install
npm run dev


## Service Endpoints

- `/health` – basic health check  
- `/version` – service version info  

## Notes

- ML model loads on first request (slower initial response)  
- free hosting may cause cold starts  
- some endpoints are demo-focused  
- frontend is intentionally simple (backend-focused project)  

## Next Improvements

- backend test coverage  
- GitHub Actions (CI)  
- Alembic migrations  
- better validation and error handling  
- rate limiting  
- Docker support  

## Author

**Kamil Sarbian**  
Junior Backend Developer  

- LinkedIn: https://www.linkedin.com/in/kamil-sarbian-3399991ba/  
- GitHub: https://github.com/kamilSarbian  