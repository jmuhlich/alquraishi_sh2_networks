(function($, window, document) {

  var SLIDER_PREC_DIGITS = 2;
  var SLIDER_SCALING = Math.pow(10, SLIDER_PREC_DIGITS);
  var CUTOFF_MIN = 0.53;
  var CUTOFF_MAX = 1.0;

  function initGraph(data, textStatus, jqXHR) {

    var elements = data.elements;

    var cy = cytoscape({
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
    $("#cutoff").val(cutoff.toFixed(SLIDER_PREC_DIGITS));
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
    updateCutoff($slider.slider("value") / SLIDER_SCALING);

  });


}(jQuery, window, document));
