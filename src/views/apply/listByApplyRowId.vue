<template>
    <div>
        <v-data-table :items="items" :loading="loading" :headers="headers" no-data-text="未查询到数据">
            <template v-slot:item.action="{item}">
                <v-btn x-small @click="detailHandler(item)">明细</v-btn>
            </template>
        </v-data-table>
        <instance-detail :frame="frameId" @close="closeHandler"></instance-detail>
    </div>
</template>

<script>
    import {listByPlanRowId} from '@/api/apply'

    export default {
        name: "listByApplyRowId",
        components:{
          instanceDetail:()=>import('@/components/easyflow/instance-detail')
        },
        data: () => ({
            planRowId: null,
            items: [],
            headers: [
                {text:"申请单名称",value:'apply.serialNumber'},
                {text:"申请日期",value:'apply.date'},
                {text:"申请人",value:'apply.staff.name'},
                {text:"审核日期",value:'apply.approveDate'},
                {text:"货运地址",value:'apply.city.name'},
                {text:"操作",value:'action'},
            ],
            loading:false,
            frameId:null
        }),
        created() {
            this.planRowId = this.$route.params.planRowId
            this.listByPlanRowId()
        },
        methods: {
            closeHandler(close){
                if(close){
                    this.frameId = null
                }
            },
            detailHandler(item){
                this.frameId = item.apply.id
                this.detailDialog = true
            },
            listByPlanRowId() {
                if (this.planRowId) {
                    this.loading = true
                    listByPlanRowId(this.planRowId).then(result => {
                        this.items = result
                    }).finally(() => {
                        this.loading = false
                    })
                }
            }
        }
    }
</script>

<style scoped>

</style>