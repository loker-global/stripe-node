#!/bin/bash

# Check folder sizes utility script
# This script helps monitor disk usage of various project directories

echo "📁 Folder Size Checker"
echo "====================="
echo ""

# Function to get human-readable size
get_size() {
    local dir="$1"
    if [ -d "$dir" ]; then
        du -sh "$dir" 2>/dev/null | cut -f1
    else
        echo "N/A"
    fi
}

# Function to get detailed breakdown
get_detailed_size() {
    local dir="$1"
    if [ -d "$dir" ]; then
        echo "📊 Detailed breakdown of $dir:"
        du -sh "$dir"/* 2>/dev/null | sort -hr | head -10
        echo ""
    fi
}

# Check node_modules specifically
echo "🔍 Checking node_modules size..."
node_modules_size=$(get_size "node_modules")
echo "node_modules: $node_modules_size"

if [ -d "node_modules" ]; then
    echo ""
    echo "📈 Top 10 largest packages in node_modules:"
    du -sh node_modules/* 2>/dev/null | sort -hr | head -10
    echo ""
    
    # Count number of packages
    package_count=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo "📦 Total packages: $((package_count - 1))"
    
    # Count total files
    file_count=$(find node_modules -type f | wc -l)
    echo "📄 Total files: $file_count"
    echo ""
fi

# Check other common directories
echo "📂 Other directory sizes:"
echo "-------------------------"
echo "Project root: $(get_size ".")"
echo ".git: $(get_size ".git")"
echo "src: $(get_size "src")"
echo "dist: $(get_size "dist")"
echo "build: $(get_size "build")"
echo "coverage: $(get_size "coverage")"
echo "logs: $(get_size "logs")"
echo ""

# Check if package.json exists and show some stats
if [ -f "package.json" ]; then
    echo "📋 Package.json analysis:"
    echo "------------------------"
    
    # Count dependencies
    deps=$(grep -c '".*":' package.json 2>/dev/null || echo "0")
    echo "Dependencies in package.json: $deps"
    
    # Check for common heavy packages
    echo ""
    echo "🔍 Checking for common heavy packages..."
    heavy_packages=("typescript" "webpack" "babel" "eslint" "jest" "electron" "react" "angular" "vue")
    
    for package in "${heavy_packages[@]}"; do
        if grep -q "\"$package\"" package.json 2>/dev/null; then
            package_size=$(get_size "node_modules/$package")
            echo "  $package: $package_size"
        fi
    done
fi

echo ""
echo "💡 Tips:"
echo "--------"
echo "• Run 'npm prune' to remove unused packages"
echo "• Use 'npm ls --depth=0' to see top-level packages"
echo "• Consider using 'npm ci' instead of 'npm install' in CI/CD"
echo "• Add unnecessary files to .gitignore"
echo "• Use 'npx' for one-time package usage instead of global installs"

echo ""
echo "🧹 Cleanup commands:"
echo "-------------------"
echo "• Remove node_modules: rm -rf node_modules"
echo "• Clear npm cache: npm cache clean --force"
echo "• Remove package-lock: rm package-lock.json"
echo "• Fresh install: rm -rf node_modules package-lock.json && npm install"
