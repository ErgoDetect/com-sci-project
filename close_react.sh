#!/bin/bash

# Function to kill processes by port
kill_port() {
    port=$1
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sudo lsof -ti :$port | xargs sudo kill -9
    elif [[ "$OSTYPE" == "msys" ]]; then
        # Windows
        netstat -aon | findstr :$port | awk '{print $5}' | sed 's/:/ /g' | xargs -I {} taskkill /F /PID {}
    else
        echo "Unsupported OS"
    fi
}

# Call function to kill processes listening on port 3000
kill_port 3000
