module.exports = (function () {

  var audioHelpers = require('./audioHelpers');

  function SimpleSynthesizer (options) {
    this.audioContext = audioHelpers.getAudioContext();

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
    this.audioContext = audioHelpers.getAudioContext();

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

  SimpleSampleSet.prototype.playSound = function (scale, soundIndex, volume) {
    var source = this.audioContext.createBufferSource();

    source.buffer = this.buffers[soundIndex];                    
    source.connect(this.audioContext.destination);
    source.start(0);   
  };

  return {
    SimpleSampleSet: SimpleSampleSet,
    SimpleSynthesizer: SimpleSynthesizer
  };
  
}());