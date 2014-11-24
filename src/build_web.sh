#!/bin/sh

BASEPATH=$(dirname "$0")/..
OUTPATH=$BASEPATH/output/web
WEBPATH=$BASEPATH/web
DATAPATH=$BASEPATH/data

mkdir -p "$OUTPATH"
cp -a "$WEBPATH"/* "$OUTPATH"
cp "$DATAPATH/data.json" "$OUTPATH"
