# nx-plugins TODOs

## nx-graphql-code-generator

- [ ] `generator`: Investigate how best to add plugins to package.json ( similar to `graphql-codegen init` )
  - [x] Add `output` option, which maps to graphql-codegen init `output`
  - [x] Add `output` as default to nx.json
  - [x] Add `config` as default to nx.json
  - [x] Bring over list of plugins
  - [ ] Generate schema.json from list of plugins? Maybe just checklist of plugins? Check how Nx console behaves either way.
- [ ] `executor`: Add codegen flags like `--watch`
