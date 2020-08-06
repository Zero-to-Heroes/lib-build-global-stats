# Deploy

```
rm -rf dist && tsc && rm -rf dist/node_modules && 'cp' -rf dist/ /g/Source/zerotoheroes/firestone/core/node_modules/\@firestone-hs/build-global-stats/
rm -rf dist && tsc && rm -rf dist/node_modules && npm publish --access public
```

# Reference

Used this project as template: https://github.com/alukach/aws-sam-typescript-boilerplate
