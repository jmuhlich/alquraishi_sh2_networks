Project layout
==============
* data: Original source data, consider this read-only.
* output: Generated data files, do not check in anything in here.
* src: Source code for data processing.
* web: Resources for the web UI.

Build instructions
==================

* To obtain content of `data/networks/`:

  #. Unpack `data.tgz` from the Dropbox folder into this directory, producing
     `data/networks/data` containing several .csv files (see
     `data/networks/README.rst` for details)

* To prepare data files for loading into Cytoscape (version 3):

  #. Run `python build_cytoscape_network_csv.py`
  #. Run `bash src/build_cytoscape_node_data.sh`
  #. Import `output/wtmat_cytoscape_0.53.csv` into Cytoscape via
     File > Import > Network > File
  #. Import `output/node_all.tsv` into the resulting network via
     File > Import > Table > File

* To build the web content:

  #. Merge graph (.cyjs) file with tissue data::

     python src/add_tissue_data_to_graph.py data/wt_53.cyjs data/tmat_40.tsv > output/web/data.json

  #. Run `src/build_web.sh`
  #. View `output/web/index.html`


Local viewing
=============

Use chrome/chromium, with the following command line arguments:

  `--temp-profile --no-first-run --no-default-browser-check \
  --allow-file-access-from-files output/web/index.html`
