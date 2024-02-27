<template>

    <v-form>
        <v-row dense>
            <v-col cols="6">
                <v-text-field label="项目名称" readonly v-model="updateItem.projectName"></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field label="业主名称" readonly v-model="updateItem.company.name"></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field label="投标报价" readonly v-model="updateItem.bidMoney"></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-radio-group label="中标情况" v-model="updateItem.state" row @change="stateChange">
                    <v-radio key="2" label="中标" :value="2"></v-radio>
                    <v-radio key="3" label="未中标" :value="3"></v-radio>
                </v-radio-group>
            </v-col>
            <v-col cols="6">
                <v-text-field label="标前成本" type="number" v-model="updateItem.beforeMoney"></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-menu v-model="menu3"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        ref="menu3"
                        min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="updateItem.inDate"
                                      label="计划进场日期"
                                      readonly
                                      v-bind="attrs"
                                      v-on="on"></v-text-field>
                    </template>
                    <v-date-picker v-model="updateItem.inDate" @change="$refs.menu3.save()" no-title
                                   scrollable></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="6">
                <v-menu v-model="menu2"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        ref="menu2"
                        min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="updateItem.bzjDate"
                                      label="投标保证金回款时间"
                                      readonly
                                      v-bind="attrs"
                                      v-on="on"></v-text-field>
                    </template>
                    <v-date-picker v-model="updateItem.bzjDate" @change="$refs.menu2.save()" no-title
                                   scrollable></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="6">
                    <v-text-field type="number" v-model="updateItem.bzjMoney" label="投标保证金回款金额"></v-text-field>
            </v-col>
            <v-col cols="6" v-if="frameId == null">
                <easy-flow ref="flow"
                           defaultFlowName="投标结果反馈"
                           :instance="flowMsg"
                           coding="13202782"></easy-flow>
            </v-col>
            <v-col cols="6">
                <v-btn @click="toSaleContract" :disabled="updateItem.state !== 2" color="primary">生成工程合同</v-btn>
            </v-col>
        </v-row>

    </v-form>
</template>

<script>
    import {getBidById} from '@/api/proBid'
    import easyFlow from '@/components/easyflow/easyFlow'

    export default {
        name: "frame-13201782",
        components: {
            easyFlow
        },
        data: () => ({
            menu2: false,
            menu3: false,
            updateItem: null,
            flowMsg: {
                message: {
                    title: null,
                    content: null,
                    frameId: null,
                    frameCoding: 13202782,
                    frameColumn: 'id'
                }
            },
        }),
        props: {
            data: null,
            frameId: null,
            offEdit: Boolean,
        },
        model: {
            prop: 'data',
            event: 'change'
        },
        watch: {
            data: {
                handler() {
                    this.updateItem = this.data
                }
            },
            updateItem: {
                handler() {
                    this.$emit("change", this.updateItem)
                },
                deep: true,
            },
        },
        created() {
            if (this.frameId != null) {
                this.loadData();
            } else {
                this.updateItem = this.data
            }
        },
        methods: {
            toSaleContract() {
                const {href} = this.$router.resolve({
                    path: '/salesContract/list/salesContractList', query: {
                        projectBase: this.updateItem.address || "",
                        agreementName: this.updateItem.projectName,
                        agreementMoney: this.updateItem.bidMoney,
                        companyName: this.updateItem.company.name,
                        companyAddress: this.updateItem.company.address,
                        bankName: this.updateItem.company.openAccount,
                        bankAccount: this.updateItem.company.bankNumber,
                        remark: this.updateItem.remark,
                    }
                })
                window.open(href, '_blank')
            },
            stateChange(val, oldVal) {
                console.log(this.updateItem, val, oldVal);
            },
            loadData() {
                getBidById(this.frameId).then(result => {
                    this.updateItem = result
                })
            },
            startFlow(project) {
                this.flowMsg.message.title = project.projectName + "投标结果"
                if (project.remark != null) {
                    this.flowMsg.message.content = project.remark
                }
                this.flowMsg.message.frameId = project.id
                return this.$refs['flow'].startFlow(this.flowMsg.message)
            }
        }
    }
</script>

<style scoped>

</style>