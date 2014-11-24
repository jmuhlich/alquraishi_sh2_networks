(function($, window, document) {

  var WT_SLIDER_PREC_DIGITS = 2;
  var WT_SLIDER_SCALING = Math.pow(10, WT_SLIDER_PREC_DIGITS);
  var WT_CUTOFF_MIN = 0.53;
  var WT_CUTOFF_MAX = 1.0;
  var WT_CUTOFF_DEFAULT = 0.85;

  var TI_CUTOFF_MIN = 0;
  var TI_CUTOFF_MAX = 40;
  var TI_CUTOFF_DEFAULT = 20;

  var TISSUE_DEFAULT = '01';

  // ---------------------------------------------------------------------------

  // UI controller
  var UI = (function () {
    // http://stackoverflow.com/a/10425344
    function toCamelCase(s) {
      return s.replace(/-(.)/g, function (match, group1) {
        return group1.toUpperCase();
      });
    }

    function makeGetter(selector) {
      return function () { return $(selector).val(); }
    }

    function makeSetter(selector) {
      return function (value) { $(selector).val(value); };
    }

    var ids = ['wt-cutoff', 'ti-cutoff', 'tissue'];
    var obj = {};

    ids.forEach(function (id, _) {
      obj[toCamelCase('get-' + id)] = makeGetter('#' + id);
      obj[toCamelCase('set-' + id)] = makeSetter('#' + id);
    });

    return obj;
  })();

  var cy;

  // Initialization ------------------------------------------------------------

  function init (data, _, _) {
    initTissueMenu();
    initGraph(data);

    updateWtCutoff($('#wt-slider').slider('value') / WT_SLIDER_SCALING);
    updateTiCutoff($('#ti-slider').slider('value'));

    var tissue = TISSUE_DEFAULT;
    $('#ti-select option[value="' + tissue + '"]').attr('selected', 'selected');
    $('#ti-select').selectmenu('refresh');
    updateTissue(tissue);

    // DEBUG
    window.CY = cy;
  }

  function initTissueMenu () {

    // the tissue types below are in the order used in MAQ's data;
    // hence, in this data, 1 corresponds to "Large Intestine", 2
    // to "Lung", 3 to "Endometrium", etc.

    var tissues = '\
Large Intestine,\
Lung,\
Endometrium,\
Skin,\
Liver,\
Breast,\
Haematopoietic and Lymphoid Tissue,\
Ovary,\
Oesophagus,\
Kidney,\
Urinary Tract,\
Prostate,\
Central Nervous System,\
Autonomic Ganglia,\
Upper Aerodigestive Tract,\
Pancreas,\
Stomach,\
Cervix,\
Salivary Gland,\
Bone,\
Thyroid,\
Meninges,\
Adrenal Gland,\
Soft Tissue'.trim().split(',');

    // for the sake of usability, I will re-order these tissue types
    // in the dropdown menu, so that they are in alphabetical order

    tissues.map(function (e, i) {
      // create option html element for each tissue type
      var val = (i + 1).toString().replace(/^(?=\d$)/, '0');
      // return pair of tissue label and option element
      // ("Schwartzian transform")
      return [e, $('<option />').val(val).text(e)];
    })
    .sort(function (a, b) {
      // sort options alphabetically
      return a[0] < b[0] ? -1 : 1;
    })
    .forEach(function (p) {
      // append option elements to $('#ti-select') in alphabetic order
      $('#ti-select').append(p[1]);
    });
  }

  function initGraph(data) {

    var elements = data.elements;

    cy = cytoscape({
      hideEdgesOnViewport: true,
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
            'width': 30,
            'height': 30,
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
        .selector('node[?is_onco][!is_ts]')
          .css({
            'background-image': 'node_oncogene.svg',
            'background-fit': 'cover',
          })
        .selector('node[!is_onco][?is_ts]')
          .css({
            'background-image': 'node_tumorsuppressor.svg',
            'background-fit': 'cover',
          })
        .selector('node[?is_onco][?is_ts]')
          .css({
            'background-image': 'node_both.svg',
            'background-fit': 'cover',
          })
        .selector('edge')
          .css({
            'curve-style': 'bezier',
            'width': 3,
            'mid-target-arrow-shape': 'triangle',
          })
        .selector('.wt-hide.ti-hide')
          .css({
            'visibility': 'hidden',
          })
        .selector('.wt-show, .ti-show')
          .css({
            'visibility': 'visible',
          })
        .selector('edge.wt-show')
          .css({
            'opacity': 0.5,
          })
        .selector('edge.ti-show')
          .css({
            'opacity': 1,
          })
        .selector('edge.wt-show.ti-hide')
          .css({
            'line-color': '#808080',
            'mid-target-arrow-color': '#808080',
          })
        .selector('edge.wt-show, edge.ti-show')
          .css({
            'line-style': 'solid',
          })
        .selector('edge.wt-hide.ti-show')
          .css({
            'line-style': 'dotted',
          })
        .selector('edge.ti-show.wt-show')
          .css({
            'width': 10,
          })
        .selector('edge.ti-show.wt-hide')
          .css({
            'width': 5,
          })
        .selector('edge.ti-show.one')
          .css({
            'line-color': '#7fd13b', /* green = RGBColor[127/255, 209/255, 59/255] */
            'mid-target-arrow-color': '#7fd13b',
          })
        .selector('edge.ti-show.two')
          .css({
            'line-color': '#feb80a', /* orange = RGBColor[254/255, 184/255, 10/255] */
            'mid-target-arrow-color': '#feb80a',
          })
        // .selector('edge:selected')
        //   .css({
        //     'content': 'data(probability_rounded)',
        //     'font-size': 20,
        //     'font-style': 'italic',
        //   })
        .selector(':selected')
         .css({
           'border-color': 'black',
           'border-style': 'double',
           'border-width': 10,
           'opacity': 1
         })
        ,
      layout: {
        name: 'preset',
      },

      ready: function(_) {
        // Hide the loading indicator.
        $('.loading-message').hide()
      },

      elements: elements,

    });

    // Set probability data value on nodes to max of probability on incident
    // edges. Then hide/show logic can hide "orphan" nodes trivially.
    cy.nodes().each(function(i, ele) {
      var edges = ele.neighborhood('edge');
      var pmax = edges.max(function(ele) { return ele.data('probability'); });
      ele.data('probability', pmax.value);
    });
    // Add a property with the probability rounded to 3 places for display.
    cy.edges().each(function(i, ele) {
      ele.data('probability_rounded', ele.data('probability').toFixed(3));
    });

    cy.elements().addClass('wt-show ti-hide');
    rankedElements().addClass('ti-show');
  }

  // Updating functions --------------------------------------------------------

  // Update UI with new wt-cutoff value.  `cutoff` is actual value - unscaled.
  function updateWtCutoff(cutoff) {
    var old_cutoff = UI.getWtCutoff();
    // Convert from the string value the form field gives us into a float.
    if (old_cutoff == '') {
      // If the field was empty, this is the first time we've been called.
      // Pretend we're sliding up from 0 (the lowest possible probability value)
      // so all of the lower-probability nodes will be revealed.
      old_cutoff = 0;
    } else {
      old_cutoff = parseFloat(old_cutoff);
    }
    var sel = makeIntervalSelector('probability', old_cutoff, cutoff);
    cy.elements().filter(sel).toggleClass('wt-show wt-hide');

    // Use .toFixed so that e.g. 0.9 becomes "0.90".
    var cutoff_fmt = cutoff.toFixed(WT_SLIDER_PREC_DIGITS);
    // Set form field which displays the value to the user.
    UI.setWtCutoff(cutoff_fmt);
  }

  function updateTiCutoff(cutoff) {
    var old_cutoff = UI.getTiCutoff();
    applyTissueCutoffs(rankedElements(), parseInt(cutoff), parseInt(old_cutoff));

    // Set form field which displays the value to the user.
    UI.setTiCutoff(cutoff);
  }

  function applyTissueCutoffs(ranked_elements, a, b) {
    var nargs = arguments.length;
    if (nargs < 3 || b === '' || isNaN(b)) {
      b = -1;
      if (nargs < 2 || a === '' || isNaN(a)) {
        a = TI_CUTOFF_DEFAULT;
      }
    }

    var prop = 'rank_' + UI.getTissue();
    var sel = makeIntervalSelector(prop, a, b);

    ranked_elements.filter(sel).toggleClass('ti-show ti-hide');
  }

  function updateTissue(tissue) {

    var prop = 'class_' + tissue;
    var classes = ['one', 'two'];

    rankedElements()
      .removeClass(classes.concat(['ti-show']).join(' '))
      .addClass('ti-hide');

    UI.setTissue(tissue);

    var $ranked_eles = rankedElements();
    $ranked_eles.addClass('ti-hide');

    var $ranked_edges = $ranked_eles.filter('edge');
    classes.forEach(function (clss, i) {
      var val = (i + 1).toString();
      $ranked_edges.filter('[' + prop + '=' + val + ']').addClass(clss);
    });

    applyTissueCutoffs($ranked_eles, parseInt(UI.getTiCutoff()));
  }

  // ---------------------------------------------------------------------------

  function rankedElements() {
    var prop = 'rank_' + UI.getTissue();
    return cy.elements().filter(function (_, e) {
      return e.data()[prop] !== undefined;
    });
  }

  function makeIntervalSelector(property, a, b) {
    var lower = Math.min(a, b);
    var upper = Math.max(a, b);
    return '[' + property + '>=' + lower + ']' +
           '[' + property + '<'  + upper + ']';
  }

  // ---------------------------------------------------------------------------

  $('document').ready(function() {

    // Get exported json from cytoscape desktop via ajax.
    // $.get('wt.cyjs', init, 'json');
    $.get('wt_53_munged_again.cyjs', init, 'json');

    // Set up slider for probability cutoff. Values are scaled because we need
    // floats but slider only provides ints.
    $('#wt-slider').slider({
      value: WT_CUTOFF_DEFAULT * WT_SLIDER_SCALING,
      min: WT_CUTOFF_MIN * WT_SLIDER_SCALING,
      max: WT_CUTOFF_MAX * WT_SLIDER_SCALING,
      slide: function(event, ui) {
        // Note that actual cutoff is computed by scaling the raw ui.value!
        updateWtCutoff(ui.value / WT_SLIDER_SCALING);
      },
    });

    $('#ti-slider').slider({
      value: TI_CUTOFF_DEFAULT,
      min: TI_CUTOFF_MIN,
      max: TI_CUTOFF_MAX,
      slide: function(event, ui) {
        updateTiCutoff(ui.value);
      },
    });

    $('#ti-select').selectmenu({
      select: function(event, ui) {
        updateTissue(ui.item.value);
      },
    });

    // Forcibly clear form input so setCutoff's first run works properly in the
    // case where the form field is preserved across page reload (e.g. Firefox).
    // FIXME Should probably factor out the first-run logic so it can be called
    // explicitly from graph's `ready` handler rather than relying on this hack.

    UI.setWtCutoff('');
    UI.setTiCutoff('');
  });


}(jQuery, window, document));
