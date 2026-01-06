# Commit Message Guidelines

You must follow the **Conventional Commits** specification when generating commit messages.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Rules

1. **Subject**: Use the imperative mood ("add" not "added"). No period at the end. Lowercase.
2. **Body**: Motivation for the change and contrast with previous behavior.
3. **Footer**: References to issues (e.g., "Fixes #123").
4. **Scope**: Optional but encouraged (e.g., `feat(button): add variant prop`).

## Example

```
feat(auth): add login with google

Implement Google OAuth2 login flow.
Add necessary environment variables and updated the user schema.

Closes #42
```
