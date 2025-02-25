#!/bin/bash

YEAR=$1
DAY=$2

# Run the corresponding JS file with input file
node "${YEAR}/${DAY}.js" "${YEAR}/inputs/${DAY}.txt"
