import {getConfig} from "@/api/systemConfig";
export function getAddress() {
    return new Promise((resolve, reject) => {

        getConfig('baseAddress').then(result => {
            let baseAddress = {title: null, fax: null, tel: null}
            try {
                if (result) {
                    let data = result.value.split(";")
                    baseAddress.title = data[0]
                    baseAddress.fax = data[1]
                    baseAddress.tel = data[2]
                } else {
                    baseAddress.title = "江苏省南通市经济技术开发区通富南路45号"
                    baseAddress.fax = "0513-85516123"
                    baseAddress.tel = "0513-85516128"
                }
            } catch (e) {
                baseAddress.title = "江苏省南通市经济技术开发区通富南路45号"
                baseAddress.fax = "0513-85516123"
                baseAddress.tel = "0513-85516128"
            }
            resolve(baseAddress)
        }).catch(() => reject())
    })
}