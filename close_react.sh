#!/bin/bash

# Function to kill processes by port
kill_port() {
    port=$1
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sudo lsof -ti :$port | xargs sudo kill -9
}

# Call function to kill processes listening on port 3000
kill_port 3000
