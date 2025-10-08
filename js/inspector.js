
const inspector = {

    container: document.getElementById("inspector"),
    selectedBlock: null, // для подсветки

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

        // подсветка блока и скролл к нему
        this.highlightBlock(block);
    },

    showProperties(block) {
        this.clear();
        if (!block) return;

        this.selectedBlock = block;

        // Подсветка блока серой рамкой
        block.style.boxShadow = "0 0 0 3px rgba(128,128,128,0.6), 2px 2px 6px rgba(0,0,0,0.1)";

        // Скроллим к блоку
        this.scrollToBlock(block);

        // Заголовок модели
        const title = document.createElement("h3");
        title.textContent = block.querySelector(".title")?.innerText || "Модель";
        this.container.appendChild(title);

        // Список полей
        const fieldsList = block.querySelectorAll(".fields li");
        if (fieldsList.length > 0) {
            const fieldsHeader = document.createElement("h4");
            fieldsHeader.textContent = "Поля:";
            fieldsHeader.style.marginTop = "10px";
            this.container.appendChild(fieldsHeader);

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
                item.style.cursor = "default";
                item.innerHTML = `<span>${name}</span><span>${type}</span>`;
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

    showModelList(blocks) {
        this.clear();

        const header = document.createElement("h3");
        header.textContent = "Все модели";
        this.container.appendChild(header);

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

        blocks.forEach(block => {
            const li = document.createElement("li");
            li.textContent = block.querySelector(".title")?.innerText || "Без имени";
            li.style.padding = "5px 8px";
            li.style.cursor = "pointer";

            let clickTimeout;

            li.addEventListener("click", () => {
                clearTimeout(clickTimeout);
                clickTimeout = setTimeout(() => {
                    // одиночный клик — подсветка и скролл
                    this.highlightBlock(block);
                }, 250);
            });

            li.addEventListener("dblclick", () => {
                clearTimeout(clickTimeout);
                // двойной клик — показать свойства
                this.showProperties(block);
            });

            li.addEventListener("mouseenter", () => li.style.background = "#f0f0f0");
            li.addEventListener("mouseleave", () => li.style.background = "transparent");
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
            workspace.scrollLeft = offsetX - workspace.clientWidth/2 + blockRect.width/2;
        }
        if (offsetY < workspace.scrollTop || offsetY > workspace.scrollTop + workspace.clientHeight) {
            workspace.scrollTop = offsetY - workspace.clientHeight/2 + blockRect.height/2;
        }
    }
};

const canvasEl = document.getElementById("canvas");
const connectionsEl = document.getElementById("connections");

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
    const blocks = Array.from(canvasEl.querySelectorAll(".block"));
    inspector.showModelList(blocks);
});