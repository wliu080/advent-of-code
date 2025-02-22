#!/bin/bash

YEAR=$1
DAY=$2

# Run the corresponding JS file with input file
node "${YEAR}/Day${DAY}/${DAY}.js" "${YEAR}/Day${DAY}/${DAY}input.txt"
