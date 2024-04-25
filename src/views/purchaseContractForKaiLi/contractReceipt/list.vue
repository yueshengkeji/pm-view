<template>
    <div>
        <v-row>
            <v-col sm="1">
                <div style="display: flex">
                    <v-btn small @click="downloadExcel">导出</v-btn>
                    <v-btn small @click="addDialog = true">新增</v-btn>
                </div>

            </v-col>
            <v-col sm="1">
                <v-select label="收票状态" dense v-model="queryParams.state"
                          :items="approveState"></v-select>
            </v-col>
            <v-col sm="2">
                <v-autocomplete label="合同名称"
                                v-model="contractItem"
                                :items="contractList"
                                dense
                                :search-input.sync="searchContract"
                                item-text="name"
                                return-object></v-autocomplete>
            </v-col>
            <v-col sm="2">
                <v-autocomplete label="开票单位"
                                v-model="companyItem"
                                :items="companyList"
                                dense
                                :search-input.sync="searchCompany"
                                :rules="[v => !!v || '请填写单位']"
                                item-text="name"
                                return-object></v-autocomplete>
            </v-col>
            <v-col sm="2">
                <div style="display: flex">
                    <v-text-field dense type="number" v-model="queryParams.moneyStart" label="金额范围"></v-text-field>~
                    <v-text-field dense type="number" v-model="queryParams.moneyEnd" label=""></v-text-field>
                </div>

            </v-col>
            <v-col sm="3">
                <v-btn small color="primary" @click="listContractReceipt">搜索</v-btn>
                <v-btn small @click="reset">重置</v-btn>
            </v-col>
        </v-row>
        <v-data-table :items="contractReceiptList"
                      :headers="contractReceiptHeader"
                      :options.sync="options"
                      :server-items-length="totalDesserts"
                      :loading="tableLoading"
                      class="elevation-1">
            <template v-slot:item.collectTime="{item}">
                <v-chip link @click="showMenu($event,item)">{{ item.collectTime }}</v-chip>
            </template>
            <template v-slot:item.stateStr="{item}">
                <v-chip v-if="item.state == 0" color="red" link @click="showSate(item)">{{item.stateStr}}</v-chip>
                <v-chip v-if="item.state == 1" color="green" link @click="showSate(item)">{{item.stateStr}}</v-chip>
                <v-chip v-if="item.state == 9" color="grey" link @click="showSate(item)">{{item.stateStr}}</v-chip>
            </template>
            <template v-slot:item.action="{item}">
                <v-btn @click="filesHandler(item)" small>查看附件</v-btn>
            </template>
        </v-data-table>
        <v-menu ref="dateMenu2"
                v-model="dateMenu2"
                :close-on-content-click="false"
                offset-y
                absolute
                :position-y="y"
                :position-x="x"
        >
            <v-date-picker
                    @change="updateDate"
                    v-model="collectTime"
                    no-title
                    @input="dateMenu2 = false"
            ></v-date-picker>
        </v-menu>

        <!-- 附件 -->
        <v-dialog v-model="filePreviewDialog" width="60%">
            <file-preview :filesItem="files"></file-preview>
        </v-dialog>
        <!-- 状态 -->
        <v-dialog v-model="stateDialog" width="40%">
            <v-card>
                <v-col sm="12">
                    <v-radio-group v-model="stateItem" label="确认收票" @change="updateState" mandatory row>
                        <v-radio :value="0" label="未收票"></v-radio>
                        <v-radio :value="1" label="已收票"></v-radio>
                        <v-radio :value="9" label="作废"></v-radio>
                    </v-radio-group>
                </v-col>
            </v-card>
        </v-dialog>
        <!-- 新增 -->
        <v-dialog v-model="addDialog" width="40%">
            <v-card>
                <add-contract-receipt @getList="closeDialog"></add-contract-receipt>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    import {exportList, getContractReceiptFiles, list, update} from "../../../api/contractReceipt";
    import {getConfig} from "../../../api/systemConfig";
    import {list as searchCompany} from '@/api/company'
    import {getContract} from "../../../api/contract";
    import addContractReceipt from "./components/addContractReceipt";

    export default {
        name: 'contractReceiptList',
        components:{
            addContractReceipt,
            filePreview:() => import('@/components/filePreview.vue')
        },
        data: () => ({
            options: {},
            totalDesserts: 0,
            tableLoading:false,
            contractReceiptList: [],
            contractReceiptHeader: [
                {text: '合同名称', value: 'contract.name', sortable: false},
                {text: '乙方', value: 'company.name', sortable: false},
                {text: '金额(￥)', value: 'money', sortable: false},
                {text: '收票类型', value: 'advanceFlagStr', sortable: false},
                {text: '预收时间', value: 'advanceTime', sortable: false},
                {text: '收票时间', value: 'collectTime', sortable: false},
                {text: '收票状态', value: 'stateStr', sortable: false},
                {text: '登记人', value: 'staff.name', sortable: false},
                {text: '操作', value: 'action', sortable: false},
            ],
            thanClickItem: null,
            dateMenu2: false,
            x: 0,
            y: 0,
            collectTime: null,

            files: [],
            filePreviewDialog: false,
            ftpFolder: null,
            serverHost: '',

            stateDialog: false,
            stateItem: null,

            contractItem: {
                id: null
            },
            contractList: [],
            searchContract: null,

            companyItem: {
                id: null
            },
            companyList: [],
            searchCompany: null,

            approveState: [
                {text: "未收票", value: 0},
                {text: "已收票", value: 1},
                {text: "作废", value: 9},
            ],

            queryParams: {
                pageNum: 1,
                pageSize: 10,
                state: null,
                startTime: null,
                endTime: null,
                moneyStart: null,
                moneyEnd: null,
                staffId: null,
                contractId: null,
                companyId: null
            },

            //新增
            addDialog:false
        }),

        created() {
            getConfig("FTP_SERVER_PATH").then(result => {
                if (result.id != null) {
                    this.serverHost = result.value
                } else {
                    console.log('服务器未配置文件上传路径')
                }
            })
            this.listContractReceipt()
        },

        watch: {
            options: {
                handler() {
                    this.listContractReceipt()
                },
                deep: true
            },
            searchContract(val) {
                getContract({searchText: val}).then(result => this.contractList = result.rows)
            },
            searchCompany(val) {
                searchCompany(val).then(result => this.companyList = result)
            },
        },

        methods: {
            listContractReceipt() {
                this.queryParams.pageNum = this.options.page
                this.queryParams.pageSize = this.options.itemsPerPage
                this.queryParams.companyId = this.companyItem.id
                this.queryParams.contractId = this.contractItem.id
                this.tableLoading = true
                list(this.queryParams).then(res => {
                    this.contractReceiptList = res.rows
                    this.totalDesserts = res.total
                    this.tableLoading = false
                })
            },
            showMenu(e, item) {
                console.log(e)
                this.thanClickItem = item
                e.preventDefault()
                this.dateMenu2 = false
                this.x = e.clientX
                this.y = e.clientY
                this.$nextTick(() => {
                    this.collectTime = item.collectTime == null ? '' : item.collectTime
                    this.dateMenu2 = true
                })
            },
            updateDate() {
                if (this.thanClickItem) {
                    this.thanClickItem.collectTime = this.collectTime
                    update(this.thanClickItem).then(() => {
                        this.listContractReceipt()
                    })
                }
            },
            filesHandler(item) {
                this.files = []
                getContractReceiptFiles({id: item.id}).then(res => {
                    res.forEach(item => {
                        this.files.push(item)
                    })
                    this.fileSuffix(this.files)
                    this.filePreviewDialog = true
                })

            },
            fileSuffix(files) {
                files.forEach(f => {
                    let name = f.showPath;
                    let suffix = '';
                    let index = name.lastIndexOf(".");
                    index = index == -1 ? f.length : index + 1;
                    suffix = f.showPath.substring(index, f.length);
                    f.suffix = suffix.toLowerCase();
                    f.downloadPath = decodeURIComponent(f.showPath);
                    if ((this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm)
                        && window.location.protocol == 'https:') {

                        if (f.suffix == 'pdf') {
                            if (f.pdfImgPath != null && f.pdfImgPath.length > 0) {
                                f.pdfImg = true
                                let paths = [];
                                f.pdfImgPath.forEach(path => {
                                    paths.push(this.ftpFolder + "/" + encodeURIComponent(path))
                                })
                                f.pdfImgPath = paths
                            }
                        } else {
                            f.showPath = this.ftpFolder + "/" + f.downloadPath
                        }

                    } else {
                        //直接从配置的文件服务器预览
                        f.showPath = this.serverHost + f.downloadPath
                    }
                });
            },
            showSate(item) {
                this.thanClickItem = item
                this.stateItem = this.thanClickItem.state
                this.stateDialog = true
            },
            updateState() {
                this.thanClickItem.state = this.stateItem
                update(this.thanClickItem).then(() => {
                    this.listContractReceipt()
                })
            },

            reset() {
                this.queryParams = {
                    pageNum: 1,
                    pageSize: 10,
                    state: null,
                    startTime: null,
                    endTime: null,
                    moneyStart: null,
                    moneyEnd: null,
                    staffId: null,
                    contractId: null,
                    companyId: null
                }

                this.contractItem = {
                    id: null
                }

                this.companyItem = {
                    id: null
                }
            },

            downloadExcel() {
                exportList(this.queryParams).then(result => {
                    let a = document.createElement("a")
                    a.href = result
                    a.download = result
                    a.click()
                })
            },

            closeDialog(){
                this.addDialog = false
                this.listContractReceipt()
            }
        }
    }
</script>
