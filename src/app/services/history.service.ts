import { Injectable } from '@angular/core';
import {CanvasService} from './canvas.service';
import {DataService} from './data.service';
import {GlobalsService} from './globals.service';

@Injectable()
export class HistoryService {

  constructor(private canvasService: CanvasService, private globals: GlobalsService) { }

  all:any = [];

  //used for backing up canvas and other serializations
  //that are not visible to the user
  ignored:any = [];

  add (name, icon, ignore?) {
    let prop = ignore ? 'ignored' : 'all';

    //make sure don't have duplicates in ignored array
    if (prop === 'ignored') {
      for (let i = 0; i < this.ignored.length; i++) {
        if (this.ignored[i].name === name) {
          this.ignored.splice(i, 1)
        }
      }
    }

    this[prop].unshift({
      name: name,
      state: this.canvasService.fabric.toJSON(['selectable', 'name']),
      index: this.all.length+1,
      icon: icon,
      zoom: this.canvasService.zoom,
      canvasWidth: this.canvasService.originalWidth || this.canvasService.fabric.getWidth(),
      canvasHeight: this.canvasService.originalHeight || this.canvasService.fabric.getHeight()
    });
  };

  get(name, prop?) {
    if (!prop) prop = 'ignored';

    for (let i = 0; i < history[prop].length; i++) {
      if (history[prop][i].name === name) {
        return history[prop][i];
      }
    }
  };

  getCurrentCanvasState() {
    return {
      state: this.canvasService.fabric.toJSON(['selectable', 'name']),
      index: this.all.length+1,
      zoom: this.canvasService.zoom,
      canvasWidth: this.canvasService.originalWidth || this.canvasService.fabric.getWidth(),
      canvasHeight: this.canvasService.originalHeight || this.canvasService.fabric.getHeight()
    }
  };

  load (item) {
    this.globals.isLoading();

    //if we get passed a name, fetch a matching history item
    if (item instanceof String) {
      item = this.get(item);
    }

    if ( ! item) {
      return this.globals.isNotLoading();
    }

    setTimeout(function() {
      this.canvasService.fabric.loadFromJSON(item.state, function() {
        this.canvasService.fabric.forEachObject(function(obj) {

          //reapply any filters object used to have
          if (obj.applyFilters && obj.filters.length) {
            obj.applyFilters(this.canvasService.fabric.renderAll.bind(this.canvasService.fabric));
          }

          //assign new reference to mainImage property
          if (obj.name == 'mainImage') {
            this.canvasService.mainImage = obj;
          }
        });

        this.canvasService.zoom(1);

        if (item.canvasWidth && item.canvasHeight) {
          this.canvasService.fabric.setWidth(item.canvasWidth);
          this.canvasService.fabric.setHeight(item.canvasHeight);
          this.canvasService.original.width = item.canvasWidth;
          this.canvasService.original.height = item.canvasHeight;
        }

        this.canvasService.fabric.renderAll();
        this.canvasService.fabric.calcOffset();
        this.globals.isNotLoading();
        this.canvasService.fitToScreen();
        // this.dataService.$emit('history.loaded');
      });
    }, 30);
  }
}
