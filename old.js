const workspace = document.getElementById('workspace');
const canvas = document.getElementById('canvas');
const svg = document.getElementById('connections');

const blocks = {
    A: {
        el: document.getElementById('blockA'),
        x: 100,
        y: 100
    },
    B: {
        el: document.getElementById('blockB'),
        x: 500,
        y: 400
    }
};

// создаём линию между A и B
const connection = {
    from: blocks.A,
    to: blocks.B,
    path: createSVGPath()
};

function createSVGPath() {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    svg.appendChild(path);
    return path;
}

function updateSVGSize() {
    svg.setAttribute("width", canvas.offsetWidth);
    svg.setAttribute("height", canvas.offsetHeight);
    svg.setAttribute("viewBox", `0 0 ${canvas.offsetWidth} ${canvas.offsetHeight}`);
}

function updateConnection(conn) {
    const from = conn.from;
    const to = conn.to;

    const x1 = from.x + from.el.offsetWidth / 2;
    const y1 = from.y + from.el.offsetHeight / 2;

    const x2 = to.x + to.el.offsetWidth / 2;
    const y2 = to.y + to.el.offsetHeight / 2;

    const d = `M${x1},${y1} L${x2},${y2}`;
    conn.path.setAttribute("d", d);
}

// начальная отрисовка
updateSVGSize();
updateConnection(connection);

// drag
Object.values(blocks).forEach(block => {
    let isDragging = false;
    let startX, startY;

    block.el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        block.el.style.cursor = 'grabbing';
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        block.x += dx;
        block.y += dy;

        block.el.style.left = block.x + "px";
        block.el.style.top = block.y + "px";

        startX = e.clientX;
        startY = e.clientY;

        // === Авторасширение canvas ===
        const padding = 200;
        const blockRight = block.x + block.el.offsetWidth;
        const blockBottom = block.y + block.el.offsetHeight;

        let resized = false;
        if (blockRight + padding > canvas.offsetWidth) {
            canvas.style.width = (blockRight + padding) + "px";
            resized = true;
        }
        if (blockBottom + padding > canvas.offsetHeight) {
            canvas.style.height = (blockBottom + padding) + "px";
            resized = true;
        }
        if (resized) {
            updateSVGSize();
        }

        updateConnection(connection);
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            block.el.style.cursor = 'grab';
        }
    });
});

workspace.addEventListener("scroll", () => {
    updateConnection(connection);
});