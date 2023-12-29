const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img")
let messageTextArea2 = document.getElementById("messages")

let isDrawingAllowed = false;

document.title = "Draw INETE";

if(canvas!=null)
{
    ctx = canvas.getContext("2d");
}


// global variables with default value
let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 5,
selectedColor = "#000";


const fillColorCheckedChanged = ()=>{

    if(isDrawingAllowed) // user changing
    {
        socket.emit("fillColorCheckedChanged")
    } else{
        fillColor.checked = !fillColor.checked
    }   
}
fillColor.addEventListener("click",fillColorCheckedChanged);


const setCanvasBackground = () => {
    // setting whole canvas background to white, so the downloaded img background will be white
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // setting fillstyle back to the selectedColor, it'll be the brush color
}

window.addEventListener("load", () => {
    // setting canvas width/height.. offsetwidth/height returns viewable width/height of an element
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

const drawRect = (drawData) => {

    // if fillColor isn't checked draw a rect with border else draw rect with background
    if(!fillColor.checked) {
        // creating circle according to the mouse pointer
        return ctx.strokeRect(drawData.posX, drawData.posY, prevMouseX - drawData.posX, prevMouseY - drawData.posY);
    }
    ctx.fillRect(drawData.posX, drawData.posY, prevMouseX - drawData.posX, prevMouseY - drawData.posY);
}

const drawCircle = (drawData) => {
    ctx.beginPath(); // creating new path to draw circle
    // getting radius for circle according to the mouse pointer
    let radius = Math.sqrt(Math.pow((prevMouseX - drawData.posX), 2) + Math.pow((drawData.posY - drawData.offsetY), 2));
    ctx.arc(prevMouseX, drawData.posY, radius, 0, 2 * Math.PI); // creating circle according to the mouse pointer
    fillColor.checked ? ctx.fill() : ctx.stroke(); // if fillColor is checked fill circle else draw border circle
}

const drawTriangle = (drawData) => {
    ctx.beginPath(); // creating new path to draw circle
    ctx.moveTo(prevMouseX, prevMouseY); // moving triangle to the mouse pointer
    ctx.lineTo(drawData.posX, drawData.posY); // creating first line according to the mouse pointer
    ctx.lineTo(prevMouseX * 2 - drawData.posX, drawData.posY); // creating bottom line of triangle
    ctx.closePath(); // closing path of a triangle so the third line draw automatically
    fillColor.checked ? ctx.fill() : ctx.stroke(); // if fillColor is checked fill triangle else draw border
}

socket.on("drawing_allowed", (word) => {

    console.log("allowed");
    messageTextArea2.innerHTML += `<p style="color: darkgreen;">«JC BOT» - ${word.word} </p>`;
    isDrawingAllowed = true;

    document.getElementById("word").style.display = "block"
    document.getElementById("word").innerText = "Word: " + word.word
});

socket.on("user_ended_turn", ()=>{

    isDrawingAllowed = false;
    
    document.getElementById("word").style.display = "none"
})

socket.on("ended_turn",()=>{
    // reset values
  
    selectedTool = "brush"
    brushWidth = 5
    selectedColor = "#000"
    fillColor.checked = false
    
})

const startDraw = (e) => {

    console.log(isDrawingAllowed)
    if (isDrawingAllowed) {
        // Drawing logic
        socket.emit("startDrawClient",{
            posX:e.offsetX,
            posY:e.offsetY,
            brushWidth,
            selectedColor,
            canva:e
        })
      }
}

socket.on("fillColorCheckedChanged",()=>{
    
        fillColor.checked = !fillColor.checked
    
})

socket.on("startDrawServer",(socketData)=>{

    isDrawing = true;
    prevMouseX = socketData.posX; // passing current mouseX position as prevMouseX value
    prevMouseY = socketData.posY; // passing current mouseY position as prevMouseY value

    ctx.beginPath(); // creating new path to draw
    ctx.lineWidth = socketData.brushWidth; // passing brushSize as line width
    ctx.strokeStyle = socketData.selectedColor; // passing selectedColor as stroke style

    ctx.fillStyle = socketData.selectedColor; // passing selectedColor as fill style

    ctx.fillStyle = socketData.selectedColor; // passing selectedColor as fill styles

    // copying canvas data & passing as snapshot value.. this avoids dragging the image
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

})

const drawing = (e) => {

    if (isDrawingAllowed){
        socket.emit("drawingClient", {
            posX:e.offsetX, posY:e.offsetY
            ,
            canva:e,
            offsetY:e.offsetY,
            offsetX:e.offsetX
        })
    }
    
    
}


socket.on("changeToolServer",(btnId)=>{

    console.log("tool changed");
    document.querySelector(".options .active").classList.remove("active");
    document.getElementById(btnId).classList.add("active");
    selectedTool = btnId
})

socket.on("drawingServer",(drawData)=>{

    if(!isDrawing) return; // if isDrawing is false return from here
    ctx.putImageData(snapshot, 0, 0); // adding copied canvas data on to this canvas

    
    if(selectedTool === "brush" || selectedTool === "eraser") {
        // if selected tool is eraser then set strokeStyle to white 
        // to paint white color on to the existing canvas content else set the stroke color to selected color
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(drawData.posX, drawData.posY); // creating line according to the mouse pointer

        ctx.stroke(); // drawing/filling line with color

    } else if(selectedTool === "rectangle"){
        
        drawRect(drawData);
      
    } else if(selectedTool === "circle"){
        drawCircle(drawData);
    } else {
        drawTriangle(drawData);
    }
})

socket.on("clearCanvaServer",()=>{

    
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clearing whole canvas
    
    setCanvasBackground();
})

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => { // adding click event to all tool option
        // removing active class from the previous option and adding on current clicked option
        if(isDrawingAllowed)
        {
            socket.emit("changeToolClient",btn.id)
        }

    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value); // passing slider value as brushSize

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => { // adding click event to all color button
        // removing selected class from the previous option and adding on current clicked option
        if(isDrawingAllowed)
        {
            document.querySelector(".options .selected").classList.remove("selected");
            btn.classList.add("selected");
            // passing selected btn background color as selectedColor value
            selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
            socket.emit('colorChanged',selectedColor);
        }        
    });
});

colorPicker.addEventListener("change", () => {
    if(isDrawingAllowed)
    {
    // passing picked color value from color picker to last color btn background
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
    }
});

clearCanvas.addEventListener("click", () => {
    if(isDrawingAllowed)
    {
    socket.emit("clearCanvaClient")
    }
});

saveImg.addEventListener("click", () => {
    const link = document.createElement("a"); // creating <a> element
    link.download = `${Date.now()}.jpg`; // passing current date as link download value
    link.href = canvas.toDataURL(); // passing canvasData as link href value
    link.click(); // clicking link to download image
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => {
   if(isDrawingAllowed)
    {
        socket.emit("mouseUpClient") 
    }
});

function disableScroll() {
    // Get the current page scroll position
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,

        // if any scroll is attempted, set this to the previous value
        window.onscroll = function() {
            window.scrollTo(scrollLeft, scrollTop);
        };
}

function enableScroll() {
    window.onscroll = function() {};
}
function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top
    };
  }

canvas.addEventListener("touchstart", function (e) {
    disableScroll()
    mousePos = getTouchPos(canvas, e);
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("touchend", function (e) {
    enableScroll()
    var mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("touchmove", function (e) {
    disableScroll()
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}, false);

// Desabilita o botão direito do mouse
document.addEventListener("contextmenu", function(e){
    window.alert('Cant do that hehe')
    e.preventDefault();
}, false);

// Desabilita a tecla F12
document.addEventListener("keydown", function(e) {
    if (e.keyCode == 123) {
        window.alert('Cant do that hehe')
        e.preventDefault();
    }
}, false);

socket.on("mouseUpServer",()=>{
    isDrawing = false
})

socket.on("colorChanged",(color)=>{
         selectedColor = color;
})


