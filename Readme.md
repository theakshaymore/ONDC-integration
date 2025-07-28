# Dashboard Monitoring → WhatsApp Automation

Note:

- This project was built just for fun—feel free to use or fork it!
- The whole thing would be even more fun with a React library, but I’m too lazy to do that 😄
- Pull requests are welcome, though!

#Tools you need

- Node.js 18+: https://nodejs.org/

- @puppeteer/browsers: https://pptr.dev/

- N8N : https://n8n.io/

- whatsapp-web.js: https://github.com/pedroslopez/whatsapp-web.js

## Installation

- git clone [https://github.com/theakshaymore/ONDC-integration.git](https://github.com/theakshaymore/ONDC-integration.git)

- cd ONDC-integration

- npm install

- edit .env files with your configurations

---

## One-time setup

[Refer this file](one-time-setup.md)

## Manual run

- node monitor.js

## Scheduling

### Windows (Task Scheduler)

1. Create `run_monitor.bat` in the project folder:
   cd /d "%~dp0" && node monitor.js >> mylogs\log.txt 2>&1

text 2. Task Scheduler → _Create Task_ → _Triggers_ →  
• Begin daily at any time  
• _Repeat task every_ **5 minutes** → _Indefinitely_.

### Linux / VPS

- Plain cron:
  _/5 _ \* \* \* node /path/to/monitor.js >> /path/to/mylogs/log.txt 2>&1

## Generated folders

- `myscreenshots/` holds the latest `dashboard.png`
- `mylogs/` contains `log.txt` with timestamped run history
- `chrome-profile/` stores Google auth cookies (prevents re-login prompts)
