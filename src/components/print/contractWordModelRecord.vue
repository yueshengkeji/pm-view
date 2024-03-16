<template>
    <div>
        <div ref="print-containner" id="print-containner">
            <v-container id="printc" v-html="richText">

            </v-container>
            <a ref="printBtn" v-print="printObj">打印</a>
        </div>
    </div>

</template>

<script>
    import {selectContractWordRecordByContractId} from "../../api/contractWordModel";

    export default {
        name: "default-print",
        data: () => ({
            printObj: {
                id: "printc",
                popTitle: '打印',
                extraCss: '',
                extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
            },
            richText:''

        }),
        props: {
            contractId: String,
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
                selectContractWordRecordByContractId({contractId:this.contractId}).then(result => {
                    if (result != null){
                        this.richText = result.richText
                    } else {
                        this.$store.state.showTooltip.msg = "未保存合同模板记录，无法打印"
                        this.$store.state.showTooltip.show = true
                        this.$store.state.showTooltip.back = () => {
                            this.$store.state.showTooltip.show = false
                            this.$emit("success")
                        }
                    }

                }).finally(() => {
                    this.$refs.printBtn.click();
                    window.setTimeout(() => {
                        this.$emit("success")
                    }, 1000)
                })
            },
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
