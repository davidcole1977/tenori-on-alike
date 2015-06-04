module.exports = (function () {

  // TODO: turn into chained / fluent interface for creating new instruments
  // TODO: create unit tests for creating instruments and setting options
  // TODO: export makeSimpleSynthesizer instead of SimpleSynthesizer
  // TODO: ensure samples gracefully load in and don't cause errors if the app attempts to play the sound before it loads (use promises)
  // TODO: new types of instruments and ways to play sounds, as per todo list in the readme

  var AudioHelpers = require('./AudioHelpers');

  function SimpleSynthesizer () {
    this.audioContext = AudioHelpers.getAudioContext();
    
    // default sound settings
    this.baseVolume = 0.4; // oscillator based sounds are really LOUD!
    this.oscillatorType = 'sine';
    this.attackTime = 0; // attack volume is always 1
    this.decayTime = 0; // decays to sustain volume
    this.sustainTime = 0;
    this.sustainVolume = 1;
    this.releaseTime = 0.1; // release volume is always 0
  }

  SimpleSynthesizer.makeSynth = function () {
    return new SimpleSynthesizer();
  };

  SimpleSynthesizer.prototype.setBaseVolume = function (baseVolume) {
    this.baseVolume = baseVolume;
    return this;
  };

  SimpleSynthesizer.prototype.setOscillatorType = function (oscillatorType) {
    this.oscillatorType = oscillatorType;
    return this;
  };

  SimpleSynthesizer.prototype.setAttackTime = function (attackTime) {
    this.attackTime = attackTime;
    return this;
  };

  SimpleSynthesizer.prototype.setDecayTime = function (decayTime) {
    this.decayTime = decayTime;
    return this;
  };

  SimpleSynthesizer.prototype.setSustainTime = function (sustainTime) {
    this.sustainTime = sustainTime;
    return this;
  };

  SimpleSynthesizer.prototype.setSustainVolume= function (sustainVolume) {
    this.sustainVolume = sustainVolume;
    return this;
  };

  SimpleSynthesizer.prototype.setReleaseTime = function (releaseTime) {
    this.releaseTime = releaseTime;
    return this;
  };


  SimpleSynthesizer.prototype.playSound = function (noteInHertz, soundIndex, volume) {
    var oscillator = this.audioContext.createOscillator();
    var gainNode = this.audioContext.createGain();
    var adjustedVolume = this.baseVolume * volume;

    var adjustedAttackTime = this.attackTime;
    var adjustedDecayTime = this.decayTime + adjustedAttackTime;
    var adjustedSustainTime = this.sustainTime + adjustedDecayTime;
    var adjustedReleaseTime = this.releaseTime + adjustedSustainTime;

    oscillator.type = this.oscillatorType;
    oscillator.frequency.value = noteInHertz; // hertz
    gainNode.connect(this.audioContext.destination);
    oscillator.connect(gainNode);

    gainNode.gain.value = 0;

    oscillator.start(0);
    gainNode.gain.setValueAtTime(0.001, this.audioContext.currentTime); // initial
    gainNode.gain.linearRampToValueAtTime(adjustedVolume, this.audioContext.currentTime + adjustedAttackTime); // attack
    gainNode.gain.linearRampToValueAtTime(this.sustainVolume * adjustedVolume, this.audioContext.currentTime + adjustedDecayTime); // decay
    gainNode.gain.setValueAtTime(this.sustainVolume * adjustedVolume, this.audioContext.currentTime + adjustedSustainTime); // sustain
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + adjustedReleaseTime); // release
    oscillator.stop(this.audioContext.currentTime + adjustedReleaseTime); // kill
  };

  function SimpleSampleSet (options) {
    this.audioContext = AudioHelpers.getAudioContext();

    this.baseVolume = 1;

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
      };
      request.send();
    });
  };

  SimpleSampleSet.prototype.playSound = function (noteInHertz, soundIndex, volume) {
    var source = this.audioContext.createBufferSource();
    var adjustedVolume = this.baseVolume * volume;
    var gainNode = this.audioContext.createGain();

    gainNode.gain.value = adjustedVolume;

    source.buffer = this.buffers[soundIndex]; 
    gainNode.connect(this.audioContext.destination);
    source.connect(gainNode);
    source.start(0);   
  };

  return {
    SimpleSampleSet: SimpleSampleSet,
    makeSynth: SimpleSynthesizer.makeSynth
  };
  
}());