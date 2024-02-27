import Hammer from 'hammerjs'

function point2D(x, y) {
    return {x: x, y: y};
}

const reqAnimationFrame = (function () {
    return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
        window.setTimeout(callback, 1000 / 20);
    };
})();

function ZoomObject(el) {
    let tMatrix = [1, 0, 0, 1, 0, 0]//x缩放，无，无，y缩放，x平移，y平移

    let initScale = 1;//初始化scale
    let mc = new Hammer.Manager(el)
    let ticking = false
    let poscenter = point2D(0, 0);//缓存双指的中心坐标
    let duration = '';//设置过渡效果，用于双击缩放效果
    let lastTranslate = point2D(0, 0);//记录上次的偏移值
    let lastcenter = point2D(el.offsetWidth / 2, el.offsetHeight / 2)//图像的中心点，用于对比双指中心点

    let center = lastcenter
    mc.add(new Hammer.Pan({threshold: 0, pointers: 1}))
    mc.add(new Hammer.Pinch({threshold: 0})).recognizeWith([mc.get('pan')]);
    mc.add(new Hammer.Tap({event: 'doubletap', taps: 2}));
    mc.on("panmove", onPan);
    mc.on("panstart", onPanStart)
    mc.on("pinchmove", onPinch);
    mc.on("pinchstart", onPinchStart);
    mc.on("doubletap", onDoubleTap);

    function onPanStart() {
        lastTranslate = point2D(tMatrix[4], tMatrix[5])//缓存上一次的偏移值
    }

    function onPan(ev) {
        duration = ''
        el.className = ''
        tMatrix[4] = lastTranslate.x + ev.deltaX
        tMatrix[5] = lastTranslate.y + ev.deltaY
        requestElementUpdate('onpan');

    }

    function onPinchStart(ev) {
        duration = '';
        lastTranslate = point2D(tMatrix[4], tMatrix[5])//记录上一次的偏移值
        initScale = tMatrix[0] || 1;
        poscenter = point2D(ev.center.x, ev.center.y)

        lastcenter = point2D(center.x + lastTranslate.x, center.y + lastTranslate.y)//重新计算放大后的中心坐标
        poscenter = point2D(ev.center.x - lastcenter.x, ev.center.y - lastcenter.y)

        requestElementUpdate('onpinchStart');
    }

    function onPinch(ev) {
        tMatrix[0] = tMatrix[3] = initScale * ev.scale;
        tMatrix[4] = (1 - ev.scale) * poscenter.x + lastTranslate.x
        tMatrix[5] = (1 - ev.scale) * poscenter.y + lastTranslate.y
        requestElementUpdate('onpinch');
    }

    function onDoubleTap(ev) {
        duration = ".3s ease all";
        let nowScale = tMatrix[0];
        if (nowScale != 1 || tMatrix[4] != 0) {
            //scale不等于1，要重回1
            tMatrix[0] = tMatrix[3] = 1;
            tMatrix[4] = tMatrix[5] = 0;
        } else {
            let pointer = ev.center
            let scale = 2
            tMatrix[0] = tMatrix[3] = scale
            tMatrix[4] = (1 - scale) * (pointer.x - center.x)
            tMatrix[5] = (1 - scale) * (pointer.y - center.y)
        }
        requestElementUpdate('doubleTap');
    }

    function updateElementTransform() {
        el.style.transition = duration
        let tmp = tMatrix.join(',')
        el.style.transform = 'matrix(' + tmp + ')'
        ticking = false;
    }

    function requestElementUpdate() {
        // arguments && console.log(arguments[0])

        if (!ticking) {
            reqAnimationFrame(updateElementTransform);
            ticking = true;
        }
    }

    requestElementUpdate()
}

class Zoom {

    constructor(element) {
        new ZoomObject(element)
    }

}

export default Zoom
