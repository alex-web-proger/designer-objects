//**************************************************************
//                Запомнить очередное изменение               //
//**************************************************************
function pushToHistory(state) {

    // Удаляем всё "вперёд", если мы откатились назад
    if (historyPointer < history.length - 1) {
        history = history.slice(0, historyPointer + 1);
    }

    // поместить состояние в массив изменений
    historyPointer++;
    history.push(JSON.stringify(state));
    updateUndoRedoButtons();
}

//*************************************************************
//                Прверка истории изменений                  //
//*************************************************************
function canUndo() {
    return historyPointer > 0;
}

function canRedo() {
    return historyPointer < history.length - 1;
}

function undo() {
    if (!canUndo()) return;
    historyPointer--;
    document.getElementById('x1').innerHTML = historyPointer;
    loadState(JSON.parse(history[historyPointer]));
    updateUndoRedoButtons();
}

function redo() {
    if (!canRedo()) return;
    historyPointer++;
    loadState(JSON.parse(history[historyPointer]));
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undo');
    const redoBtn = document.getElementById('redo');

    if (canUndo()) {
        undoBtn.classList.remove("disabled");
    } else {
        undoBtn.classList.add("disabled");
    }

    if (canRedo()) {
        redoBtn.classList.remove("disabled");
    } else {
        redoBtn.classList.add("disabled");
    }
}

function initHistoryWithState(state) {
    history = [JSON.stringify(state)];
    historyPointer = 0;
    updateUndoRedoButtons();
}

// ------------  Перемещение по истории изменений  -----------
document.getElementById('undo').onclick = undo;
document.getElementById('redo').onclick = redo;

//  ----------- Инициализация стека истории  ----------------------
initHistoryWithState(serializeState());
