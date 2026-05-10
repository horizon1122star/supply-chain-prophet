import asyncio
import sys
import json
from agents.weather import WeatherAgent

if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding='utf-8')

async def main():
    company = sys.argv[1] if len(sys.argv) > 1 else "Global"
    agent = WeatherAgent()
    try:
        async for event in agent.execute(company, "default"):
            print(json.dumps(event), flush=True)
    except Exception as e:
        error_event = {
            "agent": "weather",
            "type": "error",
            "status": "error",
            "log": f"Wrapper Error: {str(e)}",
            "data": {}
        }
        print(json.dumps(error_event), flush=True)

if __name__ == "__main__":
    if sys.platform.startswith("win"):
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
