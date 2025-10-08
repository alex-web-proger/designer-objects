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

// вспомогательная функция для генерации UUID
function generateUUID() {
    // простой вариант UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}