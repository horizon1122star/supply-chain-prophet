import asyncio
import sys
from agents.weather import WeatherAgent

import sys
if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding='utf-8')

async def main():
    agent = WeatherAgent()
    print("Testing Weather Agent _execute()")
    async for event in agent.execute("Apple", "default"):
        print(event)

if __name__ == "__main__":
    if sys.platform.startswith("win"):
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
