<template>
    <div>
        <!--<v-select :items="floor"
                  v-model="thanFloor"
                  @change="loadHouses">
        </v-select>-->
        <div style="position: absolute;top:100px;z-index: 99;">
            <v-chip v-for="(f) in floor" :key="f.id" :color="f === thanFloor ? 'primary' : ''" @click="reloadFloor(f)">
                {{f}}
            </v-chip>
        </div>
        <div id="chart" :style="'width:100%;height:613px'"></div>
        <v-snackbar v-model="msgShow">{{msg}}</v-snackbar>
        <v-dialog v-model="zujinDialog">
            <zujin-list :loadDetailByHouse="thanFloorItem" @closeDialog="closeZujinDialog"></zujin-list>
        </v-dialog>
    </div>
</template>

<script>
    import * as echarts from 'echarts';
    import {floors, houseList, mapJson} from '@/api/house';
    import zujinList from '@/views/zj/list'

    export default {
        components:{
            zujinList
        },
        name: "house-map",
        data: () => ({
            zujinDialog:false,
            ec: null,
            lygJson: {},
            height: 0,
            floor: [],
            thanFloor: null,
            /*
            5.0
            -2500
            */
            zoom: 1.2,
            left: '25%',
            top: '10%',
            msgShow: false,
            msg: null,
            thanFloorItem: {
                id:null,
            }
        }),
        props: {
            loadFloor: String,
        },
        watch: {
            loadFloor: {
                handler() {
                    if (this.loadFloor != null) {
                        this.reloadFloor(this.loadFloor);
                    }
                },
                deep: true
            }
        },
        created() {
            this.loadFloors()
        },
        mounted() {
            this.$nextTick(() => {
                this.height = document.body.clientHeight
                this.init()
            })

        },
        methods: {
            closeZujinDialog(){
                this.thanFloorItem = null
                this.zujinDialog = false
            },
            loadFloors() {
                floors().then(res => {
                    let rows = [];
                    res.forEach((item, idx) => {
                        if (idx <= 5) {
                            rows.push(item)
                        }
                    })
                    this.floor = rows
                    if (res != null) {
                        if (this.loadFloor != null) {
                            this.thanFloor = this.loadFloor
                        } else {
                            this.thanFloor = this.floor[0]
                        }
                        this.loadHouses()
                    }
                })
            },
            reloadFloor(floor) {
                this.thanFloor = floor
                this.loadHouses()
            },
            loadHouses() {
                if (this.ec != null) {
                    this.ec.showLoading()
                }
                houseList({page: 0, itemsPerPage: 1000, floor: this.thanFloor}).then(data => {
                    let chartsData = [];
                    data.rows.forEach((item, idx) => {
                        let d = {
                            index: idx,
                            id: item.id,
                            value: item.flag,
                            name: item.pwNumber + "\r\n" + item.brandName
                        }
                        chartsData.push(d)
                    })

                    mapJson(this.thanFloor).then(data => {
                        if (data == null || data.json == null) {
                            this.msg = "地图数据不存在"
                            this.msgShow = true
                            return
                        }
                        data = JSON.parse(data.json);
                        // this.zoom = "1.2"
                        // this.left = "25%"
                        // this.top = "10%"
                        /*if (this.thanFloor == "2F") {

                        } else if (this.thanFloor == "1F") {
                            this.zoom = "1.2"
                            this.left = "25%"
                            this.top = "10%"
                        } else if (this.thanFloor == "3F") {
                            this.zoom = "1.2"
                            this.left = "25%"
                            this.top = "10%"
                        } else if (this.thanFloor == "5F") {
                            this.zoom = "1.2"
                            this.left = "25%"
                            this.top = "10%"
                        } else if (this.thanFloor == "4F") {
                            this.zoom = "1.2"
                            this.left = "25%"
                            this.top = "10%"
                        } else if (this.thanFloor == "F6") {
                            this.zoom = "1.0"
                            this.left = "10%"
                            this.top = "15%"
                        } else {
                            this.zoom = "1.5"
                            this.left = "25%"
                            this.top = "20%"
                        }*/
                        let rows = data;
                        let newData = [];
                        rows.features.forEach((item, idx) => {
                            if (item.type != "Point") {
                                if (item.geometry.coordinates != null && item.geometry.coordinates.length > 0) {
                                    // if (idx == 5279) {
                                    //     item.properties.name = "2F-001"
                                    // } else {
                                    //     item.properties.name = item.properties.Text + "" + newData.length
                                    // }
                                    if (item.geometry.type == "Point" || item.geometry.type == "MultiLineString") {
                                        return;
                                    } else {
                                        // item.type = "Polygon"
                                        item.properties.id = idx
                                        newData.push(item)
                                    }
                                } else {
                                    console.log("item", item, idx)
                                }
                            }
                        })
                        rows.features = newData
                        // newData = newData.splice(2000,5000)
                        this.lygJson = rows
                        this.load(chartsData)
                    })
                })
            },
            load(data) {
                this.ec.clear();
                let option = {
                    title: {
                        text: '锦绣汇',
                        subtext: '商铺总览图',
                        sublink: '',
                        left: 'right'
                    },
                    tooltip: {
                        trigger: 'item',
                        showDelay: 0,
                        transitionDuration: 0.2,
                        formatter: function (params) {
                            return params.seriesName + '<br/>' + params.name;
                        }
                    },
                    toolbox: {
                        show: true,
                        //orient: 'vertical',
                        left: 'left',
                        top: 'top',
                        feature: {
                            dataView: {readOnly: false},
                            restore: {},
                            saveAsImage: {}
                        }
                    },
                    dataRange: {
                        x: 'left',
                        y: 'center',
                        splitList: [
                            {start: 0, end: 0.9, label: '未租', color: '#b6b4b4'},
                            {start: 1, end: 1.9, label: '已租', color: '#0dd417'},
                            {start: 2, end: 2.9, label: '欠租', color: '#c71a1a'},
                        ]
                    },
                    series: [
                        {
                            name: '连云港-' + this.thanFloor,
                            zoom: this.zoom,
                            left: this.left,
                            top: this.top,
                            type: 'map',
                            roam: true,
                            map: '连云港',
                            emphasis: {
                                label: {
                                    show: true
                                }
                            },
                            label: {
                                show: true
                            },
                            // 文本位置修正
                            textFixed: {
                                Alaska: [20, -20]
                            },
                            data: data /*[
                                {name: '1F-001', value: 1},
                                {name: '1F-002', value: 0},
                                {name: '1F-003', value: 2},
                                {name: '1F-005', value: 5}
                            ]*/
                        }
                    ],
                    dataZoom: {
                        start: 50,
                        end: 100,
                    }
                }
                echarts.registerMap('连云港', this.lygJson)
                this.ec.setOption(option)
                this.ec.hideLoading()
            },
            init() {
                let div = document.getElementById("chart")
                div.style.height = this.height
                this.ec = echarts.init(div)
                this.ec.on('click',  (params) => {
                    if(params.data == null){
                        this.msg = "该商铺未登记合同"
                        this.msgShow = true
                        return
                    }
                    if(this.loadFloor == null){
                        this.thanFloorItem = params.data
                        this.zujinDialog = true
                    }else{
                        this.$emit("clickHouse",params.data)
                    }
                });
            }
        }
    }
</script>

<style scoped>

</style>