#!/bin/bash

# Navigate to the "public/work" directory
cd public/work

# Loop over each file and rename accordingly
for file in *.jpg *.jpeg; do
    case "$file" in
        "MLS_001.jpg") mv "$file" "001_Oral-Ocean.jpg";;
        "MLS_002.jpg") mv "$file" "002_Cyclist.jpg";;
        "MLS_004.jpg") mv "$file" "004_Swallow.jpg";;
        "MLS_005.jpeg") mv "$file" "005_Worm.jpeg";;
        "MLS_006.jpg") mv "$file" "006_UV-Horse.jpg";;
        "MLS_008.jpg") mv "$file" "008_Spring-Feelings.jpg";;
        "MLS_009.jpg") mv "$file" "009_The-Bottle.jpg";;
        "MLS_010.jpeg") mv "$file" "010_Fashion-Snowman.jpeg";;
        "MLS_011.jpg") mv "$file" "011_Bready-on-Striped-Towel.jpg";;
        "MLS_012.jpeg") mv "$file" "012_Cyclist.jpeg";;
        "MLS_013.jpg") mv "$file" "013_Doglick.jpg";;
        "MLS_014.jpeg") mv "$file" "014_ysl.jpeg";;
        "MLS_015.jpeg") mv "$file" "015_Sunny-Side-Up.jpeg";;
        "MLS_016.jpeg") mv "$file" "016_Security-Check.jpeg";;
        *) echo "No renaming rule for $file";;
    esac
done
