# Contributing to Strategy Map

Thank you for your interest in contributing to Strategy Map! This document provides guidelines and best practices for contributing to the project.

## 🎯 Project Philosophy

Strategy Map is built with these core principles:

1. **Object-Oriented Programming** - Clean, maintainable code following OOP best practices
2. **Type Safety** - TypeScript strict mode for maximum reliability
3. **User Experience** - Intuitive, smooth interactions with attention to detail
4. **Performance** - Fast, responsive application with optimized rendering
5. **Accessibility** - Keyboard navigation and screen reader support
6. **Privacy** - No unnecessary data collection, GDPR compliant

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A code editor (VS Code recommended)
- Basic knowledge of TypeScript, React, and HTML5 Canvas

### Setup Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd strategy-puzzle

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5173
```

### Development Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm run dev

# Build to check for TypeScript errors
npm run build

# Commit your changes
git add .
git commit -m "feat: description of your changes"

# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

## 📐 Architecture Overview

### Directory Structure

```
src/
├── components/         # React UI components
│   ├── Canvas.tsx     # Main drawing surface
│   ├── Toolbar.tsx    # Tool selection
│   └── ...
├── models/            # Core data models (OOP)
│   ├── Point.ts       # 2D coordinates
│   ├── Node.ts        # Diagram nodes
│   ├── Arrow.ts       # Connections
│   └── Diagram.ts     # Main model
├── managers/          # Business logic
│   ├── InteractionManager.ts
│   └── KeyboardShortcutManager.ts
├── renderers/         # Canvas rendering
│   └── CanvasRenderer.ts
└── utils/             # Helper functions
    ├── storage.ts
    └── analytics.ts
```

### OOP Principles

All code follows strict OOP principles:

- **Encapsulation** - Hide internal state, expose public interfaces
- **Single Responsibility** - Each class has one clear purpose
- **Composition over Inheritance** - Build complex objects from simple ones
- **Dependency Injection** - Pass dependencies, don't create them

See [claude.md](./claude.md) for detailed architecture documentation.

## 💻 Coding Standards

### TypeScript

- **Always use TypeScript** - No plain JavaScript files
- **Strict mode enabled** - No `any` types without good reason
- **Type everything** - Function parameters, return types, variables
- **Use interfaces** for object shapes
- **Use enums** for constants with meaning

#### Good Example

```typescript
interface NodeStyle {
  strokeColor: Color;
  backgroundColor: Color;
  strokeWidth: StrokeWidth;
}

class Node {
  private style: NodeStyle;

  constructor(
    public readonly id: string,
    public position: Point,
    public text: string
  ) {}

  setStyle(style: Partial<NodeStyle>): void {
    this.style = { ...this.style, ...style };
  }
}
```

#### Bad Example

```typescript
class Node {
  style: any; // ❌ No any types
  id; // ❌ Missing type
  constructor(id, position) {} // ❌ Untyped parameters
}
```

### React Components

- Use **functional components** with hooks
- **TypeScript interfaces** for props
- **useCallback** for event handlers
- **useMemo** for expensive calculations
- **Keep components focused** - one responsibility

#### Good Example

```typescript
interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange
}) => {
  const handleToolClick = useCallback((tool: Tool) => {
    onToolChange(tool);
  }, [onToolChange]);

  return (
    <div className="toolbar">
      {/* ... */}
    </div>
  );
};
```

### CSS

- Use **local CSS files** for components (`ComponentName.css`)
- Use **CSS variables** from `global.css` for consistency
- Follow **BEM-like naming**: `.component-name`, `.component-name-element`
- Keep styles **scoped to components**
- Use **semantic class names**

#### Good Example

```css
.toolbar {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
}

.toolbar-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.toolbar-button.active {
  background-color: var(--color-accent);
}
```

### Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add laser pointer tool
fix: resolve arrow connection bug
docs: update usage guide with new features
style: improve button hover states
refactor: extract canvas rendering logic
perf: optimize node rendering
test: add unit tests for Point class
chore: update dependencies
```

### Code Comments

- **Document why, not what** - Code should be self-explanatory
- **Use JSDoc** for public APIs
- **Explain complex algorithms**
- **Mark TODOs clearly**

```typescript
/**
 * Calculates the intersection point between two lines
 * Uses parametric line equations for accurate results
 *
 * @param line1 - First line segment
 * @param line2 - Second line segment
 * @returns Intersection point or null if lines don't intersect
 */
function findIntersection(line1: Line, line2: Line): Point | null {
  // Implementation...
}
```

## 🎨 Adding New Features

### Before You Start

1. **Check existing issues** - Someone might be working on it
2. **Open an issue** - Discuss the feature before implementing
3. **Get feedback** - Ensure it aligns with project goals
4. **Plan the architecture** - How does it fit into OOP structure?

### Implementation Checklist

- [ ] Create feature branch
- [ ] Write TypeScript with strict types
- [ ] Follow OOP principles
- [ ] Add appropriate tests (if applicable)
- [ ] Update documentation (README, USAGE_GUIDE)
- [ ] Test in multiple browsers
- [ ] Ensure no TypeScript errors (`npm run build`)
- [ ] Test keyboard shortcuts work
- [ ] Verify mobile responsiveness
- [ ] Update CHANGELOG.md
- [ ] Create pull request

### Example: Adding a New Tool

1. **Add Tool Enum** (`managers/InteractionManager.ts`)
   ```typescript
   export enum Tool {
     SELECT = 'select',
     NODE = 'node',
     ARROW = 'arrow',
     TEXT = 'text',
     PAN = 'pan',
     LASER = 'laser',
     RECTANGLE = 'rectangle', // New tool
   }
   ```

2. **Add Interaction Mode** (if needed)
   ```typescript
   enum InteractionMode {
     IDLE = 'idle',
     CREATING_RECTANGLE = 'creating_rectangle',
     // ...
   }
   ```

3. **Implement Tool Logic** (`managers/InteractionManager.ts`)
   ```typescript
   private handleRectangleMouseDown(point: Point): void {
     // Implementation
   }
   ```

4. **Add to Toolbar** (`components/Toolbar.tsx`)
   ```typescript
   const tools = [
     // ...
     { tool: Tool.RECTANGLE, icon: '▭', label: 'Rectangle', shortcut: 'R' },
   ];
   ```

5. **Add Rendering** (`renderers/CanvasRenderer.ts`)
   ```typescript
   private drawRectangle(rectangle: Rectangle): void {
     // Implementation
   }
   ```

6. **Add Model** (if needed) (`models/Rectangle.ts`)
   ```typescript
   export class Rectangle {
     // OOP implementation
   }
   ```

7. **Update Documentation**
   - README.md - Add to features list
   - USAGE_GUIDE.md - Add tool documentation
   - CHANGELOG.md - Note the addition

## 🧪 Testing

### Manual Testing

Before submitting a PR, test:

- [ ] Feature works as expected
- [ ] No console errors or warnings
- [ ] Works in Chrome, Firefox, Safari
- [ ] Mobile/tablet responsive
- [ ] Keyboard shortcuts work
- [ ] Doesn't break existing features
- [ ] Performance is acceptable

### Browser Testing

Test in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Performance Testing

- Check FPS during interactions (should be 60 FPS)
- Monitor memory usage (no leaks)
- Ensure smooth animations
- Test with large diagrams (100+ elements)

## 📝 Documentation

### Update Required Docs

When adding features:

1. **README.md** - Update features list
2. **USAGE_GUIDE.md** - Add detailed usage instructions
3. **claude.md** - Update architecture if needed
4. **CHANGELOG.md** - Document the change

### Writing Good Documentation

- Be clear and concise
- Use examples
- Include screenshots/GIFs for visual features
- Explain the "why" not just the "how"
- Keep it up-to-date

## 🐛 Bug Reports

### Good Bug Report Includes

```markdown
**Description**
Brief description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- Browser: Chrome 120
- OS: macOS 14
- Version: 1.0.0

**Additional Context**
Any other relevant information
```

## 🎯 Feature Requests

### Good Feature Request Includes

```markdown
**Problem**
What problem does this solve?

**Proposed Solution**
How should this work?

**Alternatives Considered**
What other options exist?

**Additional Context**
Examples, mockups, etc.
```

## 👥 Code Review Process

### What Reviewers Look For

1. **Code Quality**
   - Follows OOP principles
   - TypeScript strict mode compliant
   - No unnecessary complexity

2. **Functionality**
   - Feature works as described
   - No regressions
   - Handles edge cases

3. **Testing**
   - Manually tested
   - Works across browsers
   - Performance is good

4. **Documentation**
   - Code is well-commented
   - Docs are updated
   - Changelog updated

### Responding to Feedback

- Be receptive to suggestions
- Ask questions if unclear
- Make requested changes promptly
- Thank reviewers for their time

## 🚫 What Not to Do

- ❌ Add dependencies without discussion
- ❌ Break existing functionality
- ❌ Ignore TypeScript errors
- ❌ Skip documentation updates
- ❌ Use `any` types unnecessarily
- ❌ Add console.log statements
- ❌ Commit commented-out code
- ❌ Mix unrelated changes in one PR

## 📋 Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] TypeScript build succeeds
- [ ] Tested in multiple browsers
- [ ] Documentation updated
- [ ] Follows OOP principles
- [ ] No console statements
- [ ] CHANGELOG.md updated

## Screenshots (if applicable)
Add screenshots or GIFs

## Related Issues
Fixes #123
```

## 🙏 Recognition

Contributors will be:
- Listed in CHANGELOG.md
- Mentioned in release notes
- Credited in documentation
- Appreciated by the community!

## 📞 Getting Help

- Open an issue for questions
- Check existing documentation
- Review closed issues for similar problems
- Contact the maintainer: Victor Zhang
  - LinkedIn: [Victor Yuchi Zhang](https://www.linkedin.com/in/victor-yuchi-zhang/)
  - Email: victor.zhang.eu@gmail.com
- Be respectful and patient

## 👨‍💻 Project Maintainer

**Victor Zhang**
- Creator and maintainer of Strategy Map
- LinkedIn: [Victor Yuchi Zhang](https://www.linkedin.com/in/victor-yuchi-zhang/)
- Email: victor.zhang.eu@gmail.com
- GitHub: [@Victor-EU](https://github.com/Victor-EU)

I'm always happy to help contributors and discuss new features!

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Give constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## 🎉 Thank You!

Every contribution, no matter how small, makes Strategy Map better. We appreciate your time and effort!

---

**Ready to contribute? Fork the repo and start coding!** 🚀
