#!/bin/bash

DATADIR=../data/networks/data

joint () {
    join -t $'\t' $@
}

join_g () {
    echo -e "GENE\t$1"
    joint -a 1 -o 1.1 2.2 -e false \
        $DATADIR/genes.tsv <(sed -e 's/$/\ttrue/' "$2")
}

cd $(dirname $0)/..
mkdir -p output
cd output

join_g is_ppb $DATADIR/pept.tsv > node_ppb.tsv
join_g is_sh2 $DATADIR/sh2.tsv > node_sh2.tsv
# FIXME some rows in onco.tsv have trailing spaces but it just happens not to
# collide with our gene lists for now. also it has some excel genes, via some
# unknown intermediate tool (latest release should have fixed this).
join_g is_onco <(grep -v '^2013[[:space:]]' $DATADIR/onco.tsv) > node_onco.tsv
join_g is_ts $DATADIR/tss.tsv > node_ts.tsv

joint node_ppb.tsv node_sh2.tsv  | joint - node_onco.tsv | joint - node_ts.tsv \
    > node_all.tsv
