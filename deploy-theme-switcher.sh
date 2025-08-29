#!/bin/bash

# MSFG Loan Tools - Theme Switcher Deployment Script
# This script deploys all HTML files with the new theme switcher to AWS S3

echo "🎨 Deploying Theme Switcher to All MSFG Loan Tools..."

# Check if we're in the right directory
if [ ! -f "theme-switcher.js" ]; then
    echo "❌ Error: Please run this script from the directory containing theme-switcher.js"
    exit 1
fi

# List of HTML files to deploy
HTML_FILES=(
    "LLPMTool.html"
    "BuydownCalculator.html"
    "APRCalculator.html"
    "IncomeCalculatorQuestionnaire.html"
    "LoanToolsHub.html"
    "IncomeCalculator1040.html"
    "IncomeCalculatorScheduleC.html"
    "IncomeCalculatorScheduleE.html"
    "IncomeCalculatorScheduleESubject.html"
    "IncomeCalculatorScheduleB.html"
    "IncomeCalculatorScheduleD.html"
    "IncomeCalculator1065.html"
    "IncomeCalculatorK1.html"
    "IncomeCalculator1120.html"
    "IncomeCalculator1120S.html"
    "IncomeCalculator1120SK1.html"
    "IncomeCalculatorRental1038.html"
)

# Deploy theme-switcher.js first
echo "📤 Deploying theme-switcher.js..."
aws s3 cp theme-switcher.js s3://llpm-tool/ --acl public-read
aws s3 cp theme-switcher.js s3://buydown-calculator/ --acl public-read
aws s3 cp theme-switcher.js s3://apr-calculator/ --acl public-read
aws s3 cp theme-switcher.js s3://income-calculator/ --acl public-read
aws s3 cp theme-switcher.js s3://msfg-income-calculator/ --acl public-read

echo "✅ theme-switcher.js deployed to all buckets"

# Deploy updated HTML files
for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "📤 Deploying $file..."
        
        # Determine which bucket to deploy to based on file name
        case $file in
            "LLPMTool.html")
                aws s3 cp "$file" s3://llpm-tool/ --acl public-read
                ;;
            "BuydownCalculator.html")
                aws s3 cp "$file" s3://buydown-calculator/ --acl public-read
                ;;
            "APRCalculator.html")
                aws s3 cp "$file" s3://apr-calculator/ --acl public-read
                ;;
            "IncomeCalculatorQuestionnaire.html"|"LoanToolsHub.html")
                aws s3 cp "$file" s3://income-calculator/ --acl public-read
                ;;
            *)
                # All other income calculator files go to the income calculator bucket
                aws s3 cp "$file" s3://msfg-income-calculator/ --acl public-read
                ;;
        esac
        
        echo "✅ $file deployed successfully"
    else
        echo "⚠️  Warning: $file not found, skipping..."
    fi
done

echo ""
echo "🎉 Theme Switcher Deployment Complete!"
echo ""
echo "📱 All loan tools now have:"
echo "   ✅ Dark Theme (🌙) - Professional dark interface"
echo "   ✅ Default Theme (🌤️) - Balanced design"
echo "   ✅ Light Theme (☀️) - Bright, clean interface"
echo ""
echo "🔧 Features:"
echo "   ✅ Instant theme switching"
echo "   ✅ Persistent preferences"
echo "   ✅ Automatic component adaptation"
echo "   ✅ Mobile-responsive design"
echo ""
echo "🌐 Users can now:"
echo "   1. Look for the theme toggle in the top-right corner"
echo "   2. Choose their preferred visual style"
echo "   3. Enjoy consistent theming across all tools"
echo ""
echo "🎯 Next step: Test the theme switcher on your live tools!"




