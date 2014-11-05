(function($, window, document) {

  var SLIDER_PREC_DIGITS = 2;
  var SLIDER_SCALING = Math.pow(10, SLIDER_PREC_DIGITS);
  var CUTOFF_MIN = 0.53;
  var CUTOFF_MAX = 1.0;

  function initGraph(data, textStatus, jqXHR) {

    var elements = data.elements;

    cy = cytoscape({
      textureOnViewport: true,
      pixelRatio: 1,
      motionBlur: false,

      container: document.getElementById('cy'),

      /*
        green = RGBColor[127/255, 209/255, 59/255],
        orange = RGBColor[254/255, 184/255, 10/255]
      */

      style: cytoscape.stylesheet()
        .selector('node')
          .css({
            'content': 'data(name)',
            'font-size': 20,
          })
        .selector('node[?is_sh2][!is_ppb]')
          .css({
            'background-color': 'rgb(234, 21, 122)', // red
          })
        .selector('node[!is_sh2][?is_ppb]')
          .css({
            'background-color': 'rgb(0, 126, 234)', // blue
          })
        .selector('node[?is_sh2][?is_ppb]')
          .css({
            'background-color': 'rgb(117, 74, 178)', // purple (blend of red and blue)
          })
        .selector('edge')
          .css({
            'opacity': 0.5,
            'width': 3,
            'line-color': '#808080',
            'curve-style': 'bezier',
            'haystack-radius': 1,
            'mid-target-arrow-color': '#808080',
            'mid-target-arrow-shape': 'triangle',
          })
        .selector(':selected')
         .css({
           'background-color': 'black',
           'opacity': 1
         }),

      layout: {
        name: 'preset',
      },

      elements: elements,

    });

    cy.boxSelectionEnabled(false);

    // Set probability data value on nodes to max of probability on incident
    // edges. Then hide/show logic can hide "orphan" nodes trivially.
    cy.nodes().each(function(i, ele) {
      var edges = ele.neighborhood('edge');
      var pmax = edges.max(function(ele) { return ele.data('probability'); });
      ele.data('probability', pmax.value);
    });

    // Calling updateCutoff requires that cy is initialized, but this is not a
    // very good place to put this code as it's not related to building the
    // graph.
    updateCutoff($slider.slider("value") / SLIDER_SCALING);

    // DEBUG
    window.cy = cy;

  }

  // slide event handler for slider
  function slideCutoff(event, ui) {
    var cutoff = ui.value / SLIDER_SCALING;
    if (cutoff < CUTOFF_MIN | slider > CUTOFF_MAX) {
      return false;
    }
    updateCutoff(cutoff);
  }

  function updateCutoff(cutoff) {
    var old_cutoff = $("#cutoff").val();
    if (old_cutoff == "") {
      old_cutoff = CUTOFF_MAX;
    } else {
      old_cutoff = parseFloat(old_cutoff);
    }
    // Use .toFixed so that e.g. 0.9 becomes "0.90".
    $("#cutoff").val(cutoff.toFixed(SLIDER_PREC_DIGITS));
    if (cutoff < old_cutoff) {
      // Cutoff decreased.
      var sel = '[probability>=' + cutoff + '][probability<' + old_cutoff + ']';
      cy.elements().filter(sel).show();
    } else {
      // Cutoff increased.
      var sel = '[probability>=' + old_cutoff + '][probability<' + cutoff + ']';
      cy.elements().filter(sel).hide();
    }
  }

  $("document").ready(function() {

    // Get exported json from cytoscape desktop via ajax.
    $.get('../output/wt_85.cyjs', initGraph, 'json');

    // Set up slider for probability cutoff.
    $slider = $("#slider");
    $slider.slider({
      value: 0.85 * SLIDER_SCALING,
      min: 0.0,
      max: 1.0 * SLIDER_SCALING,
      slide: slideCutoff,
    });

  });


}(jQuery, window, document));
