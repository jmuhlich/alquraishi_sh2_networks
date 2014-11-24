import sys
import json
import re
import pandas as pd
import collections as co
import unipath as up

PROJECT_DIR = up.Path(__file__).absolute().ancestor(2)
DATA_DIR = PROJECT_DIR.child('data')
OUTPUT_DIR = PROJECT_DIR.child('output')

GENES = DATA_DIR.child('genes.tsv')
TISSUES = DATA_DIR.child('tissues.tsv')

def strip_trailing_ws(s, re_=re.compile(r'\s+$', re.MULTILINE)):
    return re_.sub('', s)

def extract_df(df, col, v):
    keep = [k for k in df.columns if k != col]
    return df[df.loc[:, col]==v].loc[:, keep]

def todict(df, *cols):
    if cols:
        col = cols[0]
        assert isinstance(col, basestring)
        vs = set(df.loc[:, col])
        return dict((v, todict(extract_df(df, col, v), *cols[1:]))
                    for v in vs)
    else:
        return df

def tissuesfx(i):
    return '%02d' % i

def main(cyjsfile, tmatfile):
    with open(TISSUES) as fh:
        tissues = tuple(map(str.strip, fh))

    tissue_id = dict((w, i + 1) for i, w in enumerate(tissues))

    with open(GENES) as fh:
        genes = tuple(map(str.strip, fh))

    gene_idx = dict((w, i + 1) for i, w in enumerate(genes))
    with open(cyjsfile) as fh:
        graph = json.load(fh)

    edges = dict()
    for edge in graph[u'elements'][u'edges']:
        d = edge[u'data']
        s, t = [gene_idx[n] for n in d[u'name'].split(' (pp) ')]
        es = edges.setdefault(s, dict())
        assert not t in es
        es[t] = d

    vrank = dict()
    df = pd.io.parsers.read_table(tmatfile, sep='\t',
                                  names=('tissue_id', 'src', 'tgt',
                                         'probability', 'rank', 'class'))
    d0 = todict(df, 'src')
    for s, v in edges.items():
        d1 = todict(d0[s], 'tgt', 'tissue_id') if s in d0 else dict()
        for t, w in v.items():
            d2 = d1[t] if t in d1 else dict()
            for i in tissue_id.values():
                if i in d2:
                    row = d2[i]
                    assert len(row) == 1
                    sfx = tissuesfx(i)
                    rank_prop = 'rank_%s' % sfx
                    w[rank_prop] = rank = row['rank'].values[0]
                    w['class_%s' % sfx] = row['class'].values[0]
                    for n in [vrank.setdefault(m, dict()) for m in s, t]:
                        n[rank_prop] = min(n.get(rank_prop, sys.maxint), rank)
                else:
                    # import sys
                    # print >> sys.stderr, 'missing: %s' % i
                    pass

    for vertex in graph[u'elements'][u'nodes']:
        d = vertex[u'data']
        d.update(vrank.get(gene_idx[d[u'name']], dict()))

    print strip_trailing_ws(json.dumps(dict(tissues=tissues, graph=graph),
                                       indent=2))

main(*sys.argv[1:])
