"""
agents/base.py — BaseAgent class inherited by all 6 agents.
Provides: event helper, run() with automatic fallback on any exception.
"""

from abc import ABC, abstractmethod
from typing import AsyncGenerator, Optional
import asyncio


class BaseAgent(ABC):
    name: str = "base"

    async def run(
        self, company: str, scenario: str
    ) -> AsyncGenerator[dict, None]:
        """
        Public entry point called by orchestrator.
        Wraps _execute() with fallback on any exception.
        """
        yield self._event("status", "scanning",
                          log=f"▸ {self.name.title()} agent starting...")
        try:
            async for event in self._execute(company, scenario):
                yield event
        except Exception as e:
            yield self._event("status", "error",
                              log=f"▸ API limit hit — using cached data ({e})")
            async for event in self._fallback(company, scenario):
                yield event

    @abstractmethod
    async def _execute(
        self, company: str, scenario: str
    ) -> AsyncGenerator[dict, None]:
        """Live data path — implement in each subclass."""
        pass

    @abstractmethod
    async def _fallback(
        self, company: str, scenario: str
    ) -> AsyncGenerator[dict, None]:
        """Cached data path — must never raise, always yields at least one result event."""
        pass

    def _event(
        self,
        type: str,
        status: str,
        log: str = "",
        data: Optional[dict] = None,
    ) -> dict:
        """Build a standard AgentEvent dict matching the SSE contract."""
        return {
            "agent":  self.name,
            "type":   type,
            "status": status,
            "log":    log,
            "data":   data or {},
        }
