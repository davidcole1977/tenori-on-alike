module.exports = (function () {

  var Layer = require('./layer').Layer;

  function Layers () {
    this.layers = [];
  }

  // Setters

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

  // Getters

  Layers.prototype.getLayerCount = function (index) {
    return this.layers.length;
  };

  Layers.prototype.getLayer = function (index) {
    return this.layers[index];
  };

  // module exports

  return {
    Layers: Layers
  };
  
}());