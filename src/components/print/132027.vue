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
                            <v-col
                                    cols="3"
                            >
                                项目地址：{{salesContract.projectBase}}
                            </v-col>
                            <v-col
                                    cols="9"
                                    sm="6"
                                    md="3"

                            >
                                合同名称：{{salesContract.agreementName}}
                            </v-col>
                            <v-col
                                    cols="6"
                                    sm="6"
                                    md="3"
                            >
                                <strong>合同金额(￥)：{{salesContract.agreementMoney}}</strong>
                            </v-col>
                            <v-col
                                    cols="6"
                                    sm="6"
                                    md="3"
                            >
                                <strong>质保金额(￥)：{{salesContract.retentionMoney}}</strong>
                            </v-col>

                            <v-col
                                    cols="6"
                                    sm="6"
                                    md="3"
                            >
                                税率(%)：{{salesContract.tax}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                签订日期：{{formatTimer(salesContract.signDate)}}
                            </v-col>

                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                单位名称：{{salesContract.companyName}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                单位地址：{{salesContract.companyAddress}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                开户银行：{{salesContract.bankName}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                银行账户：{{salesContract.bankAccount}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"

                            >
                                联系人：{{salesContract.contactMan}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"

                            >
                                联系方式：{{salesContract.phone}}
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
    import salesContractApi from '@/api/salesContract'

    export default {
        name: "default-print",
        data: () => ({
            printObj: {
                id: "printc",
                popTitle: '打印',
                extraCss: '',
                extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
            },
            salesContract: {
                id:null,
                projectBase:null,
                agreementName:null,
                agreementID:null,
                agreementMoney:null,
                retentionMoney:null,
                retentionPercent:null,
                tax:null,
                signDate:null,
                pDate:null,
                paymentDays:null,
                companyName:null,
                companyAddress:null,
                bankName:null,
                bankAccount:null,
                remark:null,
                invoicedMoney:null,
                collectedMoney:null,
                toCollectMoney:null,
                actualDate:null,
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
                salesContractApi.getAgreementMSG({agreementID: this.message.frameId}).then(result => {
                    if (result.salesContract.agreementID == null) {
                        this.$store.state.showTooltip.msg = "未查询到审批数据，无法打印"
                        this.$store.state.showTooltip.show = true
                        this.$store.state.showTooltip.back = () => {
                            this.$store.state.showTooltip.show = false
                            this.$emit("success")
                        }
                    } else {
                        this.salesContract = result.salesContract
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
