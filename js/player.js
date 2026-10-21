(function (museum) {
  "use strict";

  function create(element, speed) {
    const spriteVisual = element.querySelector(".player-sprite");
    museum.Assets.applySprite(spriteVisual, "visitor");
    let x = 0;
    let direction = 1;
    let worldWidth = 0;

    function setPosition(nextX) {
      x = nextX+1;
    }

    function update(axis, deltaSeconds, maxWidth) {
      worldWidth = maxWidth;
      if (axis) {
        direction = axis;
        x += axis * speed * deltaSeconds;
        x = Math.max(32, Math.min(worldWidth - 32, x));
      }
      element.classList.toggle("is-walking", Boolean(axis));
      spriteVisual.style.transform = "scaleX(" + direction + ")";
    }

    return {
      update: update,
      setPosition: setPosition,
      getX: function () { return x; },
      setSpeed: function (nextSpeed) { speed = nextSpeed; }
    };
  }

  museum.Player = { create: create };
}(window.GraphicMuseum));
