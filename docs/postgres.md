# Postgres

- set env vars Oracle?
- allow remote connections [tutorial](https://docs.cloudera.com/HDPDocuments/HDF3/HDF-3.5.2/installing-hdf/content/configure_postgres_to_allow_remote_connections.html) and [volume paths](https://stackoverflow.com/questions/67172400/how-to-launch-a-postgres-docker-container-with-valid-initial-setting)

```yml
volumes:
  - ./prisma/pg-data:/var/lib/postgresql/data
  - ./prisma/pg-config/pg_hba.conf:/var/lib/postgresql/data/pg_hba.conf
# - ./prisma/pg-config/postgresql.conf:/var/lib/postgresql/data/postgresql.conf
```

- needed to build with local database

```bash
sudo chown -R $USER ./prisma/pg-data
```

### Postgres allow remote connections

#### expose Postgres directly without Traefik (can't route TCP to subdomains, only IPs, layer4)

- set custom location for `postgresql.conf` (remove it from `/var/lib/postgresql/data`)
- can't mount conf files in `/var/lib/postgresql/data`, folder not empty error
- change port to `5433`

```yml
command: postgres -p 5433 -c config_file=/etc/postgresql.conf
```

- set custom location for `pg_hba.conf` in `postgresql.conf`

```bash
hba_file = '/etc/pg_hba.conf'
```

- allow remote connections in `pg_hba.conf`
- [tutorial](https://docs.cloudera.com/HDPDocuments/HDF3/HDF-3.5.2/installing-hdf/content/configure_postgres_to_allow_remote_connections.html)

```bash
# IPv4 local connections:
host    all             all             0.0.0.0/0               trust

# IPv6 local connections:
host    all             all             ::/0                    trust
```

- mount data and config files

```yml
volumes:
  - ./pg-data:/var/lib/postgresql/data
  - ./pg-config/postgresql.conf:/etc/postgresql.conf
  - ./pg-config/pg_hba.conf:/etc/pg_hba.conf
```

### Adminer custom port

- access on `http://localhost:8080/`
- set e.g. `localhost:5433` in the server text input field (html form)
- containers access other containers with service name (on same network, internal or external)
- from host access containers via `localhost`

- local test-db:

```bash
# .env.test.local

# npb-db-test and adminer-dev must be on same external network external-host
server: npb-db-test:5435
username: postgres_user
password: password
database: npb-db-test

# start test db
docker-compose -f docker-compose.test.yml -p npb-test up -d npb-db-test
# start adminer-dev
docker-compose -f docker-compose.dev.yml -p npb-dev up -d  adminer-dev

```

- local dev-db:

```bash
# .env.local

server: npb-db-dev:5432
username: postgres_user
password: password
database: npb-db-dev
```

### Truncate all tables from Postgres database

- stackoverflow (works, tested), stored procedure per database level, [example](https://stackoverflow.com/questions/2829158/truncating-all-tables-in-a-postgres-database)

```sql
-- first create stored procedure in db

CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
DECLARE
    statements CURSOR FOR
        SELECT tablename FROM pg_tables
        WHERE tableowner = username AND schemaname = 'public';
BEGIN
    FOR stmt IN statements LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- then call with POSTGRES_USER=postgres_user from .env*.local

SELECT truncate_tables('postgres_user');
```

### Important: Postgres volume non-root user solution:

- Docker Postgres **Arbitrary --user Notes** [docs](https://hub.docker.com/_/postgres), on Github [docker-library/docs/blob/master/postgres/content.md](https://github.com/docker-library/docs/blob/master/postgres/content.md#arbitrary---user-notes)

- **simplest:** use `postgres:14.3-bullseye` (133.03 MB) instead of `postgres:14-alpine` (85.81 MB)
- in docker-compose.yml `user: '${MY_UID}:${MY_GID}'` (1000:1000)
- and **must create manually folder `pg-data-test` on host**, and then it leaves it alone (maybe good enough)

- **it works:** mount one dir above (`prisma/pg-data`) and set data dir as subdirectory (`prisma/pg-data/data-test`), add `prisma/pg-data/.gitkeep`
- Gitlab [example](https://gitlab.apertis.org/infrastructure/qa-report-app/-/merge_requests/39)

```yml
# maybe hardcode 1000:1000 for prod
user: '${MY_UID}:${MY_GID}'
volumes:
  - ./prisma/pg-data:/var/lib/postgresql/data
environment:
  - PGDATA=/var/lib/postgresql/data/data-test
```

```bash
# .gitignore, .dockerignore
# ignore data, commit .gitkeep
prisma/pg-data/data-*
```

### Public free Postgres db in cloud

- Heroku requires 2 databases for shadow database, restricted privilegies for default db (only for migrate dev and reset), for prod it should work dev.to [tutorial](https://dev.to/prisma/how-to-setup-a-free-postgresql-database-on-heroku-1dc1)
- elephantsql.com 20MB database, medium (trivial) [tutorial](https://medium.com/@noogetz/how-to-setup-a-database-with-elephantsql-7d87ea9953d0)

```bash
# same on elephantsql.com
Error: P3014

Prisma Migrate could not create the shadow database. Please make sure the database user has permission to create databases. Read more about the shadow database (and workarounds) at https://pris.ly/d/migrate-shadow

Original error:
db error: ERROR: permission denied to create database
   0: migration_core::state::DevDiagnostic
             at migration-engine/core/src/state.rs:250
```

- can use `npx prisma db push` without migration history, good enough, Prisma [docs](https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database#shadow-database-user-permissions)
