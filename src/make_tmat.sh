#!/usr/bin/env bash
set -x
THIS=$( basename $0 )

usage () {
  printf <<EOF >&2
Usage: %s <N> [DATADIR]
EOF
  exit 1
}

joint () {
  [[ -n $GNUDIR ]] && JOIN=$GNUDIR/join || JOIN=join
  $JOIN -t$'\t' "$@"
}

sortt () {
  [[ -n $GNUDIR ]] && SORT=$GNUDIR/sort || SORT=sort
  $SORT -t$'\t' "$@"
}

pflane () {
  perl -lne 'BEGIN { $, = "\t"; } @F = split( $,, $_, -1 );' -e "$@"
}

squish () {
  N=$1 
  shift
  # collapse the first $N columns into 1
  pflane 'print join(":", @F[0..'"$(( N - 1 ))"']), @F['"$N"'..$#F]' "$@" | sortt -k1,1
}

split () {
  # split the :-separated columns
  pflane 'print split(/:/, $F[0]), @F[1..$#F]' "$@"
}

N=$1
DATADIR=${2:-data/networks/data}

[[ $(( N + 0 )) == $N ]] && [[ -d $DATADIR ]] || usage

joint <( squish 3 $DATADIR/tmat1.tsv | sortt -k1,1 ) \
      <( squish 3 $DATADIR/tmat2.tsv | sortt -k1,1 ) | \
  split | \
  sortt -k1,1n -k4,4gr | \
  pflane '
BEGIN { $N = '$N'; }
if ( $tissue ne $F[ 0 ] ) {
  $tissue = $F[ 0 ];
  $rank = 0;
}
print @F[ 0 .. $#F - 1 ], $rank, $F[ -1 ] if $rank < $N;
++$rank;
'
