import csv
import argparse
import json
from unipath import Path
import requests


PORT_NUMBER = 1234
BASE = 'http://localhost:' + str(PORT_NUMBER) + '/v1/'
HEADERS = {'Content-Type': 'application/json'}


def parse_bool(v, _map={'true': True, 'false': False}):
    try:
        return _map[v]
    except KeyError:
        raise ValueError('expected "true" or "false", got %s' % v)


project_dir = Path(__file__).absolute().ancestor(2)
data_dir = project_dir.child('data')
output_dir = project_dir.child('output')

tmat_dtypes = (int, int, int, float, int, int)

parser = argparse.ArgumentParser(
    description='Load tissue-specific edges into Cytoscape via cy-rest.')
args = parser.parse_args()

genes_path = data_dir.child('genes.tsv')
num_to_gene = {}
with open(genes_path) as f:
    for i, record in enumerate(csv.reader(f), 1):
        num_to_gene[i] = unicode(record[0])

with open(data_dir.child('wt_53.cyjs')) as f:
    network = json.load(f)
with open(data_dir.child('tmat_40.tsv')) as f:
    reader = csv.reader(f, delimiter='\t')
    tissue_edges = [map(lambda (t,v): t(v), zip(tmat_dtypes, row))
                    for row in reader]
with open(output_dir.child('node_all.tsv')) as f:
    reader = csv.DictReader(f, delimiter='\t')
    node_properties = {}
    for row in reader:
        gene = unicode(row.pop('GENE'))
        props = {unicode(k): parse_bool(v) for k, v in row.items()}
        node_properties[gene] = props

gene_to_node_id = {n['data']['name']: int(n['data']['id'])
                   for n in network['elements']['nodes']}
tissue_edge_genes = set(num_to_gene[i]
                        for i in set(sum([r[1:3] for r in tissue_edges], [])))
new_genes = sorted(tissue_edge_genes - set(gene_to_node_id))
id_base = max(gene_to_node_id.values()) + 1
new_node_ids = range(id_base, id_base + len(new_genes))
gene_to_node_id.update(zip(new_genes, new_node_ids))

new_nodes = [{u'data': {u'id': unicode(gene_to_node_id[g]), u'name': g,
                        'from_tissue': True,}}
             for g in new_genes]
for n in new_nodes:
    n['data'].update(node_properties[n['data']['name']])
new_edges = [{u'data': {u'source': unicode(gene_to_node_id[num_to_gene[e[1]]]),
                        u'target': unicode(gene_to_node_id[num_to_gene[e[2]]])}}
             for e in tissue_edges]
network['elements']['nodes'] += new_nodes
network['elements']['edges'] += new_edges

requests.delete(BASE + 'networks')
requests.post(BASE + 'networks?collection=wt_53', data=json.dumps(network),
              headers=HEADERS)
