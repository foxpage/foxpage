# @foxpage/foxpage-plugin-unpkg

The plugin for foxpage to get resource list

## Usage

Import this plugin in foxpage-server env config file

```typescript
export default {
  ...
    "plugins": ["@foxpage/foxpage-plugin-unpkg"],
  ...
}
```

## Methods

#### resourceList(options:ResourceListOptions)

Search resource list from the special server with resource name

```typescript
interface ResourceListOptions {
  type: string; // default is 'unpkg', if not , then response empty array direct
  name?: string; // search resource name
  resourceConfig?: any; // the resource server address config, include host and path
  appConfig?: any; // the resource group's application config
}
```
