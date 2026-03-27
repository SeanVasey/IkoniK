<div align="center">

<!-- Replace with project logo/icon once the master SVG is created -->
# IkoniK

**A creative, powerful tool to create vectors from scratch and convert rasterized images with fidelity.**

[![CI](https://github.com/SeanVasey/IkoniK/actions/workflows/ci.yml/badge.svg)](https://github.com/SeanVasey/IkoniK/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

</div>

---

<!-- TODO: Add hero screenshot or animated demo GIF once the UI is built -->

## Features

### Vector Creation
- Create vector graphics from scratch with an intuitive interface

### Raster-to-Vector Conversion
- Convert rasterized images to vector format with high fidelity

> **Status:** Early development. See [CHANGELOG.md](./CHANGELOG.md) for progress and [tasks/todo.md](./tasks/todo.md) for the roadmap.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone https://github.com/SeanVasey/IkoniK.git
cd IkoniK
cp .env.example .env
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Environment Variables

See [`.env.example`](./.env.example) for required environment variables and their descriptions.

## Project Structure

```
IkoniK/
├── CLAUDE.md              # AI assistant guidelines
├── README.md              # This file
├── LICENSE                 # MIT License
├── CHANGELOG.md           # Version history
├── SECURITY.md            # Vulnerability reporting
├── .editorconfig          # Editor consistency
├── .gitignore             # Git exclusions
├── .env.example           # Environment variable template
├── .claude/               # Claude Code configuration
├── .github/workflows/     # CI/CD pipelines
├── docs/                  # Documentation & ADRs
├── src/                   # Application source code
├── tests/                 # Test suites
├── tasks/                 # Workflow tracking
└── public/icons/          # PWA and favicon assets
```

For detailed architecture information, see [docs/architecture.md](./docs/architecture.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## Credits

Created by [Sean Vasey](https://github.com/SeanVasey).
