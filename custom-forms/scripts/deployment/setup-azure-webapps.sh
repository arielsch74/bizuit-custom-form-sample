#!/bin/bash
# Quick setup script for Azure Web Apps deployment
# Run this script to configure both frontend and backend Web Apps

set -e  # Exit on error

echo "========================================"
echo "Azure Web Apps Setup for BIZUIT Custom Forms"
echo "========================================"
echo ""

# Configuration
SUBSCRIPTION_ID="c8538779-b0ee-48be-ba9e-d0c4f883c811"
RESOURCE_GROUP="BIZUIT"
APP_SERVICE_PLAN="AppServiceBIZUITLinux"
FRONTEND_APP="bizuit-custom-forms"
BACKEND_APP="bizuit-custom-forms-api"
RUNTIME_BASEPATH="/bizuitforms"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Setting Azure subscription...${NC}"
az account set --subscription "$SUBSCRIPTION_ID"
echo -e "${GREEN}✓ Subscription set${NC}"
echo ""

echo -e "${YELLOW}Step 2: Checking if backend Web App exists...${NC}"
if az webapp show --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  echo -e "${GREEN}✓ Backend Web App already exists${NC}"
else
  echo -e "${YELLOW}Creating backend Web App...${NC}"
  az webapp create \
    --name "$BACKEND_APP" \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$APP_SERVICE_PLAN" \
    --runtime "PYTHON:3.10"
  echo -e "${GREEN}✓ Backend Web App created${NC}"
fi
echo ""

echo -e "${YELLOW}Step 3: Configuring backend Web App...${NC}"

# Enable HTTPS only
az webapp update \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --https-only true

# Enable Always On
az webapp config set \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --always-on true

echo -e "${GREEN}✓ Backend Web App configured (HTTPS + Always On)${NC}"
echo ""

echo -e "${YELLOW}Step 4: Configuring frontend Web App...${NC}"

# Enable Always On for frontend
az webapp config set \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --always-on true

# Set frontend runtime basePath
az webapp config appsettings set \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    RUNTIME_BASEPATH="$RUNTIME_BASEPATH" \
    NODE_ENV="production" \
    WEBSITE_NODE_DEFAULT_VERSION="~22" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="false" \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE="false" \
  --output none

echo -e "${GREEN}✓ Frontend Web App configured${NC}"
echo ""

echo -e "${YELLOW}Step 5: Generating JWT secret for backend...${NC}"
JWT_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}✓ JWT secret generated: ${JWT_SECRET:0:16}...${NC}"
echo ""

echo -e "${RED}⚠️  IMPORTANT: Configure backend secrets!${NC}"
echo -e "${YELLOW}You MUST set the following secrets manually:${NC}"
echo ""
echo "Run this command with your actual database password:"
echo ""
cat << EOF
az webapp config appsettings set \\
  --name $BACKEND_APP \\
  --resource-group $RESOURCE_GROUP \\
  --settings \\
    DB_SERVER="test.bizuit.com" \\
    DB_DATABASE="arielschBIZUITDashboard" \\
    DB_USER="BIZUITarielsch" \\
    DB_PASSWORD="YOUR_PASSWORD_HERE" \\
    PERSISTENCE_DB_SERVER="test.bizuit.com" \\
    PERSISTENCE_DB_DATABASE="arielschBizuitPersistenceStore" \\
    PERSISTENCE_DB_USER="BIZUITarielsch" \\
    PERSISTENCE_DB_PASSWORD="YOUR_PASSWORD_HERE" \\
    BIZUIT_DASHBOARD_API_URL="https://test.bizuit.com/arielschbizuitdashboardapi/api" \\
    ADMIN_ALLOWED_ROLES="Administrators,BIZUIT Admins,SuperAdmin,FormManager" \\
    SESSION_TIMEOUT_MINUTES="30" \\
    JWT_SECRET_KEY="$JWT_SECRET" \\
    ENCRYPTION_TOKEN_KEY="Vq2ixrmV6oUGhQfIPWiCBk0S" \\
    API_PORT="8080" \\
    MAX_UPLOAD_SIZE_MB="50" \\
    TEMP_UPLOAD_PATH="./temp-uploads" \\
    CORS_ORIGINS="https://bizuit-custom-forms-gtg7g8b9gdb8egbh.eastus-01.azurewebsites.net,https://test.bizuit.com" \\
    PYTHONUNBUFFERED="1" \\
    ENVIRONMENT="production"
EOF
echo ""

# Ask if user wants to configure secrets now
read -p "Do you want to configure backend secrets now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  read -s -p "Enter DB_PASSWORD: " DB_PASSWORD
  echo
  read -s -p "Enter PERSISTENCE_DB_PASSWORD (or press Enter to use same): " PERSISTENCE_DB_PASSWORD
  echo

  if [ -z "$PERSISTENCE_DB_PASSWORD" ]; then
    PERSISTENCE_DB_PASSWORD="$DB_PASSWORD"
  fi

  echo -e "${YELLOW}Configuring backend secrets...${NC}"
  az webapp config appsettings set \
    --name "$BACKEND_APP" \
    --resource-group "$RESOURCE_GROUP" \
    --settings \
      DB_SERVER="test.bizuit.com" \
      DB_DATABASE="arielschBIZUITDashboard" \
      DB_USER="BIZUITarielsch" \
      DB_PASSWORD="$DB_PASSWORD" \
      PERSISTENCE_DB_SERVER="test.bizuit.com" \
      PERSISTENCE_DB_DATABASE="arielschBizuitPersistenceStore" \
      PERSISTENCE_DB_USER="BIZUITarielsch" \
      PERSISTENCE_DB_PASSWORD="$PERSISTENCE_DB_PASSWORD" \
      BIZUIT_DASHBOARD_API_URL="https://test.bizuit.com/arielschbizuitdashboardapi/api" \
      ADMIN_ALLOWED_ROLES="Administrators,BIZUIT Admins,SuperAdmin,FormManager" \
      SESSION_TIMEOUT_MINUTES="30" \
      JWT_SECRET_KEY="$JWT_SECRET" \
      ENCRYPTION_TOKEN_KEY="Vq2ixrmV6oUGhQfIPWiCBk0S" \
      API_PORT="8080" \
      MAX_UPLOAD_SIZE_MB="50" \
      TEMP_UPLOAD_PATH="./temp-uploads" \
      CORS_ORIGINS="https://bizuit-custom-forms-gtg7g8b9gdb8egbh.eastus-01.azurewebsites.net,https://test.bizuit.com" \
      PYTHONUNBUFFERED="1" \
      ENVIRONMENT="production" \
    --output none

  echo -e "${GREEN}✓ Backend secrets configured${NC}"
else
  echo -e "${YELLOW}Skipping secret configuration. Remember to set them manually!${NC}"
fi
echo ""

echo -e "${YELLOW}Step 6: Getting Web App URLs...${NC}"
FRONTEND_URL=$(az webapp show --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP" --query "defaultHostName" -o tsv)
BACKEND_URL=$(az webapp show --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP" --query "defaultHostName" -o tsv)
echo ""

echo "========================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "========================================"
echo ""
echo "Frontend URL: https://$FRONTEND_URL$RUNTIME_BASEPATH"
echo "Backend URL:  https://$BACKEND_URL"
echo ""
echo "Next steps:"
echo "1. Configure Azure DevOps service connection (if not done)"
echo "2. Create frontend pipeline: azure-pipelines-frontend-webapp.yml"
echo "3. Create backend pipeline: azure-pipelines-backend-webapp.yml"
echo "4. Run backend pipeline first"
echo "5. Run frontend pipeline"
echo ""
echo "See docs/setup/AZURE_WEBAPP_DEPLOYMENT.md for detailed instructions"
echo ""
