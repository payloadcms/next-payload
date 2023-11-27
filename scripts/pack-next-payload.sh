#!/bin/bash

if [ "$(basename "$(dirname "$0")")" != "scripts" ]; then
  echo "Error: Please run this script from the next-payload root directory."
  exit 1
fi

if [ "$#" -eq 0 ]; then
  echo "Error: Please provide the destination directory as the first argument. i.e. ./scripts/pack-next-payload.sh ../destination_directory"
  exit 1
elif [ "$#" -eq 1 ]; then
  destination_directory="$1"
else
  echo "Error: Too many arguments provided. Usage: ./scripts/pack-next-payload.sh ../destination_directory"
  exit 1 
fi

# Pack the package
yarn build
yarn_pack_output=$(yarn pack)

# Helper variables
archive_file=$(echo "$yarn_pack_output" | grep -o '".*"' | awk -F '"' '{print $2}')
filename=$(basename "$archive_file")
echo "filename: $filename"

# Move tgz into the destination directory
mv "$archive_file" "$destination_directory"
# Move into the destination directory
cd "$destination_directory"

yarn remove @payloadcms/next-payload

# Remove all files in yarn cache .tmp directory
rm -rf "$(yarn cache dir)/.tmp/"*
# Install the package
yarn add ./$filename
# Cleanup the archive file
rm -rf ./$filename