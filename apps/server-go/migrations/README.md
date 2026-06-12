# Go Server Migrations

Early Go migration work must not mutate the existing MySQL schema. The Python
service remains the schema owner while route traffic is moved module by module.

Add migration files here only after architecture review confirms the change is
backward compatible with the live `ah_*` tables.
