# @eddeee888/nx-dev-tools

This [Nx plugin](https://nx.dev/getting-started/intro) can be used to add essential Docker and networking config to an Nx workspace.

## Generators

### init

You can use this generator to create essential config to an Nx workspace.

```bash
$ nx generate @eddeee888/nx-dev-tools
```

| Options       | Required | Description                                                                                                 |
| ------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `projectName` | Yes      | Name of the project. This is used with `devDomain` to generate the final project domain.                    |
| `commandName` | Yes      | Name of command to conveniently interact with the Docker stack                                              |
| `devDomain`   | Yes      | Top level domain to set up networking. This is used with `projectName` to generate the final project domain |
