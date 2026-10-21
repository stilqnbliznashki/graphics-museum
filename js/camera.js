(function (museum) {
  "use strict";

  function create(viewport, worldLayer, playerElement, floor, farLayer, nearLayer, mapPlayer) {
    let cameraX = 0;

    function update(playerX, worldWidth) {
      const viewportWidth = viewport.clientWidth;
      const maxCamera = Math.max(0, worldWidth - viewportWidth);
      cameraX = Math.max(0, Math.min(maxCamera, playerX - viewportWidth * 0.42));

      worldLayer.style.transform = "translate3d(" + -cameraX + "px, 0, 0)";
      farLayer.style.transform = "translate3d(" + -cameraX * 0.18 + "px, 0, 0)";
      nearLayer.style.transform = "translate3d(" + -cameraX * 0.62 + "px, 0, 0)";
      floor.style.transform = "translate3d(" + -cameraX * 0.92 + "px, 0, 0)";
      playerElement.style.left = (playerX - cameraX - 32) + "px";
      mapPlayer.style.left = (playerX / worldWidth * 100) + "%";
    }

    return { update: update, getX: function () { return cameraX; } };
  }

  museum.Camera = { create: create };
}(window.GraphicMuseum));
