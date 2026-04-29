#!/bin/bash

# VPS Finder - Автоматическая установка (Linux/macOS/BSD/RHEL)
set -e

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Определение ОС
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS_NAME=$NAME
            OS_ID=$ID
            OS_VERSION=$VERSION_ID
        else
            OS_NAME="Linux"
            OS_ID="unknown"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        OS_NAME="macOS"
        OS_ID="macos"
    elif [[ "$OSTYPE" == "freebsd"* ]]; then
        OS="freebsd"
        OS_NAME="FreeBSD"
        OS_ID="freebsd"
    elif [[ "$OSTYPE" == "openbsd"* ]]; then
        OS="openbsd"
        OS_NAME="OpenBSD"
        OS_ID="openbsd"
    else
        OS="unknown"
        OS_NAME="Unknown"
        OS_ID="unknown"
    fi
}

# Определение пакетного менеджера
detect_package_manager() {
    if command -v dnf &> /dev/null; then
        PM="dnf"
        PM_INSTALL="sudo dnf install -y"
        PM_UPDATE="sudo dnf check-update"
        PM_NODEJS="nodejs"
    elif command -v yum &> /dev/null; then
        PM="yum"
        PM_INSTALL="sudo yum install -y"
        PM_UPDATE="sudo yum check-update"
        PM_NODEJS="nodejs"
    elif command -v apt &> /dev/null; then
        PM="apt"
        PM_INSTALL="sudo apt-get install -y"
        PM_UPDATE="sudo apt-get update"
        PM_NODEJS="nodejs"
    elif command -v brew &> /dev/null; then
        PM="brew"
        PM_INSTALL="brew install"
        PM_UPDATE="brew update"
        PM_NODEJS="node"
    elif command -v pacman &> /dev/null; then
        PM="pacman"
        PM_INSTALL="sudo pacman -S --noconfirm"
        PM_UPDATE="sudo pacman -Sy"
        PM_NODEJS="nodejs"
    elif command -v apk &> /dev/null; then
        PM="apk"
        PM_INSTALL="sudo apk add"
        PM_UPDATE="sudo apk update"
        PM_NODEJS="nodejs"
    elif command -v pkg &> /dev/null && [[ "$OS" == "freebsd" ]]; then
        PM="pkg"
        PM_INSTALL="sudo pkg install -y"
        PM_UPDATE="sudo pkg update"
        PM_NODEJS="node"
    else
        PM="unknown"
        PM_INSTALL=""
        PM_UPDATE=""
        PM_NODEJS=""
    fi
}

# Функция для скрытого ввода пароля
read_password() {
    local prompt="$1"
    local password=""
    echo -n -e "${YELLOW}$prompt${NC}"
    stty -echo
    read password
    stty echo
    echo
    echo "$password"
}

# Функция генерации пароля
generate_password() {
    local length=${1:-16}
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32 | tr -d "=+/" | tr -d '\n' | cut -c1-$length
    else
        cat /dev/urandom 2>/dev/null | tr -dc 'a-zA-Z0-9!@#$%^&*' | fold -w $length | head -n 1
    fi
}

# Функция генерации читаемого пароля
generate_readable_password() {
    local words=("apple" "blue" "cloud" "dark" "echo" "fire" "gold" "high" "iron" "java"
                 "king" "lake" "moon" "north" "ocean" "peak" "quiet" "river" "star" "time")
    local nums=$(printf "%02d" $((RANDOM % 99)))
    echo "${words[$((RANDOM % ${#words[@]}))]}-${words[$((RANDOM % ${#words[@]}))]}-${nums}"
}

# Функция выбора способа ввода пароля (С ПОДСКАЗКАМИ)
get_password_with_choice() {
    local purpose="$1"
    local min_length="$2"
    local default_length="$3"
    
    echo -e "\n${CYAN}📌 ${purpose}${NC}"
    
    while true; do
        echo -e "${BLUE}   ╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BLUE}   ║  Выберите способ создания пароля:                            ║${NC}"
        echo -e "${BLUE}   ╠══════════════════════════════════════════════════════════════╣${NC}"
        echo -e "${BLUE}   ║  ${GREEN}1${NC}) Ввести пароль вручную (минимум ${min_length} символов)               ${BLUE}║${NC}"
        echo -e "${BLUE}   ║  ${GREEN}2${NC}) Сгенерировать случайный пароль (${default_length} символов)             ${BLUE}║${NC}"
        echo -e "${BLUE}   ║  ${GREEN}3${NC}) Сгенерировать читаемый пароль (легко запомнить)         ${BLUE}║${NC}"
        echo -e "${BLUE}   ╚══════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        read -p "   ➤ Ваш выбор [1-3]: " choice
        
        case $choice in
            1)
                while true; do
                    password=$(read_password "   ➤ Введите пароль: ")
                    if [ -z "$password" ]; then
                        echo -e "   ${RED}❌ Пароль не может быть пустым${NC}"
                        continue
                    fi
                    if [ ${#password} -lt $min_length ]; then
                        echo -e "   ${RED}❌ Пароль должен содержать минимум $min_length символов${NC}"
                        continue
                    fi
                    confirm=$(read_password "   ➤ Повторите пароль: ")
                    if [ "$password" != "$confirm" ]; then
                        echo -e "   ${RED}❌ Пароли не совпадают${NC}"
                    else
                        break
                    fi
                done
                break
                ;;
            2)
                password=$(generate_password $default_length)
                echo -e "\n   ${GREEN}✅ Сгенерирован случайный пароль:${NC}"
                echo -e "   ${CYAN}   ┌─────────────────────────────────────────────────────────┐${NC}"
                echo -e "   ${CYAN}   │  ${YELLOW}${password}${NC}${CYAN}  │${NC}"
                echo -e "   ${CYAN}   └─────────────────────────────────────────────────────────┘${NC}"
                echo -e "   ${YELLOW}⚠️  Сохраните этот пароль в надежном месте!${NC}"
                read -p "   ➤ Нажмите Enter, чтобы продолжить..."
                break
                ;;
            3)
                password=$(generate_readable_password)
                echo -e "\n   ${GREEN}✅ Сгенерирован читаемый пароль:${NC}"
                echo -e "   ${CYAN}   ┌─────────────────────────────────────────────────────────┐${NC}"
                echo -e "   ${CYAN}   │  ${YELLOW}${password}${NC}${CYAN}  │${NC}"
                echo -e "   ${CYAN}   └─────────────────────────────────────────────────────────┘${NC}"
                echo -e "   ${YELLOW}⚠️  Сохраните этот пароль в надежном месте!${NC}"
                read -p "   ➤ Нажмите Enter, чтобы продолжить..."
                break
                ;;
            *)
                echo -e "   ${RED}❌ Неверный выбор. Пожалуйста, введите 1, 2 или 3${NC}"
                ;;
        esac
    done
    
    echo "$password"
}

# Установка Node.js на RHEL/AlmaLinux/Rocky/CentOS
install_nodejs_rhel() {
    echo -e "${YELLOW}📦 Установка Node.js 20.x на $OS_NAME...${NC}"
    
    # Добавление официального репозитория NodeSource для RHEL
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    
    if command -v dnf &> /dev/null; then
        sudo dnf install -y nodejs
    else
        sudo yum install -y nodejs
    fi
}

# Установка Node.js на других системах
install_nodejs_generic() {
    if [[ "$OS" == "macos" ]]; then
        if command -v brew &> /dev/null; then
            brew install node
        else
            echo -e "${RED}❌ Для macOS требуется Homebrew. Установите: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"${NC}"
            exit 1
        fi
    elif [[ "$OS" == "freebsd" ]]; then
        pkg install -y node
    elif [[ "$OS" == "openbsd" ]]; then
        pkg_add node
    else
        echo -e "${RED}❌ Не удалось определить систему для установки Node.js${NC}"
        echo -e "${YELLOW}   Установите Node.js 18+ вручную и запустите скрипт снова${NC}"
        exit 1
    fi
}

# Основная установка Node.js
install_nodejs() {
    echo -e "${YELLOW}📦 Установка Node.js...${NC}"
    
    if [[ "$OS_ID" == "rhel" ]] || [[ "$OS_ID" == "centos" ]] || [[ "$OS_ID" == "almalinux" ]] || [[ "$OS_ID" == "rocky" ]] || [[ "$OS_ID" == "ol" ]]; then
        install_nodejs_rhel
    elif [[ "$OS_ID" == "ubuntu" ]] || [[ "$OS_ID" == "debian" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        install_nodejs_generic
    fi
}

# ============================================================
# ОСНОВНАЯ УСТАНОВКА
# ============================================================

clear
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🚀 VPS FINDER - АВТОМАТИЧЕСКАЯ УСТАНОВКА               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

detect_os
detect_package_manager

echo -e "${CYAN}📋 Система: ${GREEN}$OS_NAME${NC}"
echo -e "${CYAN}📦 Пакетный менеджер: ${GREEN}${PM:-не определен}${NC}"
echo ""

# Проверка/установка curl
if ! command -v curl &> /dev/null; then
    echo -e "${YELLOW}📦 Установка curl...${NC}"
    $PM_INSTALL curl
fi

# Установка Node.js
if ! command -v node &> /dev/null; then
    install_nodejs
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js версии 18+ требуется (установлена: $(node -v))${NC}"
    echo -e "${YELLOW}   Обновите Node.js и запустите скрипт снова${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Установка PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Установка PM2...${NC}"
    npm install -g pm2
fi
echo -e "${GREEN}✅ PM2 установлен${NC}"

# Создание папок
mkdir -p data logs backups

# ============================================================
# НАСТРОЙКА ПАРОЛЕЙ
# ============================================================

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔐 НАСТРОЙКА БЕЗОПАСНОСТИ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

WEB_PASSWORD=$(get_password_with_choice "ПАРОЛЬ ДЛЯ ВЕБ-ИНТЕРФЕЙСА" 8 16)
MASTER_PASSWORD=$(get_password_with_choice "МАСТЕР-ПАРОЛЬ УПРАВЛЕНИЯ" 10 20)

# Генерация ключей
JWT_SECRET=$(generate_password 32)
ADMIN_HASH=$(echo -n "$MASTER_PASSWORD" | sha256sum | cut -d' ' -f1)

# Создание .env
cat > .env << EOF
ACCESS_PASSWORD=$WEB_PASSWORD
PORT=3000
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=300
UPDATE_INTERVAL_HOURS=24
FIRST_INSTALL=true
EOF

# Сохранение паролей
echo -n "$WEB_PASSWORD" > data/web-password.txt
chmod 600 data/web-password.txt
echo "$ADMIN_HASH" > data/manage-password.hash
chmod 600 data/manage-password.hash

# Создание скрипта manage-passwords.sh
cat > manage-passwords.sh << 'EOF'
#!/bin/bash
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
WEB_PASS=$(cat data/web-password.txt 2>/dev/null)
echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}         🔐 ПАРОЛИ VPS FINDER${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🌐 Веб-интерфейс:${NC} логин: admin, пароль: ${YELLOW}$WEB_PASS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
EOF
chmod +x manage-passwords.sh

# Установка зависимостей
echo -e "\n${YELLOW}📦 Установка зависимостей...${NC}"
npm install --production --no-fund --no-audit

# Запуск приложения
echo -e "\n${YELLOW}🚀 Запуск приложения...${NC}"
pm2 start server.js --name vps-finder
pm2 save

# Вывод информации
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP=$(ifconfig 2>/dev/null | grep inet | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | cut -d: -f2)
fi

echo -e "\n${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ УСТАНОВКА ЗАВЕРШЕНА!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e ""
echo -e "${CYAN}🌐 ДОСТУП:${NC} http://${SERVER_IP:-localhost}:3000"
echo -e "${CYAN}🔑 Логин:${NC} admin"
echo -e "${CYAN}🔐 Пароль:${NC} ${YELLOW}$WEB_PASSWORD${NC}"
echo -e ""
echo -e "${CYAN}📋 Команды:${NC}"
echo -e "   ${GREEN}pm2 status${NC} - статус"
echo -e "   ${GREEN}pm2 logs vps-finder${NC} - логи"
echo -e "   ${GREEN}./manage-passwords.sh${NC} - посмотреть пароль"
echo -e ""
