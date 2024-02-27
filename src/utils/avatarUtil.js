/**
 *
 * 头像绘制工具类
 * @param name 绘制名字
 * @param canvasId canvasId
 * @param isLast 是否绘制最后一个字，默认绘制第一个字
 **/
export function drawAvatar(name, color) {
    name = name.replace(/\s/g, "");
    if (name.length > 2) {
        // if(isLast){
        name = name.substring(name.length - 2, name.length);
        // }else{
        //   name = name.substring(0, 1);
        // }
    }
    // 创建画布
    let canvas = document.createElement('canvas');
    canvas.width = "156";
    canvas.height = "156";
    // 绘制文字环境
    let context = canvas.getContext("2d");
    // 设置字体
    context.font = "60px Source Han Sans CN";
    // 获取字体宽度
    let width = context.measureText(name).width;
    // context.arc(100, 100, 108, 0, Math.PI * 2, true);
    context.clearRect(0, 0, width, width);
    // 画布宽度
    context.width = "156";
    // 画布高度
    context.height = "156";
    // 填充颜色
    // console.log(book)
    // let bgColors = ["#e57373", "#90a4ad", "#b968c7", "#80c783", "#64b5f6", "#7721f6", "#008000", "#f63caf"];
    context.fillStyle = color;
    context.fillRect(0, 0, context.width, context.height);
    // 设置水平对齐方式
    context.textAlign = 'center';
    // 设置垂直对齐方式
    context.textBaseline = 'middle';
    // 设置字体颜色
    context.fillStyle = '#FFFFFF';
    // 绘制文字（参数：要写的字，x坐标，y坐标）
    context.fillText(name, context.width / 2, context.height / 2);
    return canvas.toDataURL("image/png");
}
