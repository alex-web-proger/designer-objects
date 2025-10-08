//***************************************************************
//                  Таблица и привязка к ней                   //
//***************************************************************
function applyGridSettings() {
    let btnToggleGrid = document.getElementById("toggleGrid");
    let btnToggleSnap = document.getElementById("toggleSnap");

    if (showGrid) {
        canvas.classList.add("grid-visible");
        btnToggleGrid.classList.add("active");
    }
    else {
        canvas.classList.remove("grid-visible");
        btnToggleGrid.classList.remove("active");
    }

    if (snapToGrid) {
        btnToggleSnap.classList.add("active");
    }
    else {
        btnToggleSnap.classList.remove("active");
    }

}

document.getElementById("toggleGrid").addEventListener("click", () => {
    showGrid = !showGrid;
    localStorage.setItem("showGrid", showGrid);
    applyGridSettings();
});

document.getElementById("toggleSnap").addEventListener("click", () => {
    snapToGrid = !snapToGrid;
    localStorage.setItem("snapToGrid", snapToGrid);
    applyGridSettings();
});
