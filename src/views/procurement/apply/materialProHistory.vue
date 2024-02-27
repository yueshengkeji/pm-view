<template>
    <div>
        <v-data-table :items="items"
                      hide-default-footer
                      :headers="headers">

        </v-data-table>
    </div>
</template>

<script>
    import {listByApplyMaterial} from '@/api/procurement'

    export default {
        name: "materialProHistory",
        data:()=>({
            headers:[
                {text:'订单编号',value:'p.pmNumber'},
                {text:'采购日期',value:'p.pmDate'},
                {text:'采购职员',value:'p.staff.name'},
                {text:'材料名称',value:'material.name'},
                {text:'型号',value:'material.model'},
                {text:'品牌',value:'material.brand'},
                {text:'单位',value:'material.unit.name'},
                {text:'采购单价',value:'priceTax'},
            ],
            items:[]
        }),
        created() {
            let applyMaterialId = this.$route.params.id
            listByApplyMaterial(applyMaterialId).then(result=>{
                this.items = result
            })
        },
    }
</script>

<style scoped>

</style>