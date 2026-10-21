(function (museum) {
  "use strict";

  const scenes = {
    lobby: {
      title: "Фоайе",
      mapLabel: "Фоайе · вход",
      width: museum.config.halls.lobby.width,
      farAsset: "lobbyFar",
      nearAsset: "lobbyNear",
      spawnX: museum.config.halls.lobby.spawnX,
      doors: [
        { id: "raster", x: 1650, title: "Растерна зала", active: true, destination: "raster", spawnX: 120 },
        { id: "vector", x: 2200, title: "Векторна зала", active: true, destination: "vector", spawnX: 140 },
        { id: "comparison", x: 2570, title: "Зала за сравнения", active: true, destination: "comparison", spawnX: 140 }
      ]
    },
    raster: {
      title: "Растерна зала",
      mapLabel: "Растерна зала · колекция",
      width: museum.config.halls.raster.width,
      farAsset: "rasterFar",
      nearAsset: "rasterNear",
      spawnX: museum.config.halls.raster.spawnX,
      doors: [
        { id: "lobby", x: 32, title: "Към фоайето", active: true, destination: "lobby", spawnX: 1770 },
        { id: "vector", x: 4800, title: "Векторна зала", active: true, destination: "vector", spawnX: 140 }
      ]
    },
    vector: {
      title: "Векторна зала",
      mapLabel: "Векторна зала · колекция",
      width: museum.config.halls.vector.width,
      farAsset: "vectorFar",
      nearAsset: "vectorNear",
      spawnX: museum.config.halls.vector.spawnX,
      doors: [
        { id: "lobby", x: 32, title: "Към фоайето", active: true, destination: "lobby", spawnX: 2370 },
        { id: "comparison", x: 4800, title: "Зала за сравнения", active: true, destination: "comparison", spawnX: 140 }
      ]
    },
    comparison: {
      title: "Зала за сравнения",
      mapLabel: "Зала за сравнения · интерактивни станции",
      width: museum.config.halls.comparison.width,
      farAsset: "comparisonFar",
      nearAsset: "comparisonNear",
      spawnX: museum.config.halls.comparison.spawnX,
      doors: [
        { id: "vector", x: 32, title: "Векторна зала", active: true, destination: "vector", spawnX: 4800 },
        { id: "raster", x: 5800, title: "Растерна зала", active: true, destination: "raster", spawnX: 4800 }
      ]
    }
  };

  function create(worldLayer, farLayer, nearLayer, floor, exhibits, interactives) {
    let current = null;
    let doors = [];

    function tileLayer(layer, assetName, width, speedClass) {
      layer.replaceChildren();
      layer.className = "parallax-layer " + speedClass;
      const asset = museum.Assets.definitions[assetName];
      const tiles = Math.ceil((width + asset.width * 2) / asset.width);
      for (let index = -1; index < tiles; index += 1) {
        const tile = museum.Assets.createImage(assetName, "scene-art-tile", "Сценичен фон — " + asset.label);
        tile.style.left = index * asset.width + "px";
        layer.append(tile);
      }
    }

    function mount(sceneId) {
      const scene = scenes[sceneId];
      if (!scene) throw new Error("Unknown museum scene: " + sceneId);
      current = Object.assign({ id: sceneId }, scene);
      worldLayer.replaceChildren();
      worldLayer.style.width = scene.width + "px";
      worldLayer.dataset.scene = sceneId;
      tileLayer(farLayer, scene.farAsset, scene.width, "far-layer");
      tileLayer(nearLayer, scene.nearAsset, scene.width, "near-layer");
      floor.replaceChildren();
      floor.style.width = scene.width + "px";
      const floorAsset = museum.Assets.definitions.floor;
      for (let floorIndex = 0; floorIndex < Math.ceil(scene.width / floorAsset.width); floorIndex += 1) {
        const floorTile = museum.Assets.createImage("floor", "floor-tile", "Музейна подова настилка");
        floorTile.style.left = floorIndex * floorAsset.width + "px";
        floor.append(floorTile);
      }

      const sign = document.createElement("p");
      sign.className = "scene-wall-sign";
      sign.textContent = sceneId === "lobby"
        ? "МУЗЕЙ НА ГРАФИЧНИТЕ ФОРМАТИ"
        : sceneId === "raster"
          ? "РАСТЕРНА КОЛЕКЦИЯ"
          : sceneId === "vector"
            ? "ВЕКТОРНА КОЛЕКЦИЯ"
            : "СРАВНИТЕЛНИ ИНТЕРАКТИВНИ СТАНЦИИ";
      worldLayer.append(sign);

      doors = [];
      scene.doors.forEach(function (doorData) {
        const door = document.createElement("button");
        door.type = "button";
        door.className = "world-door" + (doorData.active ? "" : " world-door--closed");
        door.style.left = doorData.x + "px";
        door.dataset.doorId = doorData.id;
        door.dataset.doorActive = String(doorData.active);
        door.disabled = !doorData.active;
        door.setAttribute("aria-label", doorData.active
          ? "Врата: " + doorData.title
          : "Затворена врата: " + doorData.title + ". Ще бъде добавена в следваща стъпка.");
        door.append(museum.Assets.createImage("museumDoor", "door-image", "Врата към " + doorData.title));
        const doorSign = document.createElement("span");
        doorSign.className = "door-sign";
        doorSign.textContent = doorData.title;
        door.append(doorSign);
        if (!doorData.active) {
          const closed = document.createElement("span");
          closed.className = "door-closed-label";
          closed.textContent = "СЛЕДВАЩА СТЪПКА";
          door.append(closed);
        } else {
          const prompt = document.createElement("span");
          prompt.className = "door-key-hint";
          prompt.textContent = "E";
          door.append(prompt);
        }
        worldLayer.append(door);
        doors.push({
          id: doorData.id,
          x: doorData.x + museum.Assets.definitions.museumDoor.width / 2,
          active: doorData.active,
          destination: doorData.destination,
          spawnX: doorData.spawnX,
          title: doorData.title,
          element: door
        });
      });

      exhibits.place(museum.formats, sceneId === "raster" ? "raster" : sceneId === "vector" ? "vector" : "", worldLayer);
      interactives.place(sceneId === "comparison" ? worldLayer : null);
      return { id: sceneId, title: scene.title, mapLabel: scene.mapLabel, width: scene.width, spawnX: scene.spawnX };
    }

    return {
      mount: mount,
      getCurrent: function () { return current; },
      getDoors: function () { return doors.slice(); },
      setMarkers: function (container) {
        container.querySelectorAll(".map-marker").forEach(function (marker) { marker.remove(); });
        if (!current) return;
        if (current.id === "raster" || current.id === "vector") {
          exhibits.getAll().forEach(function (exhibit) {
            const marker = document.createElement("span");
            marker.className = "map-marker map-marker--exhibit";
            marker.style.left = (exhibit.x + 120) / current.width * 100 + "%";
            marker.title = "Експонат " + exhibit.format.name;
            container.append(marker);
          });
        }
        if (current.id === "comparison") {
          interactives.getAll().forEach(function (exhibit) {
            const marker = document.createElement("span");
            marker.className = "map-marker map-marker--exhibit";
            marker.style.left = (exhibit.x + 120) / current.width * 100 + "%";
            marker.title = "Интерактивна станция: " + exhibit.title;
            container.append(marker);
          });
        }
        doors.forEach(function (door) {
          const marker = document.createElement("span");
          marker.className = "map-marker map-marker--door";
          marker.style.left = door.x / current.width * 100 + "%";
          marker.title = "Врата: " + door.title;
          container.append(marker);
        });
      }
    };
  }

  museum.Scene = { create: create, definitions: scenes };
}(window.GraphicMuseum));
