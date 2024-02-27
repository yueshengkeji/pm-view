<template>
    <v-container>
        <v-row>
                <v-col cols="12" md="6">
                    <v-select label="模板类型"
                              v-model="modelItem"
                              :items="modelTypes"
                              return-object
                              item-text="name"
                    ></v-select>
                </v-col>
            <v-col cols="12" md="4">
                <v-select label="数据类型选择"
                          v-model="contractParamItem"
                          :items="contractParams"
                          return-object
                          item-text="name"
                ></v-select>
            </v-col>
            <v-col cols="12" md="2">
                <v-btn color="primary" @click="insertParam(contractParamItem)">插入</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="12">
                <vue-ueditor-wrap forceInit @ready="readyEdit" v-model="moduleHtml"
                                  :config="editorOption"></vue-ueditor-wrap>
            </v-col>

        </v-row>

    </v-container>
</template>
<script>
    import VueUeditorWrap from "vue-ueditor-wrap";
    import {listContractWordModel,updateContractWordModel,listContractWordModelParams} from "../../../api/contractWordModel";

    export default {
        name: 'contractWordModel',
        components: {VueUeditorWrap},
        data: () => ({
            modelTypes: [],
            modelItem: null,

            editDocument: null,
            moduleHtml: '',
            editorOption: {
                UEDITOR_HOME_URL: process.env.BASE_URL + "UEditor/",
                serverUrl: "",
                initialFrameHeight: '420'
            },

            contractParamItem:null,
            contractParams: []
        }),

        created() {
            this.listWordModel()
            this.listContractWordModelParams()
        },

        watch: {
            modelItem: {
                handler() {
                    if (this.modelItem != null) {
                        this.loadWordModel(this.modelItem)
                    }
                },
                deep: true
            }
        },

        mounted() {
            this.$nextTick(() => {
                this.modelItem = this.modelTypes[0]
            })
        },

        methods: {
            listContractWordModelParams(){
                listContractWordModelParams().then(res => {
                    this.contractParams = res
                })
            },
            listWordModel() {
                listContractWordModel().then(res => {
                    this.modelTypes = res
                })
            },
            readyEdit(document) {
                console.log(document)
                this.editDocument = document
                window.setTimeout(() => {
                    this.editDocument.execCommand('cleardoc');
                    this.modelItem = this.modelTypes[0]
                }, 500)

            },
            loadWordModel(modelItem) {
                this.editDocument.execCommand('cleardoc');
                if (modelItem.richText != null && modelItem.richText != '') {
                    this.editDocument.execCommand('insertHtml', modelItem.richText)
                }
            },

            insertParam(data) {
                this.editDocument.execCommand('insertHtml', data.markName)

            },

            submit: function () {
                console.log(this.editDocument)
                let list = this.editDocument.document.getElementById("list")
                if (list != null) {
                    list.remove();
                }
                let html = this.editDocument.document.getElementsByTagName('html')[0]
                html.getElementsByTagName('head')[0].firstChild.remove();
                html.getElementsByTagName('head')[0].firstChild.remove();
                let meta = document.createElement("meta");
                meta.setAttribute("http-equiv", "Content-Type");
                meta.setAttribute("content", "text/html;charset=utf-8");
                html.getElementsByTagName("head")[0].appendChild(meta);

                this.modelItem.richText = html.innerHTML.replace(/\u200B/g, "");
                this.modelItem.paramsArr = ""
                this.contractParams.forEach(item => {
                    if (this.modelItem.richText.indexOf(item.markName) > 0){
                        this.modelItem.paramsArr = this.modelItem.paramsArr + item.id + ","
                    }
                })
                return updateContractWordModel(this.modelItem).then(res => {
                    return res
                })
            },


        }
    }
</script>
