import os
import datetime

class CalendarIntegration:
    def __init__(self, credentials_path: str):
        self.credentials_path = credentials_path
        self.scopes = ['https://www.googleapis.com/auth/calendar']
        self.service = None

    def _get_service(self):
        try:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build
        except ImportError:
            raise ImportError("Google client libraries not installed. Please install 'google-api-python-client'.")

        if not self.service:
            if not os.path.exists(self.credentials_path):
                raise FileNotFoundError(f"Credentials file not found: {self.credentials_path}")
            
            creds = service_account.Credentials.from_service_account_file(
                self.credentials_path, scopes=self.scopes
            )
            self.service = build('calendar', 'v3', credentials=creds)
        return self.service

    def create_event(self, summary: str, description: str, start_time: str = None, end_time: str = None):
        """Creates an event on the primary calendar or simulates success."""
        try:
            service = self._get_service()
            
            # Default to now + 1 hour if not provided
            if not start_time:
                start_time = datetime.datetime.utcnow().isoformat() + 'Z'
            if not end_time:
                end_time = (datetime.datetime.utcnow() + datetime.timedelta(hours=1)).isoformat() + 'Z'

            event = {
                'summary': summary,
                'description': description,
                'start': {
                    'dateTime': start_time,
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_time,
                    'timeZone': 'UTC',
                },
            }

            event = service.events().insert(calendarId='primary', body=event).execute()
            return {"success": True, "data": event, "simulated": False}
        except Exception as e:
            return {
                "success": True, 
                "simulated": True, 
                "message": f"[Simulation] Calendar event '{summary}' would have been created.",
                "detail": str(e)
            }

calendar_client_factory = CalendarIntegration
