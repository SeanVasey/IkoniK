# Deploy Runbook

## Pre-deploy Checklist

- [ ] CI pipeline is green
- [ ] No unresolved `TODO`/`FIXME` in deployed files
- [ ] Clean lockfile install (`npm ci`) succeeds
- [ ] Zero build errors
- [ ] Environment variables are set in the deployment platform

## Deployment

_Deployment steps to be documented once the hosting platform and build pipeline are finalized._

## Rollback

1. Identify the last known good deployment
2. Redeploy from that commit or use the hosting platform's rollback feature
3. Verify the rollback is functioning correctly
4. Investigate and fix the issue on a branch before redeploying
