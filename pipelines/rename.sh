#!/bin/bash

# Associative array to map original names to new names
names=(
    [1]="Oral Ocean"
    [2]="Cyclist with Flowers"
    [3]="Spring Feelings"
    [4]="House on Fire"
    [5]="Fashion Snowman"
    [6]="Brush"
    [7]="Swallow"
    [8]="Wormy"
    [9]="Bready on Striped Towel"
    [10]="Cyclist in Trench"
    [11]="Dog Lick"
    [12]="Touch"
    [13]="Sunny Side Up"
    [14]="Party Shoe"
    [15]="Cyclist with a Beard"
    [16]="Splash"
    [17]="Security Check"
    [18]="Bottle Mould"
    [19]="Cyclist"
    [20]="Smoke"
    [21]="You Tell Me"
    [22]="UV Horse"
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

for i in {1..22}; do
    number=$(printf "%03d" $i)
    #number=$(echo $file | sed -n 's/MLS_0*\([0-9]\{1,2\}\)\.jpg/\1/p')
    file="MLS_${number}.jpg"
    echo $file

    new_name=${names[$i]}

    new_name=$(echo $new_name | tr ' ' '-')
    echo "${file}.... becomes ....${number}_${new_name}.jpg"
    # Rename the file
    mv $file "${number}_${new_name}.jpg"
done