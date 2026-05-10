-- supabase/seed.sql
-- Run this in: supabase.com → SQL Editor → Paste → Run

-- ─── TABLES ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS disruption_events (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),
  date             date,
  type             text,
  region           text,
  description      text,
  outcome          text,
  signal_lead_days integer
);

CREATE TABLE IF NOT EXISTS supplier_graph (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company     text,
  supplier    text,
  category    text,
  region      text,
  criticality text,
  lat         float,
  lon         float
);

CREATE TABLE IF NOT EXISTS scan_results (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  company    text,
  scenario   text,
  verdict    jsonb
);

-- ─── SEED: HISTORICAL DISRUPTION EVENTS ─────────────────────────────────────

INSERT INTO disruption_events (date,type,region,description,outcome,signal_lead_days) VALUES
('2024-03-26','infrastructure','USA',
 'Baltimore Francis Scott Key Bridge collapse disrupts East Coast port',
 'Port of Baltimore closed 6 weeks, $15M/day economic impact',19),
('2024-01-15','conflict','Red Sea',
 'Houthi attacks on commercial shipping in Red Sea escalate',
 '60% of traffic rerouted, shipping costs up 200%, +18 days transit',11),
('2023-08-10','weather','Vietnam',
 'Central Highlands drought reduces robusta coffee harvest',
 'Global coffee prices up 30%, Starbucks supply disruption 8 weeks',31),
('2021-03-23','navigation','Suez Canal',
 'Ever Given container ship blocks Suez Canal for 6 days',
 '$9.6B/day trade blocked, 6-day closure, 369 vessels stranded',0),
('2021-07-15','earthquake','Taiwan',
 'M6.2 earthquake near TSMC Hsinchu Science Park',
 'TSMC fab operations paused 48h, semiconductor shortage Q3 2021',14),
('2022-02-24','conflict','Ukraine',
 'Russian invasion of Ukraine disrupts grain and neon gas supply',
 'Neon prices up 600%, global wheat supply disruption 6 months',7),
('2020-03-15','pandemic','Global',
 'COVID-19 lockdowns shut Chinese manufacturing hubs',
 'Global semiconductor and electronics shortage lasting 2 years',21),
('2021-02-10','weather','USA',
 'Texas winter storm Uri freezes semiconductor fab operations',
 'NXP and Samsung fabs offline 4 weeks, chip shortage worsens',3);

-- ─── SEED: SUPPLIER GRAPHS ───────────────────────────────────────────────────

-- Apple Inc.
INSERT INTO supplier_graph (company,supplier,category,region,criticality,lat,lon) VALUES
('Apple Inc.','TSMC','Semiconductors','Taiwan','critical',24.76,120.99),
('Apple Inc.','Foxconn','Assembly','Taiwan','critical',22.6,120.3),
('Apple Inc.','Murata Manufacturing','Components','Japan','important',35.68,139.69),
('Apple Inc.','Corning','Glass','USA','important',42.15,-77.05),
('Apple Inc.','Samsung Display','Displays','South Korea','important',37.56,126.97),
('Apple Inc.','Luxshare','Assembly','China','important',30.57,104.07),

-- Ford Motor Company
('Ford Motor Company','Bosch','Electronics','Germany','critical',48.78,9.18),
('Ford Motor Company','BASF','Materials','Germany','important',49.48,8.47),
('Ford Motor Company','Aptiv','Wiring','Ireland','important',53.33,-6.25),
('Ford Motor Company','Novelis','Aluminium','USA','important',33.77,-84.39),
('Ford Motor Company','Infineon','Semiconductors','Germany','critical',48.26,11.67),

-- Starbucks Corporation
('Starbucks Corporation','Vietnam robusta farms','Coffee','Vietnam','critical',14.0,108.0),
('Starbucks Corporation','Brazil arabica farms','Coffee','Brazil','critical',-14.23,-51.93),
('Starbucks Corporation','Maersk','Logistics','Denmark','important',55.68,12.57),
('Starbucks Corporation','Colombia farms','Coffee','Colombia','important',4.57,-74.29),

-- Amazon
('Amazon','Foxconn','Electronics','Taiwan','critical',22.6,120.3),
('Amazon','Samsung','Semiconductors','South Korea','important',37.56,126.97),
('Amazon','UPS','Logistics','USA','critical',33.75,-84.39),
('Amazon','TSMC','Semiconductors','Taiwan','important',24.76,120.99);
