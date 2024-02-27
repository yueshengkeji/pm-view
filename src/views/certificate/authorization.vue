<template>
    <div>
        <v-row>
            <v-col>
                <v-data-table :items="items" :headers="headers" :search="search">
                    <template v-slot:top>
                        <v-row>
                            <v-col lg="2" offset-lg="10">
                                <v-text-field label="搜索" v-model="search"></v-text-field>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-slot:item.gainTime="{item}">
                        <span>{{item.gainTime | formatTimer}}</span>
                    </template>
                    <template v-slot:item.expirationTime="{item}">
                        <span>{{item.expirationTime | formatTimer}}</span>
                    </template>
                    <template v-slot:item.uploadTime="{item}">
                        <span>{{item.uploadTime | formatTimer}}</span>
                    </template>
                    <template v-slot:item.updateTime="{item}">
                        <span>{{item.updateTime | formatTimer}}</span>
                    </template>
                    <template v-slot:item.action="{item}">
                        <v-btn :loading="loading" small @click="downloadCer(item)">下载</v-btn>
                        <v-btn class="ml-1 primary" small @click="printCer(item)">打印</v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-dialog v-model="downloadFlag" width="50%">
            <v-card class="pa-5">
               <v-form ref="downForm">
                    <v-textarea :rules="downRef" label="下载用途" v-model="item.recordText"></v-textarea>
               </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="download" color="primary">确定</v-btn>
                    <v-btn @click="downloadFlag = false;loading = false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="printFlag" width="50%">
            <div id="printC" ref="printC" style="width: 100%;height: auto">
                <iframe id="printPdf" style="border: 0;width:100%;min-height:520px;"
                      v-if="item.fileType == 'pdf'" :src="item.fileUrl">
                </iframe>
                <img v-if="item.fileType != 'pdf'" id="imgC" @load="getBase64Image()" width="100%" height="100%" :src="item.fileUrl"/>
            </div>
            <v-btn v-print="printObj" v-if="item.fileType != 'pdf'">打印</v-btn>
            <v-btn @click="printfC()" v-if="item.fileType == 'pdf'">打印</v-btn>
        </v-dialog>
    </div>
</template>

<script>
    import {selectCoa} from "@/api/certificate";
    import {insertRecord} from "@/api/downloadRecord"

    export default {
        name: "authorization",
        data: () => ({
            search: null,
            items: [],
            loading: false,
            item: [
                {fileType: null}
            ],
            item2: [],
            downloadItem: [],
            downloadFlag: false,
            headers: [
                {text: '证书序号', value: 'serialNumber'},
                {text: '证书名称', value: 'name'},
                {text: '领证时间', value: 'gainTime', dateType: 'Date'},
                {text: '到期时间', value: 'expirationTime', dateType: 'Date'},
                {text: '上传人员', value: 'uploadUserName'},
                {text: '上传时间', value: 'uploadTime'},
                {text: '更新人员', value: 'updateUserName'},
                {text: '更新时间', value: 'updateTime'},
                {text: '操作', value: 'action'}
            ],
            downRef: [
                v => !!v || "请填写下载用途",
            ],
            printFlag: false,
            printObj: {
                id: 'printC',
                popTitle: '打印',
                extraHead: '',
            },
        }),
        created() {
            this.reset();
            this.list();
        },
        filters: {
            formatTimer(value) {
                if(value == null){
                    return null;
                }
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                return y + "-" + MM + "-" + d;
            },
        },
        methods: {
            list(){
                selectCoa().then(data => {
                    this.items = data;
                })
            },
            reset() {
                this.item = {
                    serialNumber: null,
                    name: null,
                    fileUrl: null,
                    gainTime: null,
                    expirationTime: null,
                    uploadUserName: null,
                    uploadTime: null,
                    updateUserName: null,
                    updateTime: null,
                    state: null,
                    recordText: null
                };
            },
            downloadCer(value){
                this.reset();
                this.item = value;
                this.downloadFlag = true;
            },
            download() {
                this.loading = true;
                let valid = this.$refs['downForm'].validate();
                if (valid){
                    insertRecord(this.item).then(() => {
                        let a = document.createElement('a');
                        this.getUTF(this.item.name)
                        a.href = `/api/files/downloadFile?filePath=` + this.item.fileUrl + `&downloadFile=` +
                            this.item.name + this.item.fileUrl.substring(this.item.fileUrl.lastIndexOf("."));
                        a.target = "_blank";
                        a.click();
                    }).finally(() => {
                        this.item.recordText = null;
                        this.loading = false;
                        this.downloadFlag = false;
                    })
                }
            },
            printCer(value) {
                this.item2 = value;
                this.printFlag = true;

                    this.item.fileType = this.item2.fileUrl.substr(-3);
                    if (this.item.fileType == 'pdf'){
                        this.item.fileUrl = `/api/files/printPdf?filePath=` + this.item2.fileUrl;
                    }else {
                        this.item.fileUrl = `/api/files/downloadFile?filePath=` + this.item2.fileUrl + `&downloadFile=` +
                            this.item2.name + this.item2.fileUrl.substring(this.item2.fileUrl.lastIndexOf("."));
                    }

            },
            getBase64Image() {
                // var img = document.getElementById("imgC");
                // var canvas = document.createElement("canvas");
                // canvas.width = img.width;
                // canvas.height = img.height;
                // var ctx = canvas.getContext("2d");
                // ctx.drawImage(img, 0, 0, img.width, img.height);
                // var ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();
                // var dataURL = canvas.toDataURL("image/"+ext);
                // this.item.fileUrl = dataURL;
            },

            printfC() {
                document.getElementById("printPdf").contentWindow.print();
            },

            getUTF(value) {
                return(encodeURIComponent(value));
            }
        }
    }
</script>

<style scoped>

</style>