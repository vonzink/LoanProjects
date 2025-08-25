# MSFG Loan Tools - Desktop & PWA

Professional mortgage calculation tools for loan officers and processors, available as both a desktop application and Progressive Web App.

## 🚀 Features

### **Desktop App (Electron)**
- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ Native desktop experience
- ✅ Offline functionality
- ✅ Professional installer packages
- ✅ Application menu with keyboard shortcuts

### **Progressive Web App (PWA)**
- ✅ Installable from any browser
- ✅ Works offline automatically
- ✅ Mobile-responsive design
- ✅ Push notification support
- ✅ Automatic updates

### **Tools Included**
- **LLPM Tool** - Pricing adjustments calculator
- **Buydown Calculator** - 3-2-1 buydown calculator
- **APR Calculator** - Annual Percentage Rate calculator
- **Income Calculator Series** - Complete income calculation suite
- **Loan Tools Hub** - Central navigation hub

## 🛠️ Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd LoanToolsApp

# Install dependencies
npm install

# Start development mode
npm run dev
```

### Build Commands
```bash
# Build for current platform
npm run build

# Build for specific platform
npm run build:mac    # macOS (Intel + Apple Silicon)
npm run build:win    # Windows

# Build for all platforms
npm run dist
```

## 📱 PWA Installation

### **Desktop Browser**
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Click "Install" to add to desktop

### **Mobile Browser**
1. Open in Chrome/Safari
2. Tap the share button
3. Select "Add to Home Screen"

## 🖥️ Desktop App Installation

### **macOS**
1. Download the `.dmg` file
2. Double-click to mount
3. Drag MSFG Loan Tools to Applications
4. Launch from Applications folder

### **Windows**
1. Download the `.exe` installer
2. Run the installer
3. Follow installation wizard
4. Launch from Start Menu or Desktop

## 🔧 Configuration

### **Electron Settings**
- Window size: 1400x900 (minimum: 1200x800)
- Security: Node integration disabled, context isolation enabled
- External links open in default browser

### **PWA Settings**
- Display mode: Standalone
- Theme color: #e94560
- Background color: #1a1a2e
- Offline caching enabled

## 📁 Project Structure
```
LoanToolsApp/
├── src/                    # Source HTML/JS files
│   ├── LoanToolsHub.html  # Main hub page
│   ├── LLPMTool.html      # LLPM calculator
│   ├── BuydownCalculator.html
│   ├── APRCalculator.html
│   ├── IncomeCalculatorQuestionnaire.html
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
├── assets/                # Icons and assets
│   └── icon.svg          # App icon
├── main.js               # Electron main process
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🚀 Deployment

### **Desktop Distribution**
- **macOS**: DMG installer with universal binary (Intel + Apple Silicon)
- **Windows**: NSIS installer with desktop shortcuts
- **Linux**: AppImage or snap package (future)

### **PWA Distribution**
- Deploy to any web server
- HTTPS required for service worker
- Automatic updates via service worker

## 🔮 Future Enhancements

### **Mobile App**
- React Native or Flutter implementation
- Native mobile features
- Offline-first design
- Push notifications

### **Additional Features**
- Cloud sync for calculations
- Team collaboration tools
- Advanced reporting
- Integration with loan origination systems

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Support

For support or feature requests, contact the MSFG development team.

---

**Built with ❤️ by MSFG for the mortgage industry**


