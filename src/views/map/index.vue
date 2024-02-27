<template>
  <div>
    <!--    <baidu-map :center="center" :zoom="zoom" @ready="handler" class="map"-->
    <!--               ak="4P1SgkF0MUf0MOI0apEFOLso3ztKjQai">-->

    <!--      <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>-->

    <!--      <bm-marker :position="position" animation="BMAP_ANIMATION_BOUNCE" @click="detail">-->
    <!--        <bm-label :content="label"-->
    <!--                  :labelStyle="{fontSize : '16px'}"-->
    <!--                  :offset="{width: -35, height: 30}"/>-->
    <!--      </bm-marker>-->

    <!--    </baidu-map>-->

    <div id="baiduContainer" style="width: 800px;height: 450px">

    </div>

    <v-dialog v-model="imgDialog" width="50%">
      <img :src="img" style="width: 100%;height: auto"/>
    </v-dialog>
  </div>
</template>

<script>

import {getHead} from "@/api/workCheck"
import {getConfig} from "@/api/systemConfig"
import {loadBaiDuMap} from '@/utils/baiduMap'

export default {
  name: "baiduMapIndex",
  props: {
    data: null
  },
  watch: {
    data: {
      handler() {
        if (this.data) {
          this.setData()
        }
      }
    }
  },
  data: () => ({
    center: {lng: 0, lat: 0},
    zoom: 14,
    position: {lng: 116.404, lat: 39.915},
    label: '',
    img: null,
    imgDialog: false,
    map: null
  }),
  created() {
    getConfig("BAIDU_WEB_AK").then(result => {
      if (result && result.value) {
        this.loadBaiDuMap(result.value)
      } else {
        this.message("请配置百度地图BAIDU_AK参数")
      }
    })

  },
  methods: {
    handler() {
      this.setData()
    },
    detail() {
      getHead(this.data.data.type, this.data.data.signBgAvatar || JSON.parse(this.data.data.attache)[0])
          .then(data => {
            this.img = "data:image/png;base64," + data
            this.imgDialog = true
          })
    },
    setData() {
      this.removeOverlay()
      this.data.center = this.convertGCJ02ToBD09(this.data.center.lng,this.data.center.lat)
      this.data.position = this.convertGCJ02ToBD09(this.data.position.lng,this.data.position.lat)
      window.setTimeout(() => {
        this.center = this.data.center
        this.position = this.data.position
        this.label = "<div style='height: auto'>" + this.data.label + "" +
            "<br/>日期：" + this.data.data.date +
            "<br/>考勤时间：" + this.data.data.time +
            "<br/>定位地点：" + this.data.data.column10 + "</div>"

        // 创建点标记
        let marker1 = new window.BMapGL.Marker(new window.BMapGL.Point(this.position.lng, this.position.lat));
        // 在地图上添加点标记
        this.map.addOverlay(marker1);
        this.setLabel()
        this.setNewCenter()

        marker1.addEventListener('click', () => {
          this.detail()
        })
      }, 300)
    },
    setLabel() {
      let opts = {
        position: new window.BMapGL.Point(this.position.lng, this.position.lat), // 指定文本标注所在的地理位置
        offset: new window.BMapGL.Size(20, 10) // 设置文本偏移量
      };
      // 创建文本标注对象
      let label = new window.BMapGL.Label(this.label, opts);
      // 自定义文本标注样式
      label.setStyle({
        color: '#333',
        borderRadius: '5px',
        borderColor: '#ccc',
        padding: '10px',
        fontSize: '16px',
        lineHeight: '30px',
        fontFamily: '微软雅黑'
      });
      this.map.addOverlay(label);
    },
    setNewCenter() {
      let point = new window.BMapGL.Point(this.data.center.lng, this.data.center.lat);
      this.map.setCenter(point); // 设置地图中心点
    },
    removeOverlay() {
      this.map.clearOverlays();
    },
    init(BMapGL) {
      let timeout = window.setInterval(() => {
        let bdC = document.getElementById("baiduContainer")
        if (bdC) {
          clearInterval(timeout)
          this.map = new BMapGL.Map('baiduContainer');
          this.map.centerAndZoom(new BMapGL.Point(this.data.center.lng, this.data.center.lat), 17);
          this.map.enableScrollWheelZoom(true);
          this.setData()
        }
      }, 500)
    },
    loadBaiDuMap(ak) {
      loadBaiDuMap(ak).then(this.init)
    },
  }
}
</script>

<style scoped>
.map {
  width: 100%;
  height: 450px;
}
</style>