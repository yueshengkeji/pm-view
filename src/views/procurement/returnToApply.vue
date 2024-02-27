<template>
    <div class="pa-3">
        <procurement v-if="frameId != null" @loadSuccess="loadSuccess" @selectItems="selectItems" :select="true" :frameId="frameId"></procurement>
        <v-row dense>
            <v-col cols="12" class="text-right">
                <v-btn @click="closeWindow">关闭</v-btn>
                <v-btn class="ml-1" color="primary" :disabled="offReturn" @click="returnHandler" title="回滚选中材料到申请单状态">提交</v-btn>
            </v-col>
        </v-row>
        <v-snackbar color="error" centered v-model="show">{{msg}}</v-snackbar>
    </div>
</template>

<script>
    import procurement from '@/components/15306.vue'
    import {returnToApply} from '@/api/procurement'

    export default {
        components: {
            procurement
        },
        name: "returnToApply",
        data: () => ({
            frameId: null,
            show: false,
            msg: null,
            returnMaterial: [],
            offReturn:false
        }),
        watch: {
            $route(to, from) {
                // 对路由变化作出响应...
                console.log(to, from)
                this.frameId = this.$route.params.id
                this.isNull()
            }
        },
        created() {
            this.frameId = this.$route.params.id
            this.isNull()
        },
        methods: {
            closeWindow(){
                window.location.href = "about:blank";
                window.close();
            },
            loadSuccess(data){
                if(data.state != 1){
                    this.msg = "该订单未审核，不支持回滚，可直接修改"
                    this.show = true
                    this.offReturn = true
                }
            },
            returnHandler() {
                if (this.returnMaterial.length <= 0) {
                    this.msg = "请选择回滚材料"
                    this.show = true
                } else {
                    this.msg = ""
                    this.returnMaterial.forEach(item => {
                        if (item.inSum != 0) {
                            this.msg += "《" + item.material.name + "》已入库,无法回滚\r\n"
                        }
                    })
                    if (this.msg !== "") {
                        this.show = true
                    } else {
                        console.log("提交回滚");
                        returnToApply(this.returnMaterial).then(result=>{
                            if(result == ""){
                                result = "操作成功"
                                window.setTimeout(()=>{
                                    location.reload()
                                },1000)
                            }
                            this.msg = result
                            this.show = true
                        })
                    }
                }
            },
            selectItems(items) {
                this.returnMaterial = items
            },
            isNull() {
                if (this.frameId == null || this.frameId == ":id") {
                    this.show = true;
                    this.msg = "采购订单不存在"
                }
            }
        }
    }
</script>

<style scoped>

</style>