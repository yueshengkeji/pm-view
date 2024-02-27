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
                                :rules="rules.sectionRule"
                    ></v-combobox>
                </v-col>
                <v-col cols="6" md="2" sm="2" xs="2">
                    <v-text-field v-model="entertain.staff.name" label="接待负责人" disabled></v-text-field>
                </v-col>
                <v-col cols="12" md="4" sm="2" xs="2">
                    <v-text-field v-model="entertain.entertainObject" label="宴请(来客)单位"
                                  :rules="rules.entertainObjectRule"></v-text-field>
                </v-col>
                <v-col cols="6" md="2" sm="2" xs="2">
                    <v-text-field v-model="entertain.costPlan" label="预计费用" type="number" disabled
                                  onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                  :rules="rules.costPlanRule"></v-text-field>
                </v-col>
                <v-col cols="6" md="2" sm="2" xs="2">
                    <v-text-field v-model="entertain.costActual" label="实际费用" type="number"
                                  onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                  :rules="rules.costActualRule"></v-text-field>
                </v-col>
                <v-col cols="12" md="6" sm="2" xs="2">
                    <v-text-field v-model="entertain.entertainReason" label="招待事由"
                                  :rules="rules.entertainReasonRule"></v-text-field>
                </v-col>
                <v-col cols="12" md="6" sm="2" xs="2">
                    <v-text-field v-model="entertain.remark" label="备注" :rules="rules.remarkRule"></v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="2" xs="2">
                    <v-menu ref="menu" v-model="menu" :close-on-content-click="false">
                        <template v-slot:activator="{attrs,on}">
                            <v-text-field hide-details
                                          v-bind="attrs"
                                          v-on="on"
                                          v-model="entertain.entertainTime"
                                          :rules="rules.entertainTimeRule"
                                          label="招待日期"></v-text-field>
                        </template>
                        <v-date-picker v-model="entertain.entertainTime" @change="$refs.menu.save()"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" md="3" sm="2" xs="2">
                    <v-text-field v-model="entertain.entertainNumber" label="宴请人数" type="number"
                                  onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                  :rules="rules.entertainNumberRule"></v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="2" xs="2">
                    <v-text-field v-model="entertain.accompanyingNumber" label="陪同人数" type="number"
                                  onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                  :rules="rules.accompanyingNumberRule"></v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="2" xs="2">
                    <easy-flow coding="1320286" ref="entertainFlow" :default-flow-name="defaultFlow"></easy-flow>
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
                        :rules="rules.entertainDiningOtherRule"
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
                        style="margin: -2px 10px"
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
                        :rules="rules.entertainTypeOtherRule"
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
        <!--加载框-->
        <v-dialog v-model="loadDialog"
                  hide-overlay
                  persistent
                  width="300">
            <v-card
                    color="primary"
                    dark>
                <v-card-text>
                    正在处理。。。
                    <v-progress-linear
                            indeterminate
                            color="white"
                            class="mb-0"
                    ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-container>
</template>
<script>

    import {selectById, update} from "../../../api/entertain";
    import { list} from "../../../api/section";
    import easyFlow from "../../../components/easyflow/easyFlow";

    export default {
        name: 'updateEntertain',
        components: {easyFlow},
        props: {
            entertainItem: {
                type: Object
            }
        },
        data: () => ({
            loadDialog:false,
            entertain: {
                section: null,
                staff: {name: null},
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

            defaultFlow: null,

            menu: false,
            entertainTypesItem: [],
            entertainTobaccoAlcoholFlag: false,
            entertainTobaccoAlcoholItem: [],
            entertainCategoryItem: [],

            rules: {
                sectionRule: [
                    v => !!v || '必填字段'
                ],
                entertainObjectRule: [
                    v => !!v || '必填字段', v => (v == null || v == '' || (!!v && v.length) <= 100) || "不超过100个字符"
                ],
                costPlanRule: [
                    v => !!v || '必填字段', v => v > 0 || '请输入正确的数值'
                ],
                costActualRule: [
                    v => !!v || '必填字段', v => v > 0 || '请输入正确的数值'
                ],
                entertainReasonRule: [
                    v => !!v || '必填字段',
                ],
                remarkRule: [
                    v => (v == null || v == '' || (!!v && v.length) <= 500) || "不超过500个字符"
                ],
                entertainTimeRule: [
                    v => !!v || '必填字段'
                ],
                entertainNumberRule: [
                    v => !!v || '必填字段', v => v > 0 || '请输入正确的数值'
                ],
                accompanyingNumberRule: [
                    v => !!v || '必填字段', v => v > 0 || '请输入正确的数值'
                ],
                entertainDiningOtherRule: [
                    v => (v == null || v == '' || (!!v && v.length) <= 250) || "不超过250个字符"
                ],
                entertainTypeOtherRule: [
                    v => (v == null || v == '' || (!!v && v.length) <= 250) || "不超过250个字符"
                ]
            }
        }),

        watch: {
            entertainItem: {
                handler() {
                    console.log(this.entertainItem)
                    if (this.entertainItem != null) {
                        this.entertain = this.entertainItem
                        this.initData(this.entertain)
                    }
                },
                deep: true
            },
            entertainTypesItem: {
                handler() {
                    console.log(this.entertainTypesItem)
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
            if (this.$store.state.user.sectionName.indexOf("市场") !== -1) {
                this.defaultFlow = "招待申请（市场）"
            }
            this.loadSections()
            if (this.entertainItem != null) {
                this.entertain = this.entertainItem
                this.initData(this.entertain)
            } else if (this.$route.params.id) {
                selectById({id: this.$route.params.id}).then(res => {
                    this.entertain = res
                    this.initData(this.entertain)
                })
            }
        },

        methods: {
            loadSections() {
                list().then(result => {
                    this.sections = result
                })
            },
            initData(data) {
                let a = data.entertainTypes.split(',')
                a.forEach(item => {
                    if (item != '') {
                        this.entertainTypesItem.push(item)
                    }
                })

                let b = data.entertainTobaccoAlcohol.split(',')
                b.forEach(item => {
                    if (item != '') {
                        this.entertainTobaccoAlcoholItem.push(item)
                    }
                })

                let c = data.entertainCategory.split(',')
                c.forEach(item => {
                    if (item != '') {
                        this.entertainCategoryItem.push(item)
                    }
                })

                this.entertain.entertainCar = data.entertainCar + ''
                this.entertain.entertainDiningStandard = data.entertainDiningStandard + ''
                this.entertain.entertainWay = data.entertainWay + ''

                this.entertain.entertainTime = data.entertainTime.substring(0, 10)
            },
            validateForm() {
                let flag = null
                if (this.$refs['entertainForm'].validate()) {
                    flag = true
                } else {
                    flag = false
                }
                return flag
            },

            resetFormRules() {
                this.clear = true
                this.$refs['entertainForm'].resetValidation()
            },
            update() {
                this.loadDialog = true
                return update(this.entertain).then(res => {
                    this.$refs['entertainFlow'].startFlow({
                        title: "关于对《" + this.entertain.entertainObject + "》的招待",
                        content: this.entertain.entertainReason == null ? "" : res.entertainReason,
                        frameId: this.entertain.id,
                        frameCoding: 1320286,
                        frameColumn: 'id'
                    }).then()
                    this.loadDialog = false
                    return res
                })
            },
            resetData() {
                this.entertain = {
                    section: null,
                    staff: null,
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

        }
    }
</script>
