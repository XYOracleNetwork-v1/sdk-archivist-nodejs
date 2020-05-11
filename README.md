[logo]: https://cdn.xy.company/img/brand/XYO_full_colored.png

[![logo]](https://xyo.network)

# XYO ARCHIVIST SDK (sdk-archivist-nodejs)

[![NPM](https://img.shields.io/npm/v/@xyo-network/sdk-archivist-nodejs.svg?style=plastic)](https://www.npmjs.com/package/@xyo-network/sdk-archivist-nodejs)
 
![](https://github.com/XYOracleNetwork/sdk-archivist-nodejs/workflows/Build/badge.svg) [![Maintainability](https://api.codeclimate.com/v1/badges/f3dd4f4d35e1bd9eeabc/maintainability)](https://codeclimate.com/github/XYOracleNetwork/sdk-archivist-nodejs/maintainability) [![BCH compliance](https://bettercodehub.com/edge/badge/XYOracleNetwork/sdk-archivist-nodejs?branch=master)](https://bettercodehub.com/results/XYOracleNetwork/sdk-archivist-nodejs) [![DepShield Badge](https://depshield.sonatype.org/badges/XYOracleNetwork/sdk-archivist-nodejs/depshield.svg)](https://depshield.github.io) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=XYOracleNetwork_sdk-archivist-nodejs&metric=alert_status)](https://sonarcloud.io/dashboard?id=XYOracleNetwork_sdk-archivist-nodejs) [![Known Vulnerabilities](https://snyk.io/test/github/XYOracleNetwork/sdk-archivist-nodejs/badge.svg)](https://snyk.io/test/github/XYOracleNetwork/sdk-archivist-nodejs)

> The XYO Foundation provides this source code available in our efforts to advance the understanding of the XYO Procotol and its possible uses. We continue to maintain this software in the interest of developer education. Usage of this source code is not intended for production.

## Table of Contents

- [Title](#xyo-archivist-sdk)
- [Project Overview](#project-overview)
- [Scope of features](#scope-of-features)
- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)


## Project Overview

### Scope of features
Core functionality for the XYO NodeJS archivist. This repository implements the core objects and services used in the XYO protocol by an archivist. Additionally it provides core XYO features like performing block production, data generation, TCP Network services, and database services.

## Install 

### Clone Repository

```sh
 git clone https://github.com/XYOracleNetwork/sdk-archivist-nodejs.git
```

### Install

```sh
 yarn install
```

### Build

```sh
 yarn build
```

### Use Mock Data

```sh
 yarn mock-data
```

### Test

```sh
 yarn test
```

#

# Contributing

## Developer Guide

### Git Branch Standards

**Make sure that the branch you are on is current and checked out from the most updated remote state**

A key while working in a project is to ensure that you have the **latest code from the other branches**. ***especially those that you have checked out from.*** 

Remember to frequently: 

`git fetch --all`
`git pull <remote name - ususally origin> <branch name>`

We would recommend that you do this before pushing your committed code. 

**NOTE** Related: make sure that you are in communication with your project team, and that you check GitHub for updates to the codebase, especially the branch that you are checked out from. 

### Naming Your Branches

When you are checkout out new branches and naming them, you should follow a solid **git flow** method as outlined below: 
- For **feature branches** `feature/<feature you are working on>`
- For **bug fix branches - hot** `hotfix/<hotfix you are working on>`
- For **bug fix branches** `fix/<fix you are working on>` **NOTE** Only if this bug-fix will not interfere with dev worklflow
- For **release branch** `release/<version number>` **NOTE** Only if your project is working off of a release before merge into master

### Git Flow

**NOTE: Only the Develop and Release Branch can be merged into Master**

In order to ensure that production-ready software is truly ready, we need to maintain a strong git flow. This means that we should only merge our develop or release branch into master - essentially we want to lock the `master`, `release` and `develop` branches. The `develop` branch should be the home for all tested and production ready code that is ready for a final review with included checks before being brought into master, we can also use `release` for production staging. All checks would include CI/CD and code quality. 

For feature branches, you should `git checkout -b feature/<what feature name you are working on>`
**NOTE** Feature branches should always and **only** be checked out from the latest develop branch. 

Bug fixes, documentation updates, and minor styling should be done through a `release` branch which would be checked out from the latest `develop` branch after all feature branches have been merged into the `develop` branch.

The `develop` branch should also be where we conduct full app testing, as opposed to feature specific. To test features, you should make sure that all feature specifc tests pass in the `feature` branch that you are working on.

If you feel you may need to do a `hot-fix` directly to master, please communicate when to do this. **Do Not Take Hot Fixes Lightly**

### Tools

- [yarn package manager](https://yarnpkg.com/en/)
- [eslint](https://eslint.org/)
- [tslint](https://palantir.github.io/tslint/)
- [typescript](https://www.typescriptlang.org/)
- Use `@storybook` dependencies 
- Use `@type` dependencies

### Maintainers

- Carter Harrison
- Arie Trouw

## License

See the [LICENSE](LICENSE) file for license details.

## Credits

Made with 🔥and ❄️ by [XYO](https://www.xyo.network)
