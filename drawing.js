
// var cache_canvas = document.createElement('canvas');
// cache_canvas.width = 3000;
// cache_canvas.height = 8000;
// var cache_ctx = cache_canvas.getContext("2d");
var cache_canvas = new UnlimitedCanvas();
var setting_grid = "";
var display_canvas;
var display_ctx;



// TODO depracate this value
// canvasOffset = [0, 0];


function update_canvasOffset(delta) {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    ctx.translate(delta[0], delta[1]);
    updateDisplayCanvas()
}
function update_canvasZoom(factor, originX, originY) {
    let ctx = display_ctx;
    let pt = getTransformedPointer(originX, originY);
    ctx.translate(pt.x, pt.y);

    ctx.scale(factor, factor);
    let t = ctx.getTransform();
    t.a = Math.min(t.a, 1.2);
    t.d = Math.min(t.a, 1.2);
    t.a = Math.max(t.a, 0.2);
    t.d = Math.max(t.a, 0.2);
    ctx.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);

    ctx.translate(-pt.x, -pt.y);
    updateDisplayCanvas()
}
function resetCanvasOffset() {
    // canvasOffset = [0,0];
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    ctx.resetTransform();
    updateDisplayCanvas();
}
function resetCanvasZoom() {
    let ctx = display_ctx;
    let pt = getTransformedPointer(canvas.width / 2, canvas.height / 2);
    ctx.translate(pt.x, pt.y);
    let t = ctx.getTransform();
    t.a = 1;
    t.d = 1;
    ctx.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
    ctx.translate(-pt.x, -pt.y);
    updateDisplayCanvas()
}
function drawEvent(event, animated, updateDisplay = true, bounding_box = false) {
    if (event.content.objtype == "p.path") {
        let points = pathStringToArray(event.content.path, event.content.objpos);
        if (animated) {
            asyncDrawPath(points, event.content.objcolor);
        } else {
            if(bounding_box){
                let pos = (event.content.objpos || "0 0").split(" ");
                let size = (event.content.objsize || "1000 1000").split(" ");
                cache_ctx.beginPath();
                cache_ctx.strokeStyle = "#EE111180";
                cache_ctx.lineWidth = 1;
                cache_ctx.rect(parseInt(pos[0]),parseInt(pos[1]),parseInt(size[0]),parseInt(size[1]));
                cache_ctx.stroke();
            }
            drawPath(cache_ctx, points, event.content.objcolor);
            if (updateDisplay) { updateDisplayCanvas(true); }
        }
    }
}
// function drawEventLive(event, offset, animated) {
//     if (event.content.objtype == "p.path") {
//         let points = pathStringToArray(event.content.path, event.content.objpos, offset);
//         if (animated) {
//             asyncDrawPath(cache_ctx, points, event.content.objcolor);
//         } else {
//             drawPath(cache_ctx, context, points, event.content.objcolor);

//         }  
//     }
// }
function drawPath(context, points, color) {
    // const canvas = document.getElementById("canvas");
    // const ctx = canvas.getContext("2d");
    let ctx = context;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let p = 1; p < points.length; p++) {
        ctx.moveTo(points[p - 1][1], points[p - 1][2]);
        ctx.strokeStyle = color;
        ctx.lineWidth = points[p][3];
        ctx.lineTo(points[p][1], points[p][2]);
    }
    ctx.stroke();
}

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
}
async function asyncDrawPath(points, color) {
    for (let p = 1; p < points.length; p++) {
        // let ctx = canvas.getContext("2d");
        // let ctx = context;
        // ctx.lineCap = "round";
        drawSegmentDisplay([points[p - 1], points[p]], color);
        drawSegment(cache_ctx, [points[p - 1], points[p]], color);
        // const canvas = document.getElementById("canvas");
        // console.log("going to wait for " + points[p][0]);
        // ctx.beginPath();
        // ctx.moveTo(points[p-1][1], points[p-1][2]);
        // ctx.strokeStyle = color;
        // ctx.lineWidth = points[p][3];
        // ctx.lineTo(points[p][1], points[p][2]);
        // ctx.stroke();
        let a = await sleep(points[p][0]);
        // console.log("after");
    }
    updateDisplayCanvas(true);
}

function drawSegment(ctx, segment_points, color) {

    ctx.beginPath();
    ctx.moveTo(segment_points[0][1], segment_points[0][2]);
    ctx.strokeStyle = color;
    ctx.lineWidth = segment_points[1][3];
    ctx.lineTo(segment_points[1][1], segment_points[1][2]);
    ctx.stroke();
}
function drawSegmentDisplay(segment_points, color) {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    drawSegment(ctx, segment_points, color);
}
function drawGrid(ctx, grid, size, gridsize, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    if (grid === "dots") {
        let radius = 3;
        let xcount = size[0] / gridsize;
        let ycount = size[1] / gridsize;
        ctx.beginPath();
        for (i = 0; i < xcount; i++) {
            for (j = 0; j < ycount; j++) {
                ctx.moveTo(i * gridsize, j * gridsize);
                ctx.ellipse(i * gridsize, j * gridsize, radius, radius, 0, 0, Math.PI * 2);
            }
        }
        ctx.fill();
    }
    if (grid === "squares") {
        let xcount = size[0] / gridsize;
        let ycount = size[1] / gridsize;
        ctx.beginPath();
        for (i = 0; i < xcount; i++) {
            ctx.moveTo(i * gridsize, 0);
            ctx.lineTo(i * gridsize, size[1]);
        }
        for (j = 0; j < ycount; j++) {
            ctx.moveTo(0, j * gridsize);
            ctx.lineTo(size[0], j * gridsize);
        }
        ctx.stroke();
    }
}
var DRAW_BOUNDING_BOX = false;
function reloadCacheCanvas(animated = false) {
    cache_canvas.reload();
}
// function reloadCacheCanvas(animated = false) {
//     cache_ctx.fillStyle = "#eee";
//     cache_ctx.fillRect(0, 0, cache_canvas.width, cache_canvas.height);
//     cache_ctx.clearRect(3, 3, cache_canvas.width - 6, cache_canvas.height - 6);
//     drawGrid(cache_ctx, setting_grid, [cache_canvas.width, cache_canvas.height], 50, cache_ctx.fillStyle)
//     console.log("!! Cache Canvas redraw START");
//     let starttime = Date.now()
//     objectStore.allSorted().forEach(obj => {
//         if (obj.type == "p.whiteboard.object") {
//             drawEvent(obj, animated, animated, DRAW_BOUNDING_BOX);
//         }
//     });
//     console.log("!! Cache Canvas redraw DONE in", Date.now() - starttime);
// }


function updateDisplayCanvas(clear = true) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    if (clear) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
    for(c of cache_canvas.getKeys()){
        ctx.drawImage(cache_canvas.canvasChunks[c], c[0], c[1]);
    }
}

// function updateDisplayCanvas(clear = true) {
//     const canvas = document.getElementById("canvas");
//     const ctx = canvas.getContext("2d");
//     if (clear) {
//         ctx.save();
//         ctx.setTransform(1, 0, 0, 1, 0, 0);
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.restore();
//     }
//     ctx.drawImage(cache_canvas, 0, 0);
// }

// OLD!!
// function reloadCanvas(animated = false) {
//     const canvas = document.getElementById("canvas");
//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     objectStore.all().forEach(obj => {
//         if (obj.type == "p.whiteboard.object") {
//             console.log(obj.type);
//             drawEvent(obj, canvasOffset, animated);
//         }
//     });
// }

// only for button...
// function clearDisplayCanvas() {
//     const canvas = document.getElementById("canvas");
//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
// }
function onResize(entries) {
    let target;
    let w;
    let h;
    for (const entry of entries) {
        let width;
        let height;
        let dpr = window.devicePixelRatio;
        if (entry.devicePixelContentBoxSize) {
            // NOTE: Only this path gives the correct answer
            // The other paths are imperfect fallbacks
            // for browsers that don't provide anyway to do this
            width = entry.devicePixelContentBoxSize[0].inlineSize;
            height = entry.devicePixelContentBoxSize[0].blockSize;
            dpr = 1; // it's already in width and height
        } else if (entry.contentBoxSize) {
            if (entry.contentBoxSize[0]) {
                width = entry.contentBoxSize[0].inlineSize;
                height = entry.contentBoxSize[0].blockSize;
            } else {
                width = entry.contentBoxSize.inlineSize;
                height = entry.contentBoxSize.blockSize;
            }
        } else {
            width = entry.contentRect.width;
            height = entry.contentRect.height;
        }
        w = Math.round(width * dpr);
        h = Math.round(height * dpr);
        target = entry.target;
    }
    if (target == display_canvas){
        let t = display_ctx.getTransform();
        display_canvas.width = w;
        display_canvas.height = h;
        display_ctx.setTransform(t);
        updateDisplayCanvas();
    }
}
function init_drawing() {
    display_canvas = document.getElementById('canvas');
    display_ctx = display_canvas.getContext("2d");
    display_ctx.imageSmoothingEnabled = true;
    const resizeObserver = new ResizeObserver(onResize);
    try {
      resizeObserver.observe(canvas, {box: 'device-pixel-content-box'});
    } catch (ex) {
      resizeObserver.observe(canvas, {box: 'content-box'});
    }
}