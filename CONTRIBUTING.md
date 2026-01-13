# Contributing to Neo-Tokyo: Rival Academies

Thank you for your interest in contributing to Neo-Tokyo: Rival Academies! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and considerate
- Welcome newcomers and help them get started
- Be open to constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insulting, or derogatory remarks
- Publishing others' private information
- Any conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- PNPM >= 10.0.0
- Git
- A GitHub account

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/neo-tokyo-rival-academies.git
   cd neo-tokyo-rival-academies
   ```

3. **Install PNPM** (if not already installed):
   ```bash
   npm install -g pnpm@10
   ```

4. **Install dependencies**:
   ```bash
   pnpm install
   ```

5. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/arcade-cabinet/neo-tokyo-rival-academies.git
   ```

6. **Verify setup**:
   ```bash
   pnpm dev
   ```

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `perf/` - Performance improvements
- `test/` - Test additions or changes

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Test your changes thoroughly
- Keep commits focused and atomic

### 3. Keep Your Branch Updated

Regularly sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

### 4. Test Your Changes

Before pushing:

```bash
# Run all checks
pnpm check

# Type check
pnpm type-check

# Build the project
pnpm build

# Test the build
pnpm preview
```

### 5. Push Your Changes

```bash
git push origin your-branch-name
```

### 6. Create a Pull Request

1. Go to the repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template (see below)
5. Submit the PR

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` - use `unknown` or proper types
- Define interfaces/types for all props and function parameters

```typescript
// ✅ Good
interface PlayerProps {
  position: [number, number, number];
  velocity: number;
}

export const Player: FC<PlayerProps> = ({ position, velocity }) => {
  // ...
};

// ❌ Bad
export const Player = ({ position, velocity }) => {
  // ...
};
```

### React Components

- Use functional components
- Use hooks for state and effects
- Prefer named exports
- Use proper prop types

```typescript
// ✅ Good
import type { FC } from 'react';

export const MyComponent: FC<Props> = (props) => {
  return <div>...</div>;
};

// ❌ Bad
export default function MyComponent(props) {
  return <div>...</div>;
}
```

### Code Formatting

This project uses **Biome** (not ESLint/Prettier):

- Single quotes for strings
- Semicolons required
- 2 space indentation
- Max line width: 100 characters

Run formatting before committing:
```bash
pnpm check:fix
```

### File Organization

```
src/
├── components/react/
│   ├── scenes/         # Full 3D scenes
│   ├── objects/        # 3D objects
│   ├── ui/             # UI components
│   └── game/           # Game logic
├── layouts/            # Astro layouts
├── pages/              # Astro pages
└── utils/              # Utilities
```

### Naming Conventions

- **Files**: PascalCase for components (`PlayerController.tsx`), camelCase for utils (`gameUtils.ts`)
- **Components**: PascalCase (`GameScene`, `PlayerController`)
- **Functions**: camelCase (`calculateVelocity`, `handleJump`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_VELOCITY`, `DEFAULT_JUMP_HEIGHT`)
- **Types/Interfaces**: PascalCase (`PlayerProps`, `Vector3D`)

## 💬 Commit Guidelines

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(player): add double jump mechanic

Implemented double jump ability for the player character.
Includes particle effects and sound.

Closes #42
```

```
fix(camera): prevent camera clipping through walls

Added collision detection for camera to prevent it from
passing through wall geometries.

Fixes #38
```

```
docs(readme): update installation instructions

Added clarification about PNPM version requirement.
```

## 🔍 Pull Request Process

### PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows the project's coding standards
- [ ] All tests pass (`pnpm check`)
- [ ] TypeScript compiles without errors (`pnpm type-check`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Commits follow the commit message format
- [ ] PR description clearly explains the changes
- [ ] Relevant documentation is updated
- [ ] No merge conflicts with main branch

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Changes Made
- List of specific changes
- Use bullet points

## Testing
How to test these changes:
1. Step 1
2. Step 2

## Screenshots (if applicable)
Add screenshots or videos showing the changes.

## Related Issues
Closes #issue_number
```

### Review Process

1. **Automated Checks**: CI will run automatically
2. **Code Review**: At least one maintainer will review
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, a maintainer will merge

## 🧪 Testing

### Manual Testing

1. Start the dev server: `pnpm dev`
2. Test your changes in the browser
3. Check the console for errors
4. Test on different browsers if possible
5. Verify performance (60 FPS target)

### Performance Testing

Monitor performance:
- Use Chrome DevTools Performance tab
- Check FPS counter (add `<Stats />` from Drei)
- Monitor memory usage
- Profile renders with React DevTools

### Before Submitting

```bash
pnpm check           # Run all checks
pnpm type-check      # TypeScript validation
pnpm build           # Test production build
```

## 📚 Documentation

### When to Update Documentation

Update documentation when:
- Adding new features
- Changing APIs or interfaces
- Adding new dependencies
- Modifying build/deploy processes
- Creating new patterns or conventions

### Documentation Files

- `README.md` - Project overview and quick start
- `AGENTS.md` - AI agent context and guidelines
- `CLAUDE.md` - Claude-specific instructions
- `GEMINI.md` - Gemini-specific instructions
- `CONTRIBUTING.md` - This file
- `.github/copilot-instructions.md` - GitHub Copilot context

### Code Comments

- Add JSDoc comments for public APIs
- Explain complex algorithms or 3D math
- Document non-obvious behavior
- Don't comment obvious code

```typescript
/**
 * Calculate the trajectory for a projectile
 * @param initialVelocity - Starting velocity vector
 * @param gravity - Gravity constant (default: 9.81)
 * @param deltaTime - Time step
 * @returns New position vector
 */
export function calculateTrajectory(
  initialVelocity: Vector3,
  gravity: number = 9.81,
  deltaTime: number
): Vector3 {
  // Implementation
}
```

## 🎨 3D Asset Guidelines

### Model Requirements

- **Format**: .glb or .gltf
- **Polygon Count**: Keep as low as possible
- **Textures**: Use compressed formats (e.g., .ktx2)
- **Size**: Aim for < 1MB per model
- **Optimization**: Use tools like gltf-pipeline

### Texture Guidelines

- **Resolution**: Power of 2 (512x512, 1024x1024, etc.)
- **Format**: .jpg for photos, .png for transparency
- **Compression**: Optimize with tools like TinyPNG
- **Size**: Keep textures < 500KB when possible

### Asset Organization

```
public/
├── models/
│   ├── characters/
│   ├── environments/
│   └── props/
├── textures/
│   ├── materials/
│   └── ui/
└── audio/
    ├── sfx/
    └── music/
```

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Verify it's reproducible
3. Collect relevant information

### Bug Report Template

```markdown
**Description**
Clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node version: [e.g., 20.10.0]
- PNPM version: [e.g., 10.0.0]

**Screenshots**
If applicable, add screenshots.

**Additional Context**
Any other relevant information.
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature.

**Problem it Solves**
What problem does this feature address?

**Proposed Solution**
How do you envision this working?

**Alternatives Considered**
Other approaches you've thought about.

**Additional Context**
Any other relevant information.
```

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Request Comments**: For code-specific questions

### Questions?

If you have questions:
1. Check the documentation (README, AGENTS.md, etc.)
2. Search existing issues
3. Open a new discussion or issue

## 🏆 Recognition

Contributors will be recognized in:
- The README.md file
- Release notes
- Project documentation

Thank you for contributing to Neo-Tokyo: Rival Academies! 🎮✨

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
