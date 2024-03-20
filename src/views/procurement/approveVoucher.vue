<template>
  <div>
    <div :style="{width:$vuetify.breakpoint.width+'px'}"
         id="container"
         class="pb-5 pl-1 pr-10">
      <v-row dense>
        <v-col sm="1">
          <p class="red--text">{{ data.proCompanyName }}</p>
        </v-col>
        <v-col sm="3" cols="12">
          <p>{{ data.company.name }}</p>
        </v-col>
        <v-col sm="2">
          <p>{{ data.contract.name }}</p>
        </v-col>
        <v-col sm="1">
          <p>{{ data.tax }}</p>
        </v-col>
        <v-col sm="2">
          <p>{{ data.pmDate }}</p>
        </v-col>
        <v-col sm="2">
          <p>{{ data.staff.name }}</p>
        </v-col>
        <v-col sm="1">
          <p>{{ data.saleMoney }}</p>
        </v-col>
      </v-row>
      <v-simple-table style="height: auto;min-height: 380px;" class="pa-0">
        <template v-slot:default>
          <thead>
          <tr>
            <th v-for="h in (headers)" :key="h.text" :style="{width:h.width}">
              {{ h.text }}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="(item) in data.material"
              :key="item.name"
          >
            <td style="height: 28px">{{ item.index }}</td>
            <td style="height: 28px">{{ item.material.name }}</td>
            <td style="height: 28px">{{ item.material.model }}</td>
            <td style="height: 28px">{{ item.material.unit.name }}</td>
            <td style="height: 28px">{{ item.material.brand }}</td>
            <td style="height: 28px">{{ item.sum }}</td>
            <td style="height: 28px">{{ item.priceTax }}</td>
            <td style="height: 28px">{{ item.moneyTax }}</td>
            <td style="height: 28px">{{ item.taxMoney }}</td>
          </tr>
          </tbody>
          <tfoot>
          <tr class="bottom-border-table top-border-table">
            <td style="width:6%;height: 28px;">合计:</td>
            <td style="width:25%;height: 28px;"></td>
            <td style="width:9%;height: 28px;"></td>
            <td style="width:8%;height: 28px;"></td>
            <td style="width:5%;height: 28px;"></td>
            <td style="width:8%;height: 28px;"></td>
            <td style="width:8%;height: 28px;"></td>
            <td style="width:9%;height: 28px;">
              {{ data.proMoney }}
            </td>
            <td style="width:10%;height: 28px;"></td>
            <td style="width:5%;height: 28px;"></td>
          </tr>
          <tr class="bottom-border-table">
            <td style="width:6%;height: 28px;">地址:</td>
            <td class="text-left" style="width:32%;height: 28px;" colspan="8">{{ data.city.name }}</td>
          </tr>

          <tr class="bottom-border-table">
            <td style="width:6%;height: 28px;">项目:</td>
            <td class="text-left" style="width:32%;height: 28px;" colspan="3">{{ projectRemark }}</td>
            <td style="width:5%;height: 28px;"></td>
            <td style="width:8%;height: 28px;"></td>
            <td style="width:8%;height: 28px;"></td>
            <td style="width:9%;height: 28px;"></td>
            <td style="width:5%;height: 28px;">
              <div id="approve-flag" v-if="data.state === 1">{{ companyName }}<br>采购专用章</div>
              <div style="position: absolute;right: 50px;bottom:25px" v-if="data.state === 1">
                <canvas id="aCode" ref="aCode" :style="'width: 150px;height:15px;display:inline-table'"></canvas>
                <p class="pl-5" style="margin-top: 5px">扫码上传物流<br/>发票等信息</p>
              </div>
            </td>
          </tr>
          <tr class="bottom-border-table">
            <td style="height: 28px;" colspan="11" class="red--text">
              送货时请附带随货清单(不带采购金额)，并将物流信息发给采购员
            </td>
          </tr>
          </tfoot>
        </template>
      </v-simple-table>
    </div>
  </div>
</template>

<script>
import {getConfig, list as scList} from '@/api/systemConfig'
import {loadById} from '@/api/procurement'
import html2canvas from 'html2canvas'
import QRCode from "qrcode"


export default {
  name: "approveVoucher",
  props: {
    item: Object,
  },
  model: {
    prop: 'item',
    event: 'change'
  },
  data: () => ({
    data: {company: {}, contract: {}, staff: {}, city: {}},
    headers: [
      {text: "序号", value: 'index', width: '5%'},
      {text: "材料名称", value: 'material.name', width: '22%'},
      {text: "型号", value: 'material.model', width: '22%'},
      {text: "单位", value: 'material.unit.name', width: '7%'},
      {text: "品牌", value: 'material.brand', width: '8%'},
      {text: "采购数量", value: 'sum', width: '5%'},
      {text: "单价", value: 'priceTax', width: '8%'},
      {text: "金额", value: 'moneyTax', width: '9%'},
      {text: "税额", value: 'taxMoney', width: '9%'},
    ],
    projectRemark: null,
    companyTypeList: [],
    imgPath: null,
    companyName: null,
    loading: false,
  }),
  created() {
    // let tempToken = this.$route.query.temp_token
    // if (tempToken) {
    //   this.$store.dispatch("setTempToken", tempToken).then(() => {
    //     this.loadConfig()
    //   })
    // } else if (this.$route.params.id) {
    //   this.getById(this.$route.params.id)
    // }
  },
  methods: {
    createCode() {
      window.setTimeout(() => {
        let width = 150,
            height = 150;
        let url = this.$store.state.api.apiUrl + this.$router.options.base + `procurement/express/${this.data.id}`
        if (this.$refs.aCode) {
          this.$refs.aCode.innerHTML = ''
          // new QRCode(
          //     this.$refs.aCode, {
          //       text: url,
          //       width, height,
          //       colorDark: '#000',
          //       colorLight: '#FFF'
          //     });
        }
        QRCode.toCanvas(
            document.getElementById('aCode'),
            url,
            {width, height, toSJISFunc: QRCode.toSJIS},
        );
      }, 80)
    },
    getImgPath() {
      if (this.imgPath != null) {
        return this.imgPath
      }
    },
    runWorker() {

      /*return this.$worker.run(this.genApproveImg, [document.getElementById("container")])
          .then((result) => {
              console.log(result)
          })*/
      return this.genApproveImg(document.getElementById("container"))
    },
    separatorToCamelNaming(name) {
      const nameArr = name.split(/-/g);
      let newName = '';

      for (let i = 0, j = nameArr.length; i < j; i++) {
        const item = nameArr[i];

        if (i === 0) {
          newName += item;
        } else {
          newName += `${item[0].toLocaleUpperCase()}${item.substr(1)}`;
        }
      }

      return newName;
    },
    style2String(node, styleNames) {
      const css = window.getComputedStyle(node);
      const style = [];

      for (const name of styleNames) {
        const fName = this.separatorToCamelNaming(name);
        let value = css[fName];

        if (fName === 'fontFamily') {
          value = value.replace(/"/g, '');
        }

        style.push(`${name}: ${value};`);
      }

      return style.join(' ');
    },
    htmlToText(node) {

      const tags = ['br', 'hr', 'img', 'input', 'param', 'meta', 'link'];

      let txt = '';

      if (node.nodeName !== '#text') {
        const nodeName = node.nodeName.toLowerCase();
        const style = this.style2String(node, [
          'box-sizing', 'padding', 'margin', 'width', 'height', 'font-size', 'font-family',
          'border-radius', 'color', 'text-align', 'background-color'
        ]);

        txt += `<${nodeName} style="${style}">`;

        if (!tags.includes(nodeName)) {
          // 子节点
          const childNodes = node.childNodes;

          for (let i = 0, j = childNodes.length; i < j; i++) {
            txt += this.htmlToText(childNodes[i]);
          }

          txt += `</${nodeName}>`;
        }
      } else {
        txt += node.data;
      }

      return txt;
    },
    // genApproveImgV2(ele) {
    //   let time = new Date().getTime()
    //   return domtoimage
    //       .toPng(ele)
    //       .then((dataUrl) => {
    //         console.log("耗时：", new Date().getTime() - time, dataUrl)
    //         this.imgPath = dataUrl
    //         //输出图片的Base64,dataUrl
    //         // 下载到PC
    //         // const a = document.createElement('a') // 生成一个a元素
    //         // const event = new MouseEvent('click') // 创建一个单击事件
    //         // a.download = 'xxxx' // 设置图片名称没有设置则为默认
    //         // a.href = dataUrl // 将生成的URL设置为a.href属性
    //         // a.dispatchEvent(event) // 触发a的单击事件
    //       })
    //       .catch(function (error) {
    //         console.error('oops, something went wrong!', error)
    //       })
    //
    // },
    genApproveImg(ele) {
      /*if(this.headers.length > 9){
          this.headers.splice(7,1)
          this.headers.splice(this.headers.length-2,2)
      }*/
      let time = new Date().getTime()
      let content = ele
      let scrollHeight = content.scrollHeight
      let scrollWidth = content.scrollWidth
      let height = parseInt(content.style.height)
      scrollHeight = scrollHeight < height ? height : scrollHeight

      return html2canvas(content, {
        scale: window.devicePixelRatio,
        width: scrollWidth - 50,
        height: scrollHeight,
        windowWidth: scrollWidth > 1300 ? scrollWidth * 0.5 : scrollWidth,
        windowHeight: scrollWidth > 1300 ? scrollHeight * 0.5 : scrollHeight,
        x: 0,
        y: 0,
        logging: false
      }).then((canvas) => {
        console.log("转换耗时1:", new Date().getTime() - time)
        let dataURL = canvas.toDataURL("image/jpg");
        this.imgPath = dataURL
        console.log("转换耗时2:", new Date().getTime() - time)
      })
    },
    loadConfig() {
      return getConfig('PRO_COMPANY_TYPE').then(c => {
        scList({parent: c.id, itemsPerPage: 100, page: 1}).then(result => {
          if (result.rows.length > 0) {
            result.rows.forEach(item => {
              item.value = item.value || ''
            })
            this.companyTypeList = result.rows

            if (this.$route.params.id) {
              this.getById(this.$route.params.id);
            }
          }
        })
      })
    },
    setMaterial(procurement) {
      procurement.material.forEach((mater, index) => {
        mater.index = index + 1;
        procurement.proMoney += mater.moneyTax;
        procurement.avgMoneys += mater.sum * mater.applyPrice;

        if (mater.project && this.projectRemark === "" && mater.project.name) {
          this.projectRemark = mater.project.name
        }
      })
      procurement.proMoney = procurement.proMoney.toFixed(2);
      procurement.avgMoneys = procurement.avgMoneys.toFixed(2);
    },
    loadSuccess(procurement) {
      if (procurement.pm01326 == '1') {
        procurement.proCompanyName = '其他采购'
        this.companyName = '其他采购'
      } else {
        procurement.proCompanyName = '默认采购'
        this.companyName = this.$store.state.api.cname
      }
      if (procurement.saleMoney == 0 || procurement.saleMoney == "") {
        procurement.saleMoney = "无优惠"
      }
      if (procurement.state === 1) {
        window.setTimeout(() => {
          this.runWorker().finally(() => {
            this.$emit("loadSuccess", this.data, this.imgPath)
          })
        }, 200)
        this.$emit("loadSuccess", this.data, this.imgPath)
      }
    },
    getById(id) {
      this.imgPath = null
      loadById(id).then((item) => {
        if (!item.contract) {
          item.contract = {}
        }
        this.data = item
        if (this.data.id) {
          this.loadData()
        }
      })
    },
    loadData() {
      this.projectRemark = ""
      let procurement = this.data
      if (procurement != null) {
        this.createCode()
        if (procurement.city == null) {
          procurement.city = {name: null};
        }
        procurement.proMoney = 0.0;
        procurement.avgMoneys = 0.0;
        this.setMaterial(procurement);
        this.loadSuccess(procurement);
      }
    },
    getApproveImg() {
      this.data = this.item
      if (this.data.id) {
        this.imgPath = null
        this.loadData()
      }
    },
  }
}
</script>

<style scoped>
#approve-flag {
  position: absolute;
  right: 230px;
  text-align: center;
  color: red;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid red;
  padding: 2px;
  transform: rotate(7deg);
  user-select: none;
  bottom: 100px;
}

.bottom-border-table > td {
  border-bottom: thin solid rgba(0, 0, 0, 0.12)
}

.top-border-table > td {
  border-top: thin solid rgba(0, 0, 0, 0.12)
}

#container {
  overflow: auto;
  position: fixed;
  z-index: -1;
  left: -9999px;
}
</style>