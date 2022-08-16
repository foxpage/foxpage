# Foxpage Server

Foxpage Server apis for portal and SDK

## Project

```txt
<Project Root>
  ├── packages
  │   ├─foxpage-server               // foxpage server
  │   ├─foxpage-server-types         // foxpage types
  │   ├─foxpage-plugin-aws-s3        // foxpage aws s3 plugin
  │   ├─foxpage-plugin-ares          // foxpage ares plugin
  │   ├─foxpage-plugin-unpkg         // foxpage unpkg plugin
```

## Environment Support

[![Minimum node.js version](https://img.shields.io/badge/node-%3E%3D14.15.1-brightgreen)](https://img.shields.io/badge/node-%3E%3D14.15.1-brightgreen) [![typescript version](https://img.shields.io/badge/typescript-%3E%3D4.0.0-brightgreen)](https://img.shields.io/badge/typescript-%3E%3D4.0.0-brightgreen) [![yarn](https://img.shields.io/badge/yarn-1.22.5-blue)](https://img.shields.io/badge/yarn-1.22.5-blue)

## Getting Started

### ⏳ Installation

- (Use **yarn** to install the Foxpage (recommended). [Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
yarn boot
```

##### Start Server

```bash
npm run start-server:prod

# after server start, run install script to init data
npm run init-server:prod

```

### 🖐 Requirements

**Node:**

- NodeJS >= 14.15.1 <= 16.x
- NPM >= 6.14.x

**Database:**

- MongoDB >= 5.0.2
- Mongoose >= 5.12.14

**We recommend always using the latest version of Foxpage to start your new projects**.

## Documentation

See our documentation live [Docs](http://docs.foxfamily.io/#/) for the Foxpage Server.

## Commit

commit follows [angular specification](https://github.com/angular/angular/blob/master/CONTRIBUTING.md).

commit config: `commitlint.config.js`. see: [github](https://github.com/conventional-changelog/commitlint).

commit check by [husky](https://github.com/typicode/husky).

Commit command:

```shell
npm run commit

// or
npx git-cz
```

## Try live demo

See for yourself what's under the hood by getting access to a [Foxpage project](http://console.foxfamily.io/page/#/) with sample data.

## License

See the [LICENSE](./LICENSE) file for licensing information.
