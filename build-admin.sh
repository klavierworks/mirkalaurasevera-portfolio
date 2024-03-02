#!/bin/bash
mkdir api
git clone --depth 1 https://github.com/pages-cms/pages-cms.git
cd pages-cms
npm install
npm run build -- --base=/admin --outDir=../public/admin
mv functions/auth ../api/auth