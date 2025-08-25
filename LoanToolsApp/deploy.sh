#!/bin/bash

# MSFG Loan Tools Deployment Script
# This script builds the desktop app for all platforms and can deploy to AWS

echo "🚀 MSFG Loan Tools - Deployment Options"
echo ""
echo "Choose deployment type:"
echo "1. Desktop App (macOS + Windows)"
echo "2. AWS Web Deployment (S3 + CloudFront)"
echo "3. Both"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        deploy_desktop
        ;;
    2)
        deploy_aws
        ;;
    3)
        deploy_desktop
        echo ""
        echo "Now deploying to AWS..."
        deploy_aws
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

deploy_desktop() {
    echo "🍎 Building Desktop App for all platforms..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "main.js" ]; then
    echo "❌ Error: Please run this script from the LoanToolsApp directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Build for macOS (Intel + Apple Silicon)
echo "🍎 Building for macOS..."
npm run build:mac

# Build for Windows
echo "🪟 Building for Windows..."
npm run build:win

# Show results
echo ""
echo "✅ Build Complete!"
echo ""
echo "📁 Distribution files created in 'dist/' folder:"
echo ""

if [ -f "dist/MSFG Loan Tools-1.0.0.dmg" ]; then
    echo "🍎 macOS (Intel): MSFG Loan Tools-1.0.0.dmg"
fi

if [ -f "dist/MSFG Loan Tools-1.0.0-arm64.dmg" ]; then
    echo "🍎 macOS (Apple Silicon): MSFG Loan Tools-1.0.0-arm64.dmg"
fi

if [ -f "dist/MSFG Loan Tools Setup 1.0.0.exe" ]; then
    echo "🪟 Windows: MSFG Loan Tools Setup 1.0.0.exe"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Test the macOS .dmg files on a Mac"
echo "2. Test the Windows .exe on a Windows machine"
echo "3. Distribute the installer files to your team"
echo "4. For PWA deployment, upload the 'src/' folder to your web server"
echo ""
echo "🌐 PWA Installation:"
echo "- Users can install from any browser"
echo "- Works offline automatically"
echo "- Mobile-responsive design"
echo ""
echo "💻 Desktop App Installation:"
echo "- macOS: Double-click .dmg and drag to Applications"
echo "- Windows: Run .exe installer and follow wizard"
echo ""
echo "🎉 Ready for distribution!"
}

deploy_aws() {
    echo "🌐 Deploying to AWS..."
    
    # Check if AWS deployment script exists
    if [ ! -f "deploy-aws.sh" ]; then
        echo "❌ Error: deploy-aws.sh not found. Please ensure you're in the LoanToolsApp directory."
        exit 1
    fi
    
    # Make sure the script is executable
    chmod +x deploy-aws.sh
    
    # Run the AWS deployment
    ./deploy-aws.sh
}


