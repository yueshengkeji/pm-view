<template>
    <div>
        <v-data-table :items="items"
                      :headers="headers"
                      hide-default-footer
                      :items-per-page="-1">
            <template v-slot:item.type="{item}">
                {{formatType(item)}}
            </template>
            <template v-slot:item.action="{item}">
                <v-btn v-if="item.type == 1" color="success" x-small @click="$emit('onclick',item)">确定收款</v-btn>
            </template>
        </v-data-table>
    </div>
</template>

<script>
    import {list} from '@/api/yonyouData'

    export default {
        name: "T3Data",
        data: () => ({
            headers: [
                {text:'单据日期',value:'date'},
                {text:'开票金额',value:'payMoney'},
                {text:'收款金额',value:'billMoney'},
                {text:'备注',value:'remark'},
                {text:'类型',value:'type'},
                {text:'编号',value:'payDate'},
                {text:'操作',value:'action'},
            ],
            items: []
        }),
        props: {
            //数据年份
            dataYear: {
                type: String,
                default: ''
            },
            //会计科目号
            series: {
                type: Array,
            },
        },
        watch: {
            series: {
                handler() {
                    this.list()
                }
            },
        },
        created() {
            this.list()
        },
        methods: {
            list() {
                this.items = []
                this.series.forEach(s => {
                    list({year: this.dataYear, leaveNumber: s}).then(result => {
                        this.items = this.items.concat(JSON.parse(result))
                        console.log(this.items)
                    })
                })
            },
            formatType(item){
                return item.type === 0 ? '开票' : '收款'
            }
        }
    }
</script>

<style scoped>

</style>