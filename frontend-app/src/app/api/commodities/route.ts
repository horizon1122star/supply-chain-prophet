import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { resolveCommodities, CommodityEntry } from "@/data/commodityMap";

const CACHE_FILE = path.join(process.cwd(), "src", "data", "commodityCache.json");

export interface CommodityDataPoint {
  symbol: string;
  name: string;
  price: string;
  change: string;
  percent_change: string;
  timestamp: number;
}

export interface CommoditiesApiResponse {
  query: string;
  commodities: CommodityDataPoint[];
  source: "cache" | "live";
  error?: string;
}

async function readCache(): Promise<Record<string, any>> {
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function writeCache(data: Record<string, any>) {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to cache file", error);
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query")?.trim() ?? "";
  const forceLive = req.nextUrl.searchParams.get("forceLive") === "true";
  
  const entries = resolveCommodities(query);
  const cache = await readCache();
  const apiKey = process.env.TWELVEDATA_API_KEY;

  const results: CommodityDataPoint[] = [];
  let fetchedLive = false;
  const symbolsToFetch: CommodityEntry[] = [];

  // Determine what we can serve from cache and what needs fetching
  for (const entry of entries) {
    if (!forceLive && cache[entry.symbol]) {
      results.push({
        symbol: entry.symbol,
        name: entry.name,
        ...cache[entry.symbol]
      });
    } else {
      symbolsToFetch.push(entry);
    }
  }

  // Fetch live if needed and API key is present
  if (symbolsToFetch.length > 0) {
    if (!apiKey || apiKey === "your_twelvedata_api_key_here") {
      // If no API key, just return what we have (or error if everything is missing)
      if (results.length === 0) {
         // Create mock data just so UI doesn't break
         for (const entry of symbolsToFetch) {
            results.push({
               symbol: entry.symbol,
               name: entry.name,
               price: "0.00",
               change: "0.00",
               percent_change: "0.00",
               timestamp: Date.now() / 1000
            });
         }
      }
    } else {
      fetchedLive = true;
      try {
        const symbolList = symbolsToFetch.map(s => s.symbol).join(",");
        const res = await fetch(`https://api.twelvedata.com/quote?symbol=${symbolList}&apikey=${apiKey}`);
        const data = await res.json();
        
        // Twelve Data returns an object of objects if multiple, or a single object if one symbol
        const items = symbolsToFetch.length === 1 ? [data] : Object.values(data);
        
        for (const item of items as any[]) {
           if (!item || item.code) continue; // Skip errors from 12data
           
           // Match to entry to get display name
           const entry = symbolsToFetch.find(e => e.symbol === item.symbol);
           if (!entry) continue;

           const newPoint = {
             price: parseFloat(item.close).toFixed(2),
             change: item.change,
             percent_change: item.percent_change,
             timestamp: item.timestamp,
           };

           // Add to results
           results.push({
             symbol: entry.symbol,
             name: entry.name,
             ...newPoint
           });

           // Update cache
           cache[entry.symbol] = newPoint;
        }

        // Save new cache
        await writeCache(cache);
      } catch (error) {
        console.error("Twelve Data API fetch failed:", error);
      }
    }
  }

  return NextResponse.json<CommoditiesApiResponse>({
    query,
    commodities: results,
    source: fetchedLive ? "live" : "cache",
  });
}
