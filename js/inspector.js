const inspector = {

    container: document.getElementById("inspector"),
    selectedBlock: null, // для подсветки
    selectedItem: null,

    clear() {
        this.container.replaceChildren();
        if (this.selectedBlock) {
            // сброс подсветки
            this.selectedBlock.style.boxShadow = "2px 2px 6px rgba(0,0,0,0.1)";
            this.selectedBlock = null;
        }
    },

    show(block) {

        if (!block) return;

        // подсветка блока на рабочем поле и скролл к нему
        this.highlightBlock(block);

        // убрать выделение модели в инспекторе
        let select = document.querySelector('.model-list .selected');
        if(select) {
            select.classList.remove('selected');
            select.style.background = "transparent";
        }

        const id = block.dataset.id;
        let li = document.querySelector(`.model-list [data-id="${id}"]`);
        if (li) {
            li.classList.add('selected');
            li.style.background = '#f0f0f0';
            this.selectedItem = li;
        }
    },

    showProperties(block) {

        this.clear();

        if (!block) return;

        this.selectedBlock = block;

        this.highlightBlock(block);

        // === новый заголовок через шаблон ===
        const template = document.getElementById("inspector-title-template");
        const node = template.content.cloneNode(true);

        const titleEl = node.querySelector(".title-text");
        const backBtn = node.querySelector(".back-btn");

        titleEl.textContent = block.querySelector(".title")?.innerText || "Модель";

        backBtn.addEventListener("click", () => {
            const blocks = Array.from(document.querySelectorAll(".block"));
            inspector.showModelList(blocks);
        });

        this.container.appendChild(node);

        // === дальше идёт отрисовка полей ===
        const fieldsList = block.querySelectorAll(".fields li");
        if (fieldsList.length > 0) {
            const ul = document.createElement("ul");
            ul.style.listStyle = "none";
            ul.style.padding = 0;
            ul.style.margin = 0;

            fieldsList.forEach(li => {
                const name = li.querySelector("span:nth-child(1)")?.innerText;
                const type = li.querySelector("span:nth-child(2)")?.innerText;
                const item = document.createElement("li");
                item.style.display = "flex";
                item.style.justifyContent = "space-between";
                item.style.padding = "2px 5px";
                item.innerHTML = `<span>${name}</span><span>${type}</span>`;
                item.style.cursor = "pointer";
                item.classList.add('no-select');
                item.addEventListener("mouseenter", () => item.style.background = "#f0f0f0");
                item.addEventListener("mouseleave", () => item.style.background = "transparent");
                ul.appendChild(item);
            });

            this.container.appendChild(ul);
        } else {
            const empty = document.createElement("p");
            empty.textContent = "Нет полей";
            empty.style.color = "#888";
            this.container.appendChild(empty);
        }
    },

    showModelList() {
        let blocks = Array.from(canvasEl.querySelectorAll(".block"));

        this.clear();

        // === новый заголовок через шаблон ===
        const template = document.getElementById("inspector-model-list");
        const node = template.content.cloneNode(true);

        this.container.appendChild(node);


        if (!blocks || blocks.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "Пока нет моделей";
            empty.style.color = "#888";
            this.container.appendChild(empty);
            return;
        }

        const list = document.createElement("ul");
        list.style.listStyle = "none";
        list.style.padding = 0;
        list.style.margin = 0;
        list.classList.add('model-list');

        blocks = [...blocks].sort((a, b) =>
            a.title.localeCompare(b.title, 'en', {sensitivity: 'base'})
        );

        blocks.forEach(block => {
            const li = document.createElement("li");
            li.textContent = block.querySelector(".title")?.innerText || "Без имени";
            li.style.padding = "5px 8px";
            li.style.cursor = "pointer";
            li.classList.add('no-select');
            li.dataset.id = block.dataset.id;

            let clickTimeout;

            li.addEventListener("click", () => {

                clearTimeout(clickTimeout);
                clickTimeout = setTimeout(() => {
                    // одиночный клик — подсветка и скролл
                    this.highlightBlock(block);
                }, 250);
                // Снимаем выделение с предыдущего
                if (this.selectedItem && this.selectedItem !== li) {
                    this.selectedItem.classList.remove('selected');
                    this.selectedItem.style.background = "transparent";
                }
                li.classList.add('selected');
                this.selectedItem = li;
            });

            li.addEventListener("dblclick", () => {
                clearTimeout(clickTimeout);
                // двойной клик — показать свойства
                this.showProperties(block);
            });

            li.addEventListener("mouseenter", () => {
                if (this.selectedItem != li) li.style.background = "#f0f0f0";
            });
            li.addEventListener("mouseleave", () => {
                if (this.selectedItem != li) li.style.background = "transparent";
            });
            list.appendChild(li);
        });

        this.container.appendChild(list);
    },

    highlightBlock(block) {
        if (this.selectedBlock && this.selectedBlock !== block) {
            this.selectedBlock.style.boxShadow = "2px 2px 6px rgba(0,0,0,0.1)";
        }
        this.selectedBlock = block;
        block.style.boxShadow = "0 0 0 4px rgba(0,123,255,0.3), 2px 2px 6px rgba(0,0,0,0.1)";
        this.scrollToBlock(block);
    },

    scrollToBlock(block) {
        const canvasRect = canvas.getBoundingClientRect();
        const blockRect = block.getBoundingClientRect();
        const workspace = document.getElementById("workspace");

        const offsetX = blockRect.left - canvasRect.left;
        const offsetY = blockRect.top - canvasRect.top;

        if (offsetX < workspace.scrollLeft || offsetX > workspace.scrollLeft + workspace.clientWidth) {
            workspace.scrollLeft = offsetX - workspace.clientWidth / 2 + blockRect.width / 2;
        }
        if (offsetY < workspace.scrollTop || offsetY > workspace.scrollTop + workspace.clientHeight) {
            workspace.scrollTop = offsetY - workspace.clientHeight / 2 + blockRect.height / 2;
        }
    }
};

const canvasEl = document.getElementById("canvas");

canvasEl.addEventListener("click", (e) => {
    const target = e.target;

    // Клик на блок → игнорируем
    if (target.closest(".block")) {
        inspector.show(target.closest(".block"))
        return;
    }

    // Клик на линию → игнорируем
    if (target.closest("path")) {
        return;
    }

    // Клик по пустому фону канвы
    inspector.showModelList();
});
