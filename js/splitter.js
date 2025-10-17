document.getElementById('splitter').addEventListener('mousedown', e => {
    const work = document.getElementById('workspace');
    const inspector = document.getElementById('inspector');
    e.preventDefault();
    const startX = e.clientX;
    const startWorkspaceWidth = work.offsetWidth;
    const startInspectorWidth = inspector.offsetWidth;

    function onMouseMove(ev) {
        const dx = ev.clientX - startX;
        const newWorkspaceWidth = startWorkspaceWidth + dx;
        const newInspectorWidth = startInspectorWidth - dx;
        if (newWorkspaceWidth < 100 || newInspectorWidth < 200) return; // минимальные размеры
        work.style.flex = '0 0 ' + newWorkspaceWidth + 'px';
        inspector.style.width = newInspectorWidth + 'px';
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});
