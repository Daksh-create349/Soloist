import os
import httpx
from pydantic import BaseModel

class NotionIntegration:
    def __init__(self, api_key: str, database_id: str):
        self.api_key = api_key
        self.database_id = database_id
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }

    async def create_database_entry(self, title: str, description: str, status: str = "Inbox"):
        """Creates a new page within the target Notion Database or simulates success."""
        if not self.api_key or not self.database_id:
            return {
                "success": True,
                "simulated": True,
                "message": f"[Simulation] Notion entry '{title}' would have been created.",
                "detail": "Missing Notion API Key or Database ID."
            }

        payload = {
            "parent": {"database_id": self.database_id},
            "properties": {
                "Name": {
                    "title": [
                        {"text": {"content": title}}
                    ]
                },
                "Status": {
                    "select": {"name": status}
                }
            },
            "children": [
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {"type": "text", "text": {"content": description}}
                        ]
                    }
                }
            ]
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/pages",
                    headers=self.headers,
                    json=payload
                )
                
                if response.status_code in [200, 201]:
                    return {"success": True, "data": response.json(), "simulated": False}
                else:
                    return {
                        "success": False, 
                        "simulated": False, 
                        "message": f"Notion API Error: {response.status_code}",
                        "detail": response.text
                    }
        except Exception as e:
            return {
                "success": False, 
                "simulated": False, 
                "message": f"Notion Connection Failed",
                "detail": str(e)
            }

notion_client_factory = NotionIntegration
