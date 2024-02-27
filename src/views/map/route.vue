<template>
  <div>

    <v-row dense>
      <v-col sm="9" cols="12">
        <div id="bdContainerRoute" style="width: 100%;height: 450px"></div>
      </v-col>
      <v-col sm="3" cols="12">
        <div v-html="otherInfo">

        </div>
      </v-col>
    </v-row>

  </div>
</template>

<script>

import {getConfig} from "@/api/systemConfig"
import {loadBaiDuMap} from '@/utils/baiduMap'

export default {
  name: "baiduMapRoute",
  props: {
    data: null,
    otherInfo:null
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
    position: {
      start:{lng:0,lat:0},
      end:{lng:0,lat:0},
    },
    label: '',
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
    setData() {
      this.removeOverlay()
      this.data.center = this.convertGCJ02ToBD09(this.data.center.lng,this.data.center.lat)
      this.data.position.start = this.convertGCJ02ToBD09(this.data.position.start.lng,this.data.position.start.lat)
      this.data.position.end = this.convertGCJ02ToBD09(this.data.position.end.lng,this.data.position.end.lat)
      window.setTimeout(() => {
        this.center = this.data.center
        this.position = this.data.position

        let p1 = new window.BMapGL.Point(this.position.start.lng,this.position.start.lat);
        let p2 = new window.BMapGL.Point(this.position.end.lng,this.position.end.lat);

        let driving = new window.BMapGL.DrivingRoute(this.map, {renderOptions:{map: this.map, autoViewport: true}});
        driving.search(p1, p2);

      }, 300)
    },
    setNewCenter() {
      let point = new window.BMapGL.Point(this.data.center.lng, this.data.center.lat);
      this.map.setCenter(point); // 设置地图中心点
    },
    removeOverlay() {
      this.map.clearOverlays();
    },
    init(BMapGL) {
      this.$nextTick(() => {
        this.map = new window.BMapGL.Map('bdContainerRoute');
        this.map.centerAndZoom(new BMapGL.Point(this.data.center.lng, this.data.center.lat), 18);
        this.map.enableScrollWheelZoom(true);
        this.setData()
      })
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