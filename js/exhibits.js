(function (museum) {
  "use strict";

  const titles = {
    jpeg: "Снимки и компресия",
    png: "Прозрачност и детайл",
    gif: "Цветове и анимация",
    svg: "Векторна графика",
    ai: "Редактируем проект",
    eps: "Графика за печат",
    pdf: "Документи и печат",
    dxf: "CAD модели"
  };

  function create(sceneConfig, interactionRange, openModal, promptElement) {
    let exhibits = [];
    let activeId = null;

    function place(formats, hall, worldLayer) {
      exhibits = [];
      activeId = null;
      formats.filter(function (format) { return format.type === hall; }).forEach(function (format, index) {
        const x = Number.isFinite(format.positionX)
          ? format.positionX
          : sceneConfig.exhibitStart + index * sceneConfig.exhibitSpacing;
        const station = document.createElement("button");
        station.type = "button";
        station.className = "exhibit-station exhibit-station--" + hall;
        station.style.left = x + "px";
        station.dataset.exhibitId = format.id;
        station.setAttribute("aria-label", "Разгледай експоната " + format.name);

        const hanger = document.createElement("span");
        hanger.className = "exhibit-hanger";
        const frame = document.createElement("span");
        frame.className = "exhibit-frame";
        frame.append(museum.Assets.createImage(format.id + "Exhibit", "exhibit-image", "Илюстрация за " + format.name));
        const plaque = document.createElement("span");
        plaque.className = "exhibit-plaque";
        const name = document.createElement("strong");
        name.textContent = format.name;
        const subtitle = document.createElement("span");
        subtitle.textContent = titles[format.id] || (hall === "vector" ? "Векторен формат" : "Растерен формат");
        plaque.append(name, subtitle);
        station.append(hanger, frame, plaque);
        worldLayer.append(station);
        exhibits.push({ format: format, x: x, element: station });
      });
    }

    function nearest(x) {
      let closest = null;
      let distance = Infinity;
      exhibits.forEach(function (exhibit) {
        const nextDistance = Math.abs(x - (exhibit.x + 120));
        if (nextDistance <= interactionRange && nextDistance < distance) {
          closest = exhibit;
          distance = nextDistance;
        }
      });
      return closest;
    }

    function update(x, tourPrompt) {
      const target = nearest(x);
      activeId = target ? target.format.id : null;
      exhibits.forEach(function (exhibit) {
        exhibit.element.classList.toggle("is-highlighted", exhibit.format.id === activeId);
      });

      if (tourPrompt) {
        promptElement.textContent = tourPrompt;
        promptElement.hidden = false;
      } else if (target) {
        promptElement.textContent = "Натиснете E или докоснете рамката, за да разгледате " + target.format.name;
        promptElement.hidden = false;
      } else {
        promptElement.hidden = true;
      }
      return target;
    }

    function activate(id, trigger) {
      const exhibit = exhibits.find(function (item) { return item.format.id === id; });
      if (!exhibit) return false;
      openModal(exhibit.format, trigger);
      return true;
    }

    return {
      place: place,
      update: update,
      nearest: nearest,
      activate: activate,
      getAll: function () { return exhibits.slice(); },
      getActiveId: function () { return activeId; }
    };
  }

  museum.Exhibits = { create: create };
}(window.GraphicMuseum));
