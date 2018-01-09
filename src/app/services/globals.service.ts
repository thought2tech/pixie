import {Injectable, OnInit} from '@angular/core';

declare var window: any;
declare var $: any;

@Injectable()
export class GlobalsService implements OnInit {

  constructor() { }

  editorCustomActions: any;
  pixie: any;
  started: any;
  isIntegrationMode: boolean = false;
  activeTab: any;
  simpleShapesAvailable: any;
  simpleShapesSelected: any;
  loading = false;

  ngOnInit() {
    this.verifyMode();
  }

  // check if we're running in integration mode
  verifyMode() {
    if (window.self !== window.top) {
      $('script', window.parent.document).each((i, node) => {
        if (node.src.indexOf('pixie-integrate') > -1) {
          this.isIntegrationMode = true;
          return false;
        }
      });
    }

    //get a reference to top window if we're inside iframe
    if (this.isIntegrationMode) {
      this.pixie = window.parent.Pixie;
    }
  };

  getParam(name) {
    if (this.pixie) {
      return this.pixie.getParams()[name];
    } else if (window['PixieParams']) {
      return window['PixieParams'][name];
    }
  };

  isLoading() {
    window.setTimeout(() => {
      this.loading = true;
    });
  };

  isNotLoading() {
    window.setTimeout(() => {
      this.loading = false;
    });
  };

}
