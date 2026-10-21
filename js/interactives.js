(function (museum) {
  "use strict";

  const useCases = [
    { id: "photo", label: "Фотография", format: "JPEG", reason: "Подходящ е за снимки с плавни цветови преходи и обикновено ги съхранява компактно." },
    { id: "logo", label: "Лого", format: "SVG или PNG", reason: "SVG се мащабира чисто; PNG е удобен избор, когато е нужна растерна прозрачност." },
    { id: "icon", label: "Уеб икона", format: "SVG", reason: "Векторните контури остават ясни при различни размери на екрана." },
    { id: "print", label: "Печат", format: "PDF или TIFF", reason: "PDF е удобен за оформени документи, а TIFF се използва за висококачествени растерни изображения." },
    { id: "animation", label: "Анимация", format: "GIF или WebP", reason: "И двата формата поддържат анимация; изборът зависи от цветовете и съвместимостта." },
    { id: "industrial", label: "Индустриален дизайн", format: "DXF", reason: "DXF е широко използван за CAD чертежи и управление на машини за рязане и гравиране." }
  ];

  function create(worldLayer, dialog, titleElement, content, closeButton) {
    let stations = [];
    let onDismiss = function () { };

    function element(tagName, className, text) {
      const node = document.createElement(tagName);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    }

    function addImage(parent, assetName, label, className) {
      parent.append(museum.Assets.createImage(assetName, className || "", label));
    }

    function addInlineVector(parent, className) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("class", className || "");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Векторна илюстрация, която остава ясна при мащабиране");
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "50");
      circle.setAttribute("cy", "50");
      circle.setAttribute("r", "42");
      circle.setAttribute("fill", "#e5b878");
      circle.setAttribute("stroke", "#714e36");
      circle.setAttribute("stroke-width", "3");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M15 63 Q34 20 53 54 T86 38");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#3c786d");
      path.setAttribute("stroke-width", "8");
      path.setAttribute("stroke-linecap", "round");
      svg.append(circle, path);
      parent.append(svg);
      return svg;
    }

    function renderZoom() {
      const section = element("section", "interactive-demo");
      section.append(element("p", "panel-lead", "Увеличете двата примера. Растерното изображение се състои от видими пиксели, а векторната графика се преизчислява при всеки размер."));
      const examples = element("div", "zoom-examples");
      const raster = element("div", "zoom-example zoom-example--raster");
      raster.append(element("h3", "", "Растер · пиксели"));
      const rasterFrame = element("div", "zoom-vector-frame");
      const pixelImage = museum.Assets.createImage("zoomPixels", "zoom-sample zoom-sample--pixelated", "Пикселно изображение за сравнение");
      pixelImage.style.width = "180px";
      pixelImage.style.height = "180px";
      rasterFrame.append(pixelImage);
      const rasterSize = element("output", "zoom-size", "180 px");
      raster.append(rasterFrame, rasterSize);
      const vector = element("div", "zoom-example zoom-example--vector");
      vector.append(element("h3", "", "Вектор · SVG"));
      const vectorFrame = element("div", "zoom-vector-frame");
      const svg = addInlineVector(vectorFrame, "zoom-vector-art");
      svg.style.width = "180px";
      svg.style.height = "180px";
      const size = element("output", "zoom-size", "180 px");
      vector.append(vectorFrame, size);
      examples.append(raster, vector);
      section.append(examples);
      const label = element("label", "zoom-slider-label", "Размер на изображенията");
      const slider = element("input", "zoom-slider");
      slider.type = "range";
      slider.min = "80";
      slider.max = "320";
      slider.value = "180";
      slider.setAttribute("aria-label", "Размер на изображенията");
      slider.addEventListener("input", function () {
        const width = Number(slider.value);
        [svg, pixelImage].forEach(function (node) {
          node.style.width = width + "px";
          node.style.height = width + "px";
        });
        [size, rasterSize].forEach(function (out) {
          out.value = width + " px";
          out.textContent = width + " px";
        });
      });
      label.append(slider);
      section.append(label);
      content.append(section);
    }

    function renderCompression() {
      const section = element("section", "interactive-demo");
      section.append(element("p", "panel-lead", "Сравнете еднакъв пример при три настройки за качество. Посочените размери са приблизителни измеренения на файловете."));
      const qualities = [
        { asset: "compressionLow", quality: "Ниско качество", size: "42 KB · пример" },
        { asset: "compressionMedium", quality: "Средно качество", size: "86 KB · пример" },
        { asset: "compressionHigh", quality: "Високо качество", size: "164 KB · пример" }
      ];
      const controls = element("div", "compression-controls");
      const samples = element("div", "compression-samples");
      const card = element("article", "compression-card");
      const image = museum.Assets.createImage(qualities[0].asset, "compression-image", "Примерна снимка: " + qualities[0].quality);
      const heading = element("h3", "", qualities[0].quality);
      const size = element("p", "file-size", qualities[0].size);
      card.append(image, heading, size);
      samples.append(card);
      qualities.forEach(function (sample, index) {
        const button = element("button", "compression-choice", sample.quality);
        button.type = "button";
        button.setAttribute("aria-pressed", String(index === 0));
        button.addEventListener("click", function () {
          samples.querySelector(".asset-view").replaceWith(
            museum.Assets.createImage(sample.asset, "compression-image", "Примерна снимка: " + sample.quality)
          );
          heading.textContent = sample.quality;
          size.textContent = sample.size;
          controls.querySelectorAll(".compression-choice").forEach(function (choice) {
            choice.setAttribute("aria-pressed", String(choice === button));
          });
        });
        controls.append(button);
      });
      section.append(controls, samples);
      content.append(section);
    }

    function renderTransparency() {
      const section = element("section", "interactive-demo");
      section.append(element("p", "panel-lead", "Сменете фона, за да видите как непрозрачната JPEG снимка се държи различно от логото с прозрачни области."));
      const toggle = element("button", "background-toggle", "Черен фон");
      toggle.type = "button";
      const stage = element("div", "transparency-stage transparency-stage--light");
      const photoCard = element("article", "transparency-card");
      photoCard.append(element("h3", "", "JPEG · без прозрачност"));
      addImage(photoCard, "transparencyJpeg", "Примерна JPEG снимка", "transparency-photo");
      const logoCard = element("article", "transparency-card");
      logoCard.append(element("h3", "", "PNG / SVG · прозрачен фон"));
      addImage(logoCard, "transparencyLogo", "Примерно PNG лого с прозрачност", "transparency-logo");
      stage.append(photoCard, logoCard);
      let dark = false;
      toggle.addEventListener("click", function () {
        dark = !dark;
        stage.classList.toggle("transparency-stage--dark", dark);
        stage.classList.toggle("transparency-stage--light", !dark);
        toggle.textContent = dark ? "Бял фон" : "Черен фон";
      });
      section.append(toggle, stage);
      content.append(section);
    }

    function renderSummary() {
      const section = element("section", "interactive-demo summary-demo");
      section.append(element("p", "panel-lead", "Филтрирайте справочната таблица по тип формат."));
      const filter = element("label", "summary-filter", "Показвай формати: ");
      const select = element("select", "summary-type-filter");
      select.setAttribute("aria-label", "Филтър по тип формат");
      [["all", "Всички"], ["raster", "Растерни"], ["vector", "Векторни"]].forEach(function (optionData) {
        const option = element("option", "", optionData[1]);
        option.value = optionData[0];
        select.append(option);
      });
      filter.append(select);
      const wrap = element("div", "summary-table-wrap");
      const table = element("table", "summary-table");
      const head = element("thead");
      const headRow = element("tr");
      ["Формат", "Разширение", "Тип", "Компресия", "Прозрачност", "Анимация", "Типична употреба"].forEach(function (label) {
        headRow.append(element("th", "", label));
      });
      head.append(headRow);
      const body = element("tbody");
      function populate() {
        body.replaceChildren();
        museum.formats.filter(function (format) {
          return select.value === "all" || format.type === select.value;
        }).forEach(function (format) {
          const row = element("tr");
          [
            format.name,
            format.extensions.join(", "),
            museum.labels.types[format.type],
            museum.labels.compression[format.compression],
            format.transparency ? museum.labels.yes : museum.labels.no,
            format.animation ? museum.labels.yes : museum.labels.no,
            format.usedFor
          ].forEach(function (value) { row.append(element("td", "", value)); });
          body.append(row);
        });
      }
      select.addEventListener("change", populate);
      populate();
      table.append(head, body);
      wrap.append(table);
      section.append(filter, wrap);
      content.append(section);
    }

    function renderGuide() {
      const section = element("section", "interactive-demo");
      section.append(element("p", "panel-lead", "Изберете какво искате да създадете. Това е кратка отправна точка; изискванията към конкретния проект са важни."));
      const label = element("label", "guide-choice-label", "Какъв вид графика ви трябва?");
      const select = element("select", "guide-choice");
      select.setAttribute("aria-label", "Изберете предназначение");
      useCases.forEach(function (item) {
        const option = element("option", "", item.label);
        option.value = item.id;
        select.append(option);
      });
      const answer = element("div", "guide-answer");
      function update() {
        const result = useCases.find(function (item) { return item.id === select.value; });
        answer.replaceChildren(element("strong", "", result.format), element("p", "", result.reason));
      }
      select.addEventListener("change", update);
      update();
      label.append(select);
      section.append(label, answer);
      content.append(section);
    }

    function formatSize(kb) {
      return kb >= 1024 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB";
    }

    function renderSizes() {
      const section = element("section", "interactive-demo");
      section.append(element("p", "panel-lead", "Сравнете размерите на файловете. Лентата показва размера спрямо най-големия файл в същата група."));
      const groups = (museum.fileSizes || []).filter(function (group) {
        return group.items && group.items.length;
      });
      if (!groups.length) {
        section.append(element("p", "panel-lead", "Все още няма добавени данни."));
        content.append(section);
        return;
      }
      groups.forEach(function (group) {
        const block = element("div", "sizes-section");
        block.append(element("h3", "", group.title));
        const max = Math.max.apply(null, group.items.map(function (item) { return item.sizeKB; }));
        const wrap = element("div", "summary-table-wrap");
        const table = element("table", "summary-table sizes-table");
        const head = element("thead");
        const headRow = element("tr");
        ["Име", "Размер", "Сравнение", "Бележки"].forEach(function (label) {
          headRow.append(element("th", "", label));
        });
        head.append(headRow);
        const body = element("tbody");
        group.items.forEach(function (item) {
          const row = element("tr");
          const barCell = element("td");
          const bar = element("div", "size-bar");
          bar.style.width = Math.max(1, (item.sizeKB / max) * 100) + "%";
          barCell.append(bar);
          row.append(element("td", "", item.name), element("td", "size-value", formatSize(item.sizeKB)), barCell, element("td", "", item.notes || ""));
          body.append(row);
        });
        table.append(head, body);
        wrap.append(table);
        block.append(wrap);
        section.append(block);
      });
      content.append(section);
    }

    const renderers = {
      zoom: renderZoom,
      compression: renderCompression,
      transparency: renderTransparency,
      summary: renderSummary,
      guide: renderGuide,
      sizes: renderSizes,
    };

    function place(targetLayer) {
      stations = [];
      if (!targetLayer) return;
      museum.config.comparisonExhibits.forEach(function (data) {
        const station = element("button", "exhibit-station exhibit-station--interactive");
        station.type = "button";
        station.style.left = data.positionX + "px";
        station.dataset.interactiveId = data.id;
        station.setAttribute("aria-label", "Отвори интерактивната станция: " + data.title);
        station.append(element("span", "exhibit-hanger"));
        const frame = element("span", "exhibit-frame");
        addImage(frame, data.id + "Station", "Илюстрация за " + data.title, "exhibit-image");
        station.append(frame);
        const plaque = element("span", "exhibit-plaque");
        plaque.append(element("strong", "", data.title), element("span", "", "Интерактивен експонат"));
        station.append(plaque);
        targetLayer.append(station);
        stations.push(Object.assign({}, data, { element: station, hall: "comparison" }));
      });
    }

    function open(id) {
      const station = stations.find(function (item) { return item.id === id; });
      const renderer = station && renderers[station.kind];
      if (!station || !renderer) return false;
      titleElement.textContent = station.title;
      content.replaceChildren();
      renderer();
      if (!dialog.open) dialog.showModal();
      closeButton.focus();
      return true;
    }

    function close() {
      if (dialog.open) dialog.close();
    }

    function nearest(x, range) {
      let closest = null;
      let distance = Infinity;
      stations.forEach(function (station) {
        const nextDistance = Math.abs(x - (station.positionX + 120));
        if (nextDistance <= range && nextDistance < distance) {
          closest = station;
          distance = nextDistance;
        }
      });
      return closest;
    }

    function update(x, range) {
      const active = nearest(x, range);
      stations.forEach(function (station) {
        station.element.classList.toggle("is-highlighted", Boolean(active && active.id === station.id));
      });
      return active;
    }

    closeButton.addEventListener("click", function () {
      close();
      onDismiss();
    });
    dialog.addEventListener("cancel", function (event) {
      onDismiss(event);
    });

    return {
      place: place,
      open: open,
      close: close,
      isOpen: function () { return dialog.open; },
      nearest: nearest,
      update: update,
      getAll: function () { return stations.slice(); },
      setOnDismiss: function (callback) { onDismiss = callback; }
    };
  }

  museum.Interactives = { create: create };
}(window.GraphicMuseum));
