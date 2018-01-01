import { Injectable } from '@angular/core';
import {CanvasService} from './canvas.service';

declare var fabric: any;

@Injectable()
export class CropzoneService {

  constructor(private canvas: CanvasService, private cropzone: CropzoneService) { }

  rect: any;
  dragging= false;
  initiated= false;
  minHeight= 25;
  minWidth= 25;
  lastScaleX;
  lastScaleY;
  overlay;
  grid;
  mousex;
  mousey;
  line1;
  line2;
  line3;
  line4;
  topRect;
  rightRect;
  bottomRect;
  leftRect;


  setWidth(width) {
    if ( ! width) return;

    width = parseInt(width);

    if (width < this.minWidth) {
      width = this.minWidth;
    }

    if (width > this.canvas.originalWidth) {
      width = this.canvas.originalWidth - 25;
    }

    this.rect.width = width;
    this.rect.setTop((this.canvas.originalHeight - this.rect.getHeight()) / 2);
    this.rect.setLeft((this.canvas.originalWidth - this.rect.getWidth()) / 2);
    this.rect.setCoords();
    this.drawGrid();
    this.drawOverlay();
    this.canvas.fabric.renderAll();
  };

  setHeight(height) {
    if ( ! height) return;

    height = parseInt(height);

    if (height < this.minHeight) {
      height = this.minHeight;
    }

    if (height > this.canvas.originalHeight) {
      height = this.canvas.originalHeight - 25;
    }

    this.rect.height = height;
    this.rect.setTop((this.canvas.originalHeight - this.rect.getHeight()) / 2);
    this.rect.setLeft((this.canvas.originalWidth - this.rect.getWidth()) / 2);
    this.rect.setCoords();
    this.drawGrid();
    this.drawOverlay();
    this.canvas.fabric.renderAll();
  };

  add() {
    this.drawMainZone();
    this.drawOverlay();
    this.drawGrid();
    this.attachEvents();

    this.canvas.fabric.renderAll();

    this.initiated = true;

    //$rootScope.$emit('cropzone.added');
  };

  constrainWithinCanvas(object) {
    let x = object.getLeft(), y = object.getTop();
    let w = object.getWidth(), h = object.getHeight();
    let maxX = this.canvas.originalWidth - w;
    let maxY = this.canvas.originalHeight - h;

    if (x < 0) {
      object.set('left', 0);
    }
    if (y < 0) {
      object.set('top', 0);
    }
    if (x > maxX) {
      object.set('left', maxX);
    }
    if (y > maxY) {
      object.set('top', maxY);
    }
  };
  constrainWithinCanvasOnScaling(object) {

    let minX = object.getLeft();
    let minY = object.getTop();
    let maxX = object.getLeft() + object.getWidth();
    let maxY = object.getTop() + object.getHeight();

    if (minX < 0 || maxX > this.canvas.originalWidth) {
      let lastScaleX = this.lastScaleX || 1;
      object.setScaleX(lastScaleX);
    }

    if (minX < 0) {
      object.setLeft(0);
    }

    if (minY < 0 || maxY > this.canvas.originalHeight) {
      let lastScaleY = this.lastScaleY || 1;
      object.setScaleY(lastScaleY);
    }

    if (minY < 0) {
      object.setTop(0);
    }

    if (object.getWidth() < this.minWidth) {
      object.width = this.minWidth;
      object.setScaleX(1);
    }

    if (object.getHeight() < this.minHeight) {
      object.height = this.minHeight;
      object.setScaleY(1);
    }

    this.lastScaleX = object.getScaleX();
    this.lastScaleY = object.getScaleY();
  };

  onMouseDown(event) {
    if (event.target && (event.target.name === 'cropzone' || event.target.name === 'crop.grid')) return;

    this.cropzone.dragging = true;

    //hide cropzone on single click on overlay
    this.cropzone.overlay.visible = false;
    this.cropzone.grid.visible = false;
    this.cropzone.rect.visible = false;

    //start position for drawing a cropzone
    this.cropzone.rect.left = event.e.pageX - this.canvas.fabric._offset.left;
    this.cropzone.rect.top = event.e.pageY - this.canvas.fabric._offset.top;

    //make sure cropzone scale is 1 for accurate coordinates
    this.cropzone.rect.scale(1);
    this.cropzone.overlay.scale(1);
    this.cropzone.grid.scale(1);
    this.cropzone.mousex = event.e.pageX;
    this.cropzone.mousey = event.e.pageY;

    //prevent selection of objects while dragging
    this.canvas.fabric.selection = false;

    this.cropzone.drawOverlay();
  };

  onMouseMove(event) {
    if ( ! this.cropzone.dragging) return;

    let width  = event.e.pageX - this.cropzone.mousex,
      height = event.e.pageY - this.cropzone.mousey;

    //prevent cropzone going over the right edge
    if (this.canvas.offset.left + this.canvas.originalWidth < event.e.pageX) {
      width = (this.canvas.offset.left + this.canvas.originalWidth) - this.cropzone.mousex;
    }

    //left edge
    if (this.canvas.offset.left > event.e.pageX) {
      width = this.canvas.offset.left - this.cropzone.mousex;
    }

    //bottom edge
    if (this.canvas.offset.top + this.canvas.originalHeight < event.e.pageY) {
      height = (this.canvas.offset.top + this.canvas.originalHeight) - this.cropzone.mousey;
    }

    //top edge
    if (this.canvas.offset.top > event.e.pageY) {
      height = this.canvas.offset.top - this.cropzone.mousey;
    }

    this.cropzone.rect.width = width;
    this.cropzone.rect.height = height;
    this.cropzone.rect.moveTo(3);
    this.cropzone.rect.setCoords();
    this.cropzone.drawOverlay();
    this.cropzone.drawGrid();

    if ( ! this.cropzone.rect.visible) {
      this.cropzone.rect.visible = true;
      this.cropzone.overlay.visible = true;
      this.cropzone.grid.visible = true;
    }
  };

  onMouseUp() {
    this.cropzone.dragging = false;
    this.canvas.fabric.selection = true;
    this.cropzone.rect.setCoords();
    this.cropzone.grid.setCoords();
    this.cropzone.overlay.setCoords();

    if (this.cropzone.rect.visible) {
      this.canvas.fabric.setActiveObject(this.cropzone.rect);
    }
  };

  attachEvents() {

    //redraw cropzone grid and overlay when cropzone is resized
    this.rect.on('moving', function() {
      this.cropzone.constrainWithinCanvas(this.cropzone.rect);
      this.cropzone.drawOverlay();
      this.cropzone.drawGrid();
    });

    this.rect.on('scaling', function(e) {
      this.cropzone.constrainWithinCanvasOnScaling(this.cropzone.rect, e);
      this.cropzone.drawOverlay();
      this.cropzone.drawGrid();
    });

    this.canvas.fabric.on("mouse:down", this.cropzone.onMouseDown);
    this.canvas.fabric.on("mouse:move", this.cropzone.onMouseMove);
    this.canvas.fabric.on("mouse:up", this.cropzone.onMouseUp);
  };

  remove() {
    this.canvas.fabric.off("mouse:down", this.cropzone.onMouseDown);
    this.canvas.fabric.off("mouse:move", this.cropzone.onMouseMove);
    this.canvas.fabric.off("mouse:up", this.cropzone.onMouseUp);

    this.canvas.fabric.remove(this.rect);
    this.canvas.fabric.remove(this.grid);
    this.canvas.fabric.remove(this.overlay);
    this.canvas.fabric.renderAll();
    this.initiated = false;
  };

  hide() {
    this.rect.visible = false;
    this.rect.hasControls = false;
    this.grid.visible = false;
    this.overlay.visible = false;
  };

  getOptimalDimensions () {
    let width = this.canvas.originalWidth / 2,
      height = this.canvas.originalHeight / 2,
      left = this.canvas.originalWidth / 4,
      top = this.canvas.originalHeight / 4;

    if (this.canvas.viewport.offsetWidth < this.canvas.originalWidth) {
      width = this.canvas.viewport.offsetWidth / 2;
      left = this.canvas.viewport.offsetWidth / 4;

    }

    if (this.canvas.viewport.offsetHeight < this.canvas.originalHeight) {
      height = this.canvas.viewport.offsetHeight / 2;
      top = this.canvas.viewport.offsetHeight / 4;
    }

    return {width: width, height: height, left: left, top: top};
  };

  drawMainZone() {
    let dimensions = this.getOptimalDimensions();

    this.rect = new fabric.Rect({
      fill: 'transparent',
      stroke: 'rgba(255, 255, 255, 0.6)',
      hasBorders: false,
      width: dimensions.width,
      height: dimensions.height,
      left: dimensions.left,
      top: dimensions.top,
      hasRotatingPoint: false,
      name: 'cropzone',
      cornerColor: 'rgba(255, 255, 255, 0.6)',
      transparentCorners: false,
      ignore: true
    });

    this.canvas.fabric.add(this.rect);
    this.rect.moveTo(3);
    this.canvas.fabric.setActiveObject(this.cropzone.rect);
  };

  drawGrid() {

    if ( ! this.initiated) {
      this.line1 = new fabric.Line([], { stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 1, selectable: false, evented: false });
      this.line2 = new fabric.Line([], { stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 1, selectable: false, evented: false });
      this.line3 = new fabric.Line([], { stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 1, selectable: false, evented: false });
      this.line4 = new fabric.Line([], { stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 1, selectable: false, evented: false });
      this.grid = new fabric.Group([this.line1, this.line2, this.line3, this.line4]);
      this.grid.originY = 'left';
      this.grid.originX = 'top';
      this.grid.ignore = true;
      this.grid.selectable = false;
      this.canvas.fabric.add(this.grid);
      this.grid.moveTo(10);
    }

    this.grid.width = this.rect.getWidth();
    this.grid.height = this.rect.getHeight();
    this.grid.left = this.rect.getLeft();
    this.grid.top = this.rect.getTop();

    let width  = this.cropzone.rect.getWidth() / 3,
      height = this.cropzone.rect.getHeight() / 3;

    this.line1.set({
      x1: width,
      y1: 0,
      x2: width,
      y2: this.cropzone.grid.getHeight(),
    });

    this.line2.set({
      x1: width * 2,
      y1: 0,
      x2: width * 2,
      y2: this.cropzone.grid.getHeight()
    });

    this.line3.set({
      x1: 0,
      y1: height,
      x2: this.cropzone.grid.getWidth(),
      y2: height
    });

    this.line4.set({
      x1: 0,
      y1: height * 2,
      x2: this.cropzone.grid.getWidth(),
      y2: height * 2
    });

    this.constrainWithinCanvas(this.grid);
  };

  drawOverlay() {

    if ( ! this.initiated) {
      this.topRect = new fabric.Rect({fill: 'rgba(0,0,0,0.7)', selectable: true, evented: false});
      this.rightRect = new fabric.Rect({fill: 'rgba(0,0,0,0.7)', selectable: true, evented: false});
      this.bottomRect = new fabric.Rect({fill: 'rgba(0,0,0,0.7)', selectable: true, evented: false});
      this.leftRect = new fabric.Rect({fill: 'rgba(0,0,0,0.7)', selectable: true, evented: false});
      this.overlay = new fabric.Group([this.topRect, this.rightRect, this.bottomRect, this.leftRect]);
      this.overlay.ignore = true;
      this.overlay.name = 'grid.overlay';
      this.canvas.fabric.add(this.overlay);
      this.overlay.moveTo(1);
    }

    this.topRect.set({
      left: 0,
      top: 0,
      width: this.canvas.originalWidth,
      height: this.rect.getHeight() < 0 ? this.rect.getTop() - Math.abs(this.rect.getHeight()) : this.rect.getTop(),
    });

    this.rightRect.set({
      left: this.rect.getWidth() < 0 ? this.rect.getLeft() : this.rect.getLeft() + this.rect.getWidth(),
      top: this.rect.getTop(),
      width: this.rect.getWidth() < 0 ? this.canvas.originalWidth - (this.rect.getLeft() + this.rect.getWidth()) - Math.abs(this.rect.getWidth()) : this.canvas.originalWidth - (this.rect.getLeft() + this.rect.getWidth()),
      height: this.rect.getHeight(),
    });

    this.bottomRect.set({
      left: 0,
      top: this.rect.getHeight() < 0 ? this.rect.getTop() : this.rect.getTop() + this.rect.getHeight(),
      width: this.canvas.originalWidth,
      height: this.rect.getHeight() < 0 ? this.canvas.originalHeight - (this.rect.getTop()) : this.canvas.originalHeight - (this.rect.getTop() + this.rect.getHeight()),
    });

    this.leftRect.set({
      left: 0,
      top: this.rect.getTop(),
      width: this.rect.getWidth() > 0 ? this.rect.getLeft() : this.rect.getLeft() - Math.abs(this.rect.getWidth()),
      height: this.rect.getHeight(),
    });
  };
}
