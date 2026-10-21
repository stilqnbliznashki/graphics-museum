(function (museum) {
  "use strict";

  function create(dialog, closeButton) {
    let previousFocus = null;

    function setText(selector, value) {
      dialog.querySelector(selector).textContent = value;
    }

    function setList(selector, entries) {
      const list = dialog.querySelector(selector);
      list.replaceChildren();
      entries.forEach(function (entry) {
        const item = document.createElement("li");
        item.textContent = entry;
        list.append(item);
      });
    }

    function open(format, trigger) {
      previousFocus = trigger || document.activeElement;
      const art = dialog.querySelector(".dialog-art");
      art.replaceChildren(museum.Assets.createImage(format.id + "Exhibit", "modal-exhibit-art", "Илюстрация за " + format.name));
      dialog.dataset.type = format.type;
      setText("[data-dialog-type]", museum.labels.types[format.type]);
      setText("#dialog-title", format.name);
      setText(".dialog-extension", format.extensions.join(" · "));
      setText('[data-field="year"]', String(format.year));
      setText('[data-field="creator"]', format.creator);
      setText('[data-field="compression"]', museum.labels.compression[format.compression]);
      setText('[data-field="transparency"]', format.transparency ? museum.labels.yes : museum.labels.no);
      setText('[data-field="animation"]', format.animation ? museum.labels.yes : museum.labels.no);
      setText('[data-field="usedFor"]', format.usedFor);
      setText('[data-field="funFact"]', format.funFact);
      setList('[data-list="pros"]', format.pros);
      setList('[data-list="cons"]', format.cons);
      dialog.querySelector(".verify-note").hidden = !format.verify;
      if (!dialog.open) dialog.showModal();
      closeButton.focus();
    }

    function close() {
      if (dialog.open) dialog.close();
    }

    dialog.addEventListener("close", function () {
      if (previousFocus && document.contains(previousFocus)) previousFocus.focus();
      previousFocus = null;
    });
    closeButton.addEventListener("click", close);

    return { open: open, close: close, isOpen: function () { return dialog.open; } };
  }

  museum.Modal = { create: create };
}(window.GraphicMuseum));
