from abc import ABC, abstractmethod
import json
from typing import Dict, Any, List
from app.core.config import settings

class AIProviderInterface(ABC):
    @abstractmethod
    def generate_response(self, system_prompt: str, user_message: str, tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generates reasoning response or tool call invocation from LLM provider.
        """
        pass

class MockAIProvider(AIProviderInterface):
    """
    Deterministic AI provider fallback that uses structured reasoning 
    without requiring external LLM API credentials.
    """
    def generate_response(self, system_prompt: str, user_message: str, tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "provider": "mock",
            "reasoning": "Analyzed store sales velocity, stockout frequency, and perishable inventory expiration risks.",
            "tool_calls": [
                {"name": "detect_profit_leaks", "arguments": {}},
                {"name": "forecast_demand", "arguments": {}},
                {"name": "simulate_order", "arguments": {}}
            ],
            "text": "Based on deterministic data intelligence, I detected profit leakage and ran decision simulations."
        }

class OpenAIProvider(AIProviderInterface):
    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model_name = model_name

    def generate_response(self, system_prompt: str, user_message: str, tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        # Graceful fallback to mock if no valid key provided
        if not self.api_key or self.api_key == "mock_key":
            return MockAIProvider().generate_response(system_prompt, user_message, tools)
        try:
            import openai
            client = openai.OpenAI(api_key=self.api_key)
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
            response = client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.2
            )
            content = response.choices[0].message.content
            return {
                "provider": "openai",
                "reasoning": content,
                "tool_calls": [],
                "text": content
            }
        except Exception as e:
            return MockAIProvider().generate_response(system_prompt, user_message, tools)

def get_ai_provider() -> AIProviderInterface:
    provider_type = settings.AI_PROVIDER.lower()
    if provider_type == "openai":
        return OpenAIProvider(api_key=settings.AI_API_KEY, model_name=settings.AI_MODEL_NAME)
    else:
        return MockAIProvider()
