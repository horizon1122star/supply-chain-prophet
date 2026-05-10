import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();

async function test() {
  try {
    const quote = await yahooFinance.quote("TSLA", {
      fields: ["shortName", "regularMarketPrice", "regularMarketChange",
               "regularMarketChangePercent", "currency"],
    });
    console.log("Quote result:", quote);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
