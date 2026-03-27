# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in IkoniK, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **security@ikonik.dev** (or contact the repository owner directly via GitHub).

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 5 business days
- **Fix or mitigation:** Dependent on severity, targeting 30 days for critical issues

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | Yes       |

## Security Best Practices

This project follows the security standards documented in [CLAUDE.md](./CLAUDE.md#security), including:

- No DIY authentication — using established auth providers
- Parameterized queries for all database operations
- Input validation by file signature, not extension
- Rate limiting on all API endpoints
- No secrets in version control
- `npm audit` in CI pipeline
