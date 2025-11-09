# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-08

### 🎉 Initial Production Release

First stable release of Strategy Map - a beautiful, browser-based interactive strategy mapping tool.

### ✨ Features

#### Core Functionality
- **Interactive Canvas** - Drag, drop, and arrange elements with smooth animations
- **Auto-Save** - Automatic saving to browser localStorage
- **Hand-Drawn Aesthetic** - Excalidraw-inspired visual style
- **High-Quality Export** - Export diagrams as 2x DPI JPEG images
- **Keyboard Shortcuts** - Complete keyboard navigation support
- **Responsive Design** - Works on desktop, tablet, and mobile

#### Tools
- **Select Tool (V)** - Select, move, and edit elements
- **Node Tool (N)** - Create circular nodes with editable text
- **Arrow Tool (A)** - Connect nodes with directional arrows
- **Text Tool (T)** - Add standalone text labels with customizable borders
- **Pan Tool (H)** - Navigate around large diagrams
- **Laser Tool (L)** - Point and annotate during presentations

#### Advanced Features
- **Multi-Select** - Box selection with drag or Shift+Click
- **Smart Duplication** - Cmd/D to duplicate with preserved connections
- **Clipboard Operations** - Copy, cut, and paste elements (Cmd+C/X/V)
- **Zoom Controls** - Zoom in/out with precise controls
- **Multiple Whiteboards** - Create and manage multiple canvas boards
- **Right-Click Save** - Save canvas images to any folder with native file picker
- **ESC to Safety** - Progressive escape behavior for intuitive navigation
- **Text Borders** - Customizable borders for text labels (Solid, Dashed, Dotted)
- **Top-Positioned Start** - Initial "Start here" node positioned at top for natural workflow

#### Styling Options
- **14 Colors** - For strokes, backgrounds, and text
- **4 Stroke Widths** - Thin, Medium, Thick, Extra Thick
- **4 Fill Styles** - Solid, Hachure, Cross-Hatch, None
- **3 Font Families** - Hand Drawn, Normal, Code
- **Border Styles** - Solid, Dashed, Dotted for text labels

#### Keyboard Shortcuts
- **Tool Selection** - V (Select), N (Node), A (Arrow), T (Text), H (Pan), L (Laser)
- **Editing** - Cmd/Ctrl + D (Duplicate), C (Copy), X (Cut), V (Paste), A (Select All)
- **Navigation** - ESC (Cancel/Clear/Switch to Select)
- **Selection** - Shift+Click (Add to selection), Drag (Box select)

### 🏗️ Architecture

- **Object-Oriented Design** - Clean, maintainable code following OOP principles
- **TypeScript Strict Mode** - Maximum type safety
- **React 19** - Latest UI framework with automatic optimizations
- **Vite 7** - Lightning-fast build tool
- **HTML5 Canvas** - Hardware-accelerated 2D rendering
- **CSS Variables** - Dynamic theming with dark mode support

### 🔒 Security

- **Zero Vulnerabilities** - All dependencies audited and secure
- **No XSS Vulnerabilities** - All user input safely handled
- **Privacy-Friendly Analytics** - Anonymous, GDPR-compliant tracking via CountAPI
- **Local Storage** - All data stored in browser, no server uploads

### 📊 Performance

- **Bundle Size** - 98 KB gzipped total
  - JavaScript: 92.75 KB gzipped
  - CSS: 4.87 KB gzipped
- **Build Time** - < 1 second
- **Runtime** - 60 FPS smooth animations
- **First Load** - < 500ms on modern hardware

### 📚 Documentation

- Comprehensive README.md with quickstart guide
- Detailed USAGE_GUIDE.md with examples
- Architecture documentation in claude.md
- Deployment guide (DEPLOYMENT.md)
- Contributing guidelines (CONTRIBUTING.md)
- This changelog (CHANGELOG.md)

### ♿ Accessibility

- Keyboard navigation for all features
- Title attributes on all buttons
- Semantic HTML structure
- High contrast support
- Dark mode support via `prefers-color-scheme`

### 🌐 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## [Unreleased]

### Planned Features
- Undo/Redo functionality
- Additional shapes (rectangles, diamonds, ellipses)
- Curved arrows
- Grid snapping
- PNG export with transparency
- SVG export for scalability
- Diagram templates
- Collaborative editing (future)
- Cloud storage integration (future)

---

## Release Notes

### Version 1.0.0 Highlights

This is the first production-ready release of Strategy Map. The application has been thoroughly tested, audited for security, and optimized for performance.

**What's New:**
- Complete rewrite with TypeScript and modern React
- Hand-drawn aesthetic inspired by Excalidraw
- Full keyboard navigation support
- Multi-select with box selection
- Right-click context menu for saving images
- Auto-save to browser storage
- Privacy-friendly analytics
- Production-ready with zero vulnerabilities

**Technical Achievements:**
- 98 KB gzipped bundle size
- 60 FPS animations
- 9,045 lines of well-documented code
- 29 TypeScript files
- Zero TypeScript errors in strict mode
- Zero npm audit vulnerabilities

**Documentation:**
- 5 comprehensive documentation files
- Usage guide with examples and tips
- Architecture documentation with OOP principles
- Deployment guide for multiple platforms
- Contributing guidelines for developers

---

## Versioning

This project uses [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality (backwards compatible)
- **PATCH** version for backwards compatible bug fixes

## Links

- [Repository](https://github.com/Victor-EU/strategy-puzzle)
- [Issues](https://github.com/Victor-EU/strategy-puzzle/issues)
- [Pull Requests](https://github.com/Victor-EU/strategy-puzzle/pulls)
- [Documentation](./README.md)

## Author

**Victor Zhang**
- Creator and maintainer of Strategy Map
- LinkedIn: [Victor Yuchi Zhang](https://www.linkedin.com/in/victor-yuchi-zhang/)
- Email: victor.zhang.eu@gmail.com
- GitHub: [@Victor-EU](https://github.com/Victor-EU)

---

**Version 1.0.0 created by Victor Zhang** 🎉

*Thank you to all future contributors who will help make Strategy Map even better!*
