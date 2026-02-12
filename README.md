# Pokedex Application

A full-stack web application built with **NestJS** (Backend API) and **Angular** (Frontend) that displays Pokémon information from the PokéAPI, with Redis caching and comprehensive test coverage.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Running Tests](#running-tests)

## Overview

This application provides a modern interface for exploring Pokémon data. The project consists of:

- **Backend API**: NestJS REST API with Redis caching
- **Frontend Web App**: Angular 18 standalone components with PrimeNG UI components
- **Testing**: Jest (API) and Karma/Jasmine (Frontend)
- **Containerization**: Docker & Docker Compose for easy deployment

##  Tech Stack

### Backend
- **NestJS** 11.x - Progressive Node.js framework
- **Node.js** 20+ - Runtime
- **Redis** 7 - Caching layer
- **TypeScript** 5.4+ - Language
- **Jest** - Testing framework

### Frontend
- **Angular** 18 - Framework
- **TypeScript** 5.4+ - Language
- **PrimeNG** 18 - UI Component library
- **TailwindCSS** 3.4 - Utility-first CSS framework
- **Karma/Jasmine** - Testing framework
- **RxJS** 7.8 - Reactive programming library

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Prerequisites

Ensure you have the following installed on your system:

### System Requirements
- **Node.js**: 20.x or higher
- **npm**: 10.x or higher

### For Docker Support (Optional)
- **Docker Desktop** or **Podman** (with podman-compose)
- **Docker Compose**: v2.0 or higher

### For Running Angular Tests
- **Google Chrome** or **Chromium** (for Karma/Jasmine tests)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/jitterbit/pokedex.git
cd pokedex-jitterbit
```

### 2. Install Dependencies

#### Backend API
```bash
cd api
npm install
```

#### Frontend App
```bash
cd ../app
npm install
```

### 3. Environment Setup

Both applications use default configuration. For custom settings, create `.env` files:

#### API Environment (`api/.env`)
```env
NODE_ENV=development
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
POKEAPI_URL=https://pokeapi.co/api/v2/
```

## Running the Project

### Option 1: Local Development (Without Docker)

#### Prerequisites for Local Development
- Redis must be running on `localhost:6379`

**Start Redis locally** (if not using Docker):
```bash
# podman
podman run -d --name pokedex-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine

# docker
docker run -d --name pokedex-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine
```

#### Start the Backend API

```bash
cd api
npm start
```

#### Start the Frontend Application

In a new terminal:
```bash
cd app
npm start
```

#### **System is ready, go to [localhost:4200](http://localhost:4200) to find the Pokemons!**

### Option 2: Docker Deployment

#### Prerequisites
- Docker Desktop running or Podman machine started
- At least 2GB RAM available for containers

#### Start All Services with Docker Compose

```bash
cd ./api
docker-compose up -d
```

This will:
1. Build the API image
2. Start a Redis container
3. Start the API container
4. Create a bridge network connecting both services

**Verify services are running:**
```bash
docker-compose ps
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f redis
```

**Stop services:**
```bash
docker-compose down
```

**Stop and clean up volumes:**
```bash
docker-compose down -v
```

## Running Tests

### Backend API Tests (Jest)

```bash
cd api

# Run all tests
npm test
```

### Frontend Tests (Karma/Jasmine)

```bash
cd app

# Run tests once (headless)
npm test -- --watch=false

# Run tests in headless Chrome (CI/CD)
npm test -- --watch=false --browsers=ChromeHeadless
```

