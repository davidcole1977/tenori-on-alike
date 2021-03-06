module.exports = (function () {

  function Cell () {
    this.isSelected = false;
  }

  Cell.prototype.reset = function () {
    this.isSelected = false;
  };

  Cell.prototype.toggle = function () {
    this.isSelected = this.isSelected ? false : true;
  };

  function Grid (rowCount, colCount) {
    var row = 0;
    var col = 0;

    this.cols = [];

    for (col = 0; col < colCount; col += 1) {
      this.cols[col] = [];

      for (row = 0; row < rowCount; row += 1) {
        this.cols[col][row] = new Cell();
      }
    }
  }

  Grid.prototype.reset = function (callback) {
    this.cols.forEach(function (cells) {
      cells.forEach(function (cell) {
        cell.reset();
      });
    });

    callback();
  };

  return {
    Grid: Grid
  };
  
}());