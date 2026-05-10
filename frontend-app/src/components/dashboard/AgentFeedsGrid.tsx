"use client";

import Panel from "@/components/ui/Panel";
import NewsFeed from "@/components/feeds/NewsFeed";
import FinanceFeed from "@/components/feeds/FinanceFeed";
import WeatherFeed from "@/components/feeds/WeatherFeed";
import LogisticsFeed from "@/components/feeds/LogisticsFeed";
import MemoryFeed from "@/components/feeds/MemoryFeed";
import GeopoliticsFeed from "@/components/feeds/GeopoliticsFeed";

const feeds = [
  { id: "news",       Component: NewsFeed,       accent: "none"      },
  { id: "finance",    Component: FinanceFeed,    accent: "none"      },
  { id: "weather",    Component: WeatherFeed,    accent: "none"      },
  { id: "logistics",  Component: LogisticsFeed,  accent: "none"      },
  { id: "memory",     Component: MemoryFeed,     accent: "none"      },
  { id: "geo",        Component: GeopoliticsFeed, accent: "error"    },
] as const;

export default function AgentFeedsGrid() {
  return (
    <section className="grid grid-cols-3 gap-3">
      {feeds.map(({ id, Component, accent }) => (
        <Panel
          key={id}
          accentColor={accent as "none" | "error"}
          className="p-4"
          style={{ minHeight: "180px" }}
        >
          <Component />
        </Panel>
      ))}
    </section>
  );
}
