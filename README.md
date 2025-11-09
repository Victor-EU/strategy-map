# Strategy Map

> A beautiful, browser-based interactive strategy mapping tool inspired by Excalidraw. Create hand-drawn style diagrams with nodes, arrows, and text labels to visualize your strategies, plans, and ideas.

[![Production Ready](https://img.shields.io/badge/production-ready-brightgreen.svg)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![Bundle Size](https://img.shields.io/badge/gzip-98KB-success.svg)](https://github.com)
[![Security](https://img.shields.io/badge/vulnerabilities-0-success.svg)](https://github.com)

## ✨ Features

### Core Functionality
- 🎨 **Hand-Drawn Aesthetic** - Excalidraw-inspired visual style with smooth, sketchy rendering
- 🖱️ **Interactive Canvas** - Drag, drop, and arrange elements with smooth animations
- 📦 **Auto-Save** - Your work is automatically saved to browser storage
- 💾 **High-Quality Export** - Export diagrams as high-resolution JPEG images (2x DPI)
- ⌨️ **Keyboard Shortcuts** - Complete keyboard navigation support
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

### Tools & Interactions
- **Select Tool (V)** - Select, move, and edit elements
- **Node Tool (N)** - Create circular nodes with editable text
- **Arrow Tool (A)** - Connect nodes with directional arrows
- **Text Tool (T)** - Add standalone text labels with customizable borders
- **Pan Tool (H)** - Navigate around large diagrams
- **Laser Tool (L)** - Point and annotate during presentations

### Advanced Features
- 🎯 **Multi-Select** - Box selection with drag or Shift+Click for multiple elements
- 🎨 **Rich Styling Options**:
  - 14 color options for strokes and backgrounds
  - 4 stroke widths (Thin, Medium, Thick, Extra Thick)
  - 4 fill styles (Solid, Hachure, Cross-Hatch, None)
  - 3 font families (Hand Drawn, Normal, Code)
  - Text borders with 3 styles (Solid, Dashed, Dotted)
- ⚡ **Smart Duplication** - Duplicate with Cmd/D, preserving connections
- 📋 **Clipboard Operations** - Copy, cut, and paste elements
- 🔄 **Zoom Controls** - Zoom in/out with precise controls
- 📐 **Multiple Whiteboards** - Create and manage multiple canvas boards
- 💾 **Right-Click Save** - Save canvas images to any folder
- ✨ **ESC to Safety** - Progressive escape behavior for intuitive navigation

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd strategy-puzzle

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
tsc --noEmit
```

### Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📖 Usage

### Basic Workflow

1. **Create Nodes** - Press `N`, click on canvas, type text
2. **Connect with Arrows** - Press `A`, click source node, drag to target node
3. **Add Text** - Press `T`, click position, type text
4. **Customize Styles** - Select elements, use Properties Panel
5. **Export** - Click Export button to save as JPEG

See [USAGE_GUIDE.md](./USAGE_GUIDE.md) for detailed instructions.

### Keyboard Shortcuts

**Tools**
- `V` - Select tool
- `N` - Node tool
- `A` - Arrow tool
- `T` - Text tool
- `H` - Pan tool
- `L` - Laser tool

**Editing**
- `Cmd/Ctrl + D` - Duplicate selected elements
- `Cmd/Ctrl + C` - Copy
- `Cmd/Ctrl + X` - Cut
- `Cmd/Ctrl + V` - Paste
- `Cmd/Ctrl + A` - Select all
- `Delete`/`Backspace` - Delete selected
- `Escape` - Cancel / Clear selection / Switch to Select tool

**Selection**
- `Shift + Click` - Add to selection
- `Drag on empty space` - Box select multiple elements

## 🏗️ Architecture

Strategy Map follows strict **Object-Oriented Programming** principles for clean, maintainable code.

### Core Models

```
Point           → 2D coordinate system with vector operations
Node            → Circular diagram nodes with text and styling
Arrow           → Directional connections between nodes
TextLabel       → Standalone text elements with borders
Whiteboard      → Canvas boards with resize capabilities
Diagram         → Manages all elements and relationships
```

### Managers

```
InteractionManager     → Handles all user input (mouse, keyboard, touch)
KeyboardShortcutManager → Platform-aware keyboard shortcuts
```

### Renderers

```
CanvasRenderer  → High-performance 2D rendering with hand-drawn style
                  - Multi-whiteboard support
                  - Export functionality (JPEG, PNG)
                  - Zoom and pan transformations
```

### React Components

```
App               → Main application container
Canvas            → Drawing surface with event handling
Toolbar           → Tool selection and actions
PropertiesPanel   → Style customization panel
ZoomControls      → Zoom in/out/reset controls
ConfirmDialog     → Confirmation dialogs
```

### CSS Architecture

- **Global Styles** (`styles/global.css`) - CSS variables, theme system, resets
- **Component Styles** (`.css` files) - Scoped component styles
- **Design System** - Consistent spacing, colors, and typography
- **Dark Mode** - Automatic support via `prefers-color-scheme`

See [claude.md](./claude.md) for comprehensive architecture documentation.

## 🛠️ Technology Stack

- **React 19** - Latest UI framework with automatic optimizations
- **TypeScript 5.9** - Strict type safety and modern ES features
- **Vite 7** - Lightning-fast build tool and dev server
- **HTML5 Canvas** - Hardware-accelerated 2D rendering
- **CSS Variables** - Dynamic theming and customization
- **React Router** - Client-side routing for shared diagrams

## 📦 Project Structure

```
strategy-puzzle/
├── src/
│   ├── components/        # React components
│   │   ├── Canvas.tsx
│   │   ├── Toolbar.tsx
│   │   ├── PropertiesPanel.tsx
│   │   └── ...
│   ├── models/           # Core data models (OOP)
│   │   ├── Point.ts
│   │   ├── Node.ts
│   │   ├── Arrow.ts
│   │   ├── Diagram.ts
│   │   └── ...
│   ├── managers/         # Business logic managers
│   │   ├── InteractionManager.ts
│   │   └── KeyboardShortcutManager.ts
│   ├── renderers/        # Canvas rendering
│   │   └── CanvasRenderer.ts
│   ├── utils/            # Utilities
│   │   ├── storage.ts
│   │   └── analytics.ts
│   ├── styles/           # Global styles
│   │   └── global.css
│   └── App.tsx           # Main app component
├── public/               # Static assets
├── dist/                 # Production build output
├── README.md             # This file
├── USAGE_GUIDE.md        # Detailed usage instructions
├── claude.md             # Architecture documentation
└── package.json
```

## 🔒 Security & Privacy

- ✅ **Zero Dependencies Vulnerabilities** - All packages audited and secure
- ✅ **No XSS Vulnerabilities** - All user input safely handled
- ✅ **No Exposed Secrets** - No API keys or credentials in code
- ✅ **Privacy-Friendly Analytics** - Anonymous, GDPR-compliant tracking
- ✅ **Local Storage** - All data stored in browser, no server uploads
- ✅ **TypeScript Strict Mode** - Maximum type safety

See production audit results in codebase for full security report.

## 📊 Performance

- **Bundle Size**: 98 KB gzipped (total)
  - JavaScript: 92.75 KB gzipped
  - CSS: 4.87 KB gzipped
- **Build Time**: < 1 second
- **First Load**: < 500ms on modern hardware
- **Runtime**: 60 FPS smooth animations

## 🎯 Production Ready

✅ All TypeScript errors resolved
✅ Production build tested and verified
✅ Security audit passed (0 vulnerabilities)
✅ Performance optimized
✅ Accessibility features implemented
✅ Error handling comprehensive
✅ Documentation complete

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Follow the existing OOP architecture
2. Maintain TypeScript strict mode compliance
3. Write clean, documented code
4. Test thoroughly before submitting
5. Update documentation as needed

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📄 License

ISC License - See [LICENSE](./LICENSE) file for details.

## 👨‍💻 Author

**Victor Zhang**
- LinkedIn: [Victor Yuchi Zhang](https://www.linkedin.com/in/victor-yuchi-zhang/)
- Email: victor.zhang.eu@gmail.com
- GitHub: [@Victor-EU](https://github.com/Victor-EU)

## 🙏 Acknowledgments

- Inspired by [Excalidraw](https://excalidraw.com/) for the hand-drawn aesthetic
- Built with modern web technologies and OOP best practices
- Designed for developers, strategists, and creative thinkers

## 📚 Documentation

- [Usage Guide](./USAGE_GUIDE.md) - Detailed usage instructions
- [Architecture](./claude.md) - OOP architecture and design patterns
- [Analytics](./ANALYTICS.md) - Privacy-friendly analytics implementation
- [Authors](./AUTHORS.md) - Creator and contributors
- [Changelog](./CHANGELOG.md) - Version history and release notes

## 🐛 Issues & Support

Found a bug or have a feature request?

- Check existing issues on GitHub
- Create a new issue with detailed description
- Include browser version and steps to reproduce

## 🚢 Deployment

Ready to deploy? See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Vercel deployment instructions
- Environment configuration
- Custom domain setup
- Production checklist

---

**Made with ❤️ by Victor Zhang using TypeScript, React, and Canvas API**

*Version 1.0.0 - Production Ready*

Connect with me: [LinkedIn](https://www.linkedin.com/in/victor-yuchi-zhang/) | [Email](mailto:victor.zhang.eu@gmail.com) | [GitHub](https://github.com/Victor-EU)
