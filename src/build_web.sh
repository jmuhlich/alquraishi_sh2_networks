#!/bin/sh

cd $(dirname "$0")/..
OUTPATH=output/web
STATICPATH=static
DATAPATH=data

mkdir -p "$OUTPATH"
cp -a "$STATICPATH"/* "$OUTPATH"
python src/render_index.py
python src/add_tissue_data_to_graph.py \
    "$DATAPATH"/wt_53.cyjs "$DATAPATH"/tmat_40.tsv \
    > "$OUTPATH"/data.json
