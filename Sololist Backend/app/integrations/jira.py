import httpx
from pydantic import BaseModel
import base64

class JiraIntegration:
    def __init__(self, jira_url: str, email: str, api_token: str):
        self.jira_url = jira_url.rstrip("/")
        self.email = email
        self.api_token = api_token
        
        # JIRA uses Basic Auth with email:api_token
        auth_str = f"{self.email}:{self.api_token}"
        encoded_auth = base64.b64encode(auth_str.encode()).decode()
        self.headers = {
            "Authorization": f"Basic {encoded_auth}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

    async def create_issue(self, summary: str, description: str, project_key: str = "KAN", issue_type: str = "Bug"):
        """Creates a new issue in JIRA or simulates success."""
        if not self.jira_url or not self.api_token:
            return {
                "success": True, 
                "simulated": True, 
                "message": f"[Simulation] Jira issue '{summary}' would have been created.",
                "detail": "Missing JIRA configuration."
            }

        # Note: JIRA API v3 uses ADF (Atlassian Document Format) for descriptions.
        # This is a simplified version.
        payload = {
            "fields": {
                "project": {"key": project_key},
                "summary": summary,
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {"type": "text", "text": description}
                            ]
                        }
                    ]
                },
                "issuetype": {"name": issue_type}
            }
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.jira_url}/rest/api/3/issue",
                    headers=self.headers,
                    json=payload
                )
                if response.status_code in [200, 201]:
                    return {"success": True, "data": response.json(), "simulated": False}
                else:
                    return {
                        "success": False, 
                        "simulated": False, 
                        "message": f"Jira API Error: {response.status_code}",
                        "detail": response.text
                    }
        except Exception as e:
            return {
                "success": False, 
                "simulated": False, 
                "message": f"Jira Connection Failed",
                "detail": str(e)
            }

jira_client_factory = JiraIntegration
