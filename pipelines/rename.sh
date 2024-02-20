#!/bin/bash

# Associative array to map original names to new names
names=(
    [1]="nicchi, Oral Ocean"
    [2]="Dropbox x It's Nice That, Cyclists"
    [3]="Chanel, Brush"
    [4]="SZ Magazine, Fashion Snowman"
    [5]="ZEIT Crime Magazine, Spring Feelings"
    [6]="M Le Magazine du Monde, Security Check"
    [7]="The New Yorker, Fiction Cover"
    [8]="Bibi Van Der Velden, Smoke Diamond Chandelier"
    [9]="nicchi, Dog Lick"
    [10]="YSL, Sticky Touch"
    [11]="Wetransfer, Sunny Side Up"
    [12]="Splash,"
    [13]="Vogue, Cartier Watch"
    [14]="Swallow, Lightinstallation in Cave"
    [15]="Dior, The Worm"
    [16]="Dropbox x It's Nice That, Cyclists"
    [17]="Another Magazine, Healthy Body"
    [18]="Prada x SZ Magazine, Prada Signals"
    [19]="UV Horse, The Solar Project"
)

cd ../public/carousel

# Count the number of .jpeg files in the current directory
jpeg_count=$(find . -maxdepth 1 -type f -name "*.jpeg" | wc -l)
echo $jpeg_count

if [ $jpeg_count -gt 0 ]; then
    for file in *.jpeg; do
        if [ -f "$file" ]; then
            new_name="${file%.jpeg}.jpg"
            mv "$file" "$new_name"
            echo "Renamed $file to $new_name"
        fi
    done
fi

echo "Renaming jpg files"

for i in {1..19}; do # Adjusted loop to iterate over the defined indices in the associative array
    number=$(printf "%03d" $i)
    original_name=${names[$i]}
    
    if [[ $original_name == *","* ]]; then
        # Split the original name into name and client name
        IFS=',' read -r name client_name <<< "$original_name"
        # Trim leading and trailing whitespace
        name=$(echo $name | xargs)
        client_name=$(echo $client_name | xargs)
        # Replace spaces with hyphens
        name=${name// /-}
        client_name=${client_name// /-}
        # Construct new name
        new_name="${number}_${name}---${client_name}.jpg"
    else
        # Handle names without a comma
        new_name=$(echo $original_name | tr ' ' '-')
        new_name="${number}_${new_name}.jpg"
    fi
    
    file="MLS_${number}.jpg"
    echo "${file}.... becomes ....${new_name}"
    # Rename the file
    mv "$file" "$new_name"
done
