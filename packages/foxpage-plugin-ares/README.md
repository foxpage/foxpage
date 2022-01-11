# @foxpage/foxpage-plugin-ares

The plugin for foxpage to get resource list

## Usage

Import this plugin in foxpage-server env config file

```typescript
export default {
  ...
    "plugins": ["@foxpage/foxpage-plugin-ares"],
  ...
}
```

## Methods

#### resourceList(options:ResourceListOptions)

Search resource list from the special server with resource name

```typescript
interface ResourceListOptions {
  type: string; // default is 'ares', if not , then response empty array direct
  name?: string; // search resource name
  resourceConfig?: any; // the resource server address config, include host and path
  groupConfig?: any; // the resource group's manifest file path config
  appConfig?: any; // the resource group's application config
}
```
