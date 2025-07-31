#!/bin/bash

# Medverus AI Frontend Deployment Script
# Production deployment with security checks and monitoring

set -euo pipefail

# Configuration
PROJECT_NAME="medverus-frontend"
DOCKER_IMAGE="medverus/frontend"
VERSION=${1:-"latest"}
ENVIRONMENT=${2:-"production"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    if [ ! -f ".env.local" ]; then
        log_error ".env.local file not found. Copy from .env.example and configure."
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Security checks
security_checks() {
    log_info "Running security checks..."
    
    # Check for sensitive files
    if [ -f ".env" ]; then
        log_warn ".env file found. Use .env.local for production."
    fi
    
    # Check JWT secret
    if grep -q "your-super-secure-jwt-secret-key-here" .env.local; then
        log_error "Default JWT secret detected. Please update JWT_SECRET_KEY in .env.local"
        exit 1
    fi
    
    # Check Redis password
    if grep -q "your-redis-password-here" redis.conf; then
        log_error "Default Redis password detected. Please update redis.conf"
        exit 1
    fi
    
    log_info "Security checks passed"
}

# Build application
build_application() {
    log_info "Building application..."
    
    # Build Docker image
    docker build -t ${DOCKER_IMAGE}:${VERSION} .
    
    # Tag as latest if this is the latest version
    if [ "$VERSION" = "latest" ]; then
        docker tag ${DOCKER_IMAGE}:${VERSION} ${DOCKER_IMAGE}:latest
    fi
    
    log_info "Application built successfully"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Install dependencies and run tests
    npm ci
    npm run lint
    npm run type-check
    
    log_info "All tests passed"
}

# Database migration (if needed)
run_migrations() {
    log_info "Running database migrations..."
    
    # Add migration commands here if using a database
    # docker-compose exec medverus-frontend npm run migrate
    
    log_info "Migrations completed"
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    
    # Stop existing containers
    docker-compose down --remove-orphans
    
    # Pull latest images (for dependencies)
    docker-compose pull
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose ps | grep -q "healthy"; then
            log_info "Services are healthy"
            break
        fi
        sleep 5
        timeout=$((timeout - 5))
    done
    
    if [ $timeout -le 0 ]; then
        log_error "Services failed to become healthy"
        docker-compose logs
        exit 1
    fi
    
    log_info "Application deployed successfully"
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    # Check if application is responding
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "Application health check passed"
    else
        log_error "Application health check failed"
        exit 1
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_info "Redis health check passed"
    else
        log_error "Redis health check failed"
        exit 1
    fi
}

# Performance check
performance_check() {
    log_info "Running performance checks..."
    
    # Basic performance test with curl
    response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000/)
    
    if (( $(echo "$response_time < 2.0" | bc -l) )); then
        log_info "Performance check passed (${response_time}s)"
    else
        log_warn "Performance check slow (${response_time}s)"
    fi
}

# Cleanup old containers and images
cleanup() {
    log_info "Cleaning up old containers and images..."
    
    # Remove old containers
    docker container prune -f
    
    # Remove old images (keep last 3 versions)
    docker images ${DOCKER_IMAGE} --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}" | \
        tail -n +4 | \
        awk '{print $2}' | \
        xargs -r docker rmi
    
    log_info "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting deployment of ${PROJECT_NAME} version ${VERSION}"
    
    check_prerequisites
    security_checks
    run_tests
    build_application
    run_migrations
    deploy_application
    health_check
    performance_check
    cleanup
    
    log_info "Deployment completed successfully!"
    log_info "Application is running at: http://localhost:3000"
    log_info "Performance dashboard: http://localhost:3000/admin/performance"
    log_info "Security dashboard: http://localhost:3000/admin/security"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"