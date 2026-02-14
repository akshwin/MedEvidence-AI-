@echo off
echo ========================================
echo Creating .env file for Email Setup
echo ========================================
echo.
echo Please enter your Gmail App Password:
echo (Get it from: https://myaccount.google.com/apppasswords)
echo.
set /p PASSWORD="Enter App Password: "
echo.
set /p SMTP_USERNAME="Enter SMTP email (e.g. your-email@gmail.com): "
echo.
set /p GROQ_API_KEY="Enter GROQ_API_KEY (or press Enter to skip): "

(
echo # Email Settings for Contact Form
echo SMTP_SERVER=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USERNAME=%SMTP_USERNAME%
echo SMTP_PASSWORD=%PASSWORD%
echo.
echo # Other settings
echo GROQ_API_KEY=%GROQ_API_KEY%
) > .env

echo.
echo ✅ .env file created successfully!
echo.
echo Next steps:
echo 1. Restart your backend server
echo 2. Test the contact form
echo.
pause







