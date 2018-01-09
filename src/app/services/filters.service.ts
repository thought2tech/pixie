import { Injectable } from '@angular/core';
import {DataService} from './data.service';
import {CanvasService} from './canvas.service';
import {GlobalsService} from './globals.service';

declare var fabric: any;

@Injectable()
export class FiltersService {

  constructor(private canvas: CanvasService, private globals: GlobalsService) { }

  appliedFilters:any;
  all= [
    { name: 'grayscale' },
    { name: 'invert' },
    { name: 'sepia' },
    { name: 'sepia2' },
    {
      name: 'removeWhite',
      options: {
        distance: { current: 10 },
        threshold: { current: 50 }
      }
    },
    {
      name: 'brightness',
      options: {
        brightness: { current: 50 }
      }
    },
    {
      name: 'noise',
      options: {
        noise: { current: 40, max: 600 }
      }
    },
    {
      name: 'GradientTransparency',
      displayName: 'Gradient',
      options: {
        threshold: { current: 40 }
      }
    },
    {
      name: 'pixelate',
      options: {
        blocksize: { max: 40, current: 2 }
      }
    },
    {
      name: 'sharpen',
      uses: 'Convolute',
      matrix: [ 0, -1,  0, -1,  5, -1, 0, -1,  0 ]
    },
    {
      name: 'blur',
      uses: 'Convolute',
      matrix: [ 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9 ]
    },
    {
      name: 'emboss',
      uses: 'Convolute',
      matrix: [ 1,   1,  1, 1, 0.7, -1, -1,  -1, -1 ]
    },
    {
      name: 'tint',
      options: {
        opacity: { current: 0.5, min: 0.1, max: 1, step: 0.1 },
        color: { colorpicker: true, current: '#FF4081' }
      }
    },
    {
      name: 'multiply',
      options: {
        color: { colorpicker: true, current: '#FF4081' }
      }
    },
    {
      name: 'blend',
      options: {
        mode: { current: 'add', select: true, available: ['add', 'multiply', 'subtract', 'diff', 'screen', 'lighten', 'darken'] },
        alpha: { current: 0.5, min: 0.1, max: 1, step: 0.1 },
        color: { colorpicker: true, current: '#FF4081' }

      }
    }

    ];

  applyFilter(filter) {
    if ( ! this.filterExists(filter)) return;

    if (this.filterAlreadyApplied(filter.name)) {
      return this.removeFilter(filter);
    }

    this.globals.isLoading();
    this.markAsApplied(filter.name);

    //need to use timeout to display loading spinner properly
    setTimeout(function() {
      this.canvas.fabric.forEachObject(function(obj) {
        if (obj.applyFilters) {
          obj.filters.push(this.getFilter(filter));
          obj.applyFilters(this.canvas.fabric.renderAll.bind(this.canvas.fabric));
        }
      });

      this.history.add('filter: '+(filter.displayName || filter.name), 'brightness-6');
      this.lastAppliedFilter = filter;
      this.globals.isNotLoading();
    }, 30);
  };

  removeFilter(filter) {
    if ( ! this.filterExists(filter)) { return };

    this.globals.isLoading();
    this.unmarkAsApplied(filter.name);
    let $this = this;

    setTimeout(function() {
      this.canvas.fabric.forEachObject(function(obj) {
        if (obj.applyFilters) {
          for (let i = 0; i < obj.filters.length; i++) {
            if (obj.filters[i].name.toLowerCase() === filter.name.toLowerCase()) {
              obj.filters.splice(i, 1);
              obj.applyFilters($this.canvas.fabric.renderAll.bind($this.canvas.fabric));
            }
          }
        }
      });

      this.lastAppliedFilter = false;
      this.globals.isNotLoading();
    }, 30);
  };

  applyValue(filterName, optionName, optionValue) {
    this.globals.isLoading();
    let $this = this;

    setTimeout(function() {
      $this.canvas.fabric.forEachObject(function(obj) {
        if (obj.applyFilters) {
          for (let i = 0; i < obj.filters.length; i++) {
            let filter = obj.filters[i];

            if (filter.type.toLowerCase() === filterName.toLowerCase()) {
              filter[optionName] = optionValue;
              obj.applyFilters($this.canvas.fabric.renderAll.bind($this.canvas.fabric));
            }
          }
        }
      });

      $this.globals.isNotLoading();
    }, 30);
  }

  filterAlreadyApplied(name) {
    return this.appliedFilters.indexOf(name) !== -1;
  }

  markAsApplied(name) {
    if (this.appliedFilters.indexOf(name) === -1) {
      this.appliedFilters.push(name);
    }
  }

  unmarkAsApplied(name) {
    for (let i = 0; i < this.appliedFilters.length; i++) {
      if (this.appliedFilters[i] === name) {
        this.appliedFilters.splice(i, 1);
      }
    }
  }

  filterExists(filter) {
    return fabric.Image.filters[fabric.util.string.capitalize(filter.uses || filter.name, true)] !== undefined;
  }

  getFilter(filter) {
    let newFilter;

    if (filter.uses) {
      newFilter = new fabric.Image.filters[fabric.util.string.capitalize(filter.uses, true)]({ matrix: filter.matrix });
    } else {
      let options = {};
      for (let key in filter.options) {
        options[key] = filter.options[key].current;
      }
      newFilter = new fabric.Image.filters[fabric.util.string.capitalize(filter.name, true)](options);
    }

    newFilter.name = filter.name;

    return newFilter;
  }
}
