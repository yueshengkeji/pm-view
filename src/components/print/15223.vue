<template>
    <div>
        <div ref="print-containner" id="print-containner">
            <v-container id="printc">
                <v-row class="border" justify="center">
                    <v-col cols="2" class="border-rb text-center">主题</v-col>
                    <v-col cols="4" class="border-rb text-center">{{ message.title }}</v-col>
                    <v-col cols="2" class="border-rb text-center">状态</v-col>
                    <v-col cols="4" class="border-b text-center" v-html="formatFlowMsgState(message)"></v-col>

                    <v-col cols="2" class="border-rb text-center ">发起人</v-col>
                    <v-col cols="4" class="border-rb text-center">{{ message.staff.name }}</v-col>
                    <v-col cols="2" class="border-rb text-center">发起时间</v-col>
                    <v-col cols="4" class="border-b text-center">{{ message.startDate }}</v-col>

                    <v-col cols="12" style="min-height: 200px" class="border-b">
                        <table style="width:100%">
                            <caption class=" text-center" style="font-size: 22px;font-weight: bold">办公用品领用</caption>
                            <tr>
                                <td class="border text-center" width="15%">领用人</td>
                                <td class="border text-center" width="35%">{{ data.staff.name }}</td>
                                <td class="border text-center" width="15%">领用日期</td>
                                <td class="border text-center" width="35%">{{ data.outDate }}</td>
                            </tr>
                        </table>
                        <table width="100%">
                            <tr>
                                <td class="border text-center" width="15%">备注</td>
                                <td class="border text-center" width="85%">{{ data.remark }}</td>
                            </tr>
                            <tr>
                                <td class="border text-center" width="15%">领取物品</td>
                                <td class="border text-center" width="85">
                                    <v-data-table
                                        hide-default-header
                                        height="300"
                                        :items="data.materOutList"
                                        :headers="headers"
                                        :items-per-page="10000"
                                        hide-default-footer>
                                        <template v-slot:item.sum="{item}">
                                            <v-text-field style="width: 100%" @change="sumHandler(item)" v-model="item.sum" type="number"></v-text-field>
                                        </template>
                                        <template v-slot:item.material.unit.name="{item}">
                                            <v-text-field style="width: 100%" v-model="item.material.unit.name"></v-text-field>
                                        </template>
                                    </v-data-table>
                                </td>
                            </tr>
                        </table>

                    </v-col>

                    <template v-for="(fa,i) in approveList">
                        <v-col v-if="fa.approveState == 5 || fa.approveState == 6" cols="2" :key="fa.id"
                               class="border-rb text-center pa-5"><span class="vertical-center">{{
                            fa.courseName
                            }}</span>
                        </v-col>
                        <v-col v-if="fa.approveState == 5 || fa.approveState == 6" cols="10" :key="fa.id+i"
                               class="border-b">
                            <v-container class="full-height">
                                <v-row class="full-height" style="margin-top: -20px;">
                                    <v-col cols="12" class="border-b text-center" style="min-height:32px;">
                                        <span class="vertical-center">{{ fa.content }}</span>

                                    </v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height">知会人</v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height" v-if="fa.acceptUser">
                                        {{ fa.acceptUser.name }}
                                    </v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height" v-else>-</v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height">知会时间</v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height"
                                           v-html="formatterDate(fa)"></v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height">知会结果</v-col>
                                    <v-col cols="2" class="pl-5 full-height">{{ formatApproveState(fa) }}</v-col>
                                </v-row>
                            </v-container>
                        </v-col>
                        <v-col v-if="fa.approveState != 5 && fa.approveState != 6" cols="2" :key="fa.id"
                               class="border-rb text-center pa-5"><span class="vertical-center">{{
                            fa.courseName
                            }}</span>
                        </v-col>
                        <v-col v-if="fa.approveState != 5 && fa.approveState != 6" cols="10" :key="fa.id+i"
                               class="border-b">
                            <v-container class="full-height">
                                <v-row class="full-height" style="margin-top: -20px;">
                                    <v-col cols="12" class="border-b text-center" style="min-height:32px;">
                                        <span class="vertical-center">{{ fa.content }}</span>

                                    </v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height">审批人</v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height" v-if="fa.acceptUser">
                                        {{ fa.acceptUser.name }}
                                    </v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height" v-else>-</v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height">审批时间</v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height"
                                           v-html="formatterDate(fa)"></v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height">审批结果</v-col>
                                    <v-col cols="2" class="pl-5 full-height">{{ formatApproveState(fa) }}</v-col>
                                </v-row>
                            </v-container>

                        </v-col>
                    </template>

                </v-row>
            </v-container>
            <a ref="printBtn" v-print="printObj">打印</a>
        </div>
    </div>

</template>
<script>
import {loadById} from "@/api/workMaterial";

export default {
    name: 'default-print-15223',
    props: {
        approve: Object,
        printContent: String,
        approveList: Array,
        message: {
            type: Object,
            default: () => ({staff: {name: null}})
        },
    },
    data: () => ({
        printObj: {
            id: "printc",
            popTitle: '打印',
            extraCss: '',
            extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
        },
        data: null,
        headers: [
            {text: "办公用品名称", value: 'material.name', width: '20%'},
            {text: "领用数量", value: 'sum', width: '5%'},
            {text: "单位", value: 'material.unit.name', width: '9%'},
            {text: "库存数量", value: 'storageSum', width: '9%'},
        ],
    }),
    watch: {},
    created() {
        this.reset()
    },
    mounted() {
        let than = this
        this.$nextTick(function () {
            // Code that will run only after the
            // entire view has been rendered
            than.load()
        })

    },
    methods: {
        load() {
            loadById(this.message.frameId).then(res => {
                if (res.id == null) {
                    this.$store.state.showTooltip.msg = "未查询到审批数据，无法打印"
                    this.$store.state.showTooltip.show = true
                    this.$store.state.showTooltip.back = () => {
                        this.$store.state.showTooltip.show = false
                        this.$emit("success")
                    }
                } else {
                    this.data = res
                }
            }).finally(() => {
                this.$refs.printBtn.click();
                window.setTimeout(() => {
                    this.$emit("success")
                }, 1000)
            })
        },
        sumHandler(item) {
            if (item.sum) {
                item.taxMoney = item.sum * item.planPrice
            }
        },
        reset() {
            this.data = {
                outDate: this.formatTimer(new Date()),
                staff: {id: this.$store.state.user.id, name: this.$store.state.user.name},
                series: null,
                materOutList: [],
                remark: null
            }
        },
        formatterDate(fa) {
            if (fa.approveDate != "") {
                //审批时间
                return fa.approveDate.substring(5, 16);
            } else if (fa.readDate != "") {
                //阅读时间
                return fa.readDate.substring(5, 16);
            }
            return "-";
        }
    }
}
</script>
<style scoped>
#print-containner {
    position: fixed;
    opacity: 0;
    left: 1000%;
}

.border {
    border: 1px solid black;
}

.border-l {
    border-left: 1px solid black;
}

.border-top {
    border-top: 1px solid black;
}

.border-rb {
    border-right: 1px solid black;
    border-bottom: 1px solid black;
}

.border-r {
    border-right: 1px solid black;
}

.border-b {
    border-bottom: 1px solid black;
}

div {
    padding: 0px;
}

.full-height {
    height: 100%;
}

#printc {
    padding: 12px;
}

.container {
    padding: 12px;
}

.text-center {
    text-align: center;
}

.vertical-center {
    position: relative;
    top: 25%;
}

.pl-5 {
    padding-left: 5px;
}

.theme--light.v-data-table > .v-data-table__wrapper > table > thead > tr:last-child > th {
    border-bottom: 1px solid black !important;
}

table {
    border-collapse: collapse;
    border-spacing: 0;
}

.border-black {
    border-bottom: 1px solid black !important;
}
</style>