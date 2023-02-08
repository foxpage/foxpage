<p align="center">
  <!-- <a href="https://www.foxpage.io/page/#"> -->
    <img src="https://www.foxpage.io/logo.jpg" width="260px" alt="Foxpage logo" />
  <!-- </a> -->
</p>
<h1 align="center">Foxpage</h1>
<h4 align="center">Low-code, made simple and fast</h4>
<!-- <p align="center"><a href="https://www.foxpage.io/page/#/">在线体验</a></p> -->
<br />

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D14.15.1-brightgreen" alt="Node Version" />
  <img src="https://img.shields.io/badge/typescript-%3E%3D4.3.0-brightgreen" alt="Typescript Version" />
  <img src="https://img.shields.io/badge/yarn-1.22.5-blue" alt="Yarn Version" />
  <img src="https://img.shields.io/badge/npm-%3E%3D6.14.x-blue" alt="NPM Version" />
</p>

Foxpage 是一个轻量级前端低代码框架。

[English](./README.md) | 简体中文

<a href="https://www.foxpage.io/#/guide" target="_blank">阅读使用教程</a>

## 特性

- 🖥️ **可视化**，提供可视化的前端页面搭建，所见即所得。
- 🏷️ **组件化**，提供较为完善的组件制作流程和组件化方案，制作页面先从制作组件开始。
- 📋 **可扩展**，提供多端，多技术栈及多种场景的支持。
- 🌍 **国际化**，提供一套国际化内容管理的方案。
- 📡 **平台化**，给开发者、编辑、运营等提供了一个在线合作的平台。

## 项目目录

```txt
<Project Root>
  ├── packages
  |   ├─foxpage-admin                // foxpage portal
  │   ├─foxpage-server               // foxpage server
  │   ├─foxpage-server-types         // foxpage types
  │   ├─foxpage-visual-editor         // foxpage visual editor
```

## 开始使用

### ⏳ 安装

- 推荐使用 **yarn** 安装 Foxpage. [使用这些文档安装 yarn](https://yarnpkg.com/lang/en/docs/install/)

```shell
$ yarn boot
```

##### 启动 API 服务

```shell
$ yarn run start-server:prod

# 启动成功后，初始化数据
$ yarn run init-server:prod

```

##### 启动前端服务

```shell
$ yarn run start-admin:prod
```

### 🖐 系统要求

**数据库**

- MongoDB >= 5.0.2
- Mongoose >= 5.12.14

**我们建议始终使用最新版本的 Foxpage 来开始您的新项目**。

## 成为贡献者

在向项目提交拉取请求之前，请阅读我们的 [贡献指南](https://www.foxpage.io/#/guide/contribute)。

## 社区支持

有关 Foxpage 使用的一般帮助，请参阅 [Foxpage 官方文档](https://www.foxpage.io/)。 如需其他帮助，您可以使用以下渠道之一提出问题:

- [GitHub](https://github.com/foxpage/foxpage) (错误报告，贡献)

## 文档中心

- [开发者文档](https://www.foxpage.io/#/developer)
- [用户指南](https://www.foxpage.io/#/course)

<!-- ## 在线体验

通过访问带有示例数据的 [Foxpage 项目](https://www.foxpage.io/#/page/)，了解系统。 -->

## 使用许可

点击[LICENSE](./LICENSE) 查看更多使用许可信息.
