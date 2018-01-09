import {Injectable, OnInit} from '@angular/core';
import { WindowRef} from '../utility/window-ref';
import { CanvasService } from './canvas.service';
import { HistoryService } from './history.service';
import { SimpleShapesService } from './simple-shapes.service';
import { FiltersService } from './filters.service';

declare var $: any;
declare var window: any;
declare var $$rAF: any;

@Injectable()
export class DataService implements OnInit {

  editorCustomActions: any;
  userPresetWidth;
  userPresetHeight;
  userPresetName;

  // true after user uploads an image or create a new canvas
  started: boolean = false;

  // check if we're on a demo site
  isDemo: any = window.document.URL.indexOf('pixie.vebto.com') > -1;

  history = this.historyService;
  shapes = this.simpleShapes;
  animationEndEvent = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
  transitionEndEvent = 'webkitTransitionEnd mozTransitionEnd MSTransitionEnd oatransitionend atransitionend transitionend';
  maxPanelHeight = $(window).height() - 120;

  activePanel: any;
  activeTab: any;

  keys = {
    google_fonts: 'AIzaSyDhc_8NKxXjtv69htFcUPe6A7oGSQ4om2o',
  };

  constructor(private windowRef: WindowRef, private canvas: CanvasService,
              private historyService: HistoryService, private simpleShapes: SimpleShapesService,
              private filters: FiltersService) { }


  ngOnInit() {
    this.canvas.start();
    this.draggable();
  }

  //make actions panels draggable
  draggable(){
    $('.actions-menu').draggable({
      handle: '.menu-header',
      containment: 'body'
    });
  }

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

    $$rAF(function() {
      $(panel).addClass('transition-in').css('transform', '');
    });
  };





  // $rootScope.$watch('activePanel', function() {
  //   setTimeout(function () {
  //     $(window).resize();
  //   }, 100);
  // });

 resetUI() {
   window.setTimeout(() => {
      this.activePanel = null;
      this.activeTab   = 'basics';
      this.simpleShapes.selected  = null;
      this.filters.appliedFilters = [];
      this.history.all = [];
    });
  };

  // //open corresponding tab in left panel when user selects an object
  // openTab() {
  //   this.support.openTab(this);
  // }

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
