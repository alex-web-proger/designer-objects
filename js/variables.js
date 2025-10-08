const svgContainer = document.getElementById("connections");
const canvas = document.getElementById('canvas');
let connecting = null;
let tempLine = null;
let connections = [];

// Глобальные переменные
let currentProjectId = null;
let zoomLevel = 1;
const zoomStep = 0.1;

const gridSize = 20;

// === История изменений для Undo/Redo ===
let history = [];
let historyPointer = -1;

let showGrid = localStorage.getItem("showGrid") === "true";
let snapToGrid = localStorage.getItem("snapToGrid") === "true";