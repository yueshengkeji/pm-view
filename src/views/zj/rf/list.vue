<template>
    <div>
        <v-row>
            <v-col lg="2">
                <v-btn v-if="type == null" color="primary" @click="openDialog">新增</v-btn>
                <v-btn @click="downloadExcel" :loading="loading" class="ml-1">导出</v-btn>
            </v-col>
            <v-col lg="2" offset="8">
                <v-text-field label="搜索" v-model="query.searchText" @change="list"></v-text-field>
            </v-col>
        </v-row>
        <v-data-table
                class="cursor"
                :items="items"
                :items-per-page="10"
                :server-items-length="total"
                :options.sync="options"
                sort-by="series"
                sort-desc
                @dblclick:row="detail"
                :headers="headers">
            <template v-slot:item.dateTime="{item}">
                {{dateFormat(new Date(item.dateTime),'mm-dd HH:MM')}}
            </template>

            <template v-slot:item.action="{item}">
                <v-btn class="ml-1" color="error" x-small @click="deleteItem(item)">删除</v-btn>
            </template>
        </v-data-table>
        <v-dialog v-model="dialog" @close="dialog = false" width="60%">
            <v-card class="pa-5">
                <v-form ref="zujinForm" class="pt-5">
                    <v-row dense>
                        <v-col sm="6">
                            <v-text-field dense label="合同编号" :rules="rules.series" v-model="data.series"></v-text-field>
                        </v-col>
                        <v-col sm="6">
                            <v-text-field dense label="租赁方" :rules="rules.brandCompany.name"
                                          v-model="data.company"></v-text-field>
                        </v-col>
                        <v-col sm="6">
                            <v-text-field dense label="品牌" :rules="rules.brand" v-model="data.brand"></v-text-field>
                        </v-col>
                        <v-col sm="6">
                            <v-text-field type="number" dense label="应收金额" :rules="rules.yearRental"
                                          v-model="data.yearRental"></v-text-field>
                        </v-col>
                        <v-col sm="6">
                            <v-text-field type="number" dense label="实收金额" :rules="rules.sjMoney"
                                          v-model="data.sjMoney"></v-text-field>
                        </v-col>
                        <v-col sm="6">
                            <v-text-field type="number" dense label="保证金"
                                          v-model="data.bzjMoney"></v-text-field>
                        </v-col>
                        <v-col sm="6">
                            <v-text-field dense label="租赁联系人" v-model="data.zlPerson"></v-text-field>
                        </v-col>
                        <v-col sm="6">
                            <v-text-field dense label="联系手机号" v-model="data.zlPersonTel"></v-text-field>
                        </v-col>
                        <v-col sm="8">
                            <v-text-field dense label="备注" v-model="data.remark"></v-text-field>
                        </v-col>
                        <v-col sm="4">
                            <v-text-field dense label="经办人" v-model="data.staffName"></v-text-field>
                        </v-col>

                        <v-col sm="2" v-if="data.id != null"  v-show="false">
                            <v-row key="row-sm-2" dense class="white">
                                <v-col style="background-color: rgba(218, 150, 148, 1);" cols="6">期初未开票
                                </v-col>
                                <v-col class="cursor" cols="6" style="background-color: rgba(218, 150, 148, 1)">
                                    <v-text-field @change="updateQcOweMoney(data.billOwe)" type="number"
                                                  @focus="$event.target.select()" hide-details dense
                                                  v-model="data.billOwe.oweMoney"></v-text-field>
                                </v-col>

                                <v-col style="background-color: rgba(0, 176, 240, 1)" cols="6">期初欠费</v-col>
                                <v-col class="cursor" cols="6" style="background-color: rgba(0, 176, 240, 1)">
                                    <v-text-field @change="updateQcOweMoney(data.moneyOwe)" type="number"
                                                  @focus="$event.target.select()" hide-details dense
                                                  v-model="data.moneyOwe.oweMoney"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="insertZujin" color="primary">确定</v-btn>
                    <v-btn @click="dialog = false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="deleteDialog" @close="deleteDialog = false" width="30%">
            <v-card>
                <v-card-actions>
                    <v-card-title>确定删除:{{item.series}}？</v-card-title>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="deleteZujin" autofocus>确定</v-btn>
                    <v-btn @click="deleteDialog = false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="msgShow">{{msg}}</v-snackbar>
    </div>
</template>

<script>
    import {
        bzjList,
        bzjMoneyList,
        deleteZujin,
        expireList,
        exportZujinExcel,
        insertBzj,
        insertZujin,
        rageMoneyList,
        tempMoneyList,
        updateMoney,
        updateZujin
    } from '@/api/zujin'
    import {
        addPayDetail,
        getById,
        getPayDetails,
        getPutDetailByMain,
        insertProPutDetail,
        updateProPutDetail,
    } from '@/api/proPutDetail'
    import {updatePay} from '@/api/proDetailPay'
    import {getOweList, insertOwe, updateOwe, updateQcOwe} from '@/api/proOwe'
    import {list} from '@/api/yetai'
    import {houseList} from '@/api/house'

    export default {
        name: "zj-list",
        props: {
            type: null,
        },
        data: () => ({
            msgShow: false,
            msg: null,
            year: '2021',
            headers: [
                {text: '合同编号', value: 'series'},
                {text: '租赁方', value: 'brandCompany.name'},
                {text: '品牌', value: 'brand'},
                {text: '应收金额', value: 'yearRental'},
                {text: '实际金额', value: 'sjMoney'},
                {text: '保证金', value: 'bzjMoney'},
                {text: '登记时间', value: 'dateTime'},
                {text: '备注', value: 'remark'},
                {text: '操作', value: 'action'},

            ],
            items: [],
            options: {},
            query: {
                searchText: null,
                page: 1,
                itemsPerPage: 10,
            },
            total: 0,
            downloadExcelUrl:"tempMoney/export",
            dialog: false,
            data: null,
            payTypes: [
                {text: '年付方式', value: 0},
                {text: '季度方式', value: 1},
                {text: '月付方式', value: 2},
            ],
            houseList: [],
            searchHouse: null,

            rules: {
                series: [v => !!v || '请输入合同编号', v => (!!v && v.length < 100) || '合同编号不能超过10个字符'],
                company: [v => !!v || '请输入租赁方', v => (!!v && v.length < 100) || '租赁方不能超过10个字符'],
                brand: [v => !!v || '请输入品牌', v => (!!v && v.length < 100) || '品牌不能超过10个字符'],
                yearRental: [v => !!v || '请输入应收金额'],
                sjMoney: [v => !!v || '请输入实收金额'],
            },
            yitaiItems: [],

            houseMessage: null,
            acreageMessage: null,
            dzNumberError: null,
            deleteDialog: false,
            item: {
                series: ''
            },
            /*应收/实收表（物业费明细表）*/
            headers2: [
                {text: '序号', value: 'index', width: '10%'},
                {text: '应收时间', value: 'proDate'},
                {text: '金额', value: 'proMoney', width: '10%'},
                {text: '实收时间', value: 'putDate'},
                {text: '金额', value: 'putMoney', width: '10%'},
                {text: '备注', value: 'remark', width: '20%'},
            ],
            ysMoneyItems: [],
            ysMoneyCount: 0,
            sjMoneyCount: 0,
            offInsert: false,
            detailItem: {
                id: null,
                proDate: null,
                proMoney: null,
                putDate: null,
                putMoney: null,
                remark: null,
                edit: false
            },
            detailLoading: false,

            menu: false,
            menu2: false,
            date: null,
            date2: null,

            headers3: [
                {text: '开票情况', value: 'billMoney', colspan: 2, width: '50%'},
                {text: '收款情况', value: 'payMoney', colspan: 2, width: '50%'},
            ],
            cwMoneyItems: [],
            detailLoading2: false,
            saveLoading: false,
            payCount: 0,
            billCount: 0,

            //会计科目相关
            billItems: [],
            billDialog: false
        }),
        watch: {
            search(value) {
                this.loadHouses(value);
            },
            options: {
                handler() {
                    this.list()
                },
                deep: true
            }
        },
        created() {
            list().then(items => {
                this.yitaiItems = items
            })
            this.reset()
        },
        methods: {
            downloadExcel(){
                this.loading = true
                let {page, itemsPerPage, sortBy, sortDesc} = this.options
                this.query.page = page
                this.query.itemsPerPage = itemsPerPage
                this.query.sortBy = sortBy.join(',')
                this.query.sortDesc = sortDesc.join(',')
                exportZujinExcel(this.downloadExcelUrl,this.query).then(data => {
                    try {
                        let a = document.createElement("a");
                        a.target = "_blank"
                        a.href = data
                        a.click()
                    } catch (e) {
                        console.log(e)
                    }
                }).finally(() => {
                    this.loading = false
                })

            },
            getSjQMoney() {
                let m = parseFloat(this.data.moneyOwe.oweMoney)
                if (isNaN(m)) {
                    m = 0
                }
                return m + this.data.sjMoney - this.data.cwMoney
            },
            getNoBillMoney() {
                let m = parseFloat(this.data.billOwe.oweMoney)
                if (isNaN(m)) {
                    m = 0
                }
                return m + this.data.sjMoney - this.data.kpMoney
            },
            updateQcOweMoney(data) {
                updateQcOwe(data).then(() => {
                    this.list()
                })
            },
            newLine3(data) {
                this.detailItem = {
                    edit: true,
                    mainId: this.item.id,
                    money: 0,
                    remark: '系统备注',
                    series: ''
                }
                data.push(this.detailItem)
                this.offInsert = true
            },

            savePay() {
                this.saveLoading = true
                /*
                收票、收款保存
                 */
                let size = this.cwMoneyItems.length
                let than = this
                let count = 0
                for (let i = 0; i < size; i++) {
                    let detailItem = than.cwMoneyItems[i]
                    if (detailItem.id != null) {
                        updatePay(detailItem).finally(() => {
                            count++
                        })
                    } else {
                        addPayDetail(detailItem).finally(() => {
                            count++
                        })
                    }
                }
                /*
                会计科目保存
                 */
                size += this.billItems.length
                for (let x = 0; x < this.billItems.length; x++) {
                    let item = this.billItems[x]
                    item.remark = ""
                    if (item.id != null) {
                        updateOwe(item).finally(() => {
                            count++
                        })
                    } else {
                        insertOwe(item).finally(() => {
                            count++
                        })
                    }
                }

                let timeout = window.setInterval(() => {
                    console.log("count%1 size%2", count, size)
                    if (count === size) {
                        than.saveLoading = false
                        than.offInsert = false
                        than.loadProDetail()
                        window.clearInterval(timeout)
                    }
                }, 1000);
            },
            editDetailItem2(event, item) {
                this.editDetailItem(event, item)
            },

            dateChange(item, prop) {
                if (prop == "putDate") {
                    // this.$refs[prop].save()
                    this.menu2 = false
                } else {
                    this.menu = false
                }
            },
            editDetailItem(event, param) {
                if (this.offInsert) {
                    let isRequest = true
                    if (this.detailItem.id === (event.id || param.id)) {
                        isRequest = false
                    }
                    if (this.detailItem.id != null && isRequest) {
                        this.detailItem.edit = false
                        getById(this.detailItem.id).then(detail => {
                            detail.edit = false
                            this.detailItem.proDate = detail.proDate
                            this.detailItem.proMoney = detail.proMoney
                            this.detailItem.putMoney = detail.putMoney
                            this.detailItem.putDate = detail.putDate
                            this.detailItem.remark = detail.remark
                        }).finally(() => {
                            this.openEdit(event, param)
                        })
                    } else if (isRequest) {
                        this.ysMoneyItems.splice(this.detailItem.index, 1)
                        this.openEdit(event, param)
                    }
                    return
                } else {
                    this.openEdit(event, param)
                }

            },
            openEdit(event, param) {
                if (event.id == null) {
                    window.setTimeout(() => {
                        let temp
                        if (this.$refs[param.id + event] instanceof Array) {
                            temp = this.$refs[param.id + event][0]
                        } else {
                            temp = this.$refs[param.id + event]
                        }
                        temp.focus()
                        temp.$refs.input.select()
                    }, 100)
                    this.detailItem = param
                } else {
                    this.detailItem = param.item
                }
                if (event == "proDate") {
                    this.menu = true
                } else if (event == "putDate") {
                    this.menu2 = true
                } else {
                    this.menu = false
                    this.menu2 = false
                }
                this.detailItem.edit = true
                this.offInsert = true
            },
            cancelInsert() {
                if (this.detailItem.id == null) {
                    this.ysMoneyItems.splice(this.detailItem.index, 1)
                }
                this.offInsert = false
                this.loadProDetail()
            },
            savePro() {
                if (this.detailItem.proMoney < 0 && (this.detailItem.remark == "" || this.detailItem.remark == null)) {
                    this.msg = "填写抵扣金额时必须填写抵扣备注信息"
                    this.msgShow = true
                    return;
                }
                if (this.detailItem.id != null) {
                    updateProPutDetail(this.detailItem).then(() => {
                        this.loadProDetail()
                    }).finally(() => {
                        this.offInsert = false
                    })
                } else {
                    insertProPutDetail(this.detailItem).then(() => {
                        this.loadProDetail()
                    }).finally(() => {
                        this.offInsert = false
                    })
                }

            },
            setItemMoneys() {
                this.item.ysMoney = this.ysMoneyCount
                this.item.sjMoney = this.sjMoneyCount
                this.item.cwMoney = this.payCount
                this.item.kpMoney = this.billCount
            },
            loadProDetail() {
                let loadCount = 0
                this.detailLoading = true
                this.ysMoneyCount = 0
                this.sjMoneyCount = 0
                //应收/实收
                getPutDetailByMain(this.item.id).then(data => {
                    if (data != null) {
                        data.forEach((item, idx) => {
                            item.edit = false
                            item.index = idx + 1
                            if (item.proMoney != null) {
                                this.ysMoneyCount += item.proMoney
                            }
                            if (item.putMoney != null) {
                                this.sjMoneyCount += item.putMoney
                            }
                        })
                        if (loadCount == 1) {
                            this.setItemMoneys()
                            updateMoney({
                                id: this.item.id,
                                ysMoney: this.ysMoneyCount,
                                sjMoney: this.sjMoneyCount,
                                cwMoney: this.payCount,
                                kpMoney: this.billCount,
                            }).then(() => {
                                this.list()
                            })
                        } else {
                            loadCount++
                        }

                        this.ysMoneyItems = data
                    }
                }).catch(() => {
                    this.ysMoneyItems = []
                }).finally(() => {
                    this.detailLoading = false
                })

                //财务实收/开票
                this.detailLoading2 = true
                getPayDetails(this.item.id).then(data => {
                    this.payCount = 0
                    this.billCount = 0
                    if (data != null) {
                        data.forEach(item => {
                            item.edit = false
                            if (item.payMoney != null) {
                                this.payCount += item.payMoney
                            }
                            if (item.billMoney != null) {
                                this.billCount += item.billMoney
                            }
                        })
                        if (loadCount == 1) {
                            this.setItemMoneys()
                            updateMoney({
                                id: this.item.id,
                                ysMoney: this.ysMoneyCount,
                                sjMoney: this.sjMoneyCount,
                                cwMoney: this.payCount,
                                kpMoney: this.billCount,
                            }).then(() => {
                                this.list()
                            })
                        } else {
                            loadCount++
                        }
                        this.cwMoneyItems = data

                    }
                }).catch((() => this.cwMoneyItems = [])).finally(() => {
                    this.detailLoading2 = false
                })

                //财务会计科目
                getOweList(this.item.id).then(data => {
                    data.forEach(item => {
                        item.edit = false
                    })
                    this.billItems = data
                }).catch(() => this.billItems = [])
            },
            newLine(data) {
                let date = this.dateFormat(new Date(), 'YYYY-mm-dd')
                this.detailItem = {
                    edit: true,
                    mainId: this.item.id,
                    index: data.length + 1,
                    proDate: date,
                    proMoney: 0,
                    putDate: date,
                    putMoney: 0,
                }
                data.push(this.detailItem)
                this.offInsert = true
            },
            newLine2(data) {
                let date = this.dateFormat(new Date(), 'YYYY.mm.dd#')
                this.detailItem = {
                    edit: true,
                    mainId: this.item.id,
                    index: data.length + 1,
                    billDate: date,
                    billMoney: 0,
                    payDate: date,
                    payMoney: 0,
                }
                data.push(this.detailItem)
                this.offInsert = true
            },

            detail(event, row) {
                this.item = row.item

                if (this.item.houses.length > 0) {
                    this.item.houses.forEach(item => {
                        item.temp = item.pwNumber + ":" + item.acreage
                        this.houseList.push(item)
                    })
                }
                this.data = row.item
                this.loadBzj();
                this.loadProDetail()
                this.dialog = true
            },
            loadBzj() {
                this.bzjMoneyCount = 0;
                bzjList(this.data.id).then(result => {
                    result.forEach(item => {
                        if (item.money != null) {
                            this.bzjMoneyCount += item.money;
                        }
                    })
                    this.bzjItems = result
                })
            },
            insertBzjEvent() {
                if (this.bzj.money == "" || this.bzj.money == 0) {
                    return false;
                }
                this.bzj.proDetailId = this.data.id
                insertBzj(this.bzj).then(() => {
                    this.loadBzj()
                    this.$refs['bzjForm'].reset();
                    this.bzjDialog = false
                }).catch(e => {
                    console.log("登记失败", e)
                })
            },
            formatHouse(houses) {
                if (houses.length > 0) {
                    return houses[0].pwNumber
                } else {
                    return ""
                }
            },
            deleteZujin() {
                deleteZujin(this.item.id).then(() => {
                    this.list()
                    this.deleteDialog = false
                }).catch(e => {
                    console.log(e)
                })
            },
            deleteItem(item) {
                this.item = item
                this.deleteDialog = true
            },
            formatDjYsMoney(item) {

                /*
                 *   {text: '年付方式', value: 0},
                     {text: '季度方式', value: 1},
                     {text: '月付方式', value: 2},
                 */
                if (item.payType == 0) {
                    return item.yearRental
                } else if (item.payType == 1) {
                    let num = this.getQuarter()
                    console.log("每季度金额：", item.yearRental / 4, "当前季度", num)
                    return (item.yearRental / 4 * num).toFixed(2)
                } else {
                    return (item.yearRental / 12 * new Date().getMonth() + 1).toFixed(2)
                }

            },
            formatPay(item) {
                let result = null;
                for (let x = 0; x < this.payTypes.length; x++) {
                    if (this.payTypes[x].value === item.payType) {
                        result = this.payTypes[x].text
                        break
                    }
                }
                return result
            },
            loadHouses(value) {
                houseList({searchText: value, page: 1, itemsPerPage: 50, flag: 0}).then(data => {
                    data.rows.forEach(item => {
                        item.temp = item.pwNumber + ":" + item.acreage
                    })
                    this.houseList = data.rows
                })
            },
            openDialog() {
                this.reset()
                this.dialog = true
            },
            houseChange() {
                console.log("houseChange")
                this.data.acreage = 0
                this.data.houses.forEach(item => {
                    let acreage = parseFloat(item.acreage);
                    if (isNaN(acreage)) {
                        acreage = 0
                    }
                    this.data.acreage += acreage
                })
                this.data.acreage = this.data.acreage.toFixed(2)
                let last = 0;
                if ((last = this.data.houses.length) > 0) {
                    last = this.data.houses[last - 1]
                    if (last.yetaiId != null) {
                        this.data.yt = {id: last.yetaiId, name: ''}
                        for (let x = 0; x < this.yitaiItems.length; x++) {
                            let item = this.yitaiItems[x]
                            if (item.id == last.yetaiId) {
                                this.data.yt.name = item.name
                                break
                            }
                        }
                    }
                    this.houseMessage = null
                    this.acreageMessage = null
                }
            },
            houseSelect() {
                if (this.data.zlType != 0) {
                    this.data.houses = []
                    this.data.acreage = 0
                }
            },
            reset() {
                this.data = {
                    series: null,
                    company: null,
                    brand: null,
                    payType: 0,
                    acreage: 0,
                    zl_person: null,
                    zl_person_tel: null,
                    yt: {id: null, name: null},
                    staffName: this.$store.state.user.name,
                    isDz: null,
                    isSh: null,
                    remark: null,
                    houses: [],
                    zlType: 2,
                    dzNumber: 0,
                    zlPerson: null,
                    zlPersonTel: null,
                    billOwe: {oweMoney: 0},
                    moneyOwe: {oweMoney: 0},
                    djYsMoney: 0,
                    yearRental: null,
                    endDatetime: null,
                }
                this.ysMoneyItems = []
                this.cwMoneyItems = []
                this.payCount = 0
                this.billCount = 0
                this.ysMoneyCount = 0
                this.sjMoneyCount = 0
                this.loadHouses();
            },
            insertZujin() {
                let valid = this.$refs['zujinForm'].validate();
                if (valid) {
                    if (this.data.id != null) {
                        updateZujin(this.data).then(() => {
                            this.list()
                            this.dialog = false
                        })
                    } else {
                        insertZujin(this.data).then(() => {
                            this.list()
                            this.dialog = false
                        })
                    }
                }
            },
            list() {
                let {page, itemsPerPage, sortBy, sortDesc} = this.options
                this.query.page = page
                this.query.itemsPerPage = itemsPerPage
                this.query.sortBy = sortBy.join(',')
                this.query.sortDesc = sortDesc.join(',')
                let request;
                if (this.type == null) {
                    request = tempMoneyList(this.query)
                } else if (this.type == "expire") {
                    request = expireList(this.query)
                } else if (this.type == "rage") {
                    request = rageMoneyList(this.query)
                } else {
                    request = bzjMoneyList(this.query)
                }
                request.then(data => {
                    data.rows.forEach(item => {
                        item.djYsMoney = this.formatDjYsMoney(item)
                    })
                    this.items = data.rows
                    this.total = data.total
                })
            }
        }
    }
</script>

<style scoped>
    .cursor {
        cursor: pointer;
    }

    .border-top {
        border-top: thin solid rgba(0, 0, 0, 0.12)
    }
</style>