(function (museum) {
  "use strict";

  function create(viewport, duration) {
    let transitioning = false;

    function go(changeScene) {
      if (transitioning) return Promise.resolve(false);
      transitioning = true;
      viewport.classList.add("is-transitioning");
      return new Promise(function (resolve) {
        window.setTimeout(function () {
          changeScene();
          window.setTimeout(function () {
            viewport.classList.remove("is-transitioning");
            transitioning = false;
            resolve(true);
          }, duration / 2);
        }, duration / 2);
      });
    }

    return { go: go, isActive: function () { return transitioning; } };
  }

  museum.Transitions = { create: create };
}(window.GraphicMuseum));
