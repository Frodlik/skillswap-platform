#!/usr/bin/env bash
set -euo pipefail

# Creates all SkillSwap databases under the same PostgreSQL instance.
# Executed once by the postgres container on first startup.

DATABASES=(auth_db user_db skill_db match_db session_db)

for db in "${DATABASES[@]}"; do
    echo "Creating database: $db"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
        SELECT 'CREATE DATABASE $db OWNER $POSTGRES_USER'
        WHERE NOT EXISTS (
            SELECT FROM pg_database WHERE datname = '$db'
        )\gexec
EOSQL
done

echo "All databases initialised."