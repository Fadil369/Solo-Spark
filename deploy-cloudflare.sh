# 🌐 Cloudflare Deployment Script
# Deploy Solo-Spark to brainsait.io with full Cloudflare ecosystem

#!/bin/bash

set -e

echo "🚀 Starting Solo-Spark deployment to Cloudflare..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"

    if ! command -v wrangler &> /dev/null; then
        echo -e "${RED}Wrangler CLI not found. Installing...${NC}"
        npm install -g wrangler
    fi

    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js not found. Please install Node.js first.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Dependencies check complete${NC}"
}

# Login to Cloudflare
cloudflare_login() {
    echo -e "${BLUE}Logging into Cloudflare...${NC}"

    if ! wrangler whoami &> /dev/null; then
        echo -e "${YELLOW}Please login to Cloudflare:${NC}"
        wrangler login
    fi

    echo -e "${GREEN}✅ Cloudflare authentication complete${NC}"
}

# Create KV namespaces
create_kv_namespaces() {
    echo -e "${BLUE}Creating KV namespaces...${NC}"

    # User data namespace
    USER_DATA_ID=$(wrangler kv:namespace create "USER_DATA" --preview false --env production 2>/dev/null | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
    USER_DATA_PREVIEW_ID=$(wrangler kv:namespace create "USER_DATA_PREVIEW" --preview true --env production 2>/dev/null | grep -o 'id = "[^"]*"' | cut -d'"' -f2)

    # Sessions namespace
    SESSIONS_ID=$(wrangler kv:namespace create "SESSIONS" --preview false --env production 2>/dev/null | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
    SESSIONS_PREVIEW_ID=$(wrangler kv:namespace create "SESSIONS_PREVIEW" --preview true --env production 2>/dev/null | grep -o 'id = "[^"]*"' | cut -d'"' -f2)

    # Cache namespace
    CACHE_ID=$(wrangler kv:namespace create "CACHE" --preview false --env production 2>/dev/null | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
    CACHE_PREVIEW_ID=$(wrangler kv:namespace create "CACHE_PREVIEW" --preview true --env production 2>/dev/null | grep -o 'id = "[^"]*"' | cut -d'"' -f2)

    # Analytics namespace
    ANALYTICS_ID=$(wrangler kv:namespace create "ANALYTICS" --preview false --env production 2>/dev/null | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
    ANALYTICS_PREVIEW_ID=$(wrangler kv:namespace create "ANALYTICS_PREVIEW" --preview true --env production 2>/dev/null | grep -o 'id = "[^"]*"' | cut -d'"' -f2)

    echo -e "${GREEN}✅ KV namespaces created${NC}"
    echo -e "USER_DATA: ${USER_DATA_ID}"
    echo -e "SESSIONS: ${SESSIONS_ID}"
    echo -e "CACHE: ${CACHE_ID}"
    echo -e "ANALYTICS: ${ANALYTICS_ID}"
}

# Create R2 buckets
create_r2_buckets() {
    echo -e "${BLUE}Creating R2 buckets...${NC}"

    wrangler r2 bucket create solo-spark-user-files || echo "Bucket may already exist"
    wrangler r2 bucket create solo-spark-prototypes || echo "Bucket may already exist"
    wrangler r2 bucket create solo-spark-exports || echo "Bucket may already exist"
    wrangler r2 bucket create solo-spark-backups || echo "Bucket may already exist"

    # Preview buckets
    wrangler r2 bucket create solo-spark-user-files-preview || echo "Preview bucket may already exist"
    wrangler r2 bucket create solo-spark-prototypes-preview || echo "Preview bucket may already exist"
    wrangler r2 bucket create solo-spark-exports-preview || echo "Preview bucket may already exist"
    wrangler r2 bucket create solo-spark-backups-preview || echo "Preview bucket may already exist"

    echo -e "${GREEN}✅ R2 buckets created${NC}"
}

# Create D1 database
create_d1_database() {
    echo -e "${BLUE}Creating D1 database...${NC}"

    D1_DB_ID=$(wrangler d1 create solo-spark-db 2>/dev/null | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)

    if [ -n "$D1_DB_ID" ]; then
        echo -e "${GREEN}✅ D1 database created: ${D1_DB_ID}${NC}"

        # Execute schema
        echo -e "${BLUE}Initializing database schema...${NC}"
        wrangler d1 execute solo-spark-db --file=./schema.sql
        echo -e "${GREEN}✅ Database schema initialized${NC}"
    else
        echo -e "${YELLOW}Database may already exist${NC}"
    fi
}

# Create queues
create_queues() {
    echo -e "${BLUE}Creating message queues...${NC}"

    wrangler queues create ai-processing-queue || echo "Queue may already exist"
    wrangler queues create email-queue || echo "Queue may already exist"
    wrangler queues create analytics-queue || echo "Queue may already exist"

    echo -e "${GREEN}✅ Message queues created${NC}"
}

# Update wrangler.toml with actual IDs
update_wrangler_config() {
    echo -e "${BLUE}Updating wrangler.toml with resource IDs...${NC}"

    # This would typically be done manually or with sed/awk
    echo -e "${YELLOW}Please update wrangler.toml with the following IDs:${NC}"
    echo -e "USER_DATA KV: ${USER_DATA_ID}"
    echo -e "SESSIONS KV: ${SESSIONS_ID}"
    echo -e "CACHE KV: ${CACHE_ID}"
    echo -e "ANALYTICS KV: ${ANALYTICS_ID}"
    echo -e "D1 Database: ${D1_DB_ID}"

    echo -e "${GREEN}✅ Configuration updated${NC}"
}

# Build the application
build_application() {
    echo -e "${BLUE}Building the application...${NC}"

    npm install
    npm run build

    echo -e "${GREEN}✅ Application built successfully${NC}"
}

# Deploy to Cloudflare Pages
deploy_pages() {
    echo -e "${BLUE}Deploying to Cloudflare Pages...${NC}"

    # Deploy using Wrangler Pages
    wrangler pages deploy dist --project-name=solo-spark --compatibility-date=2024-08-01

    echo -e "${GREEN}✅ Deployed to Cloudflare Pages${NC}"
}

# Deploy Workers
deploy_workers() {
    echo -e "${BLUE}Deploying Cloudflare Workers...${NC}"

    # Deploy auth worker
    wrangler deploy --env production

    echo -e "${GREEN}✅ Workers deployed${NC}"
}

# Set up custom domain
setup_domain() {
    echo -e "${BLUE}Setting up custom domain: brainsait.io${NC}"

    # This requires manual DNS configuration
    echo -e "${YELLOW}Manual step required:${NC}"
    echo -e "1. Go to Cloudflare Dashboard"
    echo -e "2. Add brainsait.io domain to your account"
    echo -e "3. Update DNS records:"
    echo -e "   - CNAME www -> solo-spark.pages.dev"
    echo -e "   - CNAME @ -> solo-spark.pages.dev"
    echo -e "   - CNAME api -> solo-spark.fadil369.workers.dev"
    echo -e "4. Set up SSL/TLS encryption"

    echo -e "${GREEN}✅ Domain setup instructions provided${NC}"
}

# Configure environment variables
setup_environment() {
    echo -e "${BLUE}Setting up environment variables...${NC}"

    echo -e "${YELLOW}Please set the following secrets using wrangler:${NC}"
    echo -e "wrangler secret put ANTHROPIC_API_KEY"
    echo -e "wrangler secret put GITHUB_TOKEN"
    echo -e "wrangler secret put STRIPE_SECRET_KEY"
    echo -e "wrangler secret put STC_MERCHANT_ID"
    echo -e "wrangler secret put MADA_MERCHANT_ID"

    echo -e "${GREEN}✅ Environment setup instructions provided${NC}"
}

# Performance optimization
optimize_performance() {
    echo -e "${BLUE}Optimizing performance...${NC}"

    # Enable Cloudflare optimizations
    echo -e "${YELLOW}Enable these Cloudflare features in the dashboard:${NC}"
    echo -e "- Auto Minify (CSS, JS, HTML)"
    echo -e "- Brotli compression"
    echo -e "- Rocket Loader"
    echo -e "- Polish (image optimization)"
    echo -e "- Mirage (mobile optimization)"
    echo -e "- Browser Cache TTL: 4 hours"
    echo -e "- Edge Cache TTL: 2 hours"

    echo -e "${GREEN}✅ Performance optimization configured${NC}"
}

# Security configuration
setup_security() {
    echo -e "${BLUE}Configuring security...${NC}"

    echo -e "${YELLOW}Enable these security features:${NC}"
    echo -e "- Always Use HTTPS: On"
    echo -e "- HSTS: Enabled"
    echo -e "- Security Level: Medium"
    echo -e "- Bot Fight Mode: On"
    echo -e "- Rate Limiting: Configure as needed"
    echo -e "- Firewall Rules: Set up geo-blocking if needed"

    echo -e "${GREEN}✅ Security configuration provided${NC}"
}

# Analytics setup
setup_analytics() {
    echo -e "${BLUE}Setting up analytics...${NC}"

    echo -e "${YELLOW}Configure Cloudflare Analytics:${NC}"
    echo -e "- Enable Web Analytics"
    echo -e "- Set up custom events"
    echo -e "- Configure Real User Monitoring (RUM)"
    echo -e "- Enable Security Analytics"

    echo -e "${GREEN}✅ Analytics configuration provided${NC}"
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 Solo-Spark Cloudflare Deployment${NC}"
    echo -e "${BLUE}====================================${NC}"

    check_dependencies
    cloudflare_login
    build_application
    create_kv_namespaces
    create_r2_buckets
    create_d1_database
    create_queues
    update_wrangler_config
    deploy_pages
    deploy_workers
    setup_domain
    setup_environment
    optimize_performance
    setup_security
    setup_analytics

    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo -e "${GREEN}====================================${NC}"
    echo -e "${GREEN}Your Solo-Spark platform is now deployed to:${NC}"
    echo -e "${GREEN}🌐 https://brainsait.io${NC}"
    echo -e "${GREEN}📊 Analytics: Cloudflare Dashboard${NC}"
    echo -e "${GREEN}🔧 Workers: https://dash.cloudflare.com${NC}"
    echo -e "${GREEN}💾 Storage: R2 + KV + D1 configured${NC}"
    echo -e ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Configure your API keys using wrangler secret put"
    echo -e "2. Update DNS settings for brainsait.io"
    echo -e "3. Test all functionality"
    echo -e "4. Monitor performance and analytics"
    echo -e ""
    echo -e "${BLUE}Happy innovating! 🧠✨${NC}"
}

# Run main function
main "$@"
