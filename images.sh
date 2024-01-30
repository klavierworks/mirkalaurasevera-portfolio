#!/bin/bash

# Directory containing the files
directory="public/work/"

# Start the JS array
echo "["

# Loop through files in the directory
for file in "$directory"/*; do
    if file "$file" | grep -qE 'image|bitmap'; then
        # Get width and height
        dimensions=$(identify -format "%wx%h" "$file" 2>/dev/null)
        width=${dimensions%x*}
        height=${dimensions#*x}

        # Extract and format the project name
        filename=$(basename "$file")
        name=$(echo "$filename" | sed -E 's/MLS_([a-zA-Z]+)[^0-9]*[0-9]+\..*/\1/')
        formatted_name=$(echo "$name" | sed -r 's/([a-z])([A-Z])/\1 \2/g' | sed -r 's/./\u&/')

        # Output the formatted entry
        echo -n "    { src: '$filename', name: '$name', width: $width, height: $height },"
    fi
done

# Close the JS array
echo -e "\n]"

