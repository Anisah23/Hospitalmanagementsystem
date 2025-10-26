# Hospital Management System - CI/CD Pipeline

This document describes the CI/CD pipeline setup for the Hospital Management System, which deploys the entire application (frontend + backend) as a single unit.

## 🏗️ Architecture

The application is containerized using Docker and deployed using Docker Compose. The system consists of:

- **Frontend**: React application served by Nginx
- **Backend**: Flask API with Gunicorn and Nginx
- **Database**: PostgreSQL database
- **Reverse Proxy**: Nginx handles both frontend and backend routing

## 📁 Project Structure

```
hospital-management-system/
├── Dockerfile                    # Multi-stage build for entire app
├── docker-compose.yml           # Local development setup
├── scripts/
│   └── deploy.sh               # Deployment script
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions CI/CD pipeline
├── hospital-management-frontend/ # React frontend
└── hospital-management-backend/  # Flask backend
```

## 🚀 Deployment

### Local Development

1. **Prerequisites**:
   - Docker
   - Docker Compose

2. **Start the application**:
   ```bash
   ./scripts/deploy.sh
   ```

3. **Access the application**:
   - Frontend: http://localhost
   - API: http://localhost/api

### Production Deployment

The CI/CD pipeline automatically deploys to production when code is pushed to the `main` branch.

#### Manual Production Deployment

```bash
# Deploy to production
./scripts/deploy.sh

# Check status
./scripts/deploy.sh status

# View logs
./scripts/deploy.sh logs

# Restart services
./scripts/deploy.sh restart

# Stop services
./scripts/deploy.sh stop
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline consists of two jobs:

#### 1. Test Job
- **Trigger**: Push/PR to `main` or `develop` branches
- **Services**: PostgreSQL for testing
- **Steps**:
  - Install Python and Node.js dependencies
  - Run backend tests with pytest and coverage
  - Run frontend tests with Jest and coverage
  - Build Docker images

#### 2. Build and Deploy Job
- **Trigger**: Push to `main` branch (after tests pass)
- **Steps**:
  - Build and push Docker images to Docker Hub
  - Deploy to production server (placeholder for actual deployment)

### Environment Variables

Set these secrets in your GitHub repository:

- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password
- `PRODUCTION_HOST`: Production server hostname/IP
- `PRODUCTION_USER`: SSH user for production server
- `SSH_PRIVATE_KEY`: SSH private key for deployment

## 🐳 Docker Configuration

### Root Dockerfile

The root `Dockerfile` uses a multi-stage build:

1. **Frontend Build**: Builds the React app
2. **Backend**: Sets up Python environment with Nginx and Supervisor
3. **Production**: Combines frontend build with backend

### Docker Compose Services

- **db**: PostgreSQL database with health checks
- **app**: Main application container (frontend + backend)

## 📊 Monitoring

### Health Checks

- Database health check using `pg_isready`
- Application health check via HTTP endpoint

### Logs

View logs using:
```bash
docker-compose logs -f
```

## 🔧 Configuration

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `FLASK_ENV`: Flask environment (development/production)

### Nginx Configuration

- Frontend served from `/usr/share/nginx/html`
- API routes proxied to Gunicorn
- Static files served directly by Nginx

## 🧪 Testing

### Backend Tests
```bash
cd hospital-management-backend
python -m pytest --cov=.
```

### Frontend Tests
```bash
cd hospital-management-frontend
npm test -- --coverage --watchAll=false
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80 and 5432 are available
2. **Database connection**: Check `DATABASE_URL` environment variable
3. **Build failures**: Ensure all dependencies are properly specified

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs db

# Access container shell
docker-compose exec app bash
```

## 🔒 Security

- Database credentials stored as environment variables
- No sensitive data in Docker images
- Nginx configured for security headers
- Supervisor manages process security

## 📈 Scaling

The current setup is designed for single-server deployment. For scaling:

1. **Database**: Use managed PostgreSQL service
2. **Application**: Implement load balancer with multiple app instances
3. **File Storage**: Use cloud storage for static files
4. **Caching**: Add Redis for session and cache management

## 🤝 Contributing

1. Create feature branch from `develop`
2. Make changes and write tests
3. Ensure CI/CD pipeline passes
4. Create pull request to `main`
5. Deployment happens automatically after merge