exports.install = (Vue, store) => {
    Vue.prototype.setIframeHeight = (element) => {
        element.height = Vue.prototype.getClientHeight() - 78;
    },
        Vue.prototype.dateDiffDay = (datetime) => {
            var endTime = new Date(datetime);
            var nowTime = new Date();
            var t = endTime.getTime() - nowTime.getTime();
            var d = Math.floor(t / 1000 / 60 / 60 / 24);
            return d;
        },
        Vue.prototype.getClientHeight = () => {
            let clientHeight = 0;
            if (document.body.clientHeight && document.documentElement.clientHeight) {
                clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
            } else {
                clientHeight = (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
            }
            return clientHeight;
        },
        //获取指定日期月份的第一天
        Vue.prototype.getMonthFirst = (firstDate) => {
            firstDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
            let year = firstDate.getFullYear();
            let month = Vue.prototype.parse0((firstDate.getMonth() + 1));
            if (month == "00") {
                month = "12";
                year = parseInt(year) - 1;
            }
            return year + "-" + month + "-" + Vue.prototype.parse0(firstDate.getDate());
        },
        //获取指定日期月份的最后一天
        Vue.prototype.getMonthEnd = (date) => {
            date = new Date(date.getFullYear(), date.getMonth() + 1, 0)
            let year = date.getFullYear();
            let month = Vue.prototype.parse0((date.getMonth() + 1));
            if (month == "00") {
                month = "12";
                year = parseInt(year) - 1;
            }
            return year + "-" + month + "-" + Vue.prototype.parse0(date.getDate());
        },
        Vue.prototype.parse0 = (s) => {
            s += "";
            return s.length < 2 ? '0' + s : s;
        },
        //获取(当前||指定日期)季度
        Vue.prototype.getQuarter = (d) => {
            d = d || new Date();
            let month = d.getMonth() + 1
            if (month <= 3) {
                return 1
            } else if (month <= 6) {
                return 2
            } else if (month <= 9) {
                return 3
            } else {
                return 4
            }
        },
        //判断空
        Vue.prototype.isNotNull = (val) => {
            return val != null && val !== ""
        },
        //格式化时间字符串
        Vue.prototype.formatDateStr = (dateStr, startIdx, endIdx) => {
            try {
                return dateStr.substring(startIdx, endIdx)
            } catch (e) {
                return dateStr
            }
        },
        Vue.prototype.formatterApproveDate = (fa) => {
            if (fa.approveDate != "") {
                //审批时间
                return fa.approveDate.substring(5, 16);
            } else if (fa.readDate != "") {
                //阅读时间
                return fa.readDate.substring(5, 16);
            }
            return "-";
        },
        //格式化时间
        Vue.prototype.dateFormat = (date, fmt) => {
            let ret;
            const opt = {
                "Y+": date.getFullYear().toString(),        // 年
                "m+": (date.getMonth() + 1).toString(),     // 月
                "d+": date.getDate().toString(),            // 日
                "H+": date.getHours().toString(),           // 时
                "M+": date.getMinutes().toString(),         // 分
                "S+": date.getSeconds().toString()          // 秒
                // 有其他格式化字符需求可以继续添加，必须转化成字符串
            };
            for (let k in opt) {
                ret = new RegExp("(" + k + ")").exec(fmt);
                if (isNaN(opt[k])) {
                    fmt = ''
                } else if (ret) {
                    fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
                }
            }
            return fmt;
        },
        //计算开始到截止时间差值
        Vue.prototype.dateDiff = (start, end) => {
            let date3 = new Date(end).getTime() - new Date(start).getTime();
            if (date3 < 0) {
                return false;
            }
            let days = Math.floor(date3 / (24 * 3600 * 1000));
            let leave1 = date3 % (24 * 3600 * 1000);
            let hours = Math.floor(leave1 / (3600 * 1000));
            let leave2 = leave1 % (3600 * 1000);
            let minutes = Math.floor(leave2 / (60 * 1000));
            if (hours >= 7) {
                days++;
                hours = 0;
                minutes = 0;
            } else if (hours < 7) {
                if (0 < minutes && minutes <= 30) {
                    minutes = 30;
                } else if (minutes > 30 && minutes <= 59) {
                    hours += 1;
                    minutes = 0;
                }
            }
            if (days <= 0) {
                return hours + "小时" + minutes + "分钟";
            } else {
                return days + "天" + hours + "小时" + minutes + "分钟";
            }
        },
        //计算开始到截止时间差值
        Vue.prototype.dayDiff = (start, end) => {
            let date3 = new Date(end).getTime() - new Date(start).getTime();
            if (date3 < 0) {
                return false;
            }
            let days = Math.floor(date3 / (24 * 3600 * 1000));
            let leave1 = date3 % (24 * 3600 * 1000);
            let hours = Math.floor(leave1 / (3600 * 1000));
            let leave2 = leave1 % (3600 * 1000);
            let minutes = Math.floor(leave2 / (60 * 1000));
            if (hours >= 7) {
                days++;
                hours = 0;
                minutes = 0;
            } else if (hours < 7) {
                if (0 < minutes && minutes <= 30) {
                    minutes = 30;
                } else if (minutes > 30 && minutes <= 59) {
                    hours += 1;
                    minutes = 0;
                }
            }
            return days;
        },
        //格式化流程消息状态
        Vue.prototype.formatFlowMsgState = (msg) => {
            let state = msg.state;
            let str;
            if (state == 1) {
                str = "审批中";
            } else if (state == 4) {
                str = "已取消";
            } else if (state == 2) {
                str = "审批完成";
            } else if (state == 3) {
                str = "已读";
            } else {
                str = "被驳回";
            }
            return str;
        },
        Vue.prototype.formatApproveDate = (data) => {
            return (data.approveDate == null || data.approveDate === '') ? '-' : data.approveDate.substring(5, 16)
        }
    //格式化审批状态
    Vue.prototype.formatApproveState = (approve) => {
        let state = approve.approveState;
        switch (state) {
            case 0:
                return "未读";
            case 1:
                return "已读";
            case 3:
                return "同意";
            case 5:
                return "知会未读";
            case 6:
                return "知会已读";
            case 7:
                return "驳回";
            case 8:
                return "忽略";
            default:
                return "-";
        }
    },
        //格式化审批人员类型
        Vue.prototype.formatCoursePersonTypeState = (state) => {
            switch (state) {
                case 0:
                    return "部门经理";
                case 1:
                    return "职务";
                case 2:
                    return "审批人";
                case 3:
                    return "角色";
                case 4:
                    return "上级领导";
                case 5:
                    return "部门主管";
                case 6:
                    return "发起人";
                default:
                    return "-";
            }
        },
        //格式化日期：yyyy-MM-dd
        Vue.prototype.formatTimer = (value) => {
            let date = new Date(value);
            let y = date.getFullYear();
            let MM = date.getMonth() + 1;
            MM = MM < 10 ? "0" + MM : MM;
            let d = date.getDate();
            d = d < 10 ? "0" + d : d;
            return y + "-" + MM + "-" + d;
        },
        //获取两个时间相差的小时（排除下班时间）
        Vue.prototype.getHour = (StartTime, EndTime) => {
            if (!(StartTime instanceof Date)) {
                StartTime = new Date(StartTime);
                EndTime = new Date(EndTime);
            }
            let ms = Math.abs(EndTime.getTime() - StartTime.getTime());
            // 实际工时（天） = 起止日期差 - 周六日数目。
            if ((StartTime.getMonth() == EndTime.getMonth())
                && (StartTime.getDate() == EndTime.getDate())) {
                // 若为同一日期
                let hour1 = (Vue.prototype.getDayHour(StartTime.getHours(), StartTime.getMinutes(),
                    EndTime.getHours(), EndTime.getMinutes(), "1"));
                // console.log(hour1,StartTime,EndTime);
                if (hour1 == undefined) {
                    //未获取到工作内小时数，获取工作外的小时数
                    hour1 = Vue.prototype.getHour(StartTime, EndTime);
                }
                return hour1.toFixed(1);
            } else {
                let sh = StartTime.getHours();
                let eh = EndTime.getHours();
                let days;
                if (13 <= sh) {
                    if (8 <= eh && eh <= 12) {
                        days = Math.ceil(ms / 1000 / 60 / 60 / 24) + 1;
                    } else {
                        days = Math.floor(ms / 1000 / 60 / 60 / 24) + 1;
                    }
                } else {
                    days = Math.floor(ms / 1000 / 60 / 60 / 24) + 1;
                }
                let workDayVal = 0;
                // 工时的余数
                let remainder = days % 7;
                // 工时向下取整的除数
                let divisor = Math.floor(days / 7);
                let weekendDay = 2 * divisor;

                // 起始日期的星期，星期取值有（1,2,3,4,5,6,0）
                let nextDay = StartTime.getDay();
                // 从起始日期的星期开始 遍历remainder天
                for (let tempDay = remainder; tempDay >= 1; tempDay--) {
                    // 第一天不用加1
                    if (tempDay == remainder) {
                        nextDay = nextDay + 0;
                    } else if (tempDay != remainder) {
                        nextDay = nextDay + 1;
                    }
                    // 周日，变更为0
                    if (nextDay == 7) {
                        nextDay = 0;
                    }
                    // 周六日
                    if (nextDay == 0 || nextDay == 6) {
                        weekendDay = weekendDay + 1;
                    }
                }
                workDayVal = days - weekendDay - 2;
                let hour0 = (workDayVal * 8 + Vue.prototype.getDayHour(StartTime.getHours(),
                    StartTime.getMinutes(), EndTime.getHours(), EndTime
                        .getMinutes(), "0")).toFixed(1);
                if (hour0 == undefined) {
                    //未获取到工作内小时数，获取工作外的小时数
                    hour0 = Vue.prototype.getHour(StartTime, EndTime);
                }
                return hour0;
            }
        },
        Vue.prototype.getHourV2 = (start, end) => {
            let date3 = new Date(end).getTime() - new Date(start).getTime();
            if (date3 < 0) {
                return false;
            }
            // let days = Math.floor(date3 / (24 * 3600 * 1000));
            let leave1 = date3 % (24 * 3600 * 1000);
            let hours = Math.floor(leave1 / (3600 * 1000));
            let leave2 = leave1 % (3600 * 1000);
            let minutes = Math.floor(leave2 / (60 * 1000));
            if (hours >= 7) {
                // days++;
                hours = 0;
                minutes = 0;
            } else if (hours < 7) {
                if (0 < minutes && minutes <= 30) {
                    minutes = 30;
                } else if (minutes > 30 && minutes <= 59) {
                    hours += 1;
                    minutes = 0;
                }
            }
            return hours;
        },
        Vue.prototype.getDayHour = (sh, sm, eh, em, type) => {
            sh = parseInt(sh);
            eh = parseInt(eh);
            if (type == "0") {
                // 计算非当天
                if (8 <= sh && sh <= 12) {
                    sh = 12 - sh + 4;
                } else if (13 <= sh && sh <= 23) {
                    sh = 17 - sh;
                }
                if (8 <= eh && eh <= 12) {
                    eh = eh - 8;
                } else if (13 <= eh && eh <= 23) {
                    eh = eh - 13 + 4;
                }
                return parseFloat(sh + eh);
            } else {
                // 计算当天
                if (sh == eh) {
                    // 在同一小时
                    if (sm == em) {
                        return 0;
                    } else {
                        return Math.abs((sm - em) / 60);
                    }
                } else {
                    // 不在同一小时
                    // 开始时间在上午时间段，并且结束时间在下午时间段
                    if ((8 <= sh && sh <= 12) && (13 <= eh && eh <= 23)) {
                        if (sm == 30) {
                            return parseFloat(12 - sh + eh - 13);
                        } else if (sm < 30) {
                            return parseFloat(12 - sh + eh - 13);
                        } else if (sm > 30 && sh != 12) {
                            return parseFloat(12 - sh - 1 + eh - 13);
                        }
                    }
                    // 开始时间与结束时间都在上午时间段
                    else if ((8 <= sh && sh <= 12) && (8 <= eh && eh <= 12)) {

                        if (sm == em) {
                            return parseFloat(Math.abs(eh - sh));
                        } else {

                            return parseFloat(Math.abs(eh - sh - 1) + (60 - sm) / 60
                                + em / 60);
                        }

                    } else if (13 <= sh && sh <= 23 && 13 <= eh && eh <= 23) {
                        if (sm == em) {
                            return parseFloat(Math.abs(eh - sh));
                        } else {
                            return parseFloat(Math.abs(eh - sh - 1) + (60 - sm) / 60
                                + em / 60);
                        }
                    }
                }
            }
        },
        Vue.prototype.getHourByDate = (s1, s2) => {
            s1 = new Date(s1);
            s2 = new Date(s2);
            let ms = s2.getTime() - s1.getTime();
            if (ms < 0) return 0;
            return Math.floor(ms / 1000 / 60 / 60);
        },
        //滚动指定天数后的日期
        Vue.prototype.dateAfter = (day) => {
            let date = new Date();
            day = day * 24 * 60 * 60 * 1000;
            return Vue.prototype.dateFormat(new Date(date.getTime() + day), "YYYY-mm-dd");
        },
        Vue.prototype.dateAfterV2 = (date, day) => {
            day = day * 24 * 60 * 60 * 1000;
            return Vue.prototype.dateFormat(new Date(date.getTime() + day), "YYYY-mm-dd");
        },
        Vue.prototype.sheetMaterialModel = (m) => {
            m.name = Vue.prototype.materialTrim(m.name)
            m.model = Vue.prototype.materialTrim(m.model)
            m.remark = Vue.prototype.materialTrim(m.remark)
            m.brand = Vue.prototype.materialTrim(m.brand)
            m.unit = {name: Vue.prototype.materialTrim(m.unitName)}
            m.planPrice = Vue.prototype.materialTrim(m.planPrice)
            m.storageSum = Vue.prototype.materialTrim(m.storageSum)
            return m
        },
        Vue.prototype.materialTrim = (str) => {
            if (str == null) {
                return null;
            } else {
                str = "" + str
            }
            try {
                return str.replace(/\s/g, "").replace(/[\r\n]/g, "")
            } catch (e) {
                console.log(str, e)
                return null
            }
        },
        Vue.prototype.getTomorrow = () => {
            var now = new Date();
            var date = new Date(now.getTime() + 1 * 24 * 3600 * 1000);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            // var hour = date.getHours();
            // var minute = date.getMinutes();
            // var second = date.getSeconds();
            return year + '-' + Vue.prototype.parse0(month) + '-' + Vue.prototype.parse0(day);
        },
        Vue.prototype.dealImageByTag = (img, obj, callback) => {
            img.onload = function () {
                let that = img;
                // 默认按比例压缩
                let w = that.width, h = that.height;
                if (w > 10000) {
                    w = w / 11;
                    h = h / 11;
                } else if (w > 8000) {
                    w = w / 9;
                    h = h / 9;
                } else if (w > 6000) {
                    w = w / 7;
                    h = h / 7;
                } else if (w > 4000) {
                    w = w / 5;
                    h = h / 5;
                } else if (w > 2000) {
                    w = w / 3, h = h / 3
                }
                if (w == null || w <= 0) {
                    w = 500
                    h = 915
                }
                let scale = w / h
                w = obj.width || w;
                h = obj.height || (w / scale);
                let quality = 0.85;  // 默认图片质量为0.7
                //生成canvas
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                // 创建属性节点
                let anw = document.createAttribute("width");
                anw.nodeValue = w;
                let anh = document.createAttribute("height");
                anh.nodeValue = h;
                canvas.setAttributeNode(anw);
                canvas.setAttributeNode(anh);
                ctx.drawImage(that, 0, 0, w, h);
                // 图像质量
                if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
                    quality = obj.quality;
                }
                // quality值越小，所绘制出的图像越模糊
                // 回调函数返回base64的值
                callback(canvas.toDataURL('image/jpeg', quality));
            }
        },
        Vue.prototype.getPreMonthFirst = (date) => {
            let month = date.getMonth() - 1
            date.setMonth(month)
            return Vue.prototype.getMonthFirst(date)
        },
        Vue.prototype.getPreMonthEnd = (date) => {
            let month = date.getMonth() - 1
            date.setMonth(month)
            return Vue.prototype.getMonthEnd(date)
        },
        Vue.prototype.half = (date) => {
            return Vue.prototype.dateAfterV2(date, -(365 / 2))
        },
        Vue.prototype.getDateByStr = (strType) => {
            let date = {start: null, end: null}
            let tempDate
            switch (strType) {
                case "本月":   //本月
                    date.start = Vue.prototype.getMonthFirst(new Date());
                    date.end = Vue.prototype.getMonthEnd(new Date());
                    break;
                case "上月":   //上月
                    tempDate = new Date()
                    date.start = Vue.prototype.getPreMonthFirst(new Date())
                    date.end = Vue.prototype.getPreMonthEnd(new Date())
                    break;
                case "半年":   //半年
                    date.start = Vue.prototype.half(new Date());
                    date.end = Vue.prototype.formatTimer(new Date());
                    break;
                case "本年":   //本年
                    tempDate = new Date();
                    tempDate.setMonth(0);
                    date.start = Vue.prototype.getMonthFirst(tempDate);
                    date.end = Vue.prototype.formatTimer(new Date());
                    break;
                case "去年":
                    // 获取当前日期
                    var today = new Date()
                    // 获取去年的日期
                    var lastYear = new Date(today);
                    lastYear.setFullYear(today.getFullYear() - 1);
                    // 获取去年的第一天
                    var firstDayOfLastYear = new Date(lastYear.getFullYear(), 0, 1);
                    // 获取去年的最后一天
                    var lastDayOfLastYear = new Date(lastYear.getFullYear(), 11, 31);
                    date.start = Vue.prototype.dateFormat(firstDayOfLastYear,'YYYY-mm-dd')
                    date.end = Vue.prototype.dateFormat(lastDayOfLastYear,'YYYY-mm-dd')
                    break
                case "所有":     //所有
                    date.start = null
                    date.end = null
                    break;
                default :
                    break
            }
            return date
        },
        Vue.prototype.uuid = () => {
            let s = [];
            let hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23];
            return s.join("");
        },
        Vue.prototype.subDate = (date, idx, length) => {
            if (date && date.length >= length) {
                return date.substring(idx, length)
            } else {
                return date
            }
        },
        Vue.prototype.getMonth = (startDate, endDate) => {
            let s = new Date(startDate)
            let e = new Date(endDate)
            let sm = s.getMonth() + 1
            let em = e.getMonth() + 1
            let result = []
            for (let i = sm; i <= em; i++) {
                result.push(i)
            }
            return result
        },
        Vue.prototype.container = (val, tag) => {
            return val.indexOf(tag) !== -1
        },
        Vue.prototype.formatApproveType = (approveState) => {
            return approveState == 0 ? '未审核' : '已审核'
        },
        Vue.prototype.parseUpperNum = (num) => {
            let c = "零壹贰叁肆伍陆柒捌玖".split("");
            // ["零","壹","贰","叁","肆","伍","陆","柒","捌","玖"]
            let _c = {}; // 反向对应关系
            let d = "元***万***亿***万";
            let e = ",拾,佰,仟".split(",");
            for (var i = 0; i < c.length; i++) {
                _c[c[i]] = i;
            }
            let n = Number(num);
            if (!isNaN(num)) {
                if (num == 0) {
                    return "零元整";
                } else {
                    return _format(n);
                }
            } else {
                return false;
            }

            function _format(n) {
                let a = ("" + n).split("."), a0 = a[0], a1 = a[1];
                return _formatD(a0) + _formatF(a1);
            }

            function _formatF(b) {
                // 转化小数部分
                b = b || "";
                switch (b.length) {
                    case 0:
                        return "整";
                    case 1:
                        return c[b] + "角";
                    default:
                        return c[b.charAt(0)] + "角" + c[b.charAt(1)] + "分";
                }
            }

            function _formatD(a) {
                // 转化整数部分
                let arr = a.split(""), i = 0, result = "";
                while (arr.length) {
                    let arr1 = arr.splice(-4, 4);

                    let dw = d.charAt(i), unit = unit4(arr1);

                    if (dw == '万' && !unit) {
                        dw = "";
                    }
                    result = unit + dw + result;
                    i += 4;
                }
                return result == "元" ? "" : result;
            }


            function unit4(arr) {
                let str = "", i = 0;
                while (arr.length) {
                    let t = arr.pop();
                    str = (c[t] + (t == 0 ? "" : e[i])) + str;
                    i++;
                }

                str = str.replace(/[零]{2,}/g, "零");

                str = str.replace(/^[零]/, "");
                str = str.replace(/[零]$/, "");
                if (str.indexOf("零") == 0) {
                    str = str.substring(1);
                }
                if (str.lastIndexOf("零") == str.length - 1) {
                    str = str.substring(0, str.length - 1);
                }

                return str;
            }
        },
        Vue.prototype.formatId = (id) => {
            let x = id.indexOf("-");
            return id.substring(0, x === -1 ? id.length : x)
        },
        Vue.prototype.confirm = (msg) => {
            return new Promise((resolve, reject) => {
                store.state.showTooltip.confirm = true
                store.state.showTooltip.confirmMsg = msg
                store.state.showTooltip.confirmBack = () => {
                    resolve()
                    store.state.showTooltip.confirm = false
                }
                store.state.showTooltip.confirmCancel = () => {
                    reject()
                    store.state.showTooltip.confirm = false
                }
            })
        },
        Vue.prototype.message = (msg) => {
            store.state.showTooltip.snackbarMsg = msg
            store.state.showTooltip.snackbar = true
        },
        Vue.prototype.switchMonth = (year,month) => {
            let date = new Date();
            date.setFullYear(year)
            date.setDate(28);
            date.setMonth((month - 1));
            let end = Vue.prototype.getMonthEnd(date)
            date.setDate(28);
            date.setMonth((month - 1));
            return {end: end, start: Vue.prototype.getMonthFirst(date)};
        },
        Vue.prototype.floatAdd = (arg1, arg2) => {
            let r1, r2, m
            try {
                r1 = arg1.toString().split('.')[1].length
            } catch (e) {
                r1 = 0
            }
            try {
                r2 = arg2.toString().split('.')[1].length
            } catch (e) {
                r2 = 0
            }
            m = Math.pow(10, Math.max(r1, r2))
            return (arg1 * m + arg2 * m) / m
        },
        Vue.prototype.floatSub = (arg1, arg2) => {
            let r1, r2, m, n
            try {
                r1 = arg1.toString().split('.')[1].length
            } catch (e) {
                r1 = 0
            }
            try {
                r2 = arg2.toString().split('.')[1].length
            } catch (e) {
                r2 = 0
            }
            m = Math.pow(10, Math.max(r1, r2))
            n = (r1 >= r2) ? r1 : r2
            return ((arg1 * m - arg2 * m) / m).toFixed(n)
        },
        Vue.prototype.randomStr = function (len) {
            len = len || 32;
            var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
            var maxPos = $chars.length;
            var pwd = '';
            for (let i = 0; i < len; i++) {
                pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return pwd;
        },
        Vue.prototype.convertGCJ02ToBD09 = (lng, lat) => {
            let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
            let x = lng;
            let y = lat;
            let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
            let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
            let lngs = z * Math.cos(theta) + 0.0065;
            let lats = z * Math.sin(theta) + 0.006;
            return {
                lng: lngs,
                lat: lats,
            };
        },
        Vue.prototype.isIOS = () => {
            return /iPhone|iPad|iPod/i.test(navigator.userAgent)
        },
        Vue.prototype.downloadFile = (result) => {
            let a = document.createElement("a");
            a.download = result.substr(result.lastIndexOf("/") + 1)
            a.href = result
            a.click()
        },
        Vue.prototype.dateIsWeek = (date) => {
            // 创建一个表示今天的日期对象
            let today = new Date();

            // 获取今天是本周的第几天（0表示星期日，1表示星期一，以此类推）
            let dayOfWeek = today.getDay();

// 计算本周的第一天是几号
            let firstDayOfWeek = new Date(today);
            firstDayOfWeek.setDate(today.getDate() - dayOfWeek);

// 计算本周的最后一天是几号
            let lastDayOfWeek = new Date(today);
            lastDayOfWeek.setDate(today.getDate() + (6 - dayOfWeek));

// 要检查的日期
            let dateToCheck = new Date(date); // 请替换成你要检查的日期

// 判断日期是否在本周内
            if (dateToCheck >= firstDayOfWeek && dateToCheck <= lastDayOfWeek) {
                return true
            } else {
                return false
            }

        }, Vue.prototype.dateIsMonth = (date) => {
        // 创建一个日期对象
        let dateToCheck = new Date(date); // 如果要检查的日期不是当前日期，可以将其替换为你要检查的日期

// 获取当前年份和月份
        let currentYear = new Date().getFullYear();
        let currentMonth = new Date().getMonth() + 1; // 月份从0开始，所以需要加1

// 获取要检查日期的年份和月份
        let yearToCheck = dateToCheck.getFullYear();
        let monthToCheck = dateToCheck.getMonth() + 1;

// 判断是否在本月内
        if (currentYear === yearToCheck && currentMonth === monthToCheck) {
            return true
        } else {
            return false
        }

    },
        Vue.prototype.getFrameName = (approve) => {
            if (approve.message) {
                switch (approve.message.frameCoding) {
                    case "13270":
                        return "材料计划单"
                    case "15304":
                        return "采购申请单"
                    case "15306":
                        return "采购订单"
                    case "10531":
                    case "10563":
                        return "合同付款"
                    case "10564":
                        return "合同登记"
                    case "15203":
                        return "文件审批"
                    case "15223":
                        return "办公用品零用"
                    case "15309":
                        return "仓库盘点"
                    case "15313":
                        return "出库单"
                    case '15321':
                        return "退库单"
                    case '15323':
                        return "入库单"
                    case '15327':
                        return "其他入库单"
                    case '102012':
                        return "项目立项"
                    case '102027':
                        return "工程合同"
                    case '137214':
                        return "请假申请"
                    case '1320272':
                        return "行程填报"
                    case '1320273':
                        return "合同签订"
                    case '1320274':
                        return "出差申请单"
                    case '1320279':
                    case '1320276':
                        return "加班申请单"
                    case '1320277':
                        return "用车申请单"
                    case '1320278':
                        return "投标盖章申请表"
                    case '1320280':
                        return "就餐申请"
                    case '1320281':
                        return "工程付款"
                    case '1320282':
                        return "分包合同"
                    case '1320283':
                        return "固定资产采购申请"
                    case '1320284':
                        return "报销申请单"
                    case '1320285':
                        return "车费报销"
                    case '13202782':
                        return "投标盖章申请"
                    default:
                        return ""
                }
            }
        }
}