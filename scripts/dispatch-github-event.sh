#!/bin/sh

OWNER='CzarSimon'
REPO='webca'
EVENT_TYPE=$1
TOKEN=$2

curl \
    -X POST \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/$OWNER/$REPO/dispatches \
    -d "{\"event_type\":\"$EVENT_TYPE\"}"
