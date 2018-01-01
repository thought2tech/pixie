import { Injectable } from '@angular/core';

declare var $: any;
declare var fabric: any;

@Injectable()
export class KeybindsService {

  processKeys: any;
  fabric: Object;

  constructor() {
  }


  destroy() {
    $('.canvas-container').off("keydown", this.processKeys, false);
  };

  init(fabric) {
    this.fabric = fabric;
    $(document).on('keydown', this.handleKeyDown);
  }

  handleKeyDown(e) {
    e = e || window.event;

    if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) this.moveObject(e);
    if (e.keyCode === 46) this.deleteObject();

  }

  deleteObject() {
    let activeObject = fabric.getActiveObject();

    if (activeObject) {
      fabric.remove(activeObject);
      fabric.renderAll();
    }
  }

  moveObject(e) {
    let movementDelta = 2;

    let activeObject = fabric.getActiveObject();
    let activeGroup = fabric.getActiveGroup();

    if (e.keyCode === 37) {
      e.preventDefault();
      if (activeObject) {
        let a = activeObject.get('left') - movementDelta;
        activeObject.set('left', a);
      }
      else if (activeGroup) {
        let a = activeGroup.get('left') - movementDelta;
        activeGroup.set('left', a);
      }

    } else if (e.keyCode === 39) {
      e.preventDefault();
      if (activeObject) {
        let a = activeObject.get('left') + movementDelta;
        activeObject.set('left', a);
      }
      else if (activeGroup) {
        let a = activeGroup.get('left') + movementDelta;
        activeGroup.set('left', a);
      }

    } else if (e.keyCode === 38) {
      e.preventDefault();
      if (activeObject) {
        let a = activeObject.get('top') - movementDelta;
        activeObject.set('top', a);
      }
      else if (activeGroup) {
        let a = activeGroup.get('top') - movementDelta;
        activeGroup.set('top', a);
      }

    } else if (e.keyCode === 40) {
      e.preventDefault();
      if (activeObject) {
        let a = activeObject.get('top') + movementDelta;
        activeObject.set('top', a);
      }
      else if (activeGroup) {
        let a = activeGroup.get('top') + movementDelta;
        activeGroup.set('top', a);
      }
    }

    if (activeObject) {
      activeObject.setCoords();
      fabric.renderAll();
    } else if (activeGroup) {
      activeGroup.setCoords();
      fabric.renderAll();
    }
  }

}
