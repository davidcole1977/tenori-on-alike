module.exports = (function () {

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

  return {
    getAudioContext: getAudioContext
  };
  
}());