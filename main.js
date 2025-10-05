const workspace = document.getElementById("workspace");
const addBtn = document.getElementById("addBlock");
const svgContainer = document.getElementById("connections");
let objects = [];
let blockCounter = 0;
let connections = []; // связи между полями
let connecting = null;
let tempLine = null;

// ------------------- Функции для имен -------------------
function toModelName(name) {
    name = name.replace(/[^a-zA-Z0-9\s_]/g, "").trim();
    const parts = name.split(/[\s_]+/);
    const camel = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join("");
    return camel || "Model";
}

function isUniqueName(name, currentBlock = null) {
    const allTitles = Array.from(document.querySelectorAll(".block .title"))
        .filter(t => t !== currentBlock)
        .map(t => t.innerText.trim());
    return !allTitles.includes(name.trim());
}

function getUniqueDefaultName(base = "Model") {
    base = toModelName(base);
    let name = base, suffix = 1;
    while (!isUniqueName(name)) {
        name = base + '_' + suffix++;
    }
    return name;
}

// ------------------- Редактирование заголовка -------------------
function enableEditing(titleEl) {
    const currentText = titleEl.innerText;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.className = "title-input";
    titleEl.replaceWith(input);
    input.focus();
    input.addEventListener("blur", () => finishEditing(input));
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") finishEditing(input);
    });
}

function finishEditing(input) {
    let newName = toModelName(input.value);
    let suffix = 1, baseName = newName;
    while (!isUniqueName(newName, input)) {
        newName = `${baseName}${suffix++}`;
    }
    const newTitle = document.createElement("div");
    newTitle.className = "title";
    newTitle.innerText = newName;
    input.replaceWith(newTitle);
    let header = newTitle.parentElement;
    header.ondblclick = () => enableEditing(newTitle);
    saveState();
}

// ------------------- Создание блока -------------------
function createBlock(data = null) {
    blockCounter++;
    const block = document.createElement("div");
    block.className = "block";
    block.style.top = (data?.top || 50) + "px";
    block.style.left = (data?.left || 50) + "px";
    const uniqueName = getUniqueDefaultName("Model");
    block.innerHTML = `
      <div class="block-header">
        <span class="title">${data?.title || uniqueName}</span>
        <span class="delete-block">×</span>
      </div>
      <ul class="fields">
        ${(data?.fields || ["id INT", "name VARCHAR"]).map(f => {
        const [name, type] = f.split(" ");
        return `<li data-field-name="${name}"><span>${name}</span><span>${type}</span></li>`;
    }).join("")}
      </ul>
      <button class="add-field">+ Добавить поле</button>
    `;

    workspace.appendChild(block);

    objects.push({
        el: block,
        x: block.offsetLeft,
        y: block.offsetTop
    })

    let title = block.querySelector(".title");
    title.title = "Для редактирования имени - двойной клик";
    block.querySelector(".delete-block").onclick = () => {
        block.remove();
        saveState();
    };
    block.querySelector(".add-field").onclick = () => {
        const li = document.createElement("li");
        li.innerHTML = "<span>new_field</span><span>INT</span>";
        block.querySelector(".fields").appendChild(li);
        attachFieldEvents(li);
        saveState();
    };
    title.parentElement.ondblclick = () => enableEditing(title);

    // ------------------- Перетаскивание блока -------------------
    let header = block.querySelector(".block-header");

    header.onmousedown = e => {
        if (e.shiftKey) {
            startFieldConnection(block, e); // Shift для соединения полей
        } else {
            startDragging(block, e);
        }
    };

    [...block.querySelectorAll("li")].forEach(attachFieldEvents);

    saveState();
}

// ------------------- Перетаскивание -------------------
function startDragging(block, e) {
    const startX = e.clientX, startY = e.clientY;
    const startLeft = block.offsetLeft, startTop = block.offsetTop;

    function onMouseMove(ev) {
        let newLeft = Math.max(startLeft + (ev.clientX - startX), 0);
        let newTop = Math.max(startTop + (ev.clientY - startY), 0);
        block.style.left = newLeft + "px";
        block.style.top = newTop + "px";
        updateAllConnections();
    }

    document.addEventListener("mousemove", onMouseMove);
    document.onmouseup = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.onmouseup = null;
        saveState();
    };
}

// ------------------- События полей для соединения -------------------
function attachFieldEvents(li) {
    li.onmousedown = e => {
        if (e.shiftKey) {
            startFieldConnection(li, e);
            e.preventDefault();
        }
    };
}

// ------------------- Начало соединения поля -------------------
function startFieldConnection(li, e) {
    connecting = li;
    tempLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempLine.setAttribute("stroke", "gray");
    tempLine.setAttribute("stroke-width", "1");
    tempLine.setAttribute("fill", "none");
    tempLine.setAttribute("stroke-dasharray", "5,5");
    svgContainer.appendChild(tempLine);
    document.addEventListener("mousemove", onTempLineMoveField); // рисуем временную линию
    document.addEventListener("mouseup", onTempLineEndField);    // кнопка отпущена - фиксируем результат
}

// ------------------- Временная линия -------------------
function onTempLineMoveField(e) {
    if (!connecting) return;
    const a = connecting.getBoundingClientRect();
    const ws = workspace.getBoundingClientRect();
    const x1 = a.right - ws.left;
    const y1 = a.top + a.height / 2 - ws.top;
    const x2 = e.clientX - ws.left;
    const y2 = e.clientY - ws.top;
    const midX = (x1 + x2) / 2;
    tempLine.setAttribute("d", `M${x1},${y1} L${midX},${y1} L${midX},${y2} L${x2},${y2}`);
}

// ------------------- Завершение соединения -------------------
function onTempLineEndField(e) {
    if (!connecting) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const targetLi = target.closest("li");
    if (targetLi && targetLi !== connecting) {
        connectFields(connecting, targetLi);
    }
    tempLine.remove();
    tempLine = null;
    connecting = null;
    document.removeEventListener("mousemove", onTempLineMoveField);
    document.removeEventListener("mouseup", onTempLineEndField);
}


// ------------------- Создание постоянной линии -------------------
function connectFields(fromLi, toLi, type = "one-to-many") {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", "gray");
    path.setAttribute("stroke-width", "1");
    path.setAttribute("fill", "none");
    path.setAttribute("marker-start", "url(#many-start)");
    path.setAttribute("marker-end", "url(#many)");
    svgContainer.appendChild(path);

    // хит-зона — невидимая линия для удобного наведения
    const hitPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hitPath.setAttribute("stroke", "transparent");
    hitPath.setAttribute("stroke-width", "8"); // удобная зона
    hitPath.setAttribute("fill", "none");
    hitPath.setAttribute("pointer-events", "stroke"); // чтобы ловила события
    svgContainer.appendChild(hitPath);

    // удаление связи по клику
    path.addEventListener("click", () => {
        if (confirm("Удалить связь?")) {
            const idx = connections.findIndex(c => c.path === path);
            if (idx !== -1) {
                connections[idx].path.remove();         // убрать из DOM
                connections.splice(idx, 1);  // убрать из массива
                saveConnections();                      // обновить хранилище
            }
        }
    });

    hitPath.addEventListener("mouseenter", () => {
        path.setAttribute("stroke", "#666");
        path.setAttribute("stroke-width", "2")
    });
    hitPath.addEventListener("mouseleave", () => {
        path.setAttribute("stroke", "gray");
        path.setAttribute("stroke-width", "1")
    });

    const rel = {from: fromLi, to: toLi, path, hitPath};
    connections.push(rel);

    updateConnection(rel);

    saveConnections();
}

// ------------------- Обновление линии -------------------
function updateConnection(rel) {
    const a = rel.from.getBoundingClientRect();
    const b = rel.to.getBoundingClientRect();
    const ws = workspace.getBoundingClientRect();
    const svg = document.getElementById('connections');

    const scrollWidth = ws.scrollWidth;
    const scrollHeight = ws.scrollHeight;
    svg.setAttribute('width', scrollWidth);
    svg.setAttribute('height', scrollHeight);
    svg.setAttribute('viewBox', `0 0 ${scrollWidth} ${scrollHeight}`); // 💥 КЛЮЧ!

    const x1 = a.right - ws.left + 0;
    const y1 = a.top + a.height / 2 - ws.top;
    const x2 = b.left;
    const y2 = b.top + b.height / 2 - ws.top;

    document.getElementById('x1').innerHTML = svg.getBoundingClientRect().width;
    document.getElementById('x2').innerHTML = x2;
    document.getElementById('x3').innerHTML = workspace.scrollWidth;

    const verticalOffset = Math.abs(y2 - y1) / 2;
    const points = [];

    points.push([x1, y1]);

    if (x2 > x1 && ((x2 - x1) > 35)) {
        // цель справа — прямой горизонтальный сегмент
        const midX = (x1 + x2) / 2;
        points.push([midX, y1]);
        points.push([midX, y2]);
    } else {
        // цель слева — ступенька
        const midX1 = x1 + 30;
        points.push([midX1, y1]);
        const midY = y1 < y2 ? y1 + verticalOffset : y1 - verticalOffset;
        points.push([midX1, midY]);
        const midX2 = x2 - 30;
        points.push([midX2, midY]);
        points.push([midX2, y2]);
    }

    points.push([x2, y2]);
    const d = points.map((p, i) => (i === 0 ? "M" : "L") + p[0] + "," + p[1]).join(" ");
    rel.path.setAttribute("d", d);
    rel.hitPath.setAttribute("d", d);
}

// ------------------- Обновление всех линий -------------------
function updateAllConnections() {
    connections.forEach(updateConnection);
}

function loadConnections() {
    const data = localStorage.getItem("designerConnections");
    if (!data) return;

    const saved = JSON.parse(data);

    saved.forEach(rel => {
        const fromBlock = [...workspace.querySelectorAll(".block")].find(b =>
            b.querySelector(".title").textContent === rel.fromBlock
        );
        const toBlock = [...workspace.querySelectorAll(".block")].find(b =>
            b.querySelector(".title").textContent === rel.toBlock
        );
        if (!fromBlock || !toBlock) return;

        const fromField = [...fromBlock.querySelectorAll("li")].find(li => li.dataset.fieldName === rel.fromField);
        const toField = [...toBlock.querySelectorAll("li")].find(li => li.dataset.fieldName === rel.toField);

        if (!fromField || !toField) return;

        connectFields(fromField, toField);
    });
}


function saveConnections() {
    const data = connections.map(rel => {
        return {
            fromBlock: rel.from.parentElement.parentElement.querySelector(".title").textContent,
            fromField: rel.from.dataset.fieldName,  // назначаем каждому li поле data-field-name
            toBlock: rel.to.parentElement.parentElement.querySelector(".title").textContent,
            toField: rel.to.dataset.fieldName
        };
    });
    localStorage.setItem("designerConnections", JSON.stringify(data));
}

// ------------------- Кнопка добавить -------------------
addBtn.onclick = () => {
    createBlock();
    saveState();
};

loadState();
