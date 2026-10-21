(function (museum) {
  "use strict";

  const viewport = document.querySelector("#scene-viewport");
  const worldLayer = document.querySelector("#world-layer");
  const farLayer = document.querySelector(".far-layer");
  const nearLayer = document.querySelector(".near-layer");
  const floor = document.querySelector(".museum-floor");
  const playerElement = document.querySelector("#player");
  const promptElement = document.querySelector("#interaction-prompt");
  const messageElement = document.querySelector("#scene-message");
  const mapMarkers = document.querySelector("#map-track");
  const mapPlayer = document.querySelector("#map-player");
  const hallSelect = document.querySelector("#hall-select");
  const tourButton = document.querySelector("#tour-toggle");
  const sceneTitle = document.querySelector("#scene-title");
  const mapCaption = document.querySelector("#map-caption");
  const instructions = document.querySelector("#walk-instructions");
  const dialog = document.querySelector(".exhibit-dialog");
  const interactiveDialog = document.querySelector("#interactive-dialog");

  const modal = museum.Modal.create(dialog, dialog.querySelector(".dialog-close"));
  const interactives = museum.Interactives.create(
    worldLayer,
    interactiveDialog,
    document.querySelector("#interactive-title"),
    document.querySelector("#interactive-content"),
    interactiveDialog.querySelector(".interactive-close")
  );
  const exhibits = museum.Exhibits.create(
    museum.config.halls.raster,
    museum.config.player.interactionRange,
    modal.open,
    promptElement
  );
  const scene = museum.Scene.create(worldLayer, farLayer, nearLayer, floor, exhibits, interactives);
  const player = museum.Player.create(playerElement, museum.config.player.speed);
  const camera = museum.Camera.create(viewport, worldLayer, playerElement, floor, farLayer, nearLayer, mapPlayer);
  const transitions = museum.Transitions.create(viewport, museum.config.transitionDuration);
  const pressedKeys = new Set();
  let touchDirection = 0;
  let currentScene = null;
  let messageTimer = 0;
  let lastFrame = performance.now();
  let tourProgress = { index: 0, total: 0 };

  function setPrompt(message) {
    if (promptElement.textContent !== message) promptElement.textContent = message;
    promptElement.hidden = !message;
  }

  function showMessage(message) {
    window.clearTimeout(messageTimer);
    messageElement.textContent = message;
    messageElement.hidden = false;
    messageTimer = window.setTimeout(function () {
      messageElement.hidden = true;
    }, 2600);
  }

  function updateRoomControls() {
    sceneTitle.textContent = currentScene.title;
    mapCaption.textContent = currentScene.mapLabel;
    hallSelect.value = currentScene.id;
    instructions.innerHTML = currentScene.id === "comparison"
      ? "Движение: ← → или A / D <span>·</span> Интерактивна станция: E"
      : currentScene.id === "lobby"
        ? "Движение: ← → или A / D <span>·</span> Врата: E"
        : "Движение: ← → или A / D <span>·</span> Експонат / врата: E";
  }

  function showScene(roomId, spawnX) {
    return transitions.go(function () {
      currentScene = scene.mount(roomId);
      viewport.dataset.scene = currentScene.id;
      player.setPosition(Number.isFinite(spawnX) ? spawnX : currentScene.spawnX);
      scene.setMarkers(mapMarkers);
      updateRoomControls();
      camera.update(player.getX(), currentScene.width);
    });
  }

  function allTourStops() {
    const stops = [];
    ["raster", "vector"].forEach(function (hall) {
      museum.formats.filter(function (format) {
        return format.type === hall;
      }).forEach(function (format, index) {
        stops.push({
          type: "format",
          hall: hall,
          format: format,
          x: Number.isFinite(format.positionX)
            ? format.positionX
            : museum.config.halls[hall].exhibitStart + index * museum.config.halls[hall].exhibitSpacing
        });
      });
    });
    museum.config.comparisonExhibits.forEach(function (exhibit) {
      stops.push({
        type: "interactive",
        hall: "comparison",
        interactiveId: exhibit.id,
        title: exhibit.title,
        x: exhibit.positionX
      });
    });
    const hallOrder = { raster: 0, vector: 1, comparison: 2 };
    return stops.sort(function (first, second) {
      return hallOrder[first.hall] - hallOrder[second.hall] || first.x - second.x;
    });
  }

  function activateStop(stop) {
    if (stop.type === "interactive") interactives.open(stop.interactiveId);
    else modal.open(stop.format, null);
  }

  function closeActivePanel() {
    modal.close();
    interactives.close();
  }

  const tour = museum.Tour.create(
    allTourStops,
    activateStop,
    closeActivePanel,
    function (roomId, spawnX) {
      if (currentScene && currentScene.id === roomId) {
        player.setPosition(spawnX);
        camera.update(player.getX(), currentScene.width);
        return Promise.resolve(true);
      }
      return showScene(roomId, spawnX);
    },
    function (active, waiting, index, total) {
      tourProgress = { index: index, total: total };
      tourButton.textContent = active ? "Завърши автообиколката" : "Автообиколка";
      tourButton.setAttribute("aria-pressed", String(active));
      viewport.classList.toggle("is-on-tour", active);
      if (active && waiting) {
        const stop = tour.getStop();
        setPrompt(stop
          ? "Автообиколка · " + (stop.format ? stop.format.name : stop.title) + " · експонат " + (index + 1) + " от " + total + ". Натиснете → или интервал за следващия."
          : "");
      } else if (active) {
        const stop = tour.getStop();
        setPrompt("Автообиколка · следва " + (stop && (stop.format ? stop.format.name : stop.title)) + " · " + (index + 1) + " от " + total);
      } else {
        setPrompt("");
      }
    }
  );

  function nearestDoor(x) {
    let result = null;
    let distance = Infinity;
    scene.getDoors().forEach(function (door) {
      const nextDistance = Math.abs(x - door.x);
      if (nextDistance <= museum.config.player.interactionRange && nextDistance < distance) {
        result = door;
        distance = nextDistance;
      }
    });
    return result;
  }

  function transitionThroughDoor(door) {
    if (!door.active || !door.destination) {
      showMessage("Тази зала ще бъде добавена в следваща стъпка.");
      return;
    }
    if (tour.isActive()) tour.exit();
    showScene(door.destination, door.spawnX);
  }

  function interact(target) {
    if (!currentScene || modal.isOpen() || interactives.isOpen() || transitions.isActive()) return;
    if (target && target.dataset && target.dataset.exhibitId) {
      exhibits.activate(target.dataset.exhibitId, target);
      return;
    }
    if (target && target.dataset && target.dataset.interactiveId) {
      interactives.open(target.dataset.interactiveId);
      return;
    }

    const exhibit = exhibits.nearest(player.getX());
    const interactive = interactives.nearest(player.getX(), museum.config.player.interactionRange);
    const door = nearestDoor(player.getX());
    const exhibitDistance = exhibit ? Math.abs(player.getX() - (exhibit.x + 120)) : Infinity;
    const interactiveDistance = interactive ? Math.abs(player.getX() - (interactive.positionX + 120)) : Infinity;
    const doorDistance = door ? Math.abs(player.getX() - door.x) : Infinity;
    const station = interactiveDistance < exhibitDistance ? interactive : exhibit;
    const stationDistance = Math.min(exhibitDistance, interactiveDistance);
    if (door && doorDistance <= stationDistance) {
      transitionThroughDoor(door);
    } else if (interactive && station === interactive) {
      interactives.open(interactive.id);
    } else if (exhibit) {
      exhibits.activate(exhibit.format.id, null);
    } else {
      showMessage("Приближете се до експонат или врата.");
    }
  }

  function updateInteraction() {
    if (tour.isActive()) return;
    const exhibit = exhibits.update(player.getX(), "");
    const interactive = interactives.update(player.getX(), museum.config.player.interactionRange);
    const door = nearestDoor(player.getX());
    const exhibitDistance = exhibit ? Math.abs(player.getX() - (exhibit.x + 120)) : Infinity;
    const interactiveDistance = interactive ? Math.abs(player.getX() - (interactive.positionX + 120)) : Infinity;
    const station = interactiveDistance < exhibitDistance ? interactive : exhibit;
    const stationDistance = Math.min(exhibitDistance, interactiveDistance);
    if (station && (!door || stationDistance <= Math.abs(player.getX() - door.x))) {
      scene.getDoors().forEach(function (item) { item.element.classList.remove("is-highlighted"); });
      if (interactive && station === interactive) {
        setPrompt("Натиснете E или докоснете рамката, за да отворите: " + interactive.title);
      }
      return;
    }
    if (door) {
      door.element.classList.add("is-highlighted");
      scene.getDoors().forEach(function (item) {
        if (item !== door) item.element.classList.remove("is-highlighted");
      });
      setPrompt(door.active
        ? "Натиснете E, за да преминете: " + door.title
        : "Затворена врата · " + door.title + " ще бъде добавена в следваща стъпка.");
      return;
    }
    scene.getDoors().forEach(function (item) { item.element.classList.remove("is-highlighted"); });
  }

  function getMovementAxis() {
    if (tour.isActive()) return tour.getDirection(player.getX());
    if (touchDirection) return touchDirection;
    const left = pressedKeys.has("ArrowLeft") || pressedKeys.has("a") || pressedKeys.has("A");
    const right = pressedKeys.has("ArrowRight") || pressedKeys.has("d") || pressedKeys.has("D");
    return left === right ? 0 : left ? -1 : 1;
  }

  function frame(now) {
    const delta = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    if (currentScene) {
      player.update(getMovementAxis(), delta, currentScene.width);
      camera.update(player.getX(), currentScene.width);
      if (tour.isActive() && tour.isWaiting()) {
        const stop = tour.getStop();
        setPrompt(stop
          ? "Автообиколка · " + (stop.format ? stop.format.name : stop.title) + " · експонат " + (tourProgress.index + 1) + " от " + tourProgress.total + ". Натиснете → или интервал за следващия."
          : "");
      } else {
        updateInteraction();
      }
    }
    window.requestAnimationFrame(frame);
  }

  document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (tour.isActive()) {
      if (key === "Escape") {
        event.preventDefault();
        tour.exit();
        return;
      }
      if (key === "ArrowRight" || key === " ") {
        event.preventDefault();
        if (tour.advance()) event.preventDefault();
        return;
      }
    }

    if (key === "Escape" && modal.isOpen()) {
      event.preventDefault();
      if (tour.isActive()) tour.exit();
      else modal.close();
      return;
    }
    if (key === "Escape" && interactives.isOpen()) {
      if (tour.isActive()) {
        event.preventDefault();
        tour.exit();
      }
      return;
    }
    if (modal.isOpen() || interactives.isOpen()) return;
    if (key === "e" || key === "E") {
      event.preventDefault();
      interact();
      return;
    }
    const eventTarget = event.target instanceof Element ? event.target : null;
    const isControl = eventTarget && eventTarget.closest("button, a, select, input, textarea, [contenteditable='true']");
    if (isControl) return;
    if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(key)) {
      event.preventDefault();
      pressedKeys.add(key);
    }
  });

  document.addEventListener("keyup", function (event) {
    pressedKeys.delete(event.key);
  });

  viewport.addEventListener("pointerdown", function () { viewport.focus({ preventScroll: true }); });
  viewport.addEventListener("click", function (event) {
    const exhibitButton = event.target.closest("[data-exhibit-id]");
    const interactiveButton = event.target.closest("[data-interactive-id]");
    const doorButton = event.target.closest("[data-door-id]");
    if (exhibitButton) interact(exhibitButton);
    else if (interactiveButton) interact(interactiveButton);
    else if (doorButton && !doorButton.disabled) {
      const door = scene.getDoors().find(function (item) { return item.id === doorButton.dataset.doorId; });
      if (door && Math.abs(player.getX() - door.x) <= museum.config.player.interactionRange) transitionThroughDoor(door);
      else showMessage("Приближете се до вратата, за да преминете.");
    }
  });

  document.querySelectorAll("[data-move]").forEach(function (button) {
    button.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      touchDirection = Number(button.dataset.move);
      button.setPointerCapture(event.pointerId);
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (eventName) {
      button.addEventListener(eventName, function () { touchDirection = 0; });
    });
  });

  document.querySelector('[data-action="interact"]').addEventListener("click", function () { interact(); });
  document.querySelector('[data-action="go-lobby"]').addEventListener("click", function (event) {
    event.preventDefault();
    if (tour.isActive()) tour.exit();
    if (currentScene.id !== "lobby") showScene("lobby", museum.config.halls.lobby.spawnX);
  });

  hallSelect.addEventListener("change", function () {
    if (tour.isActive()) tour.exit();
    const next = hallSelect.value;
    if (next !== currentScene.id) showScene(next, museum.config.halls[next].spawnX);
  });

  tourButton.addEventListener("click", function () {
    if (tour.isActive()) tour.exit();
    else tour.start();
  });

  dialog.addEventListener("cancel", function (event) {
    if (tour.isActive()) {
      event.preventDefault();
      tour.exit();
    }
  });

  interactives.setOnDismiss(function (event) {
    if (tour.isActive()) {
      tour.exit();
      if (event) event.preventDefault();
    }
  });

  interactiveDialog.addEventListener("cancel", function (event) {
    if (tour.isActive()) {
      event.preventDefault();
      tour.exit();
    }
  });

  currentScene = scene.mount("lobby");
  viewport.dataset.scene = currentScene.id;
  player.setPosition(currentScene.spawnX);
  scene.setMarkers(mapMarkers);
  updateRoomControls();
  window.addEventListener("resize", function () {
    camera.update(player.getX(), currentScene.width);
  });
  camera.update(player.getX(), currentScene.width);
  window.requestAnimationFrame(frame);
}(window.GraphicMuseum));
