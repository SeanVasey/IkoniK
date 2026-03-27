# Architecture

## Overview

IkoniK is a creative tool for creating vectors from scratch and converting rasterized images to vector format with high fidelity.

## Project Structure

```
project-root/
├── CLAUDE.md              # AI assistant guidelines
├── README.md              # Project overview and setup
├── LICENSE                # MIT License
├── CHANGELOG.md           # Version history
├── SECURITY.md            # Vulnerability reporting
├── .editorconfig          # Editor consistency
├── .gitignore             # Git exclusions
├── .env.example           # Environment variable template
│
├── .claude/               # Claude Code configuration
│   ├── settings.json
│   ├── commands/          # Custom slash commands
│   ├── hooks/             # Pre/post action hooks
│   └── skills/            # Reusable workflows
│
├── .github/workflows/     # CI/CD pipelines
│   └── ci.yml
│
├── docs/                  # Documentation
│   ├── architecture.md    # This file
│   ├── decisions/         # Architecture Decision Records
│   └── runbooks/          # Operational procedures
│
├── src/                   # Application source code
├── tests/                 # Test suites
├── tasks/                 # Workflow tracking
│   ├── todo.md            # Deferred work items
│   └── lessons.md         # Lessons learned log
│
└── public/
    └── icons/             # PWA and favicon assets
```

## Key Decisions

Architecture Decision Records (ADRs) are stored in `docs/decisions/`. See that directory for the rationale behind significant technical choices.

## Tech Stack

_To be defined as the project takes shape. Update this section when the primary framework and tooling are selected._
