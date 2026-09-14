#!/usr/bin/env bash
set -euo pipefail
# Bucket configuration and ownership policies must be applied together.
echo "The private notes-files bucket is managed by migration 004_secure_workspace.sql."
echo "Run npm run supabase:db:push, or npm run db:migrate:sql with DATABASE_URL set."
