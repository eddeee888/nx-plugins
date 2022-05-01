# nx-plugins TODOs

## nx-graphql-code-generator

- [ ] Ops: Set up CI/CD to publish to NPM
  - [ ] CD: Fix publish issue where merging changeset PR does not release https://github.com/eddeee888/nx-plugins/actions/runs/2253709472
  - [ ] CI: Need setup
- [ ] `generator`: `add` should generate config for apps correctly
- [ ] `generator`: `add` should validate required options ( `project` and `schema` ) correctly
- [ ] `generator`: `add` should show required options correctly. Currently, they are all required
- [ ] `generator`: Add option to name codegen config
- [ ] `generator`: Set `nx.json`'s default generator target's schema flag
- [ ] `generator`: Investigate how best to add plugins to package.json ( similar to `graphql-codegen init` )
- [ ] `executor`: Add codegen flags like `--watch`
