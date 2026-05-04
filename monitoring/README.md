# Observability

Prometheus + Grafana, both in `docker-compose.yml`.

## URLs (after `docker compose up -d`)

| Service     | URL                          | Login         |
|-------------|------------------------------|---------------|
| Prometheus  | http://localhost:9090        | none          |
| Grafana     | http://localhost:3001        | admin / admin |

## Quick smoke test

```bash
# 1. Are all 7 Spring Boot services scraped?
open http://localhost:9090/targets
#    → expect 7/7 UP under the "spring-boot" job

# 2. Generate traffic, then watch Grafana:
node scripts/seed.mjs
open http://localhost:3001
#    → "SkillSwap — Stack Overview" dashboard, panels light up
```

## Dashboards

The repo ships with **`SkillSwap — Stack Overview`** — pre-loaded via
`grafana/dashboards/skillswap-overview.json`. It shows status, request rate,
p95 latency, JVM heap, and 5xx rate per service.

To add more, drop any community dashboard JSON into
`monitoring/grafana/dashboards/` and Grafana picks it up within 30s
(see `provisioning/dashboards/dashboards.yml`).

Useful community IDs (Dashboards → Import → enter ID):

| ID    | What                                       |
|-------|--------------------------------------------|
| 4701  | JVM (Micrometer) — heap, GC, threads       |
| 17175 | Spring Boot 3.x Statistics                 |
| 11378 | RabbitMQ Overview                          |
| 9628  | PostgreSQL                                 |

