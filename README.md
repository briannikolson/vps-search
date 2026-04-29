# 🌍 VPS Finder

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20BSD-blue)]()

**Автоматический поиск и сравнение VPS серверов по всему миру**

</div>

---

## 📋 Оглавление

- [Возможности](#-возможности)
- [Поддерживаемые ОС](#-поддерживаемые-ос)
- [Быстрая установка](#-быстрая-установка)
- [Управление паролями](#-управление-паролями)
- [Команды для управления](#-команды-для-управления)
- [Структура проекта](#-структура-проекта)
- [Безопасность](#-безопасность)
- [Установка на разных ОС](#-установка-на-разных-ос)
- [Часто задаваемые вопросы](#-часто-задаваемые-вопросы)
- [Лицензия](#-лицензия)

---

## ✨ Возможности

| Функция | Описание |
|---------|----------|
| 🔍 **Поиск VPS** | По странам и провайдерам |
| 🌐 **50+ стран** | Серверы по всему миру |
| 📊 **100+ провайдеров** | Актуальные цены |
| 🔐 **Двухуровневая защита** | Мастер-пароль + веб-пароль |
| 🛡️ **DDoS защита** | Rate limiting 300/15мин |
| 📱 **Адаптивный дизайн** | Работает на любых устройствах |
| 🚀 **Автоустановка** | Одна команда для установки |
| 🔄 **Автообновление** | Ежедневное обновление данных |

---

## 💻 Поддерживаемые ОС

| ОС | Версии | Статус |
|----|--------|--------|
| **Ubuntu** | 18.04, 20.04, 22.04, 24.04 | ✅ Полная поддержка |
| **Debian** | 10, 11, 12 | ✅ Полная поддержка |
| **CentOS/RHEL** | 7, 8, 9 | ✅ Полная поддержка |
| **Fedora** | 38, 39, 40 | ✅ Полная поддержка |
| **Arch Linux** | Latest | ✅ Полная поддержка |
| **Alpine Linux** | 3.18+ | ✅ Полная поддержка |
| **macOS** | 11 (Big Sur) - 14 (Sonoma) | ✅ Полная поддержка |
| **FreeBSD** | 13.x, 14.x | ✅ Полная поддержка |
| **OpenBSD** | 7.3, 7.4, 7.5 | ✅ Полная поддержка |
| **NetBSD** | 9.x, 10.x | ✅ Полная поддержка |
| **Windows** | Любая | ❌ Не поддерживается |

---

## 🚀 Быстрая установка

### Минимальные требования

- **CPU:** 1 vCPU
- **RAM:** 512 MB
- **Диск:** 1 GB свободного места
- **Node.js:** 18+ (устанавливается автоматически)

### Установка в одну команду

```bash
git clone https://github.com/yourusername/vps-finder.git
cd vps-finder
chmod +x install.sh
./install.sh
Что произойдет во время установки
text
1. ✅ Определение вашей операционной системы
2. ✅ Определение пакетного менеджера (apt/brew/dnf/yum/pacman/apk/pkg)
3. ✅ Проверка/установка Node.js 18+
4. ✅ Установка PM2 для управления процессом
5. ✅ Создание необходимых папок
6. 🔐 Запрос/генерация паролей (с выбором способа)
7. 📦 Установка зависимостей npm
8. 🔄 Первый запуск обновления данных
9. 🚀 Запуск приложения через PM2
Пароли, которые нужно настроить
Пароль	Назначение	Требования	Где используется
Веб-пароль	Доступ к веб-интерфейсу	минимум 8 символов	http://сервер:3000
Мастер-пароль	Управление на сервере	минимум 10 символов	./manage-passwords.sh
Выбор способа создания пароля
При установке для каждого пароля предлагается 3 варианта:

text
Выберите способ:
  1) Ввести пароль вручную
  2) Сгенерировать случайный пароль (16 символов)
  3) Сгенерировать читаемый пароль (легко запомнить)
Примеры генерируемых паролей:

Случайный: aB3$xK9#mP2&qL7@

Читаемый: moon-river-42

🔐 Управление паролями
Просмотр пароля для веб-интерфейса
bash
# Способ 1: Через меню управления
./manage-passwords.sh

# Способ 2: Прямое чтение файла
cat data/web-password.txt

# Способ 3: Просмотр в .env файле
grep ACCESS_PASSWORD .env
Смена пароля для веб-интерфейса
bash
nano data/web-password.txt
nano .env  # измените ACCESS_PASSWORD
pm2 restart vps-finder
Где хранятся пароли на сервере
Файл	Содержимое	Права доступа
data/web-password.txt	Пароль для веб-интерфейса	600
data/manage-password.hash	Хеш мастер-пароля	600
.env	ACCESS_PASSWORD + JWT_SECRET	600
backups/passwords-*.txt	Резервная копия паролей	600
Резервное копирование паролей
bash
cp data/web-password.txt backups/web-password-$(date +%Y%m%d).backup
cp .env backups/env-$(date +%Y%m%d).backup
📋 Команды для управления
Команда	Описание
./install.sh	Первоначальная установка
./update.sh	Обновление до последней версии
./manage-passwords.sh	Просмотр пароля веб-интерфейса
npm start	Запуск сервера
npm run update	Ручное обновление данных о VPS
pm2 status	Статус приложения
pm2 logs vps-finder	Просмотр логов
pm2 restart vps-finder	Перезапуск
pm2 stop vps-finder	Остановка
pm2 delete vps-finder	Удаление из PM2
📁 Структура проекта
text
vps-finder/
├── .env.example              # Пример конфигурации
├── .gitignore                # Игнорируемые файлы
├── LICENSE                   # Лицензия MIT
├── README.md                 # Документация
├── package.json              # Зависимости npm
├── server.js                 # Основной сервер
├── ecosystem.config.js       # PM2 конфигурация
├── install.sh                # Скрипт установки
├── update.sh                 # Скрипт обновления
├── manage-passwords.sh       # Скрипт просмотра паролей
├── scripts/
│   ├── auto-update.js        # Автообновление данных
│   ├── collect-providers.js  # Сбор провайдеров
│   └── scrape-prices.js      # Парсинг цен
├── public/
│   ├── index.html            # Главная страница
│   └── admin.html            # Админ-панель
├── data/                     # Данные (создаётся при установке)
└── backups/                  # Резервные копии
🛡️ Безопасность
Защита	Описание	Статус
Helmet	Безопасные HTTP заголовки	✅
Rate Limiting	300 запросов/15 минут	✅
JWT токены	Сессии с истечением 24ч	✅
XSS защита	Санитайзинг входных данных	✅
CORS	Ограничение доменов	✅
Рекомендации по безопасности
Измените пароли по умолчанию сразу после установки

Используйте HTTPS в production (настройте nginx с SSL)

Регулярно обновляйте приложение через ./update.sh

Делайте бэкапы паролей и данных

Ограничьте доступ к серверу через firewall

Не публикуйте файл .env в публичный доступ

Настройка брандмауэра (ufw)
bash
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
🔧 Установка на разных ОС
Ubuntu / Debian
bash
sudo apt update && sudo apt install -y git curl
git clone https://github.com/yourusername/vps-finder.git
cd vps-finder && ./install.sh
CentOS / RHEL / Fedora
bash
sudo dnf install -y git curl
git clone https://github.com/yourusername/vps-finder.git
cd vps-finder && ./install.sh
Arch Linux
bash
sudo pacman -S git curl
git clone https://github.com/yourusername/vps-finder.git
cd vps-finder && ./install.sh
Alpine Linux
bash
apk add git bash curl
git clone https://github.com/yourusername/vps-finder.git
cd vps-finder && ./install.sh
macOS
bash
brew install git
git clone https://github.com/yourusername/vps-finder.git
cd vps-finder && ./install.sh
FreeBSD
bash
pkg install git bash
git clone https://github.com/yourusername/vps-finder.git
cd vps-finder && ./install.sh
🔄 Обновление приложения
bash
./update.sh
Или вручную:
bash
git pull origin main
npm install --production
npm run update
pm2 restart vps-finder
Настройка автоматических обновлений (cron)
bash
crontab -e
# Добавить: 0 3 * * * cd /path/to/vps-finder && ./update.sh >> logs/update.log 2>&1
📊 Источники данных
Источник	Тип	Что собирает
GitHub (s0c-org/Providers)	JSON	Список провайдеров
Awesome VPS Hosting List	Markdown	Ссылки на сайты
VPSBenchmarks	HTML	Рейтинги и цены
LowEndBox	RSS	Бюджетные предложения
Данные обновляются автоматически раз в сутки.

❓ Часто задаваемые вопросы
Как восстановить забытый пароль?
Пароль в data/web-password.txt. При потере доступа к серверу — только переустановка.

Как изменить порт?
В .env: PORT=8080, затем pm2 restart vps-finder

Как добавить своего провайдера?
Отредактируйте scripts/scrape-prices.js — массив knownPlans

Как посмотреть логи?
pm2 logs vps-finder или tail -f logs/out.log

Как остановить приложение?
pm2 stop vps-finder или pm2 delete vps-finder

Как обновить данные вручную?
npm run update

Поддерживается ли HTTPS?
Да, настройте nginx как прокси с SSL сертификатом.

🚨 Устранение неполадок
Ошибка	Решение
EACCES: permission denied	sudo chown -R $USER:$USER . && chmod +x install.sh
Node.js version 18+ required	curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs
pm2: command not found	npm install -g pm2
Приложение не отвечает	pm2 restart vps-finder && pm2 logs vps-finder --lines 50
📞 Поддержка
Создайте Issue на GitHub

Проверьте логи: pm2 logs vps-finder

Убедитесь, что порт 3000 открыт

🤝 Лицензия
MIT License

text
Copyright (c) 2024 VPS Finder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
<div align="center">
🌍 VPS Finder — ваш помощник в поиске идеального сервера

⬆ Вернуться к началу

</div> ```
