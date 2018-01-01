import {EventEmitter, Injectable, Output} from '@angular/core';
import {DataService} from './data.service';
import {KeybindsService} from './keybinds.service';
import {WindowRef} from '../utility/window-ref';

declare var $: any;

@Injectable()
export class CanvasService {

  constructor(private dataService: DataService, private keybinds: KeybindsService, private windowRef: WindowRef) { }

  @Output() canvasInit = new EventEmitter();
  @Output() canvasOpenedNew = new EventEmitter();

  originalWidth;
  originalHeight;
  window = this.windowRef.nativeWindow;
  windowWidth = this.window.innerWidth;
  windowHeight = this.window.innerHeight;

  //store window width and height so we don't execute
  //functions unnecessarily on resize event if they didn't change
  oldWindowDimensionsWidth = this.window.windowWidth;
  oldWindowDimensionsHeight = this.window.windowHeight;

  mainImage: any = false;
  fabric: any =  false;
  ctx = false;
  container = false;
  viewport: any;
  offset: any;
  element: any;

  minWidth = 50;
  minHeight = 50;

  imageStatic: {
    locked: true,
    selectable: false,
    evented: false,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    lockUniScaling: true,
    hasControls: false,
    hasBorders: false
  };

  destroy() {
    this.fabric.dispose();
    this.mainImage = false;
    this.fabric = false;
    this.ctx = false;
    this.container = false;
    this.viewport = false;
    this.offset = false;
    this.element = false;
    this.currentZoom = 1;
    this.dataService.editorCustomActions = {};
    $(this.window).off('resize');
    this.keybinds.destroy();
  };

  start(url) {
    this.element = document.getElementById('canvas');
    this.fabric = new this.fabric.Canvas('canvas');
    this.ctx = this.fabric.getContext('2d');
    this.container = $('.canvas-container');
    this.viewport = document.getElementById('viewport');
    this.dataService.editorCustomActions = {};

    this.fabric.selection = false;
    this.fabric.renderOnAddRemove = false;

    this.fabric.borderColor = '#2196F3';
    this.fabric.cornerColor = '#2196F3';
    this.fabric.transparentCorners = false;

    if (!url) {
      url = this.dataService.getParam('url');
    }

    if (url) {
      this.loadMainImage(url);
      this.dataService.started = true;
    } else if (this.dataService.getParam('blankCanvasSize')) {
      let size = this.dataService.getParam('blankCanvasSize');
      this.openNew(size.width, size.height, 'newCanvas');
      this.dataService.started = true;
    }

    // if ( !this.dataService.started && !this.dataService.isIntegrationMode && ! this.dataService.delayEditorStart) {
    //   $mdDialog.show({
    //     template: $('#main-image-upload-dialog-template').html(),
    //     controller: 'TopPanelController',
    //     clickOutsideToClose: false
    //   });
    // }

    $(this.window).off('resize').on('resize', function(e) {
      if (this.oldWindowDimensionsHeight !== e.target.innerHeight ||
        this.oldWindowDimensionsWidth !== e.target.innerWidth) {
        this.fitToScreen();
      }

      this.oldWindowDimensionsWidth = e.target.innerWidth;
      this.oldWindowDimensionsHeight = e.target.innerHeight;
    });

    this.canvasInit.emit( {value: 'canvas.init'});

    this.keybinds.init(this.fabric);

    if (this.dataService.getParam('onLoad')) {
      this.dataService.getParam('onLoad')(this.viewport, this, this.window);
    }
  };

  hideModals () {
    // $mdDialog.hide();
  };

  mergeObjects () {
    this.zoom(1);
    this.fabric.deactivateAll();
    let data = this.fabric.toDataURL();
    this.fabric.clear();
    this.loadMainImage(data);
  };

  loadFromJSON (design, callback) {
    this.fabric.loadFromJSON(design.serialized_editor_state || design.state, function() {
      this.fabric.forEachObject(function(obj) {

        //reapply any filters object used to have
        if (obj.applyFilters && obj.filters.length) {
          obj.applyFilters(this.fabric.renderAll.bind(this.fabric));
        }

        //assign new reference to mainImage property
        if (obj.name == 'mainImage') {
          this.mainImage = obj;
        }
      });

      if (design.width && design.height) {
        this.fabric.setWidth(design.width);
        this.fabric.setHeight(design.height);
        this.originalHeight = design.height;
        this.originalWidth = design.width;
      }

      this.fabric.renderAll();
      this.fabric.calcOffset();
      this.fitToScreen();
      this.dataService.$emit('history.loaded');

      callback && callback(design);
    });
  };

  /**
   * Create a new image with given dimensions.
   *
   * @param {int|string} width
   * @param {int|string} height
   * @param {string|undefined} name
   */
  openNew (width, height, name) {
    width = width < this.minWidth ? this.minWidth : width;
    height = height < this.minHeight ? this.minHeight : height;

    this.fabric.clear();
    this.fabric.setWidth(width);
    this.fabric.setHeight(height);
    this.fabric.renderAll();
    this.fitToScreen();

    this.originalHeight = height;
    this.originalWidth = width;

    this.canvasOpenedNew.emit({value: 'canvas.openedNew'});
  };

  center (obj) {
    obj.center();

    if (this.fabric.zoom > 100) {
      obj.setLeft(10);
      obj.setTop(35);
    }

    obj.setCoords();
  };

  serialize () {
    return this.fabric.toJSON(['selectable', 'name']);
  };

  loadMainImage (url, height?, width?, dontFit?, callback?) {
    let object;

    this.fabric.util.loadImage(url, function (img) {
      //img.crossOrigin = 'anonymous';

      object = new this.fabric.Image(img, this.imageStatic);
      object.name = 'mainImage';

      if (width && height) {
        object.width = width;
        object.height = height;
      }

      this.mainImage = object;

      this.fabric.forEachObject(function(obj) {
        if (obj.name == 'mainImage') {
          this.fabric.remove(obj);
        }
      });
      this.fabric.add(object);
      object.top = -0.5;
      object.left = -0.5;
      object.moveTo(0);

      this.fabric.setHeight(object.height);
      this.fabric.setWidth(object.width);

      this.original.height = object.height;
      this.original.width = object.width;

      if (!dontFit) {
        this.fitToScreen();
      }

      this.dataService.$apply(function() {
        this.dataService.$emit('editor.mainImage.loaded');
      });

      if (callback) {
        callback();
      }
    });
  };

  /**
   * Open image at given url in canvas.
   *
   * @param {string} url
   */
  openImage (url) {
    this.zoom(1);
    this.fabric.util.loadImage(url, function(image) {
      if ( ! image) return;

      let object = new this.fabric.Image(image);
      object.name = 'image';

      //use either main image or canvas dimensions as outter boundaries for scaling new image
      let maxWidth  = this.mainImage ? this.mainImage.getWidth() : this.fabric.getWidth(),
        maxHeight = this.mainImage ? this.mainImage.getHeight() : this.fabric.getHeight();

      //if image is wider or heigher then the current canvas, we'll scale id down
      if (object.width >= maxWidth || object.height >= maxHeight) {

        //calc new image dimensions (main image height - 10% and width - 10%)
        let newWidth  = maxWidth - (0.1 * maxWidth),
          newHeight = maxHeight - (0.1 * maxHeight),
          scale     = 1 / (Math.min(newHeight / object.getHeight(), newWidth / object.getWidth()));

        //scale newly uploaded image to the above dimesnsions
        object.scaleX = object.scaleX * (1 / scale);
        object.scaleY = object.scaleY * (1 / scale);
      }

      //center and render newly uploaded image on the canvas
      this.fabric.add(object);
      object.left = (this.fabric.getWidth() - object.getWidth()) / 2;
      object.top = (this.fabric.getHeight() - object.getHeight()) / 2;
      object.setCoords();
      this.fabric.setActiveObject(object);
      this.fabric.renderAll();

      this.fitToScreen();
    });
  };

  getDataURL (options) {
    if ( ! options) options = {};

    //ignore zoom when getting data url
    options.multiplier = 1 / this.currentZoom;

    return this.fabric.toDataURL(options);
  };

  currentZoom: 1;

  zoom (scaleFactor) {
    this.fabric.setZoom(scaleFactor);
    this.fabric.setHeight(this.originalHeight * scaleFactor);
    this.fabric.setWidth(this.originalWidth * scaleFactor);

    this.currentZoom = scaleFactor;
  };

  fitToScreen() {
    let maxWidth  = this.viewport.offsetWidth - 40,
      maxHeight = this.viewport.offsetHeight - 120,
      outter    = this.mainImage || this.fabric,
      scale     = Math.min(maxHeight / outter.getHeight(), maxWidth / outter.getWidth());

    if (outter.getHeight() > maxHeight || outter.getWidth() > maxWidth) {
      this.zoom(scale);
    }
  };
}
