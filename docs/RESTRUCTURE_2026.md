# Repository Restructure (Feb 2026)

## Summary

Documentation and scripts have been reorganized for clarity.

## Changes

### Root Directory
- **Before:** 35+ markdown files at root
- **After:** Clean root with README.md, LICENSE, config files, docker-compose files only

### Documentation (`docs/`)

| Folder | Contents |
|--------|----------|
| `docs/fixes/` | Bug fix notes (ROI, genealogy, signup, KYC, etc.) |
| `docs/security/` | Security audits, CVE fixes, implementation docs |
| `docs/performance/` | Tree optimizations, performance analysis |
| `docs/deployment/` | Docker, production, stagging setup guides |
| `docs/development/` | Releases, testing, development notes |
| `docs/ci/` | GitHub Actions, SSH, deployment user setup |
| `docs/archive/` | Superseded docs, restructure plans, timestamps |
| `docs/api/` | API documentation |
| `docs/architecture/` | Architecture overview |

### CI/CD (`docs/ci/`)
- Moved from `.github/` root: SSH guides, deployment setup, quick reference

### Scripts
- Added `scripts/README.md` with script descriptions
- Moved `SERVER_FIX_GITHUB_SSH.sh` from `.github/` to `scripts/`

### Unchanged
- `client/` and `server/` - application code
- `docker-compose*.yml` - remain at root (referenced by CI/scripts)
- `.github/workflows/` - CI/CD workflows
- `package.json`, `LICENSE`, `.gitignore`
