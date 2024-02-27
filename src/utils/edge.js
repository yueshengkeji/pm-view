import {Edge} from 'butterfly-dag';

class BaseEdge extends Edge {
    draw(obj) {
        let path = super.draw(obj);
        if (this.options.color) {
            path.classList.add(this.options.color);
        }
        return path;
    }
    drawArrow(isShow) {
        let dom = super.drawArrow(isShow);
        if (this.options.color) {
            dom.classList.add(this.options.color);
        }
        return dom;
    }
    drawLabel(text) {
        let dom = null;
        if (text) {
            dom = document.createElement("span")
            dom.innerText = text
        }
        console.log("drawLabel",text,dom)
        return dom;
    }
}

export default BaseEdge;
