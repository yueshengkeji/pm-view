<template>
    <div>
        <v-row>
            <v-col md="4">
                <v-btn color="primary" @click="insertStart">新增抵扣</v-btn>
                <v-btn color="primary" @click="insertStart2" style="margin-left: 5px;">新增减免</v-btn>
                <v-btn @click="exportDetails1" style="margin-left: 5px;" :loading="loading1">导出抵扣</v-btn>
                <v-btn @click="exportDetails2" style="margin-left: 5px;" :loading="loading2">导出减免</v-btn>
            </v-col>

            <v-col md="1">
                <v-select v-model="queryParams.type" :items="typeItems" label="类型"></v-select>
            </v-col>

            <v-col md="1">
                <v-select v-model="queryParams.state" :items="stateItems" label="审核状态"></v-select>
            </v-col>

            <v-col md="2">
                <v-menu v-model="menu1" transition="scale-transition" offset-y :close-on-content-click="false"
                        min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="queryParams.startTime"
                                      label="开始日期" hide-details
                                      readonly v-bind="attrs" v-on="on"></v-text-field>
                    </template>
                    <v-date-picker v-model="queryParams.startTime" no-title scrollable
                                   @change="menu1 = false"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col md="2">
                <v-menu v-model="menu2" transition="scale-transition" offset-y :close-on-content-click="false"
                        min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="queryParams.endTime"
                                      label="截止日期" hide-details
                                      readonly v-bind="attrs" v-on="on"></v-text-field>
                    </template>
                    <v-date-picker v-model="queryParams.endTime" no-title scrollable
                                   @change="menu2 = false"></v-date-picker>
                </v-menu>
            </v-col>
            <v-spacer></v-spacer>
            <v-col md="2">
                <div style="margin-top: 20px">
                    <v-btn small @click="load">搜索</v-btn>
                    <v-icon @click="resetQueryParams" style="margin-left: 5px">mdi-refresh</v-icon>
                </div>
            </v-col>
        </v-row>
        <v-data-table
                :headers="deductionSuperiorHeader"
                :items="deductionSuperiorList"
                :options.sync="options"
                :server-items-length="total"
                :loading="loading"
                class="elevation-1"
        >
            <template v-slot:item.state="{item}">
                {{ formatDeductionState(item.state) }}
            </template>
            <template v-slot:item.type="{item}">
                {{ formatType(item.type) }}
            </template>
            <template v-slot:item.action="item">
                <v-btn x-small @click="detail($event, item)">明细</v-btn>
            </template>
        </v-data-table>

        <!--新增-->
        <v-dialog v-model="insertDialog" width="100%">
            <v-card>
                <v-card-title>{{ insertType == 1 ? '减免登记' : '抵扣登记' }}
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="showBills">选择账单</v-btn>
                </v-card-title>
                <v-card-text>
                    <v-form ref="addForm">
                        <v-row>
                            <v-col cols="12" md="3">
                                <v-text-field v-model="this.$store.state.user.name" label="登记人" readonly
                                              dense></v-text-field>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-text-field v-model="deductionSuperiorRecordItem.deductionMoneyTotal" type="=number"
                                              label="抵扣总额"
                                              readonly dense></v-text-field>
                            </v-col>
                            <v-col cols="12" md="3">
                                <easy-flow coding="1320296" ref="easyFlow"
                                           :default-flow-name="insertType == 1 ? '减免申请':'抵扣申请'"
                                           dense></easy-flow>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field v-model="deductionSuperiorRecordItem.remark" label="备注说明" dense
                                              :rules="[v => !!v || '请填写说明']"></v-text-field>
                            </v-col>
                            <v-col>
                                <file-upload v-model="file" dense></file-upload>
                            </v-col>
                        </v-row>
                    </v-form>
                    <v-data-table :items="selected"
                                  :loading="loading"
                                  hide-default-footer
                                  :headers="headers">
                        <template v-slot:item.brand="{item}">
                            <v-chip small outlined>{{ item.brand }}</v-chip>
                        </template>
                        <template v-slot:item.state="{item}">
                            {{ formatState(item.state) }}
                        </template>
                        <template v-slot:item.concatType="{item}">
                            {{ formatConcat(item.concatType) }}
                        </template>
                        <template v-slot:item.invoiceState="{item}">
                            {{ formatInvoiceState(item.invoiceState) }}
                        </template>
                        <template v-slot:item.arrearageDay="{item}">
                            <div v-if="item.arrearageDay > 0">{{ item.arrearageDay }}</div>
                        </template>
                        <template v-slot:item.deductionMoney="{item}">
                            <v-text-field v-model="item.deductionMoney" type="number"
                                          @change="resetDeductionMoneyTotal"></v-text-field>
                        </template>
                        <template v-slot:item.remark="{item}">
                            <v-text-field v-model="item.remark"></v-text-field>
                        </template>

                    </v-data-table>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="submit">提交</v-btn>
                    <v-btn @click="insertDialog = false">取消</v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>
        <!--账单-->
        <v-dialog v-model="billDialog" width="80%">
            <v-card>
                <v-row dense>
                    <v-col cols="2">
                        <v-text-field label="客户名称" v-model="query.companyName"></v-text-field>
                    </v-col>
                    <v-col cols="2">
                        <v-text-field label="品牌" v-model="query.brand"></v-text-field>
                    </v-col>
                    <v-col cols="2">
                        <v-text-field label="铺位号" v-model="query.room"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-select label="类型" v-model="query.type" :items="typeItemsBill" item-text="name" value="value"></v-select>
                    </v-col>
                    <v-col cols="2">
                        <v-select label="费用名称" v-model="query.name" :items="moneyTypes"></v-select>
                    </v-col>
                </v-row>
                <v-data-table :items="data.rows"
                              v-model="selected"
                              item-key="id"
                              show-select
                              @click:row="handleRowClick"
                              :loading="loading"
                              :options.sync="optionsBill"
                              :headers="billHeaders"
                              :server-items-length="data.total">
                    <template v-slot:item.brand="{item}">
                        <v-chip small outlined>{{ item.brand }}</v-chip>
                    </template>
                    <template v-slot:item.state="{item}">
                        {{ formatState(item.state) }}
                    </template>
                    <template v-slot:item.concatType="{item}">
                        {{ formatConcat(item.concatType) }}
                    </template>
                    <template v-slot:item.invoiceState="{item}">
                        {{ formatInvoiceState(item.invoiceState) }}
                    </template>
                    <template v-slot:item.arrearageDay="{item}">
                        <div v-if="item.arrearageDay > 0">{{ item.arrearageDay }}</div>
                    </template>

                </v-data-table>
            </v-card>
        </v-dialog>
        <!--详情-->
        <instance-detail :frame="frameId"
                         @close="closeFrameHandler"></instance-detail>
    </div>
</template>
<script>
import {exportDeduction, insertDeductionSuperiorRecord, list} from "@/api/deductionSuperiorRecord";
import EasyFlow from "@/components/easyflow/easyFlow.vue";
import {getBillList} from "@/api/zujin";
import InstanceDetail from "@/components/easyflow/instance-detail.vue";
import FileUpload from "@/components/fileUpload.vue";

export default {
    name: 'deductionSuperiorRecord',
    components: {FileUpload, EasyFlow, InstanceDetail},
    data: () => ({
        deductionSuperiorHeader: [
            {text: '备注说明', value: 'remark'},
            {text: '抵扣总额', value: 'deductionMoneyTotal'},
            {text: '时间', value: 'createTime'},
            {text: '登记人', value: 'staff.name'},
            {text: '审核状态', value: 'state'},
            {text: '类型', value: 'type'},
            {text: '操作', value: 'action'},
        ],
        deductionSuperiorList: [],
        options: {},
        loading: false,
        total: 0,
        queryParams: {
            page: 1,
            itemsPerPage: 10,
            state: null,
            staffId: null,
            startTime: null,
            endTime: null,
            type: null,
            sort: 'createTime',
            order: 'desc'
        },
        typeItems: [
            {text: '抵扣', value: 0},
            {text: '减免', value: 1}
        ],
        stateItems: [
            {text: '未审核', value: 0},
            {text: '已审核', value: 1}
        ],
        menu1: false,
        menu2: false,

        loading1: false,
        loading2: false,

        //新增
        insertDialog: false,
        insertDialog2: false,
        insertType: 0,
        deductionSuperiorRecordItem: {
            deductionMoneyTotal: 0,
            remark: null,
            state: 0,
            deductionRecordList: [],
            staff: null,
            type: 0
        },
        headers: [
            {text: '铺位号', value: 'room'},
            {text: '品牌', value: 'brand'},
            {text: '费用名称', value: 'name'},
            {text: '应收日期', value: 'payEndDate'},
            {text: '应收金额', value: 'money'},
            {text: '已收金额', value: 'payMoney'},
            {text: '已退金额', value: 'backMoney'},
            {text: '抵扣金额', value: 'sjMoney'},
            {text: '欠费金额', value: 'arrearage'},
            {text: '合同类型', value: 'concatType'},
            {text: '开票状态', value: 'invoiceState'},
            // {text: this.insertType == 0 ? '申请抵扣金额':'申请减免金额', value: 'deductionMoney'},
            // {text: this.insertType == 0 ? '申请抵扣说明':'申请减免说明', value: 'remark'},
        ],

        //账单
        billDialog: false,
        selected: [],
        billHeaders: [
            {text: '铺位号', value: 'room'},
            {text: '品牌', value: 'brand'},
            {text: '费用名称', value: 'name'},
            {text: '应收日期', value: 'payEndDate'},
            {text: '应收金额', value: 'money'},
            {text: '已收金额', value: 'payMoney'},
            {text: '已退金额', value: 'backMoney'},
            {text: '抵扣金额', value: 'sjMoney'},
            {text: '欠费金额', value: 'arrearage'},
            {text: '合同类型', value: 'concatType'},
            {text: '开票状态', value: 'invoiceState'},
        ],
        moneyTypes: ["租金", "管理费", "多经场地费", "场地保证金", "推广服务费", "二清管理费", "装修管理费"],

        concatItems: [
            {value: '0', text: '租赁合同'},
            {value: '2', text: '多经类合同'},
            {value: '1', text: '物业管理'},
        ],
        date: [],
        query: {
            companyName: null,
            brand: null,
            room: null,
            concatType: null,
            state: "wait,pay",
            type:null
        },
        optionsBill: {
            type: 'regular,compare,commission',
            page: 1,
            itemsPerPage: 10
        },
        typeItemsBill: [
            {
                name: '租金',
                value: 'regular,compare,commission'
            },
            {
                name: '保证金',
                value: 'bzj'
            },
            {
                name: '推广费',
                value: 'tgf'
            },
        ],


        data: {
            rows: [],
            total: 0
        },

        //详情
        frameId: null,
        //标题
        flowTitle: '',
        file: null
    }),
    watch: {
        options: {
            handler() {
                this.load()
            },
            deep: true
        },
        optionsBill: {
            handler() {
                this.list()
            },
            deep: true
        },
        query: {
            handler() {
                this.list()
            },
            deep: true
        },
    },
    created() {
        this.load()
    },
    methods: {
        resetQueryParams() {
            this.queryParams = {
                page: 1,
                itemsPerPage: 10,
                state: null,
                staffId: null,
                startTime: null,
                endTime: null,
                type: null,
                sort: 'createTime',
                order: 'desc'
            }
        },
        load() {
            this.queryParams.page = this.options.page
            this.queryParams.pageSize = this.options.itemsPerPage
            this.loading = true
            list(this.queryParams).then(res => {
                this.deductionSuperiorList = res.rows
                this.total = res.total
                this.loading = false
            })
        },
        reset() {
            this.selected = [],
                this.deductionSuperiorRecordItem = {
                    deductionMoneyTotal: 0,
                    remark: null,
                    state: 0,
                    deductionRecordList: [],
                    staff: null,
                    type: 0
                }
            this.file = null
        },
        insertStart() {
            this.insertType = 0
            this.deductionSuperiorRecordItem.type = 0
            this.headers = [
                {text: '铺位号', value: 'room'},
                {text: '品牌', value: 'brand'},
                {text: '费用名称', value: 'name'},
                {text: '应收日期', value: 'payEndDate'},
                {text: '应收金额', value: 'money'},
                {text: '已收金额', value: 'payMoney'},
                {text: '已退金额', value: 'backMoney'},
                {text: '抵扣金额', value: 'sjMoney'},
                {text: '减免金额', value: 'reduce'},
                {text: '欠费金额', value: 'arrearage'},
                {text: '合同类型', value: 'concatType'},
                {text: '开票状态', value: 'invoiceState'},
                {text: this.insertType == 0 ? '申请抵扣金额' : '申请减免金额', value: 'deductionMoney'},
                {text: this.insertType == 0 ? '申请抵扣说明' : '申请减免说明', value: 'remark'},
            ],
                this.insertDialog = true
        },
        insertStart2() {
            this.insertType = 1
            this.deductionSuperiorRecordItem.type = 1
            this.headers = [
                {text: '铺位号', value: 'room'},
                {text: '品牌', value: 'brand'},
                {text: '费用名称', value: 'name'},
                {text: '应收日期', value: 'payEndDate'},
                {text: '应收金额', value: 'money'},
                {text: '已收金额', value: 'payMoney'},
                {text: '已退金额', value: 'backMoney'},
                {text: '抵扣金额', value: 'sjMoney'},
                {text: '减免金额', value: 'reduce'},
                {text: '欠费金额', value: 'arrearage'},
                {text: '合同类型', value: 'concatType'},
                {text: '开票状态', value: 'invoiceState'},
                {text: this.insertType == 0 ? '申请抵扣金额' : '申请减免金额', value: 'deductionMoney'},
                {text: this.insertType == 0 ? '申请抵扣说明' : '申请减免说明', value: 'remark'},
            ],
                this.insertDialog = true
        },
        resetDeductionMoneyTotal() {
            this.deductionSuperiorRecordItem.deductionMoneyTotal = 0
            for (let a = 0; a < this.selected.length; a++) {
                if (this.selected[a].deductionMoney == '' || this.selected[a].deductionMoney == null) {
                    this.selected[a].deductionMoney = 0
                }
                this.deductionSuperiorRecordItem.deductionMoneyTotal = (Number(this.deductionSuperiorRecordItem.deductionMoneyTotal) + Number(this.selected[a].deductionMoney)).toFixed(2)
            }
        },
        setFiles() {
            if (this.file) {
                this.deductionSuperiorRecordItem.files = ''
                this.file.files.forEach(item => {
                    this.deductionSuperiorRecordItem.files += item.id + ";"
                })
            }
        },
        submit() {
            this.deductionSuperiorRecordItem.deductionRecordList = []
            for (let a = 0; a < this.selected.length; a++) {
                let tempObject = {
                    deductionMoney: this.selected[a].deductionMoney,
                    billId: this.selected[a].id,
                    remark: this.selected[a].remark,
                    state: 0,
                    type: this.insertType
                }
                this.deductionSuperiorRecordItem.deductionRecordList.push(tempObject)
            }
            this.dealTitle()
            this.setFiles()
            if (this.$refs['addForm'].validate()) {
                insertDeductionSuperiorRecord(this.deductionSuperiorRecordItem).then(res => {
                    this.insertDialog = false
                    this.reset()
                    this.load()
                    this.$refs.easyFlow.startFlow({
                        title: this.flowTitle + (this.insertType == 1 ? '减免申请' : '抵扣申请'),
                        content: res.remark || '',
                        frameId: res.id,
                        frameCoding: 1320296,
                        frameColumn: 'id'
                    })
                })
            }
        },

        dealTitle() {
            this.flowTitle = ""
            for (let a = 0; a < this.selected.length; a++) {
                if (!this.flowTitle.includes(this.selected[a].brand)) {
                    this.flowTitle = this.flowTitle + "《" + this.selected[a].brand + "》"
                }
            }
        },


        //账单
        handleRowClick(rowData, item) {
            // this.$refs.materialTable.toggleRowSelection(rowData);
            item.select(!item.isSelected);
        },
        showBills() {
            this.list()

            this.$nextTick(() => {
                this.billDialog = true
            })
        },

        list() {
            let q = Object.assign({}, this.optionsBill)
            q = Object.assign(q, this.query)
            getBillList(q).then((r) => {
                for (let a = 0; a < r.rows.length; a++) {
                    r.rows[a].deductionMoney = 0
                    r.rows[a].remark = ''
                }
                this.data = r
            })
        },
        formatConcat(state) {
            switch (state) {
                case '0':
                    return '租赁合同'
                case '2':
                    return '多经类合同'
                case '1':
                    return '物业合同'
            }
        },
        formatState(state) {
            switch (state) {
                case 'wait':
                    return '未支付'
                case 'pay':
                    return '部分支付'
                case '1':
                    return '已支付'
            }
        },
        formatInvoiceState(state) {
            switch (state) {
                case 1:
                    return '已开票'
                default:
                case 0:
                    return '未开票'
            }
        },
        formatDeductionState(state) {
            switch (state) {
                case 1:
                    return '已审核'
                default:
                case 0:
                    return '未审核'
            }
        },
        formatType(type) {
            switch (type) {
                case 1:
                    return '减免'
                default:
                case 0:
                    return '抵扣'
            }
        },

        //详情
        detail(event, row) {
            this.$nextTick(() => {
                this.frameId = row.item.id
            })
        },
        closeFrameHandler(isClose) {
            if (!isClose) {
                this.frameId = null
            }
        },

        //导出
        exportDetails1() {
            this.loading1 = true
            let q = Object.assign({}, this.queryParams)
            q.type = 0
            exportDeduction(q).then(result => {
                let a = document.createElement("a")
                a.download = result
                a.href = result
                a.click()
                console.log(a)
            }).finally(() => {
                this.loading1 = false;
            })

        },
        exportDetails2() {
            this.loading2 = true
            let q = Object.assign({}, this.queryParams)
            q.type = 1
            exportDeduction(q).then(result => {
                let a = document.createElement("a")
                a.download = result
                a.href = result
                a.click()
            }).finally(() => {
                this.loading2 = false;
            })
        }
    }
}
</script>