(function () {
  var express = require('express');
  var expressApp = express(); 
  var chalk = require('chalk');

  // serve static files
  expressApp.use(express.static('app'));

  // start server
  expressApp.listen(3000);
  console.log(chalk.cyan('Server started at localhost:3000'));

})();