Project layout
==============
* data: Original source data, consider this read-only.
* output: Generated data files, do not check in anything in here.
* src: Source code for data processing.
* web: Resources for the web UI.

Build instructions
==================

* To build `output/wt_85.cyjs`:

  #. Load `data/temp/wt_85.cys` into Cytoscape 3
  #. File > Export > Network and view > cyjs format

* To obtain content of `data/networks/`:

  #. Unpack `data.tgz` from the Dropbox folder into this directory


Local viewing
=============

Use chrome/chromium, with this command line:

  `chrome --temp-profile --allow-file-access-from-files`
