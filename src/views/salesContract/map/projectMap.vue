<template>
    <baidu-map class="bm-view" :ak="ak" :zoom="zoom" :center="center" :scroll-wheel-zoom="true"
               @ready="mapReady">
        <bml-marker-clusterer>
            <bm-marker v-for="marker in markers" :key="marker.id" :position="{lng: marker.lng, lat: marker.lat}"
                       :title="marker.projectBase" @mouseover="getBMarker(marker)" @mouseout="closeBMInfoWindow" @click="showContract(marker.id)">

            </bm-marker>
            <bm-info-window :show="show" :position="{lng: markerItem.lng, lat: markerItem.lat}" @close="infoWindowClose" @open="infoWindowOpen">
                {{markerItem.agreementName}}</bm-info-window>
        </bml-marker-clusterer>

        <div class="buttonBox">
            <v-btn @click="setProjectMap" :loading="loadingBtn" style="margin-left: 10px">重置定位</v-btn>
        </div>
        <v-dialog v-model="contractItemDialog">
            <sales-contract-item :frame-id="itemId"></sales-contract-item>
        </v-dialog>
    </baidu-map>

</template>
<script>
    import BaiduMap from 'vue-baidu-map/components/map/Map.vue'
    import BmlMarkerClusterer from 'vue-baidu-map/components/extra/MarkerClusterer.vue'
    import BmMarker from 'vue-baidu-map/components/overlays/Marker.vue'
    import BmInfoWindow from 'vue-baidu-map/components/overlays/InfoWindow.vue'
    import SalesContract from '@/api/salesContract';
    import {getConfig} from "@/api/systemConfig"
    import salesContractItem from "../../../components/132027.vue"

    export default {
        name: 'projectMap',
        components: {BaiduMap, BmlMarkerClusterer, BmMarker,BmInfoWindow,salesContractItem},
        data: () => ({
            ak: 'KjCrqv3vWmMi8jYnPDELjg6cVGmsqTzb',
            zoom: 0,
            center: {
                lng: 120,
                lat: 32
            },
            map: null,
            BMap: null,
            markers: [],
            loadingBtn:false,

            //信息窗口
            show:false,
            markerItem:{
                lng:0,
                lat:0,
                projectBase:'',
                agreementName:''
            },

            //合同详情
            itemId:null,
            contractItemDialog:false

        }),

        watch:{
            contractItemDialog(val){
                val || this.closeContractItemDialog()
            }
        },

        created() {
            getConfig("BAIDU_WEB_AK").then(result => {
                if (result && result.value) {
                    this.ak = result.value
                } else {
                    this.message("请配置百度地图BAIDU_AK参数")
                }
            })
            this.getMarkers()
        },

        methods: {
            mapReady({BMap, map}) {
                this.center.lat = 31.947129
                this.center.lng = 120.921896
                this.zoom = 10
                this.map = map
                this.BMap = BMap
            },
            getMarkers() {
                SalesContract.getProjectMap().then(res => {
                    this.markers = res
                })
            },
            setProjectMap(){
                this.loadingBtn = true
                SalesContract.setProjectMap().then(res => {
                    console.log(res)
                    this.loadingBtn = false
                })
            },
            infoWindowClose () {
                this.show = false
            },
            infoWindowOpen(){
                this.show = true
            },
            getBMarker (marker) {
                this.markerItem = marker
                this.$nextTick(() => {
                    this.show = true
                })
            },
            closeBMInfoWindow(){
                this.show = false
            },
            showContract(id){
                this.itemId = id
                this.contractItemDialog = true

            },
            closeContractItemDialog(){
                this.contractItemDialog = false
                this.itemId = null
            }
        }
    }
</script>
<style>
    .bm-view {
        width: 100%;
        height: 100vh;
    }

    .buttonBox{
        position: absolute;
        left: 20px;
        top: 40px;
        overflow: hidden;
        z-index: 99999;
    }
</style>
