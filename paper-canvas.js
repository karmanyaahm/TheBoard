
class PaperCanvas {
    constructor() {
        this.css_id = "paper";
        this.displayPaths = [];
        this.dispPath = null;
    }
    init() {
        // Get a reference to the canvas object
        var canvas = document.getElementById('paper');
        // Create an empty project and a view for the canvas:
        paper.setup(canvas);
    }
    offset(offset_delta) {
        paper.view.center = paper.view.center.subtract(offset_delta.divide(paper.view.zoom));
    }
    resetOffset() {
        this.setOffset(new paper.Point(0, 0));
    }
    setOffset(offset) {
        paper.view.center = offset;
    }
    getZoom() {
        return paper.view.zoom;
    }
    zoom(factor, zoomOrigin) {
        if (zoomOrigin === null) {
            paper.view.scale(factor)
        } else {
            var zoomOriProj = paper.view.viewToProject(zoomOrigin);
            paper.view.scale(factor, zoomOriProj);
        }
    }
    setZoom(zoom, zoomOrigin = paper.view.center) {
        var currentViewCenter = paper.view.center;
        var zoomOriProj = paper.view.viewToProject(zoomOrigin);
        paper.view.center = zoomOriProj;
        var scale = paper.view.zoom;
        paper.view.zoom = zoom;
        paper.view.center = currentViewCenter;
    }
    resetZoom() {
        this.setZoom(1);
    }

    asyncAddPathV2(pos, points, color) {
        // TODO make async animation using dash
        this.addPathV2(points, color, [pos, [0, 0]]);
    }

    addPathV2(segments, color, strokeWidth, [pos, size]) {
        var p = new paper.Path(segments);
        p.strokeColor = color;
        p.strokeWidth = strokeWidth;
        p.strokeCap = "round";
        // p.moveTo(new paper.Point(points[0][1], points[0][2]));
        // for (let i = 1; i < points.length; i++) {
        //     p.lineTo(new paper.Point(points[i][1], points[i][2]));
        // }
    }
    addPathV1(points, color, [pos, size]) {
        var p = new paper.Path();
        p.strokeColor = color;
        p.strokeWidth = 2;
        p.strokeCap = "round";
        p.moveTo(new paper.Point(points[0][1], points[0][2]));
        for (let i = 1; i < points.length; i++) {
            p.lineTo(new paper.Point(points[i][1], points[i][2]));
        }
    }
    drawSegmentDisplay(segment_points, color) {
        if (this.dispPath === null) {
            this.dispPath = new paper.Path(segment_points.map((p) => { return [p[1], p[2]] }));
            this.dispPath.strokeColor = color;
            this.dispPath.strokeWidth = 2;
            this.dispPath.strokeCap = "round"
        }else{
            this.dispPath.lineTo(new paper.Point(segment_points[1][1], segment_points[1][2]));
        }
        // var p = new paper.Path(segment_points.map((p)=>{return [p[1],p[2]]}));
        // p.strokeColor = color;
        // p.strokeWidth = segment_points[0][3];
        // this.displayPaths.push(p);
    }
    updateDisplay() {
        if(this.dispPath !== null){
            this.dispPath.remove();
            this.dispPath = null;
        }
        this.displayPaths.forEach((p) => { p.remove() });
        // for(p of this.displayPaths){
        //     p.remove();
        // }
    }
    clear() {
        var length = paper.project.activeLayer.removeChildren();
        console.log("removed ", length, " items")
    }
    drawBoundingBox(box) {
        console.log("drawBoundingBox not implemented for paper-canvas")
    }
    reload(animated = false) {
        this.clear();
        var starttime = Date.now();
        console.log("!! Paper Canvas redraw START");
        objectStore.allSorted().forEach(obj => {
            if (obj.type == "p.whiteboard.object") {
                drawEvent(obj, animated, animated);
            }
        });
        console.log("!! Paper Canvas redraw DONE in", Date.now() - starttime);
    }
    getTransformedPointer(x, y) {
        return paper.view.viewToProject(new paper.Point(x, y))
    }
}