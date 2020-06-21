#!/bin/sh

function check_version {
    package=$1
    is_new_package=$(git diff HEAD~1 "$package/package.json" | grep '+  "version"')
    if [[ "$is_new_package" != "" ]]; then
        printf "true"
        exit 0
    fi
}

for package in "$@"
do
    check_version $package
done
