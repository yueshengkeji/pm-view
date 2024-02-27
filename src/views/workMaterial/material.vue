<template>
    <div>
        <v-row>
            <v-spacer></v-spacer>
            <v-col sm="2">
                <v-text-field label="库存最小值"
                              type="number"
                              v-model="options.minNumber"></v-text-field>
            </v-col>
            <v-col sm="2">
                <v-text-field label="库存最大值"
                              type="number"
                              v-model="options.maxNumber"></v-text-field>
            </v-col>
            <v-col sm="2">
                <v-text-field label="搜索" v-model="options.searchText"></v-text-field>
            </v-col>
        </v-row>

        <v-data-table :headers="headers"
                      sort-desc
                      sort-by="po20101"
                      :options.sync="options"
                      :server-items-length="query.total"
                      :items="items">

            <template v-slot:item.storageSum="{item}">
                <div>{{item.putSum - item.outSum}}</div>
            </template>
        </v-data-table>

    </div>
</template>

<script>
    import {loadMater} from '@/api/workMaterial'

    export default {
        name: "workMater-index",
        components:{

        },
        data: () => ({
            items: [],
            headers: [
                {
                    text: "材料名称",
                    value: 'name'
                },
                {
                    text: "型号",
                    value: 'model'
                },
                {
                    text: "库存数量",
                    value: 'storageSum'
                },
                {
                    text: "领用总数",
                    value: 'outSum'
                },
                {
                    text: "入库总数",
                    value: 'putSum'
                },
                {
                    text: "单位",
                    value: 'unit.name'
                },
            ],
            query: {total: 0},
            options: {searchText:null,type:null,maxNumber:null,minNumber:null},
            detailDialog:false,
            item:null,
            http:null
        }),
        watch:{
            options:{
                handler(){
                    this.list()
                },
                deep:true
            }
        },
        methods: {
            list() {
                this.loading = true
                this.query = Object.assign({}, this.options)
                this.query.sortBy = this.query.sortBy[0]
                this.query.sortDesc = this.query.sortDesc[0] ? 'desc' : 'asc'
                loadMater(this.query).then(result => {
                    this.items = result.rows
                    this.query.total = result.total
                }).finally(()=>{this.http = null,this.loading = false})
            },
        }
    }
</script>

<style scoped>

</style>