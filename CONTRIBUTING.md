# Contributing to IkoniK

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch from `main`
4. Make your changes
5. Run verification (lint, typecheck, tests, build)
6. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
7. Push to your fork and open a Pull Request

## Commit Convention

We use Conventional Commits:

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `chore:` — Maintenance tasks
- `refactor:` — Code refactoring (no feature or fix)
- `test:` — Adding or updating tests

Every commit message should include what changed, why, and how it was verified.

## Pull Request Process

1. Ensure CI passes (lint, typecheck, tests, build)
2. Update documentation if your change affects it
3. Bug fixes must include a regression test
4. Request review from a maintainer

## Code Standards

Follow the standards documented in [CLAUDE.md](./CLAUDE.md#standards):

- Accessibility: WCAG-minded, keyboard-first, semantic HTML
- Performance: Measure first, avoid regressions
- Security: Follow all security guidelines
- UX: Responsive, polished states, consistent patterns

## Questions?

Open an issue for discussion before starting large changes.
