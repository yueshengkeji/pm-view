export function loadBaiDuMap(ak) {
    return new Promise(resolve => {
        window.initBaidu = function (){
            resolve(window.BMapGL)
        }
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//api.map.baidu.com/api?type=webgl&v=1.0&ak=' + ak + '&callback=initBaidu';
        document.body.appendChild(script);
    })
}