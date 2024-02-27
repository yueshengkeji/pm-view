<template>
    <v-container>
        <v-form ref="entertainForm">
            <v-row>
                <v-col cols="6" md="2" sm="2" xs="2">
                  <v-combobox v-model="entertain.section"
                              :items="sections"
                              label="接待部门"
                              item-text="name"
                              return-object
                              readonly
                  ></v-combobox>
                </v-col>
              <v-col cols="6" md="2" sm="2" xs="2">
                <v-text-field v-model="entertain.staff.name" label="接待负责人" readonly></v-text-field>
              </v-col>
                <v-col cols="12" md="4" sm="2" xs="2">
                    <v-text-field v-model="entertain.entertainObject" label="宴请(来客)单位" readonly></v-text-field>
                </v-col>
              <v-col cols="6" md="2" sm="2" xs="2">
                <v-text-field v-model="entertain.costPlan" label="预计费用" type="number" readonly
                              onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"></v-text-field>
              </v-col>
              <v-col cols="6" md="2" sm="2" xs="2">
                <v-text-field v-model="entertain.costActual" label="实际费用" type="number"
                              onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                              readonly></v-text-field>
              </v-col>
                <v-col cols="12" md="6" sm="2" xs="2">
                    <v-text-field v-model="entertain.entertainReason" label="招待事由" readonly></v-text-field>
                </v-col>
                <v-col cols="12" md="6" sm="2" xs="2">
                    <v-text-field v-model="entertain.remark" label="备注" readonly></v-text-field>
                </v-col>
              <v-col cols="4" md="3" sm="2" xs="2">
                <v-menu ref="menu" v-model="menu" :close-on-content-click="false">
                  <template v-slot:activator="{attrs,on}">
                    <v-text-field hide-details
                                  v-bind="attrs"
                                  v-on="on"
                                  v-model="entertain.entertainTime"
                                  readonly
                                  label="招待日期"></v-text-field>
                  </template>
                  <v-date-picker v-model="entertain.entertainTime" @change="$refs.menu.save()"></v-date-picker>
                    </v-menu>
                </v-col>
              <v-col cols="4" md="4" sm="2" xs="2">
                <v-text-field v-model="entertain.entertainNumber" label="宴请人数" type="number"
                              onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                              readonly></v-text-field>
              </v-col>
              <v-col cols="4" md="4" sm="2" xs="2">
                <v-text-field v-model="entertain.accompanyingNumber" label="陪同人数" type="number"
                              onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                              readonly></v-text-field>
              </v-col>
            </v-row>
            <v-row>
                <span>招待方式:</span>
                <v-radio-group
                        v-model="entertain.entertainWay"
                        row
                        readonly
                        style="margin: -2px 10px;"
                >
                    <v-radio
                            label="自行安排"
                            value="0"
                    ></v-radio>
                    <v-radio
                            label="公司安排"
                            value="1"
                    ></v-radio>
                    <v-radio
                            label="外出"
                            value="2"
                    ></v-radio>
                </v-radio-group>
            </v-row>
            <v-row>
                <span>招待类别:</span>
                <v-checkbox
                        v-model="entertainCategoryItem"
                        label="六楼小餐厅"
                        value="0"
                        hide-details
                        readonly
                        style="margin: -2px 10px;"
                ></v-checkbox>
            </v-row>
            <v-row style="margin-top: 30px">
                <span>接待用餐标准:</span>
                <v-radio-group
                        v-model="entertain.entertainDiningStandard"
                        row
                        readonly
                        style="margin: -2px 10px;"
                >
                    <v-radio
                            label="A类 300/人"
                            value="0"
                    ></v-radio>
                    <v-radio
                            label="B类 200/人"
                            value="1"
                    ></v-radio>
                    <v-radio
                            label="C类 150/人"
                            value="2"
                    ></v-radio>
                    <v-radio
                            label="其它"
                            value="3"
                    ></v-radio>
                </v-radio-group>
                <v-text-field
                        ref="diningOtherFocus"
                        v-model="entertain.entertainDiningOther"
                        readonly
                        style="margin: -20px 20px"
                ></v-text-field>
            </v-row>
            <v-row>
                <span>招待类型:</span>
                <v-checkbox
                        v-model="entertainTypesItem"
                        label="就餐"
                        value="0"
                        hide-details
                        readonly
                        style="margin: -2px 10px;"
                ></v-checkbox>
                <v-checkbox
                        v-model="entertainTypesItem"
                        label="住宿"
                        value="1"
                        hide-details
                        style="margin: -2px 20px"
                        readonly
                ></v-checkbox>
                <v-checkbox
                        v-model="entertainTypesItem"
                        label="招待用品"
                        value="2"
                        hide-details
                        style="margin: -2px 20px"
                        readonly
                ></v-checkbox>
                <v-checkbox
                        v-model="entertainTypesItem"
                        label="其它"
                        value="3"
                        hide-details
                        style="margin: -2px 20px"
                        readonly
                ></v-checkbox>
                <v-text-field
                        ref="focus"
                        v-model="entertain.entertainTypeOther"
                        required
                        readonly
                        style="margin: -20px 20px"
                ></v-text-field>
            </v-row>
            <v-row v-if="entertainTobaccoAlcoholFlag">
                <v-col cols="12" md="4">
                    <v-checkbox
                            v-model="entertainTobaccoAlcoholItem"
                            label="A级白酒"
                            value="A0"
                            hide-details
                            readonly
                    ></v-checkbox>
                    <v-checkbox
                            v-model="entertainTobaccoAlcoholItem"
                            label="A级红酒"
                            value="A1"
                            hide-details
                            readonly
                    ></v-checkbox>
                    <v-checkbox
                            v-model="entertainTobaccoAlcoholItem"
                            label="A级香烟"
                            value="A2"
                            hide-details
                            readonly
                    ></v-checkbox>
                </v-col>
                <v-col cols="12" md="4">
                    <v-checkbox
                            v-model="entertainTobaccoAlcoholItem"
                            label="B级白酒"
                            value="B0"
                            hide-details
                            readonly
                    ></v-checkbox>
                    <v-checkbox
                            v-model="entertainTobaccoAlcoholItem"
                            label="B级红酒"
                            value="B1"
                            hide-details
                            readonly
                    ></v-checkbox>
                    <v-checkbox
                            v-model="entertainTobaccoAlcoholItem"
                            label="B级香烟"
                            value="B2"
                            hide-details
                            readonly
                    ></v-checkbox>
                </v-col>
                <v-col cols="12" md="4">
                    <v-checkbox
                            v-model="entertainTobaccoAlcoholItem"
                            label="C级白酒"
                            value="C0"
                            hide-details
                            readonly
                    ></v-checkbox>
                    <v-checkbox
                            v-model="entertainTobaccoAlcoholItem"
                            label="C级红酒"
                            value="C1"
                            hide-details
                            readonly
                    ></v-checkbox>
                    <v-checkbox
                            v-model="entertainTobaccoAlcoholItem"
                            label="C级香烟"
                            value="C2"
                            hide-details
                            readonly
                    ></v-checkbox>
                </v-col>
            </v-row>
            <v-row style="margin-top: 30px">
                <span>商务用车:</span>
                <v-radio-group
                        v-model="entertain.entertainCar"
                        row
                        readonly
                        style="margin: -2px 20px"
                >
                    <v-radio
                            label="否"
                            value="0"
                    ></v-radio>
                    <v-radio
                            label="是"
                            value="1"
                    ></v-radio>
                </v-radio-group>
            </v-row>
        </v-form>
    </v-container>
</template>
<script>
    import {selectById} from "../api/entertain";

    export default {
        name:'1320286',
        props:{
            entertainItem:{
                type:Object
            },
            frameId:String
        },
        data:() => ({
            entertain: {
                section: {name:null},
                staff: {name:null},
                entertainObject: null,
                entertainNumber: null,
                accompanyingNumber: null,
                entertainReason: null,
                costPlan: null,
                costActual: null,
                remark: null,
                entertainTypes: null,
                entertainTypeOther: null,
                entertainTobaccoAlcohol: null,
                entertainWay: null,
                entertainCategory: null,
                entertainTime: null,
                entertainDiningStandard: null,
                entertainDiningOther: null,
                entertainCar: null,
                createTime: null,
                updateTime: null,
            },
            sections: [],

            menu: false,
            entertainTypesItem: [],
            entertainTobaccoAlcoholFlag: false,
            entertainTobaccoAlcoholItem: [],
            entertainCategoryItem: [],

            id:null
        }),

        watch:{
            frameId:{
                handler(){
                    if (this.frameId != null){
                        this.id = this.frameId
                        this.selectById()
                    }
                }
            },
            entertainItem:{
                handler(){
                    if (this.entertainItem != null){
                        this.entertain = this.entertainItem
                        this.initData(this.entertain)
                    }
                },
                deep:true
            },
            entertainTypesItem: {
                handler() {
                    if (this.entertainTypesItem.indexOf('2') != -1) {
                        this.entertainTobaccoAlcoholFlag = true
                    } else {
                        this.entertainTobaccoAlcoholFlag = false
                        this.entertainTobaccoAlcoholItem = []
                    }
                },
                deep: true,
            },
        },

        created() {

            if (this.entertainItem != null){
                this.entertain = this.entertainItem
                this.initData(this.entertain)
            } else if (this.frameId != null){
                this.id = this.frameId
                this.resetData()
                this.selectById()
            }
        },

        methods:{

            initData(data){
                let a = data.entertainTypes.split(',')
                a.forEach(item => {
                    if (item != ''){
                        this.entertainTypesItem.push(item)
                    }
                })

                let b = data.entertainTobaccoAlcohol.split(',')
                b.forEach(item => {
                    if (item != ''){
                        this.entertainTobaccoAlcoholItem.push(item)
                    }
                })

                let c = data.entertainCategory.split(',')
                c.forEach(item => {
                    if (item != ''){
                        this.entertainCategoryItem.push(item)
                    }
                })

                this.entertain.entertainCar = data.entertainCar + ''
                this.entertain.entertainDiningStandard = data.entertainDiningStandard + ''
                this.entertain.entertainWay = data.entertainWay + ''

                this.entertain.entertainTime = data.entertainTime.substring(0,10)
            },

            resetData() {
                this.entertain = {
                    section: null,
                    staff: {name:null},
                    entertainObject: null,
                    entertainNumber: null,
                    accompanyingNumber: null,
                    entertainReason: null,
                    costPlan: null,
                    costActual: null,
                    remark: null,
                    entertainTypes: null,
                    entertainTypeOther: null,
                    entertainTobaccoAlcohol: null,
                    entertainWay: null,
                    entertainCategory: null,
                    entertainTime: null,
                    entertainDiningStandard: null,
                    entertainDiningOther: null,
                    entertainCar: null,
                    createTime: null,
                    updateTime: null,
                }
                this.entertainTobaccoAlcoholItem = []
                this.entertainCategoryItem = []
                this.entertainTypesItem = []
            },

            selectById(){
                selectById({id:this.id}).then(res => {
                    this.entertain = res
                    this.initData(this.entertain)
                })
            }
        }
    }
</script>
