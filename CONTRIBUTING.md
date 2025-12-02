# Contributing

## Releasing a New Version

1. **Update the version** in `package.json` (both the `version` field and the `PKG_VERSION` in the bundle script):
   ```json
   "version": "0.X.0",
   ...
   "--define:process.env.PKG_VERSION=\"'0.X.0'\""
   ```

2. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "Release v0.X.0"
   git push origin <branch>
   ```

3. **Create a Pull Request** and merge it to `main`.

4. **Tag the merge commit** on main:
   ```bash
   git checkout main
   git pull
   git tag v0.X.0
   git push origin v0.X.0
   ```

5. The GitHub Action will automatically build and create a release with binaries for Linux, macOS, and Windows.
