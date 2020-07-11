#!/bin/sh

OWNER='czarsimon'
REPO='webca'
EVENT_TYPE=$1

curl \
    -X POST \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/$OWNER/$REPO/dispatches \
    -d "{\"event_type\":\"$EVENT_TYPE\"}"
