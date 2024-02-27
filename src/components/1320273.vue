<template>
    <div class="pa-3">
        <v-form>
            <v-row>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="合同编号" v-model="data.series"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="单位名称" v-model="data.companyName"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="单元号" v-model="data.mark"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="签订日期" v-model="data.contractDate"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="项目名称" v-model="data.projectName"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="备注" v-model="data.remark"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="合同总价" v-model="data.money"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="已收款金额" v-model="data.inMoney"></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-data-table :headers="headers" :items-per-page="1000"
                              :items="data.houseBillDetailList"></v-data-table>
            </v-row>
        </v-form>
    </div>
</template>

<script>
    import {getById} from '@/api/houseBill'

    export default {
        name: "frame-1320273",
        data: () => ({
            data: null,
            headers: [
                {text: '收款类型', value: 'type'},
                {text: '收款金额', value: 'money'},
                {text: '备注', value: 'remark'},
                {text: '会计序号', value: 'series'},
                {text: '到期日期', value: 'endDate'},
            ],
        }),
        props: {
            frameId: null,
        },
        watch: {
            frameId: {
                handler() {
                    if (this.frameId != null) {
                        this.reset();
                        this.loadData()
                    }
                },
            }
        },
        created() {
            if (this.frameId != null) {
                this.reset();
                this.loadData();
            }
        },
        methods: {
            loadData() {
                getById(this.frameId).then(data => {
                    if (data != null) {
                        this.data = data;
                    }
                })
            },
            reset() {
                this.data = {
                    series: null,
                    companyName: null,
                    mark: null,
                    contractDate: null,
                    projectName: null,
                    inMoney: null,
                    remark: null,
                    money: null,
                    houseBillDetailList: [],
                }
            }
        }
    }
</script>

<style scoped>

</style>