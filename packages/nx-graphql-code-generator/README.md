# @eddeee888/nx-graphql-code-generator

This [Nx plugin](https://nx.dev/getting-started/intro) can be used to add [graphql-code-generator](https://www.graphql-code-generator.com/) config and packages to an Nx project.

## Generators

### add

You can use this generator to wire up codegen config to an Nx project.

```bash
$ nx generate @eddeee888/nx-graphql-code-generator --project=<existing project name>
```

| Options        | Required | Description                                                                                                                              |
| -------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `project`      | Yes      | Nx project to add codegen config to.                                                                                                     |
| `schema`       | Yes      | Maps to codegen's [schema field](https://www.graphql-code-generator.com/docs/config-reference/schema-field).                             |
| `output`       | No       | Output path for the generated path. Relative from project root. More can be added manually later. Default: `graphql/generated.ts`        |
| `document`     | No       | Maps to codegen's [documents field](https://www.graphql-code-generator.com/docs/config-reference/documents-field).                       |
| `pluginPreset` | No       | Common [codegen plugins](https://www.graphql-code-generator.com/plugins) presets depending on project language, use cases and libraries. |
| `config`       | No       | Name of codegen config file. Default: `graphql-codegen.yml`                                                                              |

## Executors

### codegen

You can use this executor to run codegen CLI. Note that the `add` generator automatically adds this to the project config. Your project config should look like this:

```js
// libs/<project name>/project.json
{
  // ...
  "targets": {
    // ...
    "graphql-codegen": {
      "executor": "@eddeee888/nx-graphql-code-generator:codegen",
      "options": {
        "configFile": "libs/<project name>/codegen.yml"
      }
    }
  }
}
```

You can run the executor like you woud other targets:

```bash
$ nx graphql-codegen <project name>
```

| Options      | Required | Description                               |
| ------------ | -------- | ----------------------------------------- |
| `configFile` | Yes      | Path to the project's codegen config file |
