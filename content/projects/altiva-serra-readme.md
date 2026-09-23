# Altiva Serra

**What it is:** a multi-tenant real-estate marketplace platform. It combines a shared regional listings dataset with private, broker-specific data and tools, so multiple real-estate brokers can use the same platform without seeing each other's client or business data.

**Why it exists:** to give independent real-estate brokers a shared market view (comparable listings, pricing context) plus their own private workspace, instead of each broker working from scratch with no shared data layer.

**Tech stack:** TypeScript web application; Python services for data collection and processing; PostgreSQL with row-level security enforcing the isolation between the shared market data and each broker's private data; PDF report generation; Stripe for subscription billing (platform owner and broker accounts); deployed on Google Cloud (Cloud Build/Cloud Run).

**Status:** private, pre-launch. Billing is currently in Stripe's sandbox/test mode only — the product has not gone live yet.

**Not included here:** the specific sources it collects listings from, real customer/broker names, pricing or financial details, or any other business-sensitive specifics. Ask Breno directly for a walkthrough or more detail.
