// ------------------- Сохранение/восстановление -------------------

function saveState(){
    const blocks = [...workspace.querySelectorAll(".block")].map(b=>{
        return {
            title:b.querySelector(".title").textContent,
            top:parseInt(b.style.top),
            left:parseInt(b.style.left),
            fields:[...b.querySelectorAll(".fields li")].map(li=>{
                const spans = li.querySelectorAll("span");
                return spans[0].textContent+" "+spans[1].textContent;
            })
        };
    });
    localStorage.setItem("designerState",JSON.stringify(blocks));
}

function loadState(){
    const data = localStorage.getItem("designerState");
    if(data){ JSON.parse(data).forEach(b=>createBlock(b)); }
    loadConnections();
}