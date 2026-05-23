# Backend Developer & AI Automation Portfolio

Portfolio site and backend demo platform for practical backend systems, API integrations, and automation workflows.

The project is built to show how I approach workflows: start from the problem, design a reliable backend path, expose clear APIs, and keep the frontend focused on making the system easy to inspect.

## Live Links

- Portfolio: https://kamilsarbian-dev.vercel.app
- API docs: https://portfolio-api-kym0.onrender.com/docs
- GitHub: https://github.com/kamilSarbian/Portfolio

## Problem

Most portfolio projects present technologies before the value they create. This project is structured around backend problems that appear in real internal tools: secure access, API communication, repetitive manual work, file processing, and clear data flow between services.

## Solution

The application combines a React frontend with a FastAPI backend and exposes several working backend workflows:

- authentication and role-based access
- image classification with CLIP-based inference
- image processing through API upload flows
- contact workflow with backend validation and email delivery
- API documentation through Swagger

The frontend presents the work as focused case studies instead of a long list of disconnected demos.

## Business Value

- Reusable backend foundation for dashboards, admin panels, and internal tools.
- API workflows that reduce manual file handling and make processing repeatable.
- Clear technical documentation that helps recruiters and engineers inspect the system quickly.
- Production-minded details such as validation, role checks, JWT configuration, error handling, and test coverage.

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
- SMTP provider for contact form email delivery
- OpenCLIP/PyTorch for image classification
- Have I Been Pwned API for the password breach experiment
```

## Screenshots

Project previews are stored in `public/projects/`.

| Authentication & User Management API | AI-assisted Image Classification API | Image Processing API |
| --- | --- | --- |
| ![Authentication API preview](public/projects/auth-api.png) | ![AI-assisted image classification preview](public/projects/image-classifier.png) | ![Image processing preview](public/projects/image-processing.png) |

## Featured Case Studies

### Authentication & User Management API

**Problem**  
Internal tools often need secure user access without overcomplicated identity infrastructure.

**Solution**  
A FastAPI authentication service with registration, JWT login, protected profile access, role-based admin endpoints, password hashing, validation, and database persistence.

**Production Thinking**  
JWT configuration checks, bcrypt password hashing, role-based access, input validation, database persistence, and focused backend tests.

**API examples**

```http
POST /backend/auth/register
POST /backend/auth/login
GET /backend/users/profile
GET /backend/users
```

### AI-assisted Image Classification API

**Problem**  
Manual image review and categorization can become repetitive when teams need a first-pass classification step.

**Solution**  
A CLIP-based classification workflow exposed through FastAPI and connected to a frontend upload experience.

**Production Thinking**  
Model metadata endpoint, example labels, upload handling, clear API boundaries, and cold-start awareness for hosted inference.

**API examples**

```http
GET /backend/ml/info
GET /backend/ml/examples
POST /backend/ml/classify
```

### Image Processing API

**Problem**  
Teams often need repeatable file transformations instead of manual editing.

**Solution**  
An image upload and processing API that supports simple transformations through a predictable backend endpoint.

**API example**

```http
POST /backend/image/process
```

## Supporting Experiment

### Password Breach Checker

Small API integration experiment using the Have I Been Pwned k-anonymity flow.

```http
POST /backend/password/check
```

This remains a supporting experiment, not a featured case study.

## API Overview

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/backend/auth/register` | No | Register a new user |
| POST | `/backend/auth/login` | No | Log in and receive token |
| GET | `/backend/users/profile` | Yes | Get current user profile |
| GET | `/backend/users` | Admin | List users |
| POST | `/backend/image/process` | No | Process an uploaded image |
| GET | `/backend/ml/info` | No | Get ML model metadata |
| GET | `/backend/ml/examples` | No | Get example classification labels |
| POST | `/backend/ml/classify` | No | Run image classification |
| POST | `/backend/contact/send` | No | Send a contact form message |
| POST | `/backend/password/check` | No | Check password against breaches |
| GET | `/health` | No | Health check |
| GET | `/version` | No | Service version |

## Stack

**Backend**  
Python, FastAPI, REST APIs

**Database**  
PostgreSQL, SQLAlchemy, SQL

**AI / Automation**  
CLIP, embeddings-style classification workflow, OpenCLIP/PyTorch

**Frontend**  
React, Vite, i18next

**Tools and Deployment**  
Git, Vercel, Render, Neon PostgreSQL

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
|-- public/
|   `-- projects/     # project preview images
|-- src/
|   |-- components/   # reusable UI components
|   |-- pages/        # app pages and case studies
|   |-- i18n/         # translations
|   `-- App.jsx       # frontend app entry
|-- package.json
|-- vercel.json
`-- README.md
```

## How to Run

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Create `backend/.env` from `backend/.env.example` and configure:

- `DATABASE_URL`
- `JWT_SECRET`
- SMTP settings if contact email is enabled

### Frontend

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` if the backend is not running on `http://127.0.0.1:8000`.

## Quality Checks

```bash
npm run check
npm run test:backend
```

Backend tests can also be run directly from the project root:

```bash
.\venv\Scripts\python.exe -m pytest -q
```

## Deployment

- Frontend: Vercel
- Backend API: Render
- Database: Neon PostgreSQL
- API documentation: FastAPI Swagger UI at `/docs`

## GitHub Profile Checklist

For the public GitHub profile, pin only the strongest repositories:

1. `Portfolio` - backend portfolio and case studies.
2. Auth/API focused project, if separated into its own repository later.
3. AI automation or image classification project, if separated into its own repository later.

Avoid pinning tutorial repositories or unfinished experiments. Supporting experiments should stay visible only when they help explain API integration or backend thinking.

## Author

**Kamil Sarbian**  
Backend Developer - APIs, automation, integrations

- LinkedIn: https://www.linkedin.com/in/kamil-sarbian-3399991ba/
- GitHub: https://github.com/kamilSarbian
