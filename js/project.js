//***************************************************************
//        Сохранить рабочее поле как отдельный проект          //
//***************************************************************
function saveCurrentProjectAs(name) {
    const id = crypto.randomUUID(); // 📌 UUID
    const saved = JSON.parse(localStorage.getItem("savedProjects") || "{}");
    saved[id] = {
        id,
        name,
        timestamp: Date.now(),
        data: serializeState()
    };
    localStorage.setItem("savedProjects", JSON.stringify(saved));
    alert("Проект сохранён!");
}

//***************************************************************
//   Загрузить на рабочее поле проект из хранилища по его ID   //
//***************************************************************
function loadProject(id) {
    const saved = JSON.parse(localStorage.getItem("savedProjects") || "{}");
    if (saved[id]) {
        loadState(saved[id].data);
        currentProjectId = id;
    }
}

//***************************************************************
//           Удалить проект из хранилища по его ID             //
//***************************************************************
function deleteProject(id) {
    const saved = JSON.parse(localStorage.getItem("savedProjects") || "{}");
    delete saved[id];
    localStorage.setItem("savedProjects", JSON.stringify(saved));
}

//*************************************************************
//                   Сохранить имя проекта                   //
//*************************************************************
document.getElementById("saveProject").onclick = () => {
    const name = prompt("Введите имя проекта:");
    if (name) saveCurrentProjectAs(name);
};

//**************************************************************
//               Загрузить проект из списка                   //
//**************************************************************
document.getElementById("loadProject").onclick = () => {
    const saved = JSON.parse(localStorage.getItem("savedProjects") || "{}");
    const keys = Object.keys(saved);
    if (keys.length === 0) {
        alert("Нет сохранённых проектов");
        return;
    }
    const menu = keys.map((k, i) => `${i + 1}. ${saved[k].name}`).join("\n");
    const choice = prompt(`Выберите номер проекта:\n${menu}`);
    const index = parseInt(choice);
    if (!isNaN(index) && index > 0 && index <= keys.length) {
        loadProject(keys[index - 1]);
    }
};

//*************************************************************
//                Удалить проект из списка                   //
//*************************************************************
document.getElementById("deleteProject").onclick = () => {
    const saved = JSON.parse(localStorage.getItem("savedProjects") || "{}");
    const keys = Object.keys(saved);
    if (keys.length === 0) {
        alert("Нет проектов для удаления");
        return;
    }
    const menu = keys.map((k, i) => `${i + 1}. ${saved[k].name}`).join("\n");
    const choice = prompt(`Удалить проект:\n${menu}`);
    const index = parseInt(choice);
    if (!isNaN(index) && index > 0 && index <= keys.length) {
        if (confirm("Точно удалить?")) {
            deleteProject(keys[index - 1]);
            alert("Проект удалён");
        }
    }
};