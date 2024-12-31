<template>
    <v-container>
        <v-form ref="equipmentToRepairForm">
            <v-row>
                <v-col md="2">
                    <v-text-field v-model="experienceCouponItem.name" label="券名"
                                  :rules="rules.name"></v-text-field>
                </v-col>
                <v-col md="3" v-if="newUserFlag">
                    <span>类型:</span>
                    <v-radio-group
                            v-model="experienceCouponItem.newUserFlag"
                            row
                            mandatory
                            style="margin: -2px 10px;"
                    >
                        <v-radio
                                label="非新用户"
                                :value="0"
                        ></v-radio>
                        <v-radio
                                label="新用户"
                                :value="1"
                        ></v-radio>
                    </v-radio-group>
                </v-col>
                <v-col md="3">
                    <span>是否通用:</span>
                    <v-radio-group
                            v-model="experienceCouponItem.universalFlag"
                            row
                            mandatory
                            style="margin: -2px 10px;"
                    >
                        <v-radio
                                label="非通用"
                                :value="0"
                        ></v-radio>
                        <v-radio
                                label="通用"
                                :value="1"
                        ></v-radio>
                    </v-radio-group>
                </v-col>
                <v-col md="3" v-if="autoFlag">
                    <span>是否自动发放:</span>
                    <v-radio-group
                            v-model="experienceCouponItem.autoFlag"
                            row
                            mandatory
                            style="margin: -2px 10px;"
                    >
                        <v-radio
                                label="否"
                                :value="0"
                        ></v-radio>
                        <v-radio
                                label="是"
                                :value="1"
                        ></v-radio>
                    </v-radio-group>
                </v-col>
            </v-row>
            <v-row>
                <v-col md="3">
                    <span>是否会员券:</span>
                    <v-radio-group
                        v-model="experienceCouponItem.vipFlag"
                        row
                        mandatory
                        style="margin: -2px 10px;"
                    >
                        <v-radio
                            label="否"
                            :value="0"
                        ></v-radio>
                        <v-radio
                            label="是"
                            :value="1"
                        ></v-radio>
                    </v-radio-group>
                </v-col>
                <v-col md="3" v-if="vipAutoFlag">
                    <span>是否vip定期发放券:</span>
                    <v-radio-group
                        v-model="experienceCouponItem.vipAutoFlag"
                        row
                        mandatory
                        style="margin: -2px 10px;"
                    >
                        <v-radio
                            label="否"
                            :value="0"
                        ></v-radio>
                        <v-radio
                            label="是"
                            :value="1"
                        ></v-radio>
                    </v-radio-group>
                </v-col>
            </v-row>
            <v-row v-if="useTimeFlag">
                <v-col md="2">
                    <v-menu v-model="menu1" transition="scale-transition" offset-y :close-on-content-click="false"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="experienceCouponItem.startTime"
                                          label="开始日期" hide-details
                                          readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="experienceCouponItem.startTime" no-title scrollable
                                       @change="menu1 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col md="2">
                    <v-menu v-model="menu2" transition="scale-transition" offset-y :close-on-content-click="false"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="experienceCouponItem.endTime"
                                          label="截止日期" hide-details
                                          readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="experienceCouponItem.endTime" no-title scrollable
                                       @change="menu2 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col md="2">
                    <v-text-field v-model="experienceCouponItem.totalNum" label="发放量" type="number"
                    ></v-text-field>
                </v-col>
                <v-col v-if="receiveMonthNumFlag" md="2">
                    <v-text-field v-model="experienceCouponItem.receiveMonthNum" label="会员领取间隔(月)" type="number"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row v-if="rageDaysFlag">
                <v-col md="2">
                    <v-text-field v-model="experienceCouponItem.rangeDays" label="新人券有限天数" type="number"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-text-field v-model="experienceCouponItem.useMethod" label="使用方式"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row v-if="universalFlag">
                <v-col>
                    <v-btn @click="showShops">选择商户</v-btn>
                </v-col>
                <v-col md="12">
                    <v-textarea
                            filled
                            readonly
                            label="参与商户"
                            auto-grow
                            rows="3"
                            row-height="25"
                            v-model="experienceCouponItem.suitableShops"
                    ></v-textarea>
                </v-col>
            </v-row>
            <v-row>
                <v-col md="12">
                    <v-textarea
                            label="描述"
                            auto-grow
                            rows="3"
                            row-height="25"
                            v-model="experienceCouponItem.remark"
                    ></v-textarea>
                </v-col>
            </v-row>
            <v-row>
                <v-col md="4">

                    <v-card>
                        <v-img
                                :src="experienceCouponItem.imageUrl"
                                class="white--text align-end"
                                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                                height="200px"
                        >
                            <v-card-title v-text="'图片上传'"></v-card-title>
                        </v-img>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <file-upload :if-hide="true" @change="fileChange" :clear="clear"
                                         :accept-type="'image/*'"></file-upload>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
            <v-row>
                <div class="box">
                    <div class="box-youhuiquan">
                        <v-img :src="experienceCouponItem.imageUrl" class="box-img"></v-img>
                        <div class="box-desc">
                            <div class="desc-shop">{{ experienceCouponItem.suitableShops }}</div>
                            <div class="desc-title">{{ experienceCouponItem.name }}</div>
                            <div class="desc-use-method">{{ experienceCouponItem.useMethod }}</div>
                            <div class="desc-leave">
                                {{
                                experienceCouponItem.newUserFlag == 0 ? ("剩余" + (experienceCouponItem.totalNum - experienceCouponItem.sentNum) + "张") : ""
                                }}
                            </div>
                            <div class="desc-use-time">
                                {{
                                (experienceCouponItem.startTime != null && experienceCouponItem.endTime != null) ? ("使用时间:" + experienceCouponItem.startTime + "-" + experienceCouponItem.endTime) : ""
                                }}
                            </div>
                        </div>
                    </div>
                </div>
            </v-row>
        </v-form>
        <v-dialog v-model="showShopsDialog" width="60%">
            <v-card>
                <v-card-title>
                    <v-text-field
                            v-model="shopSearch"
                            append-icon="mdi-magnify"
                            label="Search"
                            single-line
                            hide-details
                    ></v-text-field>
                </v-card-title>
                <v-data-table
                        :headers="shopHeaders"
                        :loading="shopsLoading"
                        :items="shopDesserts"
                        :search="shopSearch"
                        v-model="shopsSelected"
                        :options.sync="shopOptions"
                        @click:row="handleRowClick"
                        item-key="id"
                        show-select
                        class="elevation-1"
                ></v-data-table>
            </v-card>
        </v-dialog>

    </v-container>
</template>
<script>
import {zujinList} from "@/api/zujin";
import {update} from "@/api/jxhExperienceCoupon";
import FileUpload from "@/components/fileUpload.vue";
import {getConfig} from "@/api/systemConfig";

export default {
    name: 'updateExperienceCoupon',
    components: {FileUpload},
    props: {
        item: {
            type: Object
        }
    },
    data: () => ({
        experienceCouponItem: {
            id: null,
            name: null,
            suitableShops: null,
            suitableShopIds: null,
            remark: null,
            type: 0,
            discount: 0,
            deduction: 0,
            totalNum: 0,
            sentNum: 0,
            startTime: null,
            endTime: null,
            createTime: null,
            useFlag: null,
            newUserFlag: 0,
            vipFlag: 0,
            universalFlag: 0,
            autoFlag: 0,
            imageUrl: null,
            rangeDays: 0,
            useMethod: null,
            vipAutoFlag:0,
            receiveMonthNum:0
        },
        menu1: false,
        menu2: false,
        useTimeFlag: true,
        universalFlag: true,
        rageDaysFlag: false,
        vipAutoFlag: false,
        autoFlag: true,
        newUserFlag: true,
        receiveMonthNumFlag:false,
        rules: {
            name: [v => !!v || '必填字段', v => (!!v && v.length < 50) || '不超过50个字符']
        },

        //zujinList
        shopsQueryParams: {
            page: 1,
            itemsPerPage: 500,
            endFlag2: 9
        },
        showShopsDialog: false,
        shopSearch: null,
        shopsLoading: false,
        shopHeaders: [
            {text: '商铺名', value: 'brand'},
        ],
        shopDesserts: [],
        shopsSelected: [],
        shopOptions: {},
        shopTotal: 0,

        //图片上传
        clear: false,
        serverHost: '',
        ftpFolder: ''
    }),

    watch: {
        item: {
            handler() {
                if (this.item != null) {
                    this.experienceCouponItem = this.item
                }
            },
            immediate: true
        },

        'experienceCouponItem.newUserFlag': {
            handler() {
                if (this.experienceCouponItem.newUserFlag == 0) {
                    this.useTimeFlag = true
                    this.rageDaysFlag = false
                } else if (this.experienceCouponItem.newUserFlag == 1) {
                    this.useTimeFlag = false
                    this.rageDaysFlag = true
                }
            },
            immediate: true
        },

        'experienceCouponItem.universalFlag': {
            handler() {
                if (this.experienceCouponItem.universalFlag == 0) {
                    this.universalFlag = true
                } else if (this.experienceCouponItem.universalFlag == 1) {
                    this.universalFlag = false
                }
            },
            immediate: true
        },

        'experienceCouponItem.vipFlag':{
            handler(){
                if (this.experienceCouponItem.vipFlag == 0){
                    this.vipAutoFlag = false
                    this.newUserFlag = true
                    this.experienceCouponItem.vipAutoFlag = 0
                }else if (this.experienceCouponItem.vipFlag == 1){
                    this.vipAutoFlag = true
                    this.newUserFlag = false
                    this.experienceCouponItem.newUserFlag = 0
                }
            },
            immediate:true
        },

        'experienceCouponItem.vipAutoFlag':{
            handler(){
                if (this.experienceCouponItem.vipAutoFlag == 0){
                    this.autoFlag = true
                    this.receiveMonthNumFlag = false
                    this.experienceCouponItem.receiveMonthNum = 0
                }else if (this.experienceCouponItem.vipAutoFlag == 1){
                    this.autoFlag = false
                    this.receiveMonthNumFlag = true
                    this.experienceCouponItem.autoFlag = 0
                }
            },
            immediate:true
        },

        shopsSelected: {
            handler() {
                this.dealShopsSelected()
            },
            deep: true
        }
    },

    created() {
        getConfig("NOTIFY_IP").then(result => {
            if (result.id != null) {
                this.serverHost = result.value
            } else {
                this.error = '服务器未配置文件上传路径'
                this.disabled = true
            }
        })
        getConfig("FTP_ROOT_FOLDER").then(result => {
            if (result.id != null) {
                this.ftpFolder = result.value
            } else {
                this.error = '服务器未FTP根目录路径'
                this.disabled = true
            }
        })
    },

    methods: {
        listShops() {
            this.shopsLoading = true
            zujinList(this.shopsQueryParams).then(res => {
                this.shopDesserts = res.rows
                this.shopTotal = res.total
                this.shopsLoading = false
            })
        },

        showShops() {
            this.showShopsDialog = true
            this.listShops()
        },

        handleRowClick(rowData, item) {
            item.select(!item.isSelected);
        },

        dealShopsSelected() {
            this.experienceCouponItem.suitableShops = ''
            this.experienceCouponItem.suitableShopIds = ''
            for (let a = 0; a < this.shopsSelected.length; a++) {
                if (a == this.shopsSelected.length - 1) {
                    this.experienceCouponItem.suitableShops += this.shopsSelected[a].brand
                    this.experienceCouponItem.suitableShopIds += this.shopsSelected[a].id
                } else {
                    this.experienceCouponItem.suitableShops += this.shopsSelected[a].brand + ','
                    this.experienceCouponItem.suitableShopIds += this.shopsSelected[a].id + ','
                }

            }
        },
        validateForm() {
            let flag = null
            if (this.$refs['equipmentToRepairForm'].validate()) {
                flag = true
            } else {
                flag = false
            }
            return flag
        },
        submitAdd() {
            if (this.experienceCouponItem.newUserFlag == 1){
                this.experienceCouponItem.startTime = ""
                this.experienceCouponItem.endTime = ""
            }else {
                this.experienceCouponItem.startTime = this.experienceCouponItem.startTime + " 00:00:00"
                this.experienceCouponItem.endTime = this.experienceCouponItem.endTime + " 23:59:59"
            }
            return update(this.experienceCouponItem).then(res => {
                return res
            })
        },
        reset() {
            this.experienceCouponItem = {
                id: null,
                name: null,
                suitableShops: null,
                suitableShopIds: null,
                remark: null,
                type: 0,
                discount: 0,
                deduction: 0,
                totalNum: 0,
                sentNum: 0,
                startTime: null,
                endTime: null,
                createTime: null,
                useFlag: null,
                newUserFlag: 0,
                vipFlag: 0,
                universalFlag: 0,
                autoFlag: 0,
                imageUrl: null,
                rangeDays: 0,
                useMethod: null
            }
            this.shopsSelected = []
        },

        //图片上传
        fileChange(res) {
            if (res.files.length > 0) {
                this.experienceCouponItem.imageUrl = this.serverHost + this.ftpFolder + "/" + this.parseUrl(res.files[0].ftpPath)
                this.clear = true
            } else if (res.files.length == 0) {
                this.clear = false
            }
        },

        parseUrl(url) {
            let t = url
            t = t.replaceAll("\\", "/")
            return t
        }


    }
}
</script>
<style>
.box {
    width: 600px;
    height: 160px;
    background-color: #FAFAFA;
    border-radius: 5px;
}

.box .box-youhuiquan {
    border: 1px dashed #ffcdcd;
    border-radius: 5px;
    position: relative;
    margin: 10px;
    height: 140px;
    display: flex;
}

.box .box-youhuiquan .box-img {
    margin: 5px;
    width: 28%;
    height: 130px;
}

.box .box-youhuiquan .box-desc {
    width: 65%;
    height: 130px;
    margin: 5px;
    position: relative;
}

.box .box-youhuiquan .box-desc .desc-shop {
    white-space: nowrap; /* 保证文本不会换行 */
    overflow: hidden; /* 超出容器部分隐藏 */
    text-overflow: ellipsis;
    font-size: 25px;
    font-weight: 700;
}

.box .box-youhuiquan .box-desc .desc-title {
    white-space: nowrap; /* 保证文本不会换行 */
    overflow: hidden; /* 超出容器部分隐藏 */
    text-overflow: ellipsis;
    font-size: 18px;
}

.box .box-youhuiquan .box-desc .desc-use-method {
    white-space: nowrap; /* 保证文本不会换行 */
    overflow: hidden; /* 超出容器部分隐藏 */
    text-overflow: ellipsis;
    font-size: 18px;
    color: cornflowerblue;
}

.box .box-youhuiquan .box-desc .desc-leave {
    white-space: nowrap; /* 保证文本不会换行 */
    overflow: hidden; /* 超出容器部分隐藏 */
    text-overflow: ellipsis;
    font-size: 15px;
    color: coral;
}

.box .box-youhuiquan .box-desc .desc-use-time {
    white-space: nowrap; /* 保证文本不会换行 */
    overflow: hidden; /* 超出容器部分隐藏 */
    text-overflow: ellipsis;
    font-size: 12px;
    position: absolute;
    bottom: 0;
}
</style>
