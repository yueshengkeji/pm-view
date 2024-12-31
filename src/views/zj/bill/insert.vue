<template>
    <div>
        <v-card class="pa-3">
            <v-card-title>收款登记</v-card-title>
            <v-form ref="form">
                <v-row>
                    <v-col cols="3">
                        <v-autocomplete label="客户名称"
                                        item-text="brandCompany.name"
                                        return-object
                                        :search-input.sync="searchConcat"
                                        :items.sync="zujinList"
                                        v-model="concat"
                                        @change="zujinChangeHandler"></v-autocomplete>
                    </v-col>
                    <v-col cols="3">
                        <v-text-field label="铺位号" v-model="d.room"></v-text-field>
                    </v-col>
                    <v-col cols="3">
                        <v-text-field label="楼层" v-model="d.floor"></v-text-field>
                    </v-col>
                    <v-col cols="3">
                        <v-text-field label="品牌" v-model="d.brand"></v-text-field>
                    </v-col>
                    <v-col cols="3">
                        <v-combobox label="费用名称*" v-model="d.name" :items="nameItems"
                                    :rules="[v => !!v || '请选择费用名称']"></v-combobox>
                    </v-col>
                    <v-col cols="3">
                        <v-menu v-model="menu" transition="scale-transition" offset-y :close-on-content-click="false"
                                min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field v-model="d.payEndDate"
                                              :rules="[v => !!v || '请选择应收日期']"
                                              label="应收日期*"
                                              readonly v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="d.payEndDate" no-title scrollable></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="3">
                        <v-text-field type="number" label="应收金额*" v-model="d.money"
                                      :rules="[v => !!v || '请输入应收金额']" readonly></v-text-field>
                    </v-col>
                    <v-col cols="3">
                        <v-text-field type="number" label="已收金额" v-model="d.payMoney" readonly></v-text-field>
                    </v-col>
                    <v-col cols="3">
                        <v-text-field type="number" label="已退金额" v-model="d.backMoney"></v-text-field>
                    </v-col>
                    <v-col cols="3">
                        <v-text-field type="number" label="抵扣金额" v-model="d.sjMoney" readonly></v-text-field>
                    </v-col>
                    <v-col cols="3">
                        <v-text-field type="number" label="减免金额" v-model="d.reduce" readonly></v-text-field>
                    </v-col>
                    <v-col cols="3">
                        <v-select label="合同类型"
                                  :items="concatTypes"
                                  v-model="d.concatType"></v-select>
                    </v-col>

                    <v-col cols="3">
                        <v-menu v-model="menu2" transition="scale-transition" offset-y :close-on-content-click="false"
                                min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field v-model="d.startDate"
                                              label="账单区间开始日期"
                                              readonly v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="d.startDate" no-title scrollable></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="3">
                        <v-menu v-model="menu3" transition="scale-transition" offset-y :close-on-content-click="false"
                                min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field v-model="d.endDate"
                                              label="账单区间截止日期"
                                              readonly v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="d.endDate" no-title scrollable></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="3">
                        <v-checkbox label="已开票" v-model="d.invoiceState"></v-checkbox>
                    </v-col>
                    <v-col cols>
                        <v-text-field label="备注" v-model="d.remark"></v-text-field>
                    </v-col>
                </v-row>
            </v-form>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn outlined @click="showDeduction" color="indigo">减免抵扣记录</v-btn>
                <v-btn outlined @click="showCollect" color="indigo">收款记录</v-btn>
                <v-btn outlined @click="deleteHandler" :disabled="d.id == null" color="error">作废单据</v-btn>
                <v-btn outlined @click="ysHandler" :disabled="d.money <= 0" color="success">确认已收款</v-btn>
                <v-btn @click="saveHandler" color="primary">保存</v-btn>
                <v-btn @click="$emit('close')">关闭</v-btn>
            </v-card-actions>

            <v-dialog v-model="deductionDialog" width="80%">
                <v-data-table
                        :headers="deductionHeader"
                        :items="deductionDessert"
                        :disable-pagination="true"
                        hide-default-footer
                        dense
                >
                    <template v-slot:top>
                        <v-toolbar
                                flat
                        >
                            <v-toolbar-title>减免抵扣列表
                            </v-toolbar-title>
                            <v-divider
                                    class="mx-4"
                                    inset
                                    vertical
                            ></v-divider>
                            <v-spacer></v-spacer>

                        </v-toolbar>
                    </template>
                    <template v-slot:item.state="{item}">
                        {{formatDeductionState(item.state)}}
                    </template>
                    <template v-slot:item.type="{item}">
                        {{ formatType(item.type) }}
                    </template>
                    <template v-slot:item.action="{item}">
                        <v-btn x-small :disabled="!(item.state == 1)" @click="revokeAction(item,1)">撤销</v-btn>
                    </template>
                </v-data-table>
            </v-dialog>

            <v-dialog v-model="collectDialog" width="80%">
                <v-data-table
                    :headers="collectHeader"
                    :items="collectDessert"
                    :disable-pagination="true"
                    hide-default-footer
                    dense
                >
                    <template v-slot:top>
                        <v-toolbar
                            flat
                        >
                            <v-toolbar-title>收款列表
                            </v-toolbar-title>
                            <v-divider
                                class="mx-4"
                                inset
                                vertical
                            ></v-divider>
                            <v-spacer></v-spacer>

                        </v-toolbar>
                    </template>
                    <template v-slot:item.state="{item}">
                        {{formatDeductionState(item.state)}}
                    </template>
                    <template v-slot:item.action="{item}">
                        <v-btn x-small :disabled="!(item.state == 1)" @click="revokeAction(item,2)">撤销</v-btn>
                    </template>
                </v-data-table>
            </v-dialog>

            <v-dialog v-model="revokeDialog" width="60%">
                <v-card>
                    <v-col>
                        <v-textarea v-model="deductionItem.revokeReason" label="撤销原因"></v-textarea>
                    </v-col>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="revokeConfirm">提交</v-btn>
                        <v-btn @click="revokeDialog = false">取消</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-dialog v-model="revokeCollectDialog" width="60%">
                <v-card>
                    <v-col>
                        <v-textarea v-model="collectItem.revokeReason" label="撤销原因"></v-textarea>
                    </v-col>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="revokeCollectConfirm">提交</v-btn>
                        <v-btn @click="revokeDialog = false">取消</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!--消息框-->
            <v-snackbar v-model="showSnackbarDialog"
                        :timeout="timeout"
                        :centered="true"
            >
                {{ msg }}
            </v-snackbar>

        </v-card>
    </div>
</template>

<script>
import {
    deleteBill,
    insertBill,
    queryById,
    updateBill,
    zujinList,
    listDeductionList,
    revokeDeduction
} from "@/api/zujin";
import {listZuJinCollect,revokeCollect} from "@/api/zuJinCollect";

export default {
    name: "bill-insert",
    data: () => ({
        searchConcat: null,
        menu: false,
        nameItems: ["租金", "管理费", "推广服务费", "二清管理费", "装修管理费"],
        zujinList: [],
        d: {
            room: null,
            floor: null,
            brand: null,
            name: null,
            payEndDate: null,
            money: null,
            payMoney: null,
            backMoney: null,
            sjMoney: null,
            concatType: null,
            startDate: null,
            endDate: null,
            invoiceState: false,
            remark: null,
            reduce: null,
        },
        concatTypes: [
            {value: '0', text: '租赁合同'},
            {value: '2', text: '多经类合同'},
            {value: '1', text: '物业管理'},],
        concat: null,
        menu2: false,
        menu3: false,

        //抵扣减免列表
        deductionDialog: false,
        deductionHeader: [
            {value: 'deductionMoney', text: '金额'},
            {value: 'remark', text: '备注'},
            {value: 'createTime', text: '登记时间'},
            {value: 'staff.name', text: '登记人'},
            {value: 'state', text: '审核状态'},
            {value: 'type', text: '类型'},
            {value: 'revoker.name', text: '撤销人'},
            {value: 'revokeTime', text: '撤销时间'},
            {value: 'revokeReason', text: '撤销原因'},
            {value: 'action', text: '操作'},
        ],
        deductionDessert: [],
        //收款列表
        collectDialog:false,
        collectHeader:[
            {value: 'collectMoney', text: '收款金额'},
            {value: 'remark', text: '备注'},
            {value: 'collectCompanyName', text: '付款单位'},
            {value: 'collectCompanyOpenAccount', text: '开户行'},
            {value: 'collectCompanyBankNumber', text: '银行账号'},
            {value: 'collectDate', text: '收款时间'},
            {value: 'staff.name', text: '登记人'},
            {value: 'state', text: '审核状态'},
            {value: 'action', text: '操作'},
        ],
        collectDessert: [],

        //撤销
        deductionItem: {
            id: null,
            billId: null,
            deductionMoney: 0,
            remark: null,
            staff: null,
            type: null,
            revoker: null,
            revokeTime: null,
            revokeReason: null
        },
        revokeDialog: false,

        revokeCollectDialog:false,
        collectItem: {
            id: null,
            billId: null,
            collectCompanyName: null,
            collectCompanyOpenAccount: null,
            collectCompanyBankNumber: null,
            collectMoney: 0,
            remark: null,
            staff: null,
            revoker: null,
            revokeTime: null,
            revokeReason: null,
        },
        //消息框
        showSnackbarDialog: false,
        timeout: 2000,
        msg: null,
    }),
    methods: {
        deleteHandler() {
            this.confirm("确定作废吗？不可恢复").then(() => {
                deleteBill(this.d.id).then(result => {
                    this.$emit("close", result)
                })
            })
        },
        saveHandler() {
            let valid = this.$refs.form.validate()
            if (valid) {
                let req
                if (this.d.invoiceState == true) {
                    this.d.invoiceState = 1
                } else {
                    this.d.invoiceState = 0
                }
                if (this.d.id) {
                    req = updateBill(this.d)
                } else {
                    req = insertBill(this.d)
                }
                req.then(result => {
                    this.$emit("close", result)
                }).finally(() => {
                    this.reset()
                })
            }
        },
        reset() {
            this.d = {
                room: null,
                floor: null,
                brand: null,
                name: null,
                payEndDate: null,
                money: null,
                payMoney: null,
                backMoney: null,
                sjMoney: null,
                concatType: null,
                startDate: null,
                endDate: null,
                remark: null,
                reduce: null,
            }
        },
        zujinChangeHandler() {
            this.d.concatId = this.concat.id
            this.d.brand = this.concat.brand
            this.d.concatType = this.concat.companyType
            queryById(this.concat.id).then(result => {
                if (result.houses) {
                    result.houses.forEach(item => {
                        this.d.floor = item.floor
                        this.d.room = item.pwNumber
                    })
                }
            })
        },
        ysHandler() {
            this.d.payMoney = this.d.sjMoney || this.d.money
            this.saveHandler()
        },

        //抵扣，减免
        showDeduction() {
            listDeductionList({billId: this.d.id}).then(res => {
                this.deductionDessert = res
                this.deductionDialog = true
            })
        },

        revokeAction(item,flag) {
            if (flag == 1){
                this.deductionItem = item
                this.revokeDialog = true
            }else if (flag == 2){
                this.collectItem = item
                this.revokeCollectDialog = true
            }
        },
        revokeConfirm() {
            revokeDeduction(this.deductionItem).then(res => {
                if (res > 0) {
                    this.msg = '撤销成功'
                    this.revokeDialog = false
                    this.showSnackbarDialog = true
                    this.showDeduction()
                    this.revokeSuccess()
                }
            }).catch((e) => {
                this.msg = e
                this.showSnackbarDialog = true
            })
        },
        revokeSuccess() {
            if (this.deductionItem.type == 0){
                this.d.sjMoney = this.d.sjMoney - this.deductionItem.deductionMoney
            }else if (this.deductionItem.type == 1){
                this.d.reduce = this.d.reduce - this.deductionItem.deductionMoney
            }},

        //收款
        showCollect(){
            listZuJinCollect({billId: this.d.id}).then(res => {
                this.collectDessert = res
                this.collectDialog = true
            })
        },

        revokeCollectConfirm(){
            revokeCollect(this.collectItem).then(res => {
                if (res > 0) {
                    this.msg = '撤销成功'
                    this.revokeCollectDialog = false
                    this.showSnackbarDialog = true
                    this.showCollect()
                    this.revokeCollectSuccess()
                }
            }).catch((e) => {
                this.msg = e
                this.showSnackbarDialog = true
            })
        },
        revokeCollectSuccess(){
            this.d.payMoney = this.d.payMoney - this.collectItem.collectMoney
        },

        formatDeductionState(state) {
            switch (state) {
                case 2:
                    return '已撤销'
                case 1:
                    return '已审核'
                default:
                case 0:
                    return '未审核'
            }
        },
        formatType(type){
            switch (type) {
                case 1:
                    return '减免'
                default:
                case 0:
                    return '抵扣'
            }
        },

    },
    created() {
        if (this.item) {
            this.d = Object.assign(this.item, {})
        }
    },
    props: {
        item: Object
    },
    model: {
        prop: "item",
        event: "change"
    },
    watch: {
        item: {
            handler() {
                this.d = Object.assign(this.item, {})
            }
        },
        searchConcat(val) {
            zujinList({searchText: val, page: 1, itemsPerPage: 10}).then(result => {
                this.zujinList = result.rows
                console.log("zujinList", this.zujinList)
            })
        },
        d: {
            handler() {
                this.$emit("change", this.d)
            },
            deep: true
        }
    }
}
</script>

<style scoped>

</style>