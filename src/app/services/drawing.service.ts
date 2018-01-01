import { Injectable } from '@angular/core';
import {CanvasService} from './canvas.service';
import {DataService} from './data.service';

declare var fabric: any;

@Injectable()
export class DrawingService {

  constructor(private canvas: CanvasService, private dataService: DataService) { }

  availableBrushes= ['pencil', 'vLine', 'diamond', 'hLine', 'circle', 'square', 'spray'];
  defaultBrushName= 'pencil';
  activeBrushName= false;
  isEnabled= false;
  shadow;
  VLineBrush;
  color;
  DiamondBrush;
  HLineBrush;
  SquareBrush;

  params: {
    shadowColor: '#1E89E6',
    brushWidth: 9,
    brushColor: '#000',
    shadowBlur: 30,
    shadowOffsetX: 10,
    shadowOffsetY: 10,
    enableShadow: false
  };

  enable() {
    this.canvas.fabric.isDrawingMode = true;
    this.changeBrush(this.defaultBrushName);

    if ( ! this.shadow) {
      this.shadow = new fabric.Shadow({
        color: this.params.shadowColor,
        blur: this.params.shadowBlur,
        offsetX: this.params.shadowOffsetX,
        offsetY: this.params.shadowOffsetY
      });
    }

    this.isEnabled = true;
  };

  disable() {
    this.canvas.fabric.isDrawingMode = false;
    this.isEnabled = false;
  };

  setShadowProperty(name, value) {
    if (this.canvas.fabric.freeDrawingBrush.shadow[name]) {
      this.canvas.fabric.freeDrawingBrush.shadow[name] = value;
    }
  };

  setProperty(name, value) {
    if (this.canvas.fabric.freeDrawingBrush[name]) {
      this.canvas.fabric.freeDrawingBrush[name] = value;
    }
  };

  toggleShadow(on) {
    if (on) {
      this.canvas.fabric.freeDrawingBrush.shadow = this.shadow;
    } else {
      this.shadow = this.canvas.fabric.freeDrawingBrush.shadow;
      this.canvas.fabric.freeDrawingBrush.shadow = undefined;
    }
  };

  changeBrush(name) {
    this.activeBrushName = name;
    name = this.makeBrushName(name);

    //check if it's a base fabric brush
    if (fabric[name]) {
      this.canvas.fabric.freeDrawingBrush = new fabric[name](this.canvas.fabric);

      //check if it's a custom brush that we have already made
    } else if (this[name]) {
      this.canvas.fabric.freeDrawingBrush = this[name];

      //check if we can make a request brush
    } else if (this['make'+name]) {
      this.canvas.fabric.freeDrawingBrush = this['make'+name]();
    }

    this.canvas.fabric.freeDrawingBrush.width  = this.params.brushWidth;
    this.canvas.fabric.freeDrawingBrush.color  = this.params.brushColor;

    if (this.params.enableShadow) {
      this.canvas.fabric.freeDrawingBrush.shadow = this.shadow;
    }
  };

  /**
   * Compile a fabric brush function name from given name.
   *
   * @param name (pencil)
   * @returns string (PencilBrush)
   */
  makeBrushName(name) {
    return name.charAt(0).toUpperCase()+name.slice(1) + 'Brush';
  };

  makeVLineBrush() {
    let $this = this;
    this.VLineBrush = new fabric.PatternBrush(this.canvas.fabric);
    this.VLineBrush.getPatternSrc = function() {

      let patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 10;
      let ctx = patternCanvas.getContext('2d');

      ctx.strokeStyle = $this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };

    return this.VLineBrush;
  };

  makeDiamondBrush () {
    this.DiamondBrush = new fabric.PatternBrush(this.canvas.fabric);
    this.DiamondBrush.getPatternSrc = function() {

      let squareWidth = 10, squareDistance = 5;
      let patternCanvas = fabric.document.createElement('canvas');
      let rect = new fabric.Rect({
        width: squareWidth,
        height: squareWidth,
        angle: 45,
        fill: this.color
      });

      let canvasWidth = rect.getBoundingRectWidth();

      patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
      rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

      let ctx = patternCanvas.getContext('2d');
      rect.render(ctx);

      return patternCanvas;
    };

    return this.DiamondBrush;
  };

  makeHLineBrush () {
    let $this = this;
    this.HLineBrush = new fabric.PatternBrush(this.canvas.fabric);
    this.HLineBrush.getPatternSrc = function() {

      let patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 10;
      let ctx = patternCanvas.getContext('2d');

      ctx.strokeStyle = $this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(5, 10);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };

    return this.HLineBrush;
  };

  makeSquareBrush () {
    let $this = this;
    this.SquareBrush = new fabric.PatternBrush(this.canvas.fabric);

    this.SquareBrush.getPatternSrc = function() {
      let squareWidth = 10, squareDistance = 2;

      let patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
      let ctx = patternCanvas.getContext('2d');

      ctx.fillStyle = $this.color;
      ctx.fillRect(0, 0, squareWidth, squareWidth);

      return patternCanvas;
    };

    return this.SquareBrush;
  };
}
