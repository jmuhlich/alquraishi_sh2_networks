import sys
import collections
import itertools
import json

with open(sys.argv[1]) as f:
    network = json.load(f)

se = sorted(network['elements']['edges'],
            key=lambda e:
                (e['data']['source'], e['data']['target'], -e['data']['probability'])
            )
g = itertools.groupby(se, lambda e: (e['data']['source'], e['data']['target']))
fe = [it.next() for k, it in g]

network['elements']['edges'] = fe

print json.dumps(network, indent=2, separators=(',', ': '))
