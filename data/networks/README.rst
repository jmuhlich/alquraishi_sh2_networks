Description of tsv files in data/
=================================

The files with "mat" in their names are sparse arrays (1-based).  The remaining
ones are lists of gene names.  The one called "genes.tsv" lists the genes in
the "canonical order".  "genes.tsv" is the union of "sh2.tsv" and "pept.tsv".

"wtmat.tsv" lists the wild-type probabilities.  "tmat1.tsv" and "tmat2.tsv" are
the two collections of per-tissue-type matrices; the first one has the
probabilities, the second one the classification into gain/loss.

