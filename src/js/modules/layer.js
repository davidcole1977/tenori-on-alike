module.exports = (function () {

  var Grid = require('./grid').Grid;

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

  function Layer (index) {
    this.grid = new Grid(16, 16);
    this.instrument = null;
    this.scale = null;
    this.colour = conf.layerColours[index];
    this.volume = 1; // 0 to 1
  }

  Layer.prototype.setInstrument = function (instrument) {
    this.instrument = instrument;
    return this; // allow chaining when setting properties
  };

  Layer.prototype.setVolume = function (volume) {
    this.volume = volume;
    return this; // allow chaining when setting properties
  };

  Layer.prototype.setColour = function (colour) {
    this.colour = colour;
    return this; // allow chaining when setting properties
  };

  // Layer getters

  Layer.prototype.getInstrument = function () {
    return this.instrument;
  };

  Layer.prototype.getVolume = function () {
    return this.volume;
  };

  Layer.prototype.getColour = function () {
    return this.colour;
  };

  return {
    Layer: Layer
  };

}());