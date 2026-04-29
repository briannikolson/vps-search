#!/bin/bash

# VPS Finder - Скрипт обновления

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔄 ОБНОВЛЕНИЕ VPS FINDER${NC}"
echo -e "${BLUE}========================================${NC}"

# Проверка git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git не установлен${NC}"
    exit 1
fi

# Бэкап .env
if [ -f ".env" ]; then
    cp .env .env.backup
    echo -e "${GREEN}✅ Бэкап .env создан${NC}"
fi

# Получение обновлений
echo -e "${YELLOW}📥 Получение обновлений...${NC}"
git pull origin main

# Установка зависимостей
echo -e "${YELLOW}📦 Обновление зависимостей...${NC}"
npm install --production --no-fund --no-audit

# Обновление данных
echo -e "${YELLOW}🔄 Обновление данных...${NC}"
npm run update

# Перезапуск
echo -e "${YELLOW}🚀 Перезапуск...${NC}"
pm2 restart vps-finder 2>/dev/null || pm2 start server.js --name vps-finder

echo -e "${GREEN}✅ Обновление завершено!${NC}"
