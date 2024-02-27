<template>
    <div>
        <div v-if="showQ == true">
            <v-form ref="quoteForm">
                <div>
                    <v-row style="text-align: center;margin: 0">
                        <v-col cols="12" md="3">
                            <div style="margin-top: 20px">{{enquiry.name}}</div>
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-text-field v-model="name" label="请填写报价人姓名" :rules="rules.nameRule"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-text-field v-model="tel" label="请填写报价人手机号" :rules="rules.telRule"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-text-field v-model="company" label="请填写报价单位" :rules="rules.companyRule"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-text-field v-model="totalAllPrice" label="总金额" readonly></v-text-field>
                        </v-col>
                    </v-row>
                </div>

                <v-data-table
                        :headers="headers"
                        :items="desserts"
                        hide-default-footer
                        class="elevation-1"
                        dense
                >
                    <template v-slot:item.quotePrice="{item}">
                        <v-text-field v-model="item.quotePrice" :rules="rules.priceRule"
                                      onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                      @change="quotePriceChanged(item)"></v-text-field>
                    </template>
                    <template v-slot:item.quoteRemark="{item}">
                        <v-text-field v-model="item.quoteRemark"></v-text-field>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <v-btn color="error" @click="ignore(item)" small>忽略</v-btn>
                    </template>

                </v-data-table>
            </v-form>
            <div style="text-align: right">
                <v-btn color="primary" @click="submit" style="margin-right: 20px;margin-top: 10px;margin-bottom: 10px">提交</v-btn>
            </div>
            <!--消息框-->
            <v-snackbar
                    v-model="snackbar"
                    :timeout="timeout"
                    :centered="true"
            >
                {{ textMsg }}
            </v-snackbar>
        </div>
        <div v-if="showQ == false">
            <div>
                <h5 style="text-align: center">报价系统</h5>
            </div>
            <div style="display: block;text-align: center;color: red">
                <h3 id="msg" style="padding: 0px 15px;">{{textMsg}}</h3>
            </div>
        </div>
    </div>


</template>
<script>
    import {getQuote, insertQuote} from "../../../api/queryEnquiry";

    export default {
        name: "quote",
        data: () => ({
            showQ: true,

            headers: [
                {text: '序号', value: 'index', sortable: false},
                {text: '材料名称', value: 'material.name', sortable: false},
                {text: '型号', value: 'material.model', sortable: false},
                {text: '单位', value: 'material.unitName', sortable: false},
                {text: '品牌', value: 'material.brand', sortable: false},
                {text: '需求量', value: 'num', sortable: false},
                {text: '请填写单价', value: 'quotePrice', sortable: false},
                {text: '总价', value: 'totalPrice', sortable: false},
                {text: '报价留言', value: 'quoteRemark', sortable: false},
                {text: '操作', value: 'actions',sortable: false},
            ],
            desserts: [],
            enquiry: {
                name: null
            },

            rules: {
                priceRule: [
                    v => v > 0 || '请输入正确的数值'
                ],
                telRule: [
                    v => {
                        const pattern = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
                        return pattern.test(v) || '请输入正确的手机号'
                    }

                ],
                nameRule: [
                    v => !!v || '请填写报价人姓名'
                ],
                companyRule: [
                    v => !!v || '请填写报价单位'
                ]
            },

            name: null,
            tel: null,
            company: null,
            totalAllPrice: null,

            proQuote: {
                enquiryId: null,
                enquiryMaterId: null,
                price: null,
                remark: null,
                tel: null,
                name: null,
                company: null,
                money: null,
                material: null,
            },
            // proQuoteList: [],
            proQuoteModel: {
                proQuoteList: []
            },

            snackbar: false,
            timeout: 2000,
            textMsg: null,
        }),

        watch: {},

        created() {
            this.load()
            this.init()
        },

        methods: {
            init() {
                this.name = JSON.parse(window.localStorage.getItem("quote_name"))
                this.tel = JSON.parse(window.localStorage.getItem("quote_tel"))
                this.company = JSON.parse(window.localStorage.getItem("quote_company"))
            },
            load() {
                getQuote(this.$route.params.enquiryId).then(res => {
                    console.log(res)
                    if (res != null) {
                        for (let a = 0; a < res.material.length; a++) {
                            res.material[a].index = a + 1
                            res.material[a].totalPrice = ''
                            res.material[a].quotePrice = ''
                            res.material[a].quoteRemark = ''
                            // res.material[a].hasPrice = 0
                        }
                    }
                    this.desserts = res.material
                    this.enquiry = res.enquiry
                }).catch(e => {
                    this.textMsg = e
                    this.showQ = false
                })

            },

            ignore(item){
                let index = this.desserts.indexOf(item)
                this.desserts.splice(index,1)
            },

            quotePriceChanged(item) {
                if (item.quotePrice > 0) {
                    item.totalPrice = item.num * item.quotePrice
                    this.totalAllPrice = this.totalAllPrice + item.totalPrice
                    // item.hasPrice = 1
                } else {
                    this.totalAllPrice = this.totalAllPrice - item.totalPrice
                    item.totalPrice = ''
                    // item.hasPrice = 0
                }
            },

            submit() {

                if (this.$refs.quoteForm.validate()) {
                    window.localStorage.setItem("quote_name", JSON.stringify(this.name))
                    window.localStorage.setItem("quote_tel", JSON.stringify(this.tel))
                    window.localStorage.setItem("quote_company", JSON.stringify(this.company))
                    for (let b = 0; b < this.desserts.length; b++) {
                        this.proQuote.enquiryId = this.enquiry.id
                        this.proQuote.enquiryMaterId = this.desserts[b].id
                        this.proQuote.price = this.desserts[b].quotePrice
                        this.proQuote.remark = this.desserts[b].quoteRemark
                        this.proQuote.tel = this.tel
                        this.proQuote.name = this.name
                        this.proQuote.company = this.company
                        this.proQuote.money = this.desserts[b].totalPrice
                        this.proQuote.material = this.desserts[b].material

                        this.proQuoteModel.proQuoteList.push(this.proQuote)
                        this.pReset()
                    }
                    insertQuote(this.proQuoteModel).then(res => {
                        console.log(res)
                        if (res != null) {
                            this.proQuoteModel.proQuoteList = []
                            this.textMsg = '已提交'
                            this.showQ = false
                        }
                    })
                }

            },

            pReset() {
                this.proQuote = {
                    enquiryId: null,
                    enquiryMaterId: null,
                    price: null,
                    remark: null,
                    tel: null,
                    name: null,
                    company: null,
                    money: null,
                    material: null,
                }
            }
        }
    }
</script>
