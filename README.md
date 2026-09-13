# sentry

> Sentry is cross-platform application monitoring, with a focus on error reporting.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Key Components](#key-components)
5. [Setup & Installation](#setup--installation)
6. [Running the Application](#running-the-application)
7. [Infrastructure & CI/CD](#infrastructure--cicd)
8. [Contributing](#contributing)

---

## Overview

**sentry** is part of the [Unacademy](https://github.com/unacademy) engineering ecosystem.

Sentry is cross-platform application monitoring, with a focus on error reporting.

**Topics / Tags:** `approvers-1`

---

## Tech Stack

| Attribute | Value |
|-----------|-------|
| **Primary Language** | Unknown |
| **Framework / Platform** | React |
| **Package Manager** | — |

### Dependencies

**Runtime Dependencies:**
- `@babel/core`
- `@babel/plugin-proposal-class-properties`
- `@babel/plugin-proposal-decorators`
- `@babel/plugin-proposal-object-rest-spread`
- `@babel/plugin-syntax-dynamic-import`
- `@babel/plugin-transform-runtime`
- `@babel/preset-env`
- `@babel/preset-react`
- `@babel/preset-typescript`
- `@babel/runtime`
- `@emotion/babel-preset-css-prop`
- `@emotion/core`
- `@emotion/styled`
- `@sentry/apm`
- `@sentry/browser`

**Dev Dependencies:**
- `@babel/plugin-transform-react-jsx-source`
- `@sentry/node`
- `@storybook/addon-a11y`
- `@storybook/addon-actions`
- `@storybook/addon-docs`
- `@storybook/addon-info`
- `@storybook/addon-knobs`
- `@storybook/addon-options`
- `@storybook/addon-storysource`
- `@storybook/addons`


---

## Repository Structure

```
sentry/
├── .artifacts
├── .dockerignore
├── .envrc
├── .eslintignore
├── .eslintrc.js
├── .eslintrc.relax.js
├── .gitattributes
├── .github/
│   ├── CODEOWNERS
│   ├── CONTRIBUTING.md
│   ├── ISSUE_TEMPLATE
├── .gitignore
├── .mailmap
├── .npmrc
├── .nvmrc
├── .pre-commit-config.yaml
├── .python-version
├── .storybook/
│   ├── .babelrc
│   ├── main.js
│   ├── manager.js
│   ├── preview.js
│   ├── webpack.config.js
├── .travis/
│   ├── deploy-storybook.sh
│   ├── storybook-credentials.tar.gz.enc
├── .travis.yml
├── .tx
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   ├── settings.json
├── .yarnrc
├── AUTHORS
... (truncated)
```

---

## Key Components

Below is an analysis of the key files and modules:

| File / Directory | Purpose |
|-----------------|---------|


> **Note:** Only the first 20 non-trivial files are listed. See the repository tree above for the complete structure.

---

## Setup & Installation

### Prerequisites

- Git (`git --version`)
- Unknown runtime installed
- Docker (optional, for containerized setup)
- `make` (for Makefile targets)

### Steps

```bash
# 1. Clone the repository
git clone git@github.com:unacademy/sentry.git
cd sentry

# 2. Install dependencies
npm install      # or yarn install
```

```bash
docker-compose up --build   # or docker build/run
```

```bash
make help   # list available make targets
```

### Available Scripts

```bash
# test
npm run test   # node scripts/test.js

# test-precommit
npm run test-precommit   # yarn test --bail --findRelatedTests -u

# test-ci
npm run test-ci   # yarn test --ci --coverage

# test-debug
npm run test-debug   # node --inspect-brk scripts/test.js --runInBand

# test-staged
npm run test-staged   # yarn test --findRelatedTests $(git diff --name-only --cached)

# lint
npm run lint   # yarn eslint tests/js src/sentry/static/sentry/app --ext .js,.jsx,.ts,.tsx

# lint:css
npm run lint:css   # yarn stylelint --syntax css-in-js 'src/sentry/static/sentry/app/**/*.jsx'

# dev
npm run dev   # (yarn check --verify-tree || yarn install --check-files) && sentry devserver

# dev-server
npm run dev-server   # webpack-dev-server

# dev-acceptance
npm run dev-acceptance   # NO_DEV_SERVER=1 NODE_ENV=development yarn webpack --watch

```


---

## Running the Application

```bash
npm run dev   # (yarn check --verify-tree || yarn install --check-files) && sentry devserver
```

---

## Infrastructure & CI/CD

- Docker support available (`Dockerfile` / `docker-compose.yml`)
- Test suite present — run tests before submitting PRs

---

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Commit your changes: `git commit -m "feat: describe your change"`
3. Push and open a PR targeting `master`
4. Ensure all CI checks pass before requesting review

---

## Original README (Excerpt)

> <p align="center">
  <p align="center">
    <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
      <img src="https://sentry-brand.storage.googleapis.com/sentry-logo-black.png" alt="Sentry" height="72">
    </a>
  </p>
  <p align="center">
    Users and logs provide clues. Sentry provides answers.
  </p>
</p>

# What's Sentry?

Sentry fundamentally is a service that helps you monitor and fix crashes
in realtime. The server is in Python, but it contains a full API for
sending events from any language, in any application.

<p align="center">
  <img src="https://gith

---

*This README was auto-generated on 2026-09-14 by the Unacademy repo-summarizer tool.*
*For corrections or additions, edit this file directly or open an issue.*
