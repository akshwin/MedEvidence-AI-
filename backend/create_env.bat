@echo off
echo ========================================
echo Creating .env file for Email Setup
echo ========================================
echo.
echo Please enter your Gmail App Password:
echo (Get it from: https://myaccount.google.com/apppasswords)
echo.
set /p PASSWORD="Enter App Password: "

(
echo # Email Settings for Contact Form
echo SMTP_SERVER=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USERNAME=akshwint.2003@gmail.com
echo SMTP_PASSWORD=%PASSWORD%
echo.
echo # Other settings
echo GROQ_API_KEY=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
) > .env

echo.
echo ✅ .env file created successfully!
echo.
echo Next steps:
echo 1. Restart your backend server
echo 2. Test the contact form
echo.
pause







