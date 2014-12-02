#!/bin/sh

cd $(dirname "$0")/..
OUTPATH=output/web
WEBPATH=web
DATAPATH=data

mkdir -p "$OUTPATH"
cp -a "$WEBPATH"/* "$OUTPATH"
python src/add_tissue_data_to_graph.py \
    "$DATAPATH"/wt_53.cyjs "$DATAPATH"/tmat_40.tsv \
    > "$OUTPATH"/data.json
