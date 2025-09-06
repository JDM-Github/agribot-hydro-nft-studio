import smtplib
from email.message import EmailMessage

# --- Configuration ---
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465  # SSL port
SENDER_EMAIL = "agribothydroteam@gmail.com"
SENDER_PASSWORD = "qlrr bgyv aoax lewe"
RECEIVER_EMAIL = "jdmaster888@gmail.com"

# --- Create the email ---
msg = EmailMessage()
msg['Subject'] = "Test Email from SMTP"
msg['From'] = SENDER_EMAIL
msg['To'] = RECEIVER_EMAIL
msg.set_content("Hello! This is a test email sent via Python SMTP.")

# --- Send the email ---
try:
    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as smtp:
        smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
        smtp.send_message(msg)
    print("✅ Email sent successfully!")
except Exception as e:
    print(f"❌ Failed to send email: {e}")
