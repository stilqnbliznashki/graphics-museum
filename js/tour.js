(function (museum) {
  "use strict";

  function create(getStops, activateStop, closeActive, setHall, onChange) {
    let active = false;
    let waiting = false;
    let index = 0;
    let stops = [];
    let currentHall = "";

    function announce() {
      onChange(active, waiting, index, stops.length);
    }

    function showStop() {
      waiting = true;
      const stop = stops[index];
      if (stop) activateStop(stop);
      announce();
    }

    function start() {
      const begin = function () {
        stops = getStops().slice();
        if (!stops.length) return;
        active = true;
        waiting = false;
        index = 0;
        currentHall = "";
        moveToStop();
      };
      begin();
    }

    function moveToStop() {
      const stop = stops[index];
      if (!stop) {
        exit();
        return;
      }
      const finishMove = function () {
        currentHall = stop.hall;
        waiting = false;
        announce();
      };
      if (currentHall !== stop.hall) {
        setHall(stop.hall, museum.config.halls[stop.hall].spawnX).then(finishMove);
      } else {
        finishMove();
      }
    }

    function advance() {
      if (!active || !waiting) return false;
      closeActive();
      if (index >= stops.length - 1) {
        exit();
        return true;
      }
      index += 1;
      moveToStop();
      return true;
    }

    function exit() {
      if (!active) return;
      active = false;
      waiting = false;
      closeActive();
      announce();
    }

    function getDirection(playerX) {
      if (!active || waiting || !stops[index]) return 0;
      const stopX = stops[index].x + 120;
      const delta = stopX - playerX;
      if (Math.abs(delta) <= 14) {
        showStop();
        return 0;
      }
      return delta > 0 ? 1 : -1;
    }

    return {
      start: start,
      advance: advance,
      exit: exit,
      getDirection: getDirection,
      isActive: function () { return active; },
      isWaiting: function () { return waiting; },
      getStop: function () { return stops[index] || null; },
      getProgress: function () { return { index: index, total: stops.length }; }
    };
  }

  museum.Tour = { create: create };
}(window.GraphicMuseum));
