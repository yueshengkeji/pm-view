<template>
    <div>
        <v-subheader>合同实际付款明细</v-subheader>
        <v-form ref="paymentForm" :disabled="offEdit" autocomplete="off">
            <div>
                <v-row>
                    <v-col lg="3" md="4" v-if="offEdit" cols="12">
                        <v-text-field title="根据合同甲方显示，无需填写" disabled label="采购单位"
                                      v-model="data.proCompanyName"></v-text-field>
                    </v-col>
                    <v-col lg="3" md="3" v-else cols="12">
                        <v-text-field label="付款编号" v-model="data.series"></v-text-field>
                    </v-col>
                    <v-col lg="3" md="4" cols="12">
                        <v-autocomplete @change="selectCompany" :rules="rules[0]" :loading="loading" label="收款单位"
                                        v-model="data.company"
                                        :search-input.sync="searchCompany"
                                        :items.sync="companys"
                                        return-object
                                        item-text="name"></v-autocomplete>
                    </v-col>
                    <v-col lg="2" md="2" cols="12">
                        <v-text-field label="开户行" v-model="data.company.openAccount"
                                      @change="updateCompany"></v-text-field>
                    </v-col>
                    <v-col lg="2" md="4" cols="12">
                        <v-text-field label="银行账号" v-model="data.company.bankNumber"
                                      @change="updateCompany"></v-text-field>
                    </v-col>
                    <v-col lg="2" md="2" cols="12" v-show="!offEdit">
                        <easyFlow :searchName="false" :instance="flowModel" coding="10563" :change="changeFlow"
                                  :start="startFlow"></easyFlow>
                    </v-col>
                    <v-col lg="3" md="4" cols="12">
                        <v-text-field label="备注" v-model="data.remark"></v-text-field>
                    </v-col>
                    <v-col lg="3" md="3" cols="6">
                        <v-text-field label="申请付款总额" v-model="data.moneys" :rules="rules[1]" disabled
                                      :color="getColor(data.moneys)"></v-text-field>
                    </v-col>
                    <v-col lg="3" md="3" cols="6">
                        <v-text-field label="申请人" v-model="data.staff.name" disabled></v-text-field>
                    </v-col>
                    <v-col lg="3" md="3" cols="12" v-if="!offEdit">
                        <v-autocomplete label="请选择合同"
                                        v-if="data.company.id != null"
                                        single-line
                                        @focus="loadContract"
                                        :items="contracts" item-text="name" item-value="id" return-object
                                        multiple @input="selectContract"
                                        :search-input.sync="searchContract"
                                        title="请先选择供应单位" v-model="payDetails"></v-autocomplete>
                    </v-col>
                    <v-col lg="10" md="10" cols="12" v-if="!offEdit">
                        <file-upload :clear="clearFile"
                                     :mainId="data.id"
                                     :loadFile="loadFile"
                                     mainCoding="10563"
                                     @change="fileChange"></file-upload>
                    </v-col>
                    <v-col lg="2" md="2" cols="12" v-if="!offEdit">
                        <v-checkbox v-model="isColie" @change="filterContract(contracts)" label="子公司付款"></v-checkbox>
                    </v-col>
                </v-row>
            </div>
            <v-data-table :items="data.details"
                          disable-sort
                          @dblclick:row="deleteRow"
                          :headers="headers"
                          :items-per-page="10000" height="200" style="max-height: 200px" hide-default-footer>
                <template v-slot:item.paymentType.name="{item}">
                    <v-autocomplete dense height="40" v-if="item.edit3" autofocus @blur="item.edit3 = false" single-line
                                    :items="types" return-object item-text="name"
                                    v-model="item.paymentType"></v-autocomplete>
                    <div v-else @click="item.edit3 = true">{{item.paymentType.name}}</div>
                </template>
                <template v-slot:item.ratio="{ item }">
                    <v-text-field type="number" full-width style="width:45px;height: 40px" dense v-if="item.edit2"
                                  autofocus v-model="ratio" @blur="exitRatio(item)"
                                  @keyup.enter="exitRatio(item)"></v-text-field>
                    <v-chip v-else @click="item.edit2 = true">
                        {{ item.ratio }}
                    </v-chip>
                </template>
                <template v-slot:item.applyMoney="{ item }">
                    <v-text-field full-width style="width:100px;height: 40px" dense v-if="item.edit"
                                  autofocus v-model="item.applyMoney" @keyup.enter="exitItem(item)"
                                  @blur="exitItem(item)"></v-text-field>
                    <v-chip v-else :color="getColor(item.applyMoney)" dark @click="editRow(item)">
                        {{ item.applyMoney }}
                    </v-chip>
                </template>
                <template v-slot:item.remark="{item}">
                    <v-edit-dialog :return-value.sync="item.remark" large save-text="确定" cancel-text="取消">
                        <v-content link>
                            <v-icon left x-small>mdi-lead-pencil</v-icon>
                            {{item.remark}}
                        </v-content>
                        <template v-slot:input>
                            <div class="mt-4 title">
                                说明
                            </div>
                            <v-textarea v-model="item.remark" label="备注" counter autofocus></v-textarea>
                        </template>
                    </v-edit-dialog>
                </template>
            </v-data-table>
        </v-form>
        <v-snackbar top v-model="msg.show">{{msg.content}}</v-snackbar>
    </div>
</template>

<script>
    import {getPayType, loadById} from '@/api/payment'
    import {list, update} from '@/api/company'
    import {getByCompanyId} from '@/api/contract'
    import easyFlow from '@/components/easyflow/easyFlow'
    import fileUpload from '@/components/fileUpload'

    export default {
        name: "frame-10563",
        components: {
            easyFlow,
            fileUpload
        },
        props: {
            frameId: String,
            offEdit: {
                type: Boolean,
                default: true
            },
            change: {
                type: Function,
                default: null,
            },
            startFlow: {
                type: Boolean,
                default: false,
            },
            flowModel: {
                type: Object,
                default: null
            },
            updateItem: {
                type: Object,
                default: null
            },
            clearFile: Boolean,
        },
        data: () => ({
            searchContract:null,
            contractName:null,
            isColie: false,
            fileLoading: false,
            files: [],
            rules: [
                [
                    v => !!v.id || "请选择收款单位",
                ],
                [
                    v => v > 0 || "请选择付款合同,不能付款0元"
                ]
            ],
            updateRemark: null,
            ratio: "",
            payDetails: [],
            contracts: [],
            searchCompany: null,
            loading: false,
            companys: [],
            data: {},
            msg: {
                show: false,
                content: ''
            },
            id: null,
            headers: [
                {text: "序号", value: 'index'},
                {text: "合同名称", value: "contract.name"},
                {text: "合同总价", value: "contract.price"},
                {text: "已付款", value: "contract.yetPay"},
                {text: "比例(%)", value: "ratio", width: '8%'},
                {text: "本次申请付款", value: "applyMoney", width: "14%"},
                {text: "款项性质", value: "paymentType.name", width: '10%'},
                {text: "说明", value: "remark", width: '10%'},
                {text: "项目名称", value: "contract.projects[0].name"},
            ],
            types: [],
            typeMap: [],
            flow: null,
            loadFile: false,
        }),
        created() {
            this.reset();
            this.id = this.$route.params.id;
            if (this.id) {
                this.loadData();
            } else {
                this.id = this.frameId;
                if (this.id) {
                    this.loadData();
                } else {
                    this.loadCompany();
                    this.loadType();
                    this.data.staff = {
                        name: this.$store.state.user.name,
                        id: this.$store.state.user.id
                    }
                }
            }
        },
        watch: {
            updateItem: {
                handler() {
                    if (this.updateItem != null) {
                        this.data = this.updateItem
                        window.setTimeout(() => {
                            this.loadFile = true
                        }, 1000);
                    } else {
                        this.reset();
                    }
                },
                deep: true,
            },
            data: {
                handler() {
                    if (this.change != null) {
                        this.change(this.data, "data");
                    }
                },
                deep: true,
            },
            $route(to) {
                // 对路由变化作出响应...
                this.id = to.params.id;
                if (this.id) {
                    this.reset();
                    this.loadData();
                }
            },
            searchCompany(value) {
                this.loadCompany(value);
            },
            searchContract(value){
                if(value != null){
                    this.contractName = value
                    this.loadContract()
                }
            }
        },
        methods: {
            fileChange(files) {
                this.change(files, "files");
            },
            filterContract(items) {
                let filterData = [];
                items.forEach(c => {
                    if (this.isColie) {
                        //其他合同
                        if (c.partyA.id == "A343E3EC3DA1") {
                            filterData.push(c);
                        }
                    } else {
                        //默认合同
                        if (c.partyA.id == "22CA94CC3FF") {
                            filterData.push(c);
                        }
                    }
                })
                this.contracts = filterData;
                return filterData;
            },
            updateCompany() {
                if (this.data.company.id != null) {
                    update(this.data.company);
                }
            },
            changeFlow(flow) {
                this.flow = flow;
                if (this.change != null) {
                    this.change(this.flow, "flow");
                }
            },
            loadType() {
                getPayType().then(data => {
                    this.types = data;
                    this.types.forEach(type => {
                        this.typeMap[type.id] = type;
                    })
                })
            },
            deleteRow(event, item) {
                if (this.offEdit) {
                    return;
                }
                this.data.details.splice(item.index, 1);
                this.payDetails.splice(item.index, 1);
                this.setPayment(this.data)
            },
            editRow(item) {
                item.edit = true;
            },
            selectContract(items) {
                this.data.details = [];
                items.forEach((item, index) => {
                    let payType = "EBWF$U11";
                    if (item.yetPay <= 0) {
                        payType = "E0LWOI11";
                    }
                    let detail = null;
                    if (item.payClone != null) {
                        detail = item.payClone;
                    } else {
                        detail = {
                            contract: item,
                            index: index + 1,
                            applyMoney: (item.price - item.yetPay).toFixed(2),
                            remark: '',
                            edit: false,
                            ratio: 0,
                            edit2: false,
                            paymentType: {id: payType, name: this.typeMap[payType].name},
                            edit3: false,
                        }
                    }
                    this.setRatio(detail, item.price);
                    this.data.details.push(detail)
                })
                this.setPayment(this.data)
            },
            exitRatio(item) {
                if (this.ratio != '') {
                    item.ratio = this.ratio;
                    item.applyMoney = (item.contract.price * (item.ratio / 100)).toFixed(2)
                    item.edit2 = false;
                    this.ratio = "";
                    this.warn(item);
                    this.setPayment(this.data)
                } else {
                    this.msg.content = "请输入付款比例";
                    this.msg.show = true;
                }
            },
            exitItem(item) {
                if (item.applyMoney == "") {
                    this.msg.content = "请输入付款金额";
                    this.msg.show = true;
                } else {
                    item.edit = false
                    this.setRatio(item, item.contract.price);
                    this.warn(item);
                    this.setPayment(this.data)
                }
            },
            warn(item) {
                if (item.contract.price < (item.applyMoney + item.contract.yetPay)) {
                    this.msg.content = "付款金额超过合同总价！";
                    this.msg.show = true;
                }
            },
            setRatio(detail, total) {
                if (detail.applyMoney > 0) {
                    detail.ratio = Math.round((detail.applyMoney / total) * 10000) / 100.00;
                }
            },
            selectCompany() {
                this.data.details = [];
                this.payDetails = [];
            },
            loadContract() {
                if (this.data.company.id != null) {
                    getByCompanyId(this.data.company.id,this.contractName).then(data => {
                        this.filterContract(data);
                    })
                    this.data.details.forEach(detailItem => {
                        detailItem.contract.payClone = detailItem;
                        let isAdd = true;
                        try {
                            this.payDetails.forEach(old => {
                                if (old.id == detailItem.contract.id) {
                                    isAdd = false
                                    throw new Error("this id is exist")
                                }
                            })
                        } catch (ingore) {
                            // ingore
                        }
                        if (isAdd) {
                            this.payDetails.push(detailItem.contract);
                        }
                    })
                }
            },
            loadCompany(value) {
                this.loading = true;
                list(value).then(data => {
                    this.companys = data;
                }).finally(() => {
                    this.loading = false;
                })
            },
            loadData() {
                loadById(this.id).then(payment => {
                    if (payment != null) {
                        this.setPayment(payment);
                        this.companys.push(payment.company);
                        this.data = payment;
                    } else {
                        this.msg.content = "单据已被删除";
                        this.msg.show = true;
                    }
                });
            },
            setPayment(payment) {
                payment.proCompanyName = this.$store.state.api.cname;
                payment.moneys = 0.0;
                if (payment.details) {
                    payment.details.forEach((item, i) => {
                        item.index = i + 1;
                        try {
                            if (item.contract.partyA.id != "229CAD0E-7AAA-48CE-A3AF-8C97994CC3FF") {
                                payment.proCompanyName = item.contract.partyA.name;
                            }
                        } catch (e) {
                            console.log(e);
                        }
                        payment.moneys += parseFloat(item.applyMoney);
                        this.setRatio(item, item.contract.price);
                    });
                    payment.moneys = payment.moneys.toFixed(2);
                }
            },
            reset() {
                this.data = {
                    series: null,
                    proCompanyName: null,
                    company: {
                        name: null,
                        openAccount: null,
                        bankNumber: null
                    },
                    staff: {name: null},
                    remark: null,
                    moneys: 0.0,
                    details: []
                }
                this.payDetails = []
                this.contracts = []
                this.loadFile = false;
            },
            getColor(money) {
                if (money > 100000) return 'red'
                else if (money > 20000) return 'orange'
                else return 'green'
            },
        }
    }
</script>

<style scoped>

</style>