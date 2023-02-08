<p align="center">
  <!-- <a href="https://console.foxfamily.io/page/#"> -->
    <img src="https://www.foxpage.io/logo.jpg" width="260px" alt="Foxpage logo" />
  <!-- </a> -->
</p>
<h4 align="center">Low-code, made simple and fast</h4>
<!-- <p align="center"><a href="https://console.foxfamily.io/page/#/">Try live demo</a></p> -->
<br />

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D14.15.1-brightgreen" alt="Node Version" />
  <img src="https://img.shields.io/badge/typescript-%3E%3D4.3.0-brightgreen" alt="Typescript Version" />
  <img src="https://img.shields.io/badge/yarn-1.22.5-blue" alt="Yarn Version" />
  <img src="https://img.shields.io/badge/npm-%3E%3D6.14.x-blue" alt="NPM Version" />
</p>

Foxpage is a lightweight front-end low-code framework.

English | [简体中文](./README.zh-CN.md)

<a href="https://www.foxpage.io/#/guide" target="_blank">Read the using document</a>

## Features

- 🖥️ **Visualization**. Provides visual page editing, what you see is what you get.
- 🏷️ **Componentized**. Provide a relatively complete component production process and componentization scheme, and the production of pages starts with the production of components.
- 📋 **Scalable**. Strong scalability both at the technical level and at the business level.
- 🌍 **Globalization**. Provide a set of international content management solutions.
- 📡 **Platform**. Provides an online cooperation platform for developers, editors, operations, etc.

## Project

```txt
<Project Root>
  ├── packages
  |   ├─foxpage-admin                // foxpage portal
  │   ├─foxpage-server               // foxpage server
  │   ├─foxpage-server-types         // foxpage types
  │   ├─foxpage-visual-editor         // foxpage visual editor
```

## Getting Started

<!-- Read the Getting Started tutorial or follow the steps below: -->

### ⏳ Installation

- (Use **yarn** to install the Foxpage (recommended). [Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```shell
$ yarn boot
```

##### Start Server

```shell
$ yarn run start-server:prod

# after server start, run install script to init data
$ yarn run init-server:prod

```

##### Start Portal

```shell
$ yarn run start-admin:prod
```

### 🖐 Requirements

**Database:**

- MongoDB >= 5.0.2
- Mongoose >= 5.12.14

**We recommend always using the latest version of Foxpage to start your new projects**.

## Contributing

Please read our [Contributing Guide](https://www.foxpage.io/#/guide/contribute) before submitting a Pull Request to the project.

## Community support

For general help using Foxpage, please refer to [the official Foxpage documentation](https://www.foxpage.io/). For additional help, you can use one of these channels to ask a question:

- [GitHub](https://github.com/foxpage/foxpage) (Bug reports, Contributions)

## Documentation

See our documentation live [Docs](https://www.foxpage.io/) for the Foxpage Server.

- [Developer docs](https://www.foxpage.io/#/developer)
- [User guide](https://www.foxpage.io/#/course)

<!-- ## Try live demo

See for yourself what's under the hood by getting access to a [Foxpage project](https://console.foxfamily.io/page/#/) with sample data. -->

## License

See the [LICENSE](./LICENSE) file for licensing information.
