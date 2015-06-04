(function () {

  var ScaleMaker = require('scale-maker');
  var InstrumentFactory = require('./modules/instrumentFactory');
  var LayerStack = require('./modules/layerStack');
  var _ = require('lodash');

  function onDOMReady () {
    var scaleNames = ScaleMaker.getScaleNames(),
        scales = {};

    scaleNames.forEach(function (scaleName)  {
      scales[scaleName] = ScaleMaker.makeScale(scaleName, 'C3', 16).inHertz;
    });

    var instruments = {
      simpleSine: InstrumentFactory.makeSynth().setOscillatorType('sine').setAttackTime(0.05).setDecayTime(0).setSustainTime(0).setReleaseTime(0.4),
      simpleBleep: InstrumentFactory.makeSynth().setOscillatorType('triangle').setAttackTime(0.05).setDecayTime(0).setSustainTime(0).setReleaseTime(0.05),
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

    var instrumentNames = [];

    _.forOwn(instruments, function (instrumentObject, instrumentName) {
      instrumentNames.push(instrumentName);
    });

    var layerStack = new LayerStack.Layers();

    layerStack.addLayers(8);
    layerStack.getLayers().forEach(function (layer) {
      layer.setInstrument('simpleSine');
    });

    var sequencerRactive = new Ractive({
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
        instrumentNames: instrumentNames,
        scaleNames: scaleNames,
        currentScale: 'kuomiPentatonic',

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

    sequencerRactive.on('clearGrid', function (event, layerIndex) {
      var that = this;

      this.get('currentLayer').grid.reset(function () {
        that.update();
      });
    });

    sequencerRactive.on('changeLayer', function (event, layerIndex) {
      this.set('currentLayer', this.get('layerStack').getLayer(layerIndex));
      this.set('currentLayerIndex', layerIndex);
    });

    sequencerRactive.on('selectCell', function (event) {
      var selected = event.context.isSelected  ? false : true;

      this.set(event.keypath + '.isSelected', selected);
    });

    // sequencerRactive.on('setInstument', function (event, instrument) {
    //   this.set('currentLayer.instrument', instrument);
    // });

    function playCurrentSounds (sequencerRactiveInstance) {
      var layers = sequencerRactiveInstance.get('layers');
      var playheadPos = sequencerRactiveInstance.get('playHeadPos');
      var currentScale = sequencerRactiveInstance.get('currentScale');

      
      layers.forEach(function (layer) {
        layer.grid.cols[playheadPos].forEach(function (cell, rowIndex) {
          if (cell.isSelected) {
            instruments[layer.instrument].playSound(scales[currentScale][rowIndex], rowIndex, layer.volume);
          }
        });
      });
    }

    // TODO: make playhead class?
    function getPlayheadInterval (bpm, notesPerBeat) {
      return (1 / (bpm / 60 * notesPerBeat)) * 1000;
    }

    var playheadTimeout = null;

    sequencerRactive.on('startPlayhead', function (event) {
      if (this.get('isPlaying')) {
        return;
      }

      var bpm = this.get('bpm'); 
      var that = this;

      function advancePlayhead () {
        var currentPlayheadPos = that.get('playHeadPos');
        var nextPlayheadPos = currentPlayheadPos < 15 ? currentPlayheadPos + 1 : 0;

        if (!that.get('isPlaying')) {
          return;
        }

        playCurrentSounds(that);

        that.set('playHeadPos', nextPlayheadPos);

        playheadTimeout = window.setTimeout(advancePlayhead, getPlayheadInterval(that.get('bpm'), that.get('notesPerBeat')));
      }

      playheadTimeout = window.setTimeout(advancePlayhead, getPlayheadInterval(that.get('bpm')));

      sequencerRactive.set('isPlaying', true);
      sequencerRactive.set('isPaused', false);
    });

    sequencerRactive.on('pausePlayhead', function (event) {
      this.set('isPlaying', false);
      this.set('isPaused', true);
    });

    sequencerRactive.on('changeBPM', function (event) {
      window.clearTimeout(playheadTimeout);
      this.set('isPlaying', false);
      this.fire('startPlayhead');
    });

    sequencerRactive.on('stopPlayhead', function (event) {
      this.set('playHeadPos', 0);
      this.set('isPlaying', false);
      this.set('isPaused', false);
    });

  }

  document.addEventListener("DOMContentLoaded", onDOMReady);

})();
