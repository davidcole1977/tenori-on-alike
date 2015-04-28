(function () {

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
    }

    function getNthRoot (value, n) {
      return Math.pow(value, 1 / n);
    }

    var TWELFTH_ROOT = getNthRoot(2, 12);
    var OCTAVE_INTERVAL = 12;
    var FIFTH_INTERVAL = 7;

    // ref: http://www.phy.mtu.edu/~suits/NoteFreqCalcs.html
    // http://www.phy.mtu.edu/~suits/notefreqs.html

    // get the frequency of a note that's a given number of intervals away from the reference frequency (interval can be negative)
    function getFrequency (reference, interval) {
      reference = (typeof reference !== 'undefined') ? reference : 440; // 440Hz = middle A
      
      var frequency = reference * Math.pow(TWELFTH_ROOT, interval);

      return frequency;
    }

    // scales:
    // major
    // minor forms
    // blues
    // chromatic
    // whole tone
    // pentatonic:
    // http://en.wikipedia.org/wiki/Pentatonic_scale#Types_of_pentatonic_scales
    // 

    var CMajorScale = [
      130.81, // C3
      146.83, // D3
      164.81, // E3
      174.61, // F3
      196.00, // G3
      220.00, // A3
      246.94, // B3
      261.63, // C4
      293.66, // D4
      329.63, // E4
      349.23, // F4
      392.00, // G4
      440.00, // A4
      493.88, // B4
      523.25, // C5 
      587.33 // D5
    ];

    scales = {
      'C Major': CMajorScale
    };

    getAudioContext = (function () {
      var context = null;

      window.AudioContext = window.AudioContext || window.webkitAudioContext;

      function createContext () {
        return new window.AudioContext();
      }

      function getContext () {
        if (context === null) {
          context = createContext();
        }

        return context;
      }

      return getContext;
    })();

    function SimpleSynthesizer (options) {
      this.audioContext = getAudioContext();

      this.oscillatorType = options.oscillatorType || 'sine'; // sine, square, sawtooth, triangle

      this.attackTime = (options.attackTime || 0); // attack volume is always 1
      this.decayTime = (options.decayTime || 0) + this.attackTime; // decays to sustain volume
      this.sustainTime = (options.sustainTime || 0) + this.decayTime;
      this.sustainVolume = options.sustainVolume || 1;
      this.releaseTime = (options.releaseTime || 0.1) + this.sustainTime; // release volume is always 0
    }

    SimpleSynthesizer.prototype.playSound = function (scale, soundIndex, volume) {
      var oscillator = this.audioContext.createOscillator();
      var gainNode = this.audioContext.createGain();

      oscillator.type = this.oscillatorType;
      oscillator.frequency.value = scale[soundIndex]; // hertz
      gainNode.connect(this.audioContext.destination);
      oscillator.connect(gainNode);

      gainNode.gain.value = 0;

      oscillator.start(0);
      gainNode.gain.setValueAtTime(0.001, this.audioContext.currentTime); // initial
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + this.attackTime); // attack
      gainNode.gain.linearRampToValueAtTime(this.sustainVolume * volume, this.audioContext.currentTime + this.decayTime); // decay
      gainNode.gain.setValueAtTime(this.sustainVolume * volume, this.audioContext.currentTime + this.sustainTime); // sustain
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + this.releaseTime); // release
      oscillator.stop(this.audioContext.currentTime + this.releaseTime); // kill
    };

    function SimpleSampleSet (options) {
      this.audioContext = getAudioContext();

      this.samplesDir = 'ogg/';
      this.sources = options.sources || [];
      this.buffers = [];

      this.loadSounds();
    }

    SimpleSampleSet.prototype.loadSounds = function () {
      var that = this;

      this.sources.forEach(function (fileName, index) {
        var request = new XMLHttpRequest();
        
        request.open('GET', that.samplesDir + fileName, true);
        request.responseType = 'arraybuffer';

        // Decode asynchronously
        request.onload = function() {
          that.audioContext.decodeAudioData(request.response, function(buffer) {
            that.buffers[index] = buffer;
          });
        }
        request.send();
      })
    };

    SimpleSampleSet.prototype.playSound = function (scale, soundIndex, volume) {
      var source = this.audioContext.createBufferSource();

      source.buffer = this.buffers[soundIndex];                    
      source.connect(this.audioContext.destination);
      source.start(0);   
    };

    var instruments = {
      simpleSine: new SimpleSynthesizer({
        oscillatorType: 'sine',
        attackTime: 0.05,
        decayTime: 0,
        sustainTime: 0,
        sustainVolume: 1,
        releaseTime: 0.4
      }),
      simpleBleep: new SimpleSynthesizer({
        oscillatorType: 'triangle',
        attackTime: 0.05,
        decayTime: 0,
        sustainTime: 0,
        sustainVolume: 1,
        releaseTime: 0.05
      }),
      simpleDrums: new SimpleSampleSet({
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
      this.scale = 'C Major';
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
            return '#ccc'
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
      };

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
