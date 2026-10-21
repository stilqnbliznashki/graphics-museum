(function (museum) {
    "use strict";
    museum.fileSizes = [
        {
            title: "Plane gif",
            items: [
                { name: "gif", sizeKB: 1500, notes: "" },
                { name: "webp", sizeKB: 1220, notes: "" },
            ]
        },
        {
            title: "Bird png",
            items: [
                { name: "png", sizeKB: 96, notes: "Original" },
                { name: "tiff", sizeKB: 107, notes: "Със компресия. Без отделяне на слоевете. freeconvert.com" },
                { name: "tiff", sizeKB: 1900, notes: "Без компресия. Без отделяне на слоевете. freeconvert.com" },
                { name: "jpg", sizeKB: 33, notes: "Без прозрачност. cloudconvert.com/png-converter" },
                { name: "webp", sizeKB: 13, notes: "Без прозрачност. cloudconvert.com" },
                { name: "bmp", sizeKB: 1975, notes: "freeconvert.com" },
            ]
        },
        {
            title: "Woman SVG",
            items: [
                { name: "svg", sizeKB: 340, notes: "Original" },
                { name: "ai", sizeKB: 314, notes: "convertio.co" },
                { name: "eps", sizeKB: 297, notes: "Загуба? jumpshare.com convertio.co" },
                { name: "dxf", sizeKB: 1152, notes: "След обратно конвертиране към svg файлът стана празна снимка с размер 216 байта. convertio.co" },
                { name: "pdf", sizeKB: 111, notes: "Загуба на прозрачността. convertio.co" },
            ]
        },
    ];
}(window.GraphicMuseum));