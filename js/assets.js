(function (museum) {
  "use strict";

  const assets = {

    
    vectorFar: { file: "assets/scenes/far.svg", width: 1500, height: 594, frames: 1, label: "далечен фон на векторната зала" },
    vectorNear: { file: "assets/scenes/near.svg", width: 1250, height: 554, frames: 1, label: "близък фон на векторната зала" },
    comparisonFar: { file: "assets/scenes/far.svg", width: 1500, height: 594, frames: 1, label: "далечен фон на залата за сравнения" },
    comparisonNear: { file: "assets/scenes/near.svg", width: 1250, height: 554, frames: 1, label: "близък фон на залата за сравнения" },
    lobbyFar: { file: "assets/scenes/far.png", width: 1500, height: 594, frames: 1, label: "далечен фон на фоайето" },
    lobbyNear: { file: "assets/scenes/near.png", width: 1250, height: 554, frames: 1, label: "близък фон фоайе" },
    rasterFar: { file: "assets/scenes/far.png", width: 1500, height: 594, frames: 1, label: "далечен фон на растерната зала" },
    rasterNear: { file: "assets/scenes/near.png", width: 1250, height: 554, frames: 1, label: "близък фон растерна зала" },
    museumDoor: { file: "assets/scenes/door.png", width: 176, height: 300, frames: 1, label: "врата на музея" },
    floor: { file: "assets/scenes/floor.png", width: 428, height: 102, frames: 1, label: "подова настилка" },
    
    visitor: { file: "assets/sprites/visitor.png", width: 1920, height: 240, frameWidth: 240, frameHeight: 240, frames: 8, label: "спрайт посетителя" },
    
    sizesStation: { file: "assets/exhibits/sizes.png", width: 200, height: 170, frames: 1, label: "илюстрация за станцията за размери" },
    summaryStation: { file: "assets/exhibits/summary.png", width: 200, height: 170, frames: 1, label: "илюстрация за обобщаващата таблица" },
    guideStation: { file: "assets/exhibits/guide.png", width: 200, height: 170, frames: 1, label: "илюстрация за справочната станция" },
    compressionStation: { file: "assets/exhibits/jpeg-high.jpg", width: 200, height: 170, frames: 1, label: "илюстрация за станцията за компресия" },
    zoomStation: { file: "assets/exhibits/zoom.png", width: 200, height: 170, frames: 1, label: "илюстрация за станцията за мащабиране" },
    transparencyStation: { file: "assets/exhibits/transparency-logo.png", width: 200, height: 170, frames: 1, label: "илюстрация за станцията за прозрачност" },
    jpegExhibit: { file: "assets/exhibits/jpeg.jpg", width: 200, height: 170, frames: 1, label: "изображение за JPEG" },
    pngExhibit: { file: "assets/exhibits/png.png", width: 200, height: 170, frames: 1, label: "изображение за PNG" },
    gifExhibit: { file: "assets/exhibits/gif.gif", width: 200, height: 170, frames: 1, label: "изображение за GIF" },
    bmpExhibit: { file: "assets/exhibits/bmp.bmp", width: 200, height: 170, frames: 1, label: "изображение за BMP" },
    tiffExhibit: { file: "assets/exhibits/tiff.png", width: 200, height: 170, frames: 1, label: "изображение за TIFF" },
    webpExhibit: { file: "assets/exhibits/webp.webp", width: 200, height: 170, frames: 1, label: "изображение за WebP" },
    svgExhibit: { file: "assets/exhibits/svg.svg", width: 200, height: 170, frames: 1, label: "изображение за SVG" },
    aiExhibit: { file: "assets/exhibits/ai.svg", width: 200, height: 170, frames: 1, label: "изображение за AI" },
    epsExhibit: { file: "assets/exhibits/eps.svg", width: 200, height: 170, frames: 1, label: "изображение за EPS" },
    pdfExhibit: { file: "assets/exhibits/pdf.svg", width: 200, height: 170, frames: 1, label: "изображение за PDF" },
    dxfExhibit: { file: "assets/exhibits/dxf.svg", width: 200, height: 170, frames: 1, label: "изображение за DXF" },
    zoomPixels: { file: "assets/exhibits/zoom-pixels.png", width: 32, height: 32, frames: 1, label: "пикселно изображение за сравнение" },
    compressionLow: { file: "assets/exhibits/jpeg-low.jpg", width: 360, height: 200, frames: 1, label: "снимка с ниска JPEG настройка" },
    compressionMedium: { file: "assets/exhibits/jpeg-medium.jpg", width: 360, height: 200, frames: 1, label: "снимка със средна JPEG настройка" },
    compressionHigh: { file: "assets/exhibits/jpeg-high.jpg", width: 360, height: 200, frames: 1, label: "снимка с висока JPEG настройка" },
    transparencyJpeg: { file: "assets/exhibits/transparency-photo.jpg", width: 200, height: 200, frames: 1, label: "примерна JPEG снимка" },
    transparencyLogo: { file: "assets/exhibits/transparency-logo.png", width: 200, height: 200, frames: 1, label: "примерно лого с прозрачност" }
  };

  function createImage(name, className, alt) {
    const asset = assets[name];
    if (!asset) throw new Error("Unknown museum asset: " + name);

    const container = document.createElement("span");
    container.className = "asset-view " + (className || "");
    container.dataset.asset = name;
    container.style.setProperty("--asset-width", asset.width + "px");
    container.style.setProperty("--asset-height", asset.height + "px");
    container.setAttribute("role", "img");
    container.setAttribute("aria-label", alt || name);

    const image = document.createElement("img");
    image.src = asset.file;
    image.alt = alt || "";
    image.width = asset.width;
    image.height = asset.height;
    image.draggable = false;
    image.addEventListener("error", function () {
      container.classList.add("asset-view--missing");
      container.replaceChildren();
      const placeholder = document.createElement("span");
      placeholder.className = "asset-placeholder";
      placeholder.textContent = "ЛИПСВАЩО ИЗОБРАЖЕНИЕ · " + asset.label.toLocaleUpperCase("bg");
      container.append(placeholder);
    }, { once: true });
    container.append(image);
    return container;
  }

  function applySprite(element, name) {
    const asset = assets[name];
    if (!asset) throw new Error("Unknown museum sprite: " + name);

    element.style.setProperty("--sprite-frame-width", asset.frameWidth + "px");
    element.style.setProperty("--sprite-frame-height", asset.frameHeight + "px");
    element.style.setProperty("--sprite-frames", asset.frames);
    const image = new Image();
    image.addEventListener("load", function () {
      element.style.backgroundImage = "url('" + asset.file + "')";
      element.style.backgroundSize = asset.width + "px " + asset.height + "px";
      element.classList.add("player-sprite--loaded");
    }, { once: true });
    image.addEventListener("error", function () {
      element.classList.add("player-sprite--missing");
    }, { once: true });
    image.src = asset.file;
  }

  museum.Assets = { definitions: assets, createImage: createImage, applySprite: applySprite };
}(window.GraphicMuseum));
