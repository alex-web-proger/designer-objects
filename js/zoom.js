//  ----------------- Управление зумом  ----------------------
let zoomReset = document.getElementById('zoomReset');
let zoomIn = document.getElementById('zoomIn');
let zoomOut = document.getElementById('zoomOut');

//************************************************************
//              Управление кнопкой сброса зума              //
//************************************************************
function btnZoomReset() {
    if (zoomLevel == 1) zoomReset.classList.add("disabled");
    else zoomReset.classList.remove("disabled");
}

function btnZoomIn() {
    if (zoomLevel > 1.4) zoomIn.classList.add("disabled");
    else zoomIn.classList.remove("disabled");
}

function btnZoomOut() {
    if (zoomLevel < 0.6) zoomOut.classList.add("disabled");
    else zoomOut.classList.remove("disabled");
}

function applyZoom() {
    canvas.style.transform = `scale(${zoomLevel})`;
    canvas.style.transformOrigin = '0 0';
    btnZoomReset();
    btnZoomIn();
    btnZoomOut();
}

document.getElementById('zoomIn').onclick = () => {
    if(zoomLevel < 1.4) {
        zoomLevel += zoomStep;
        applyZoom();
    }
};

document.getElementById('zoomOut').onclick = () => {
    if(zoomLevel > 0.6) {
        zoomLevel = Math.max(zoomStep, zoomLevel - zoomStep);
        applyZoom();
    }
};

document.getElementById('zoomReset').onclick = () => {
    zoomLevel = 1;
    applyZoom();
};

//***************************************************************
//                         Зум колесиком                       //
//***************************************************************
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;

document.getElementById("workspace").addEventListener("wheel", function (e) {
    if (!e.ctrlKey) return;

    e.preventDefault();

    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.1 : 0.9;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel * factor));

    if (newZoom === zoomLevel) return;
    zoomLevel = newZoom;
    applyZoom();

}, { passive: false });
