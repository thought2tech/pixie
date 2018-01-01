import { Injectable } from '@angular/core';
import {WindowRef} from '../utility/window-ref';
import {CanvasService} from './canvas.service';
import {HistoryService} from './history.service';
import {SimpleShapesService} from './simple-shapes.service';
import {FiltersService} from './filters.service';

declare var $: any;

@Injectable()
export class DataService {

  constructor(private windowRef: WindowRef, private canvasService: CanvasService,
              private historyService: HistoryService, private simpleShapes: SimpleShapesService,
              private filters: FiltersService) { }


  this: any = this;
  editorCustomActions: any;
  isIntegrationMode: boolean = false;
  pixie: any;
  userPresetWidth;
  userPresetHeight;
  userPresetName;
  window = this.windowRef.nativeWindow;

  // true after user uploads an image or create a new canvas
  started: boolean = false;

  // check if we're on a demo site
  isDemo: any = document.URL.indexOf('pixie.vebto.com') > -1;

  // check if we're running in integration mode
  verifyMode(){
    if (window.self !== window.top) {
      $('script', window.parent.document).each(function(i, node) {
        if (node.src.indexOf('pixie-integrate') > -1) {
          this.isIntegrationMode = true;
          return false;
        }
      });
    }

    //get a reference to top window if we're inside iframe
    if (this.isIntegrationMode) {
      this.pixie = this.window.parent.Pixie;
    }
  };

  // verifyMode();

  getParam(name) {
    if (this.pixie) {
      return this.pixie.getParams()[name];
    } else if (this.windowRef['PixieParams']) {
      return this.windowRef['PixieParams'][name];
    }
  };

  // this.canvasService.start();

  //make actions panels draggable
  draggable(){
    $('.actions-menu').draggable({
      handle: '.menu-header',
      containment: 'body'
    });
  }

  // draggable()

  canvas = this.canvasService;
  history = this.historyService;
  shapes = this.simpleShapes;
  loading = false;
  animationEndEvent = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
  transitionEndEvent = 'webkitTransitionEnd mozTransitionEnd MSTransitionEnd oatransitionend atransitionend transitionend';

  maxPanelHeight = $(window).height() - 120;

  openPanel(name, e) {
    if (this.activePanel === name) return;

    this.activePanel = name;

    let panel = $('[data-name="'+name+'"]');

    let clickRect = e.target.getBoundingClientRect();
    let panelRect = panel[0].getBoundingClientRect();

    let scaleX = Math.min(0.5, clickRect.width / panelRect.width);
    let scaleY = Math.min(0.5, clickRect.height / panelRect.height);

    panel.removeClass('transition-in').css('transform', 'translate3d(' +
      (-panelRect.left + clickRect.left + clickRect.width/2 - panelRect.width/2) + 'px,' +
      (-panelRect.top + clickRect.top + clickRect.height/2 - panelRect.height/2) + 'px,' +
      '0) scale(' + scaleX + ',' + scaleY + ')'
    );

    // $$rAF(function() {
    //   $(panel).addClass('transition-in').css('transform', '');
    // });
  };

  isLoading() {
    // this.timeout(function() {
      this.loading = true;
    // });
  };

  isNotLoading() {
    // $timeout(function() {
      this.loading = false;
    // });
  };

  activePanel: any;
  activeTab: any;

  keys = {
    google_fonts: 'AIzaSyDhc_8NKxXjtv69htFcUPe6A7oGSQ4om2o',
  };

  // $rootScope.$watch('activePanel', function() {
  //   setTimeout(function () {
  //     $(window).resize();
  //   }, 100);
  // });

 resetUI() {
    // $timeout(function() {
      this.activePanel = null;
      this.activeTab   = 'basics';
      this.simpleShapes.selected  = null;
      this.filters.appliedFilters = [];
      this.history.all = [];
    // });
  };

  //open corresponding tab in left panel when user selects an object
  openTab() {
    this.canvasService.fabric.on('object:selected', function(e) {
      if (e.target.name == 'text') {
        this.activeTab = 'text';
      } else if (e.target.name == 'sticker' && this.activeTab !== 'stickers') {
        this.activeTab = 'stickers';
      } else if (e.target.name && this.activeTab !== 'simple-shapes') {
        for (let i = 0; i < this.simpleShapes.available.length; i++) {
          let shape = this.simpleShapes.available[i];

          if (shape.name === e.target.name && this.activeTab !== 'simple-shapes') {
            this.simpleShapes.selected = shape;
            this.activeTab = 'simple-shapes';
          }
        }
      }

      // this.$timeout(function() {});
    });

    //Close object panel when object is de-selected
    this.canvasService.fabric.on('selection:cleared', function() {
      // this.$timeout(function() {});
    });

    //deselect all objects when clicking outside canvas
    $('#viewport').on('click', function(e) {
      if (e.target.id === 'viewport') {
        // this.$timeout(function() {
          this.canvasService.fabric.deactivateAll().renderAll();
        // });
      }
    });
  }

  // openTab();

  openBottomSheet(name) {
    // $mdBottomSheet.show({
    //   template: $('#'+name+'-sheet-template').html(),
    //   controller: 'BottomSheetController'
    // });
  };

  //cleanup. remove color picker containers on scope destroy.
  cleanup() {
    // this.$on('$destroy', function() {
    //   $('.sp-container').remove();
    // });

    let spacify = function(text) {
      if (text) {
        let temp = text.replace( /([A-Z])/g, " $1" );
        return temp.charAt(0).toUpperCase() + temp.slice(1);
      }
    };
  }
}
