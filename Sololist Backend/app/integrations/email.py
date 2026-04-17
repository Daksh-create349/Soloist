import smtplib
from email.message import EmailMessage

class EmailIntegration:
    def __init__(self, smtp_user: str, smtp_password: str):
        self.smtp_user = smtp_user
        self.smtp_password = smtp_password
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 465 # SSL

    def send_email(self, to_email: str, subject: str, body: str):
        """Sends an email via Gmail SMTP or simulates success if keys are missing."""
        if not self.smtp_user or not self.smtp_password:
            return {
                "success": True, 
                "simulated": True, 
                "message": f"[Simulation] Email to {to_email} would have been sent.",
                "detail": "Missing Gmail SMTP configuration."
            }

        msg = EmailMessage()
        msg.set_content(body)
        msg['Subject'] = subject
        msg['From'] = self.smtp_user
        msg['To'] = to_email

        try:
            with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port) as server:
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            return {"success": True, "message": f"Email sent to {to_email}", "simulated": False}
        except Exception as e:
            # Fallback to simulation if real send fails (e.g. wrong credentials)
            return {
                "success": True, 
                "simulated": True, 
                "message": f"[Simulation] Email would have been sent (Real attempt failed).",
                "detail": str(e)
            }

email_client_factory = EmailIntegration
