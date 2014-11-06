import sys
import csv
import argparse
from unipath import Path


project_dir = Path(__file__).absolute().ancestor(2)
data_dir = project_dir.child('data')
output_dir = project_dir.child('output')

network_data_dir = data_dir.child('networks').child('data')

parser = argparse.ArgumentParser(
    description='Build CSV representation of wtmat network suitable for '
    'Cytoscape import.')
parser.add_argument(
    '-c', '--cutoff', type=float, default=0.53,
    help='Cutoff for minimum edge probability')
args = parser.parse_args()

if not 0 <= args.cutoff <= 1:
    raise ValueError("cutoff must be between 0 and 1 inclusive")

genes_path = network_data_dir.child('genes.tsv')
num_to_gene = {}
with open(genes_path) as f:
    for i, record in enumerate(csv.reader(f), 1):
        num_to_gene[i] = record[0]

wtmat_path = network_data_dir.child('wtmat.tsv')
wtmat_file = open(wtmat_path)
wtmat_types = (int, int, float)
output_filename = 'wtmat_cytoscape_%g.csv' % args.cutoff
output_path = output_dir.child(output_filename)

with open(output_path, 'w') as output_file:
    reader = csv.reader(wtmat_file, delimiter='\t')
    writer = csv.writer(output_file)
    writer.writerow(['source', 'target', 'probability'])
    for row in reader:
        source, target, prob = map(lambda (t,v): t(v), zip(wtmat_types, row))
        if prob >= args.cutoff:
            row_out = [num_to_gene[source], num_to_gene[target], prob]
            writer.writerow(row_out)
