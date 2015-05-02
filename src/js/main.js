(function () {

  var ScaleFactory = require('./modules/scaleFactory');
  var InstrumentFactory = require('./modules/instrumentFactory');

  function onDOMReady () {

    var conf = {
      layerColours: [
        '#fc0',
        '#cf0',
        '#0fc',
        '#0cf',
        '#c0f',
        '#c96',
        '#c69',
        '#9c6'
      ]
    };

    function Cell () {
      this.isSelected = false;
    }

    Cell.prototype.reset = function () {
      this.isSelected = false;
    };

    function Grid (rowCount, colCount) {
      var row = 0;
      var col = 0;

      this.cols = [];

      for (col = 0; col < colCount; col += 1) {
        this.cols[col] = {
          rows: []
        };

        for (row = 0; row < rowCount; row += 1) {
          this.cols[col].rows[row] = new Cell();
        }
      }
    }

    Grid.prototype.reset = function (callback) {
      this.cols.forEach(function (col) {
        col.rows.forEach(function (cell) {
          cell.reset();
        });
      });

      callback();
    };

    scales = {
      'C Major': ScaleFactory.getScale('major', 'C3', 16),
      'Ab Chromatic': ScaleFactory.getScale('chromatic', 'Ab3', 16),
      'F Whole Tone': ScaleFactory.getScale('wholeTone', 'F3', 16),
    };

    var instruments = {
      simpleSine: new InstrumentFactory.SimpleSynthesizer({
        oscillatorType: 'sine',
        attackTime: 0.05,
        decayTime: 0,
        sustainTime: 0,
        sustainVolume: 1,
        releaseTime: 0.4
      }),
      simpleBleep: new InstrumentFactory.SimpleSynthesizer({
        oscillatorType: 'triangle',
        attackTime: 0.05,
        decayTime: 0,
        sustainTime: 0,
        sustainVolume: 1,
        releaseTime: 0.05
      }),
      simpleDrums: new InstrumentFactory.SimpleSampleSet({
        sources: [
          'CYCdh_Kurz01-Kick01.ogg',
          'CYCdh_Kurz01-Snr02.ogg',
          'CYCdh_Kurz01-Snr03.ogg',
          'CYCdh_Kurz01-SdSt.ogg',
          'CYCdh_Kurz01-PdHat.ogg',
          'CYCdh_Kurz01-ClHat.ogg',
          'CYCdh_Kurz01-HfHat.ogg',
          'CYCdh_Kurz01-Ride01.ogg',
          'CYCdh_Kurz01-Ride02.ogg',
          'CYCdh_Kurz01-Tom01.ogg',
          'CYCdh_Kurz01-Tom02.ogg',
          'CYCdh_Kurz01-Tom03.ogg',
          'CYCdh_Kurz01-Tom04.ogg',
          'CYCdh_Kurz01-Crash01.ogg',
          'CYCdh_Kurz01-Crash02.ogg',
          'CYCdh_Kurz01-Crash03.ogg'
        ]
      })
    };

    function Layer (index) {
      this.grid = new Grid(16, 16);
      this.instrument = 'simpleSine';
      this.scale = 'Ab Chromatic';
      this.colour = conf.layerColours[index];
      this.volume = 0.7; // 0 to 1
    }

    Layer.prototype.setInstrument = function (instrument) {
      this.instrument = instrument;
    };

    Layer.prototype.getInstrument = function (instrument) {
      return this.instrument;
    };

    function Layers () {
      this.layers = [];
    }

    Layers.prototype.addLayer = function () {
      var index = this.getLayerCount();
      this.layers.push(new Layer(index));
    };

    Layers.prototype.addLayers = function (layerCount) {
      var i;

      for (i = 0; i < layerCount; i += 1) {
        this.addLayer();
      }
    };

    Layers.prototype.getLayerCount = function (index) {
      return this.layers.length;
    };

    Layers.prototype.getLayer = function (index) {
      return this.layers[index];
    };


    var layerStack = new Layers();
    layerStack.addLayers(8);

    var grid = new Grid(16, 16); // 16 rows, 16 columns, cell dimenions 50px by 50px

    var gridRactive = new Ractive({
      el: '#gridContainer',
      template: '#gridTemplate',
      data: {
        layerStack: layerStack,
        layers: layerStack.layers,
        currentLayer: layerStack.getLayer(0),
        currentLayerIndex: 0,
        playHeadPos: 0,
        isPlaying: false,
        isPaused: false,
        bpm: 80, // BPM,
        notesPerBeat: 4, // notes per beat

        getCellColour: function (isSelected, colIndex) {
          if (isSelected || (colIndex === this.get('playHeadPos') && this.get('isPlaying'))) {
            return this.get('currentLayer').colour;
          } else if (colIndex === this.get('playHeadPos') && this.get('isPaused')) {
            return '#393939';
          } else {
            return '#222';
          }
        },

        getLayerColour: function (layerIndex) {
          if (layerIndex === this.get('currentLayerIndex')) {
            return this.get('currentLayer').colour;
          } else {
            return '#ccc';
          }
        }

      }
    });

    gridRactive.on('clearGrid', function (event, layerIndex) {
      var that = this;
      this.get('currentLayer').grid.reset(function () {
        that.update();
      });
    });

    gridRactive.on('changeLayer', function (event, layerIndex) {
      this.set('currentLayer', this.get('layerStack').getLayer(layerIndex));
      this.set('currentLayerIndex', layerIndex);
    });

    gridRactive.on('selectCell', function (event) {
      var selected = event.context.isSelected  ? false : true;

      this.set(event.keypath + '.isSelected', selected);
    });

    gridRactive.on('setInstument', function (event, instrument) {
      this.set('currentLayer.instrument', instrument);
    });

    function playCurrentSounds (ractive) {
      var layers = ractive.get('layers');
      var playheadPos = ractive.get('playHeadPos');

      
      layers.forEach(function (layer) {
        layer.grid.cols[playheadPos].rows.forEach(function (cell, rowIndex) {
          if (cell.isSelected) {
            instruments[layer.instrument].playSound(scales[layer.scale], rowIndex, layer.volume);
          }
        });
      });
    }

    // TODO: make playhead class?
    function getPlayheadInterval (bpm, notesPerBeat) {
      return (1 / (bpm / 60 * notesPerBeat)) * 1000;
    }

    var playheadTimeout = null;

    gridRactive.on('startPlayhead', function (event) {
      if (this.get('isPlaying')) {
        return;
      }

      var bpm = this.get('bpm'); 
      var ractive = this;

      function advancePlayhead () {
        var currentPlayheadPos = ractive.get('playHeadPos');
        var nextPlayheadPos = currentPlayheadPos < 15 ? currentPlayheadPos + 1 : 0;

        if (!ractive.get('isPlaying')) {
          return;
        }

        playCurrentSounds(ractive);

        ractive.set('playHeadPos', nextPlayheadPos);

        playheadTimeout = window.setTimeout(advancePlayhead, getPlayheadInterval(ractive.get('bpm'), ractive.get('notesPerBeat')));
      }

      playheadTimeout = window.setTimeout(advancePlayhead, getPlayheadInterval(ractive.get('bpm')));

      gridRactive.set('isPlaying', true);
      gridRactive.set('isPaused', false);
    });

    gridRactive.on('pausePlayhead', function (event) {
      gridRactive.set('isPlaying', false);
      gridRactive.set('isPaused', true);
    });

    gridRactive.on('changeBPM', function (event) {
      window.clearTimeout(playheadTimeout);
      this.set('isPlaying', false);
      this.fire('startPlayhead');
    });

    gridRactive.on('stopPlayhead', function (event) {
      gridRactive.set('playHeadPos', 0);
      gridRactive.set('isPlaying', false);
      gridRactive.set('isPaused', false);
    });

  }

  document.addEventListener("DOMContentLoaded", onDOMReady);

})();
