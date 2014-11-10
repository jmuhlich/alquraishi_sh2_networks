#!/bin/sh

cd $(dirname $0)
cat ../data/networks/data/pept.tsv | awk 'BEGIN {print "GENE\tis_ppb"} {print $1 "\ttrue"}' > ../output/ppb.tsv
cat ../data/networks/data/sh2.tsv | awk 'BEGIN {print "GENE\tis_sh2"} {print $1 "\ttrue"}' > ../output/sh2.tsv
