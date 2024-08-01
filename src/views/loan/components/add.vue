<template>
    <v-container>
        <v-form ref="loanAdd">
            <v-row>
                <v-col cols="12" md="3" sm="3" xs="3">
                    <v-text-field v-model="staff.name" label="借款人" readonly></v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="3" xs="3">
                    <v-text-field v-model="staff.section.name" label="部门" readonly></v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="3" xs="3">
                    <v-text-field v-model="staff.openBlank" label="开户行" readonly></v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="3" xs="3">
                    <v-text-field v-model="staff.bankNumber" label="账号" readonly></v-text-field>
                </v-col>
                <v-col cols="12" md="4" sm="4" xs="4">
                    <v-text-field v-model="loanItem.lendMoney" label="借款金额" type="number"
                                  :rules="rules.lendMoney"></v-text-field>
                </v-col>
                <v-col cols="12" md="4" sm="4" xs="4">
                    <v-menu ref="menu" v-model="menu" :close-on-content-click="false">
                        <template v-slot:activator="{attrs,on}">
                            <v-text-field hide-details
                                          v-bind="attrs"
                                          v-on="on"
                                          v-model="loanItem.lendDate"
                                          :rules="rules.lendDate"
                                          label="借款日期"></v-text-field>
                        </template>
                        <v-date-picker v-model="loanItem.lendDate" @change="$refs.menu.save()"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" md="4" sm="4" xs="4">
                    <easy-flow coding="1320294" ref="loanFlow" :default-flow-name="defaultFlow"></easy-flow>
                </v-col>
                <v-col cols="12">
                    <v-text-field v-model="loanItem.remark" label="借款原因" :rules="rules.remark"></v-text-field>
                </v-col>
            </v-row>
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
        </v-form>
    </v-container>
</template>
<script>
    import {getStaffById} from "../../../api/staff";
    import {insert} from "../../../api/loan";
    import easyFlow from "../../../components/easyflow/easyFlow";

    export default {
        name: 'addLoan',
        components: {easyFlow},
        data: () => ({
            loadDialog: false,
            staff: {
                name: null,
                section: {name: null},
                openBlank: null,
                bankNumber: null
            },
            loanItem: {
                lendMoney: 0,
                lendDate: null,
                remark: null,
                state: 0,
                moneyToRepay: 0
            },

            defaultFlow: null,

            menu: false,

            rules: {
                lendMoney: [
                    v => !!v || '必填字段', v => v > 0 || '请输入正确的数值'
                ],
                lendDate: [
                    v => !!v || '必填字段'
                ],
                remark: [
                    v => !!v || '必填字段'
                ]
            }
        }),

        created() {
            this.LoadStaffMsg()
        },
        mounted() {
            this.initDate()
        },

        methods: {

            initDate() {
                this.loanItem.lendDate = this.formatTimer(new Date())
            },

            formatTimer(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                // let h = date.getHours();
                // h = h < 10 ? "0" + h : h;
                // let m = date.getMinutes();
                // m = m < 10 ? "0" + m : m;
                // let s = date.getSeconds();
                // s = s < 10 ? "0" + s : s;
                return y + "-" + MM + "-" + d;
            },

            LoadStaffMsg() {
                getStaffById(this.$store.state.user.id).then(res => {
                    this.staff = res
                })
            },

            validateForm() {
                let flag = null
                if (this.$refs['loanAdd'].validate()) {
                    flag = true
                } else {
                    flag = false
                }
                return flag
            },

            resetFormRules() {
                this.clear = true
                this.$refs['loanAdd'].resetValidation()
            },

            insertLoan() {
                this.loanItem.moneyToRepay = this.loanItem.lendMoney

                this.loadDialog = true
                return insert(this.loanItem).then(res => {
                    this.reset()
                    this.$refs['loanFlow'].startFlow({
                        title: this.staff.name + "的借款",
                        content: res.remark,
                        frameId: res.id,
                        frameCoding: 1320294,
                        frameColumn: 'id'
                    }).then()
                    this.loadDialog = false
                    return res
                })
            },

            reset() {
                this.loanItem = {
                    lendMoney: 0,
                    lendDate: null,
                    remark: null,
                    state: 0,
                    moneyToRepay: 0
                }
            }
        }
    }
</script>
