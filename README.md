# Backend Portfolio – FastAPI + React + ML

This repository contains a backend-focused portfolio project demonstrating API development, database integration, authentication systems, and basic machine learning inference.

The application includes several interactive demo projects exposed through a web interface and connected to a real backend API.

The goal of this project is to demonstrate practical backend engineering skills such as:

- REST API design
- authentication and authorization
- database modeling
- image processing
- integration with external APIs
- deploying production-like services
- basic machine learning inference

---

# Live Demo

Frontend  
https://kamilsarbian-dev.vercel.app

Backend API (Swagger documentation)  
https://portfolio-api-kym0.onrender.com/docs

---

# Projects

## Authentication API

User management system with JWT authentication.

Features:

- user registration
- login endpoint
- JWT token authentication
- protected endpoints
- role-based access (admin / user)

Example endpoints:

POST /backend/auth/register  
POST /backend/auth/login  
GET /backend/users/profile  
GET /backend/users

Technologies:

FastAPI  
JWT  
PostgreSQL  
SQLAlchemy

---

## Password Breach Checker

Checks whether a password appears in known data breaches using the HaveIBeenPwned API.

Features:

- password breach detection
- integration with external API
- simple password strength feedback

Technologies:

FastAPI  
HaveIBeenPwned API

---

## Image Processing API

A simple image processing service accessible via API.

Features:

- image upload
- image transformation
- basic image manipulation

Technologies:

FastAPI  
Pillow

---

## Image Classifier (Machine Learning)

An image classification demo using a CLIP-based model.

Features:

- image upload
- classification into predefined categories
- inference using a pretrained model

Note:

The first request may take a few seconds because the ML model loads on demand.  
This approach reduces memory usage in the hosting environment.

Technologies:

PyTorch  
OpenCLIP  
FastAPI

---

# Architecture

Frontend

React  
Vite  
React Router

Backend

FastAPI  
SQLAlchemy  
PostgreSQL

Machine Learning

PyTorch  
OpenCLIP

Infrastructure

Vercel – frontend hosting  
Render – backend API hosting  
Neon – PostgreSQL database

---

# API Documentation

Swagger documentation:

https://portfolio-api-kym0.onrender.com/docs


---

# Technologies Used

Backend

Python  
FastAPI  
SQLAlchemy  
PostgreSQL  
JWT

Frontend

React  
Vite  
React Router

Machine Learning

PyTorch  
OpenCLIP

Infrastructure

Render  
Vercel  
Neon PostgreSQL

---

# Author

Kamil Sarbian  
Junior Backend Developer

LinkedIn  
https://www.linkedin.com/in/kamil-sarbian-3399991ba/

GitHub  
https://github.com/kamilSarbian/Portfolio
