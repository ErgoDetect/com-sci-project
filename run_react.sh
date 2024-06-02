#!/bin/bash

# Function to get script directory
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Parse optional arguments for working directory and terminal emulator
working_dir="$script_dir"
terminal_emulator=""
while getopts ":w:t:" opt; do
  case $opt in
    w) working_dir="$OPTARG" ;;
    t) terminal_emulator="$OPTARG" ;;
    \?) echo "Invalid option: -$OPTARG" >&2; exit 1 ;;
  esac
done

# Start React app in background (consider using process management tools)
cd "$working_dir"  # Change directory to working directory (optional)
echo "Starting React app with yarn start..."
yarn start &
react_app_pid=$!
echo "React app started in background (PID: $react_app_pid)"

if [[ $? -ne 0 ]]; then
    echo "Error starting React app with yarn start."
    exit 1
fi

# Start Electron app in new terminal window
# Use user-specified terminal emulator if provided
if [[ -n "$terminal_emulator" ]]; then
  "$terminal_emulator" -e "cd '$working_dir' && yarn dev"
else
  # Attempt cross-platform approach with working directory
  if [[ -n "$(command -v x-terminal-emulator)" ]]; then
    x-terminal-emulator -e "cd '$working_dir' && yarn dev"
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e 'tell app "Terminal"
        do script "cd '$working_dir' && yarn dev"
    end tell'
  elif [[ "$OSTYPE" == "msys" ]]; then
    start cmd.exe /K "cd '$working_dir' && yarn dev"
  else
    echo "Unable to open a new terminal automatically. Consider using VS Code tasks for Electron app."
  fi
fi

# Wait for the React app background process to finish
wait $react_app_pid