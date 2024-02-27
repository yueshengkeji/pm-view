<template>
    <div>
        <div ref="print-containner" id="print-containner">
            <v-container id="printc">
                <v-row class="border" justify="center">
                    <v-col cols="2" class="border-rb text-center">主题</v-col>
                    <v-col cols="4" class="border-rb text-center">{{message.title}}</v-col>
                    <v-col cols="2" class="border-rb text-center">状态</v-col>
                    <v-col cols="4" class="border-b text-center" v-html="formatFlowMsgState(message)"></v-col>

                    <v-col cols="2" class="border-rb text-center ">发起人</v-col>
                    <v-col cols="4" class="border-rb text-center">{{message.staff.name}}</v-col>
                    <v-col cols="2" class="border-rb text-center">发起时间</v-col>
                    <v-col cols="4" class="border-b text-center">{{message.startDate}}</v-col>

                    <v-col cols="12" style="min-height: 200px;padding-top:5px" class="border-b">
                        <v-row dense class="pa-1">
                            <v-col lg="4" md="4" cols="12">
                                <v-text-field autofocus
                                              v-model="bid.projectName"
                                              label="项目名称"></v-text-field>
                            </v-col>
                            <v-col lg="4" md="4" cols="12">
                                <v-text-field v-model="bid.company.name"
                                              label="建设单位"
                                ></v-text-field>
                            </v-col>
                            <v-col lg="4" md="4" cols="4">
                                <v-text-field v-model="bid.biddingDlCo"
                                              label="招标代理单位"></v-text-field>
                            </v-col>

                            <v-col lg="4" md="4" cols="4">
                                <v-text-field v-model="bid.projectSource"
                                              label="项目来源"></v-text-field>
                            </v-col>
                            <!--<v-col lg="4" md="4" cols="4">
                                <v-text-field v-model="bid.feeNote" label="收费情况"></v-text-field>
                            </v-col>-->
                            <v-col lg="4" md="4" cols="4">
                                <v-text-field v-model="bid.busPerson.name"
                                              label="负责人"></v-text-field>
                            </v-col>
                            <!--<v-col lg="2" md="2" cols="4" v-if="false">
                                <v-checkbox v-model="bid.self"
                                            label="是否自营项目"></v-checkbox>
                            </v-col>-->
                            <v-col lg="4" md="4" cols="4">
                                <v-text-field v-model="bid.type" label="类型"></v-text-field>
                            </v-col>
                            <!--<v-col lg="4" md="4" cols="4">
                                <v-text-field v-model="bid.coordinateName" label="配合方名称"></v-text-field>
                            </v-col>
                            <v-col lg="4" md="4" cols="4">
                                <v-text-field v-model="bid.cooperate" label="合作方名称"></v-text-field>
                            </v-col>-->
                            <v-col lg="2" md="2" cols="2">
                                <v-text-field type="number"
                                              v-model="bid.bidMoney"
                                              label="投标金额"></v-text-field>
                            </v-col>
                            <v-col lg="2" md="2" cols="2">
                                <v-text-field type="number"
                                              v-model="bid.cost"
                                              label="成本"></v-text-field>
                            </v-col>
                            <v-col lg="4" md="4" cols="4">

                                <v-text-field v-model="bid.date"
                                              label="投标时间"
                                              readonly></v-text-field>
                            </v-col>
                            <v-col lg="6" md="6" cols="6">
                                <v-text-field v-model="bid.address" label="项目地点"></v-text-field>
                            </v-col>

                            <v-col lg="6" md="6" cols="6">
                                <v-text-field v-model="bid.remark" label="备注"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-col>

                    <template v-for="(fa,i) in approveList">
                        <v-col v-if="fa.approveState == 5 || fa.approveState == 6" cols="2" :key="fa.id"
                               class="border-rb text-center pa-5"><span class="vertical-center">{{ fa.courseName }}</span>
                        </v-col>
                        <v-col v-if="fa.approveState == 5 || fa.approveState == 6" cols="10" :key="fa.id+i"
                               class="border-b">
                            <v-container class="full-height">
                                <v-row class="full-height" style="margin-top: -20px;">
                                    <v-col cols="12" class="border-b text-center" style="min-height:32px;">
                                        <span class="vertical-center">{{ fa.content }}</span>

                                    </v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height">知会人</v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height" v-if="fa.acceptUser">{{ fa.acceptUser.name }}
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
                               class="border-rb text-center pa-5"><span class="vertical-center">{{fa.courseName}}</span>
                        </v-col>
                        <v-col v-if="fa.approveState != 5 && fa.approveState != 6" cols="10" :key="fa.id+i"
                               class="border-b">
                            <v-container class="full-height">
                                <v-row class="full-height" style="margin-top: -20px;">
                                    <v-col cols="12" class="border-b text-center" style="min-height:32px;">
                                        <span class="vertical-center">{{fa.content}}</span>

                                    </v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height">审批人</v-col>
                                  <v-col cols="2" class="border-r pl-5 full-height" v-if="fa.acceptUser">{{fa.acceptUser.name}}</v-col>
                                  <v-col cols="2" class="border-r pl-5 full-height" v-else>-</v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height">审批时间</v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height"
                                           v-html="formatterDate(fa)"></v-col>
                                    <v-col cols="2" class="border-r pl-5 full-height">审批结果</v-col>
                                    <v-col cols="2" class="pl-5 full-height">{{formatApproveState(fa)}}</v-col>
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
    import {getBidById} from '@/api/proBid'

    export default {
        name: "proBid-print",
        data: () => ({
            printObj: {
                id: "printc",
                popTitle: '打印',
                extraCss: '',
                extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
            },
            bid: {
                projectName: "",
                company: {name: null, id: null},
                projectId: null,
                biddingDlCo: null,
                projectSource: "邀标",
                feeNote: '',
                busPerson: {
                    name: '',
                    id: '',
                },
                self: true,
                cooperate: "",
                coordinateName: "",
                bidMoney: null,
                address: null,
                date: '',
                type: "电子标",
                remark: null,
                staff: {
                    name: '',
                    id: '',
                },
            }
        }),
        props: {
            approve: Object,
            printContent: String,
            approveList: Array,
            message: {
                type: Object,
                default: () => ({staff: {name: null}})
            },
        },
        mounted() {
            let than = this
            this.$nextTick(function () {
                // Code that will run only after the
                // entire view has been rendered
                than.load()
            })
        },
        created() {

        },
        methods: {
            load() {
                getBidById(this.message.frameId).then(result => {
                    if (result.projectName == null) {
                        this.$store.state.showTooltip.msg = "未查询到审批数据，无法打印"
                        this.$store.state.showTooltip.show = true
                        this.$store.state.showTooltip.back = () => {
                            this.$store.state.showTooltip.show = false
                            this.$emit("success")
                        }
                    } else {
                        if (result.company == null) {
                            result.company = {name: ''}
                        }
                        if (result.busPerson == null) {
                            result.busPerson = {name: ''}
                        }
                        this.bid = result
                    }
                }).finally(() => {
                    this.$refs.printBtn.click();
                    window.setTimeout(() => {
                        this.$emit("success")
                    }, 1000)
                })
            },
            getContentHtml() {
                return (this.printContent != null && this.printContent !== "") ? this.printContent : this.message.content;
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
</style>
