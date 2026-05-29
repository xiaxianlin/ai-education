# Cutover and Rollback Plan

Cut over by route prefix, not by whole service.

## Gateway Rule

The default during migration is Python. A route moves to Go only after its module acceptance gate passes.

Example:

```nginx
location /api/student/ability/ {
    proxy_pass http://server-go;
}

location /api/student/practice/ {
    proxy_pass http://server-python;
}
```

## Cutover Checklist

- Module tests pass.
- API contract file is updated.
- Frontend smoke test is recorded.
- DB write compatibility is reviewed.
- Rollback route is documented.
- Logs and metrics are visible.

## Rollback

Rollback is a gateway route change back to Python. Do not run destructive DB migrations during phased cutover.

