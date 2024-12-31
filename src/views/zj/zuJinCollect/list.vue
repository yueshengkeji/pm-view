<template>
    <div>
        <v-row>
            <v-col md="2">
                <v-btn color="primary" @click="insertStart">新增收款</v-btn>
                <v-btn @click="exportDetails" style="margin-left: 5px;" :loading="loading1">导出收款</v-btn>
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
                :headers="collectSuperiorHeader"
                :items="collectSuperiorList"
                :options.sync="options"
                :server-items-length="total"
                :loading="loading"
                class="elevation-1"
        >
            <template v-slot:item.state="{item}">
                {{ formatCollectState(item.state) }}
            </template>
            <template v-slot:item.action="item">
                <v-btn x-small @click="detail($event, item)">明细</v-btn>
            </template>
        </v-data-table>
        <!--新增-->
        <v-dialog v-model="insertDialog" width="100%">
            <v-card>
                <v-card-title>收款登记<v-spacer></v-spacer><v-btn color="primary" @click="showBills">选择账单</v-btn></v-card-title>
                <v-card-text>
                    <v-form ref="addForm">
                        <v-row>
                            <v-col cols="12" md="3">
                                <v-text-field v-model="this.$store.state.user.name" label="登记人" readonly dense></v-text-field>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-text-field v-model="collectSuperiorItem.collectMoneyTotal" type="=number" label="收款总额" readonly dense></v-text-field>
                            </v-col>
                            <v-col cols="12" md="3">
                                    <v-autocomplete v-model="collectSuperiorItem.collectCompanyItem"
                                                    :items="receivedCompanyItems"
                                                    :loading="isLoading2"
                                                    return-object
                                                    dense
                                                    item-text="name"
                                                    :search-input.sync="searchReceivedCompany"
                                                    :rules="[v => !!v || '请选择付款单位']"
                                                    :append-icon=" 'mdi-plus' "
                                                    @click:append="showAddCompanyDialog"
                                                    label="付款单位"></v-autocomplete>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-text-field v-model="collectSuperiorItem.collectCompanyItem.openAccount" label="开户行" dense></v-text-field>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-text-field v-model="collectSuperiorItem.collectCompanyItem.bankNumber" label="银行账号" dense></v-text-field>
                            </v-col>
                            <v-col cols="12" md="3">
                                <easy-flow coding="1320297" ref="easyFlow" dense></easy-flow>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field v-model="collectSuperiorItem.remark" label="备注说明" dense :rules="[v => !!v || '请填写说明']"></v-text-field>
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
                        <template v-slot:item.collectMoney="{item}">
                            <v-text-field v-model="item.collectMoney" type="number" @change="resetCollectMoneyTotal"></v-text-field>
                        </template>
                        <template v-slot:item.collectDate="{item}">
                            <v-menu v-model="item.menuItem" transition="scale-transition" offset-y :close-on-content-click="false"
                                    min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="item.collectDate"
                                                  label="收款日期" hide-details
                                                  readonly v-bind="attrs" v-on="on" dense></v-text-field>
                                </template>
                                <v-date-picker v-model="item.collectDate" no-title scrollable
                                               @change="item.menuItem = false"></v-date-picker>
                            </v-menu>
                        </template>
                        <template v-slot:item.remark="{item}">
                            <v-text-field v-model="item.remark"></v-text-field>
                        </template>

                    </v-data-table>
                    <v-row>
                        <v-col md="2">
                            <span style="font-size: large">合计：</span>
                        </v-col>
                        <v-col md="3">
                            <v-text-field v-model="moneyTotal" label="应收合计" readonly dense></v-text-field>
                        </v-col>
                        <v-col md="3">
                            <v-text-field v-model="arrearageTotal" label="欠费合计" readonly dense></v-text-field>
                        </v-col>
                        <v-col md="3">
                            <v-text-field v-model="collectSuperiorItem.collectMoneyTotal" label="收款合计" readonly dense></v-text-field>
                        </v-col>
                    </v-row>
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
                        <v-select label="类型" v-model="query.type" :items="typeItems" item-text="name" value="value"></v-select>
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
        <!--新增公司-->
        <v-dialog v-model="addCompanyDialog" width="70%">
            <v-card>
                <v-card-title>新增公司信息</v-card-title>
                <add-company ref="addCompany"></add-company>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="saveCompany">提交</v-btn>
                    <v-btn @click="addCompanyDialog = false,this.$refs.addCompany.reset()">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
import {listCollectSuperior, insertZuJinCollectSuperior,exportZuJinCollect} from "@/api/zuJinCollect";
import EasyFlow from "@/components/easyflow/easyFlow.vue";
import {getBillList} from "@/api/zujin";
import InstanceDetail from "@/components/easyflow/instance-detail.vue";
import addCompany from "@/components/addCompany.vue";
import {list} from "@/api/company";

export default {
    name: 'zuJinCollect',
    components: {addCompany, EasyFlow, InstanceDetail},
    data: () => ({
        collectSuperiorHeader: [
            {text: '备注说明', value: 'remark'},
            {text: '收款总额', value: 'collectMoneyTotal'},
            {text: '时间', value: 'createTime'},
            {text: '登记人', value: 'staff.name'},
            {text: '审核状态', value: 'state'},
            {text: '操作', value: 'action'},
        ],
        collectSuperiorList: [],
        options: {},
        loading: false,
        total: 0,
        stateItems: [
            {text: '未审核', value: 0},
            {text: '已审核', value: 1}
        ],
        menu1: false,
        menu2: false,
        menu3: false,

        loading1: false,

        queryParams: {
            page: 1,
            itemsPerPage: 10,
            state: null,
            staffId: null,
            startTime: null,
            endTime: null,
            sort: 'createTime',
            order: 'desc'
        },

        //新增
        insertDialog:false,
        collectSuperiorItem:{
            collectCompanyItem:{
                name:null,
                openAccount:null,
                bankNumber:null,
            },
            collectCompanyName : null,
            collectCompanyOpenAccount : null,
            collectCompanyBankNumber: null,
            collectMoneyTotal:0,
            remark:null,
            state:0,
            zuJinCollectList:[],
            staff:null,
        },
        headers: [
            {text: '铺位号', value: 'room'},
            {text: '品牌', value: 'brand'},
            {text: '费用名称', value: 'name'},
            {text: '区间开始日期', value: 'startDate'},
            {text: '区间截止日期', value: 'endDate'},
            {text: '应收日期', value: 'payEndDate'},
            {text: '应收金额', value: 'money'},
            {text: '已收金额', value: 'payMoney'},
            {text: '已退金额', value: 'backMoney'},
            {text: '抵扣金额', value: 'sjMoney'},
            {text: '欠费金额', value: 'arrearage'},
            {text: '合同类型', value: 'concatType'},
            {text: '开票状态', value: 'invoiceState'},
            {text: '本次收款金额', value: 'collectMoney'},
            {text: '收款日期', value: 'collectDate'},
            {text: '备注说明', value: 'remark'},
        ],

        //账单
        billDialog:false,
        selected:[],
        billHeaders: [
            {text: '铺位号', value: 'room'},
            {text: '品牌', value: 'brand'},
            {text: '费用名称', value: 'name'},
            {text: '区间开始日期', value: 'startDate'},
            {text: '区间截止日期', value: 'endDate'},
            {text: '应收日期', value: 'payEndDate'},
            {text: '应收金额', value: 'money'},
            {text: '已收金额', value: 'payMoney'},
            {text: '已退金额', value: 'backMoney'},
            {text: '抵扣金额', value: 'sjMoney'},
            {text: '欠费金额', value: 'arrearage'},
            {text: '合同类型', value: 'concatType'},
            {text: '开票状态', value: 'invoiceState'},
        ],
        moneyTypes: ["租金", "管理费", "多经场地费","场地保证金","推广服务费", "二清管理费", "装修管理费"],

        concatItems: [
            {value: '0', text: '租赁合同'},
            {value: '2', text: '多经类合同'},
            {value: '1', text: '物业管理'},
        ],
        date:[],
        query: {
            companyName: null,
            brand: null,
            room: null,
            concatType: null,
            state: "wait,pay",
            type:null,
        },
        optionsBill: {
            // type: 'regular,compare,commission',
            page:1,
            itemsPerPage:10
        },
        typeItems:[
            {
                name:'租金',
                value:'regular,compare,commission'
            },
            {
                name:'保证金',
                value:'bzj'
            },
            {
                name:'推广费',
                value:'tgf'
            },
        ],

        data: {
            rows: [],
            total: 0
        },

        //详情
        frameId:null,

        //
        receivedCompanyItems: [],
        isLoading2:false,
        searchReceivedCompany:null,
        addCompanyDialog:false,

        //合计
        moneyTotal: 0,
        arrearageTotal: 0,

        //流程标题
        flowTitle:"",
    }),

    watch: {
        options:{
            handler(){
                this.load()
            },
            deep:true
        },

        optionsBill:{
            handler(){
                this.list()
            },
            deep:true
        },
        query: {
            handler() {
                this.list()
            },
            deep: true
        },
        searchReceivedCompany:{
            handler(){
                if (this.searchReceivedCompany != null){
                    this.loadReceivedCompany(this.searchReceivedCompany)
                }
            }  ,
            deep:true
        },
        selected:{
            handler(){
                this.detailSelected()
            },
            deep:true
        }
    },

    created() {
        this.load()
    },

    methods: {

        load() {
            this.queryParams.page = this.options.page
            this.queryParams.pageSize = this.options.itemsPerPage
            this.loading = true
            listCollectSuperior(this.queryParams).then(res => {
                this.collectSuperiorList = res.rows
                this.total = res.total
                this.loading = false
            })
        },


        insertStart() {
            this.insertDialog = true
        },

        submit(){
            this.collectSuperiorItem.zuJinCollectList = []
            for (let a = 0;a < this.selected.length;a++){
                let tempObject = {
                    collectCompanyName : this.collectSuperiorItem.collectCompanyItem.name,
                    collectCompanyOpenAccount : this.collectSuperiorItem.collectCompanyItem.openAccount,
                    collectCompanyBankNumber : this.collectSuperiorItem.collectCompanyItem.bankNumber,
                    collectMoney: this.selected[a].collectMoney,
                    collectDate: this.selected[a].collectDate,
                    billId: this.selected[a].id,
                    remark: this.selected[a].remark,
                    state: 0,
                }
                this.collectSuperiorItem.zuJinCollectList.push(tempObject)
            }
            this.collectSuperiorItem.collectCompanyName = this.collectSuperiorItem.collectCompanyItem.name
            this.collectSuperiorItem.collectCompanyOpenAccount = this.collectSuperiorItem.collectCompanyItem.openAccount
            this.collectSuperiorItem.collectCompanyBankNumber = this.collectSuperiorItem.collectCompanyItem.bankNumber
            this.dealTitle()
            if (this.$refs['addForm'].validate()){
                insertZuJinCollectSuperior(this.collectSuperiorItem).then(res => {
                    this.insertDialog = false
                    this.reset()
                    this.load()
                    this.$refs.easyFlow.startFlow({
                        title: this.flowTitle + "收款登记申请",
                        content: res.remark || '',
                        frameId: res.id,
                        frameCoding: 1320297,
                        frameColumn: 'id'
                    })
                })
            }
        },

        dealTitle(){
            this.flowTitle = ""
            for (let a = 0;a < this.selected.length;a++){
                if (!this.flowTitle.includes(this.selected[a].brand)){
                    this.flowTitle = this.flowTitle + "《" + this.selected[a].brand + "》"
                }
            }
        },

        formatCollectState(state) {
            switch (state) {
                case 1:
                    return '已审核'
                default:
                case 0:
                    return '未审核'
            }
        },
        resetQueryParams() {
            this.queryParams = {
                page: 1,
                itemsPerPage: 10,
                state: null,
                staffId: null,
                startTime: null,
                endTime: null,
                sort: 'createTime',
                order: 'desc'
            }
        },
        reset(){
            this.selected = []
            this.collectSuperiorItem = {
                collectCompanyItem: {
                    name:null,
                    openAccount:null,
                    bankNumber:null,
                },
                collectMoneyTotal:0,
                remark:null,
                state:0,
                zuJinCollectList:[],
                staff:null,
            }
        },
        resetCollectMoneyTotal(){
            this.collectSuperiorItem.collectMoneyTotal = 0
            for (let a = 0;a < this.selected.length;a++){
                if (this.selected[a].collectMoney == '' || this.selected[a].collectMoney == null){
                    this.selected[a].collectMoney = 0
                }
                this.collectSuperiorItem.collectMoneyTotal = (Number(this.collectSuperiorItem.collectMoneyTotal) + Number(this.selected[a].collectMoney)).toFixed(2)
            }
        },

        //账单
        handleRowClick(rowData, item) {
            // this.$refs.materialTable.toggleRowSelection(rowData);
            item.select(!item.isSelected);
        },
        showBills(){
            this.list()

            this.$nextTick(() => {
                this.billDialog = true
            })
        },

        list() {
            let q = Object.assign({}, this.optionsBill)
            if (this.query.companyName == null){
                this.query.companyName = this.collectSuperiorItem.collectCompanyItem.name
            }
            q = Object.assign(q, this.query)
            // q.companyName = this.collectSuperiorItem.collectCompanyItem.name
            getBillList(q).then((r) => {
                for (let a = 0;a < r.rows.length;a++){
                    r.rows[a].collectMoney = 0
                    r.rows[a].remark = ''
                    r.rows[a].collectCollectDate = ''
                    r.rows[a].menuItem = false
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

        //新增公司
        showAddCompanyDialog() {
            this.addCompanyDialog = true
        },

        loadReceivedCompany(str){
            list(str).then(res => {
                this.receivedCompanyItems = res
            })
        },

        saveCompany() {
            if (this.$refs.addCompany.validateForm() == true) {
                this.$refs.addCompany.saveCompany()
                this.addCompanyDialog = false
            }
        },

        exportDetails() {
            this.loading1 = true
            let q = Object.assign({},this.queryParams)
            exportZuJinCollect(q).then(result => {
                let a = document.createElement("a")
                a.download = result
                a.href = result
                a.click()
            }).finally(() => {
                this.loading1 = false;
            })
        },

        detailSelected(){
            this.moneyTotal = 0
            this.arrearageTotal = 0
            for (let a = 0;a < this.selected.length;a++){
                this.moneyTotal = (Number(this.moneyTotal) + Number(this.selected[a].money)).toFixed(2)
                this.arrearageTotal = (Number(this.arrearageTotal) + Number(this.selected[a].arrearage)).toFixed(2)
            }
        }
    }
}
</script>