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

                    <v-col cols="12" style="min-height: 200px" class="border-b">
                        <div v-html="remark" id="15203-print-style"></div>
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
                                           v-html="formatterApproveDate(fa)"></v-col>
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
                                           v-html="formatterApproveDate(fa)"></v-col>
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
        <v-snackbar top v-model="msg.show">{{msg.content}}</v-snackbar>
    </div>

</template>

<script>
    import {getContent} from '@/api/article'

    export default {
        name: "default-print-10563",
        data: () => ({
            remark: null,
            printObj: {
                id: "printc",
                popTitle: '打印',
            },
            msg: {
                show: false,
                content: ''
            }
        }),
        props: {
            approve: Object,
            printContent: String,
            approveList: {
                type: Array,
                default: () => ([{}])
            },
            message: {
                type: Object,
                default: () => ({staff: {name: null}})
            }
        },
        mounted() {
            this.$nextTick(function () {
                getContent(this.message.frameId).then(content => {
                  let newHtml = document.createElement("html");
                  newHtml.innerHTML = content;
                  try {
                    let styles = newHtml.getElementsByTagName("style");
                    console.log(styles.length)
                    for (let i = 0; i < styles.length; i++) {
                      let style = styles[i]
                      style.innerHTML = "";
                    }
                    let links = newHtml.getElementsByTagName("link");
                    for (let i = 0; i < links.length; i++) {
                      links[i].setAttribute("href", "");
                    }
                    // links.forEach(style => {
                    //   style.setAttribute("href", "");
                    // })
                    let divs = newHtml.getElementsByTagName("div");
                    for (let i = 0; i < divs.length; i++) {
                      divs[i].setAttribute("style", "");
                    }
                    // divs.forEach(div => {
                    //   div.setAttribute("style", "");
                    // });
                    let tds = newHtml.getElementsByTagName("td");
                    for (let i = 0; i < tds.length; i++) {
                      tds[i].style = "border-bottom:1px solid black;border-right:1px solid black;padding-left:5px";
                    }
                    // tds.forEach(td => {
                    //   td.style = "border-bottom:1px solid black;border-right:1px solid black;padding-left:5px";
                    // });
                    let t = newHtml.getElementsByTagName("table")[0];
                    if (t) {
                      t.style = ''
                      t.setAttribute("cellspacing", "0");
                      t.setAttribute("cellpadding", "0");
                      t.style = "border-top:1px solid black;border-left:1px solid black;width:100%;";
                    }
                  } catch (e) {
                    console.log(e)
                  }
                    this.remark = newHtml.innerHTML;
                    this.$refs.printBtn.click();
                }).catch((e) => {
                    if (e.toString().indexOf("404") != -1) {
                        this.msg.content = "请求超时" + e;
                        this.msg.show = true;
                    }
                })
            })
        },
        methods: {

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

    table {
      width: 100% !important;
    }

    #15203-print-style table {
      width: 100%;
    }
</style>
