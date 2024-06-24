#!/bin/bash

# Function to get script directory
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Parse optional arguments for working directory and terminal emulator
working_dir="$script_dir"
terminal_emulator=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -w)
            working_dir="$2"
            shift 2
            ;;
        -t)
            terminal_emulator="$2"
            shift 2
            ;;
        *)
            echo "Invalid option: $1"
            exit 1
            ;;
    esac
done

# Start React app in background
cd "$working_dir" || {
    echo "Unable to change directory to $working_dir"
    exit 1
}
echo "Starting React app with yarn start..."
yarn start &
if [ $? -ne 0 ]; then
    echo "Error starting React app with yarn start."
    exit 1
fi

# Wait until http://localhost:3000/ is accessible
wait_for_react() {
    echo "Checking if React app is ready..."
    sleep 2
    while ! curl -s http://localhost:3000/ > /dev/null; do
        sleep 2
    done
}
wait_for_react

# Start Electron app in new terminal window
# Use user-specified terminal emulator if provided
if [ -n "$terminal_emulator" ]; then
    if command -v "$terminal_emulator" &> /dev/null; then
        "$terminal_emulator" -e "cd \"$working_dir\" && yarn dev"
    else
        echo "Terminal emulator '$terminal_emulator' not found."
        exit 1
    fi
else
    open -a Terminal.app "$working_dir"
    cd "$working_dir" && yarn dev
fi

exit 0
