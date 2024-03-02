#!/bin/bash
mkdir api
git clone --depth 1 https://github.com/pages-cms/pages-cms.git
cd pages-cms
git pull

npm install
npm run build -- --base=/admin --outDir=../public/admin
cp -r functions/auth ../api/

cd ..

# Find all files containing the string "export async function" and replace it with "export default async function"
grep -rl "export async function" "api" | while IFS= read -r file; do
    sed -i '' 's/export async function/export default async function/g' "$file"
done