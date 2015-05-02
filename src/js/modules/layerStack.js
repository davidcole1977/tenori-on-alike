module.exports = (function () {

  function Layer (index) {
    this.grid = new Grid(16, 16);
    this.instrument = 'simpleSine';
    this.scale = 'C Major';
    this.colour = conf.layerColours[index];
    this.volume = 0.5; // 0 to 1
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

  return {

  };
  
}());