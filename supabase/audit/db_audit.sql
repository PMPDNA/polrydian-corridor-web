-- Top table bloat (approx)
SELECT schemaname, relname, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 20;

-- Biggest tables
SELECT schemaname, relname, pg_total_relation_size(relid) AS bytes
FROM pg_catalog.pg_statio_user_tables
ORDER BY bytes DESC
LIMIT 20;

-- Slowest queries (if pg_stat_statements is enabled)
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Missing indexes (heuristic: seq scans)
SELECT relname, seq_scan, idx_scan
FROM pg_stat_user_tables
ORDER BY seq_scan DESC
LIMIT 20;
