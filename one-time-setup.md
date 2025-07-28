- **Seed Google cookies**
  "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --user-data-dir="%cd%\chrome-profile" ^
  --profile-directory=Default

text

1. A fresh Chrome window opens.
2. Sign in with your Google account.
3. Navigate to the dashboard you want to capture.
4. Close Chrome – cookies are now stored in `chrome-profile/`.

- **Pair WhatsApp**
  node monitor.js # QR code appears once → scan with phone → Ctrl-C

text

After these two steps the script can run headlessly without interaction.

---
