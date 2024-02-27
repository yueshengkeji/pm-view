<template>
    <div>
        <v-card>
            <h3>
                <v-btn color="primary" @click="insertImage()" style="margin: auto">新增图片</v-btn>
            </h3>
            <v-data-table
                    :headers="headers"
                    :items="desserts"
                    class="elevation-1"
                    :items-per-page="5"
            >
                <template v-slot:item.actions="{item}">
                    <v-btn x-small @click="showImage(item)">查看图片</v-btn>
                    <v-btn x-small color="green" @click="updateStatus(item)">启用</v-btn>
                    <v-icon small @click="deleteD(item)">mdi-delete</v-icon>
                </template>
                <template v-slot:item.createTime="{ item }">
                    <span>{{item.createTime | formatTimer}}</span>
                </template>
                <template v-slot:item.status="{ item }">
                    <span>{{item.status | formatStatus}}</span>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="deleteDialog" width="30%">
            <v-card>
                <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="deleteCancel">取消</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteConfirm">确定
                    </v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="insertDialog" width="40%">
            <v-card>
                <v-col sm="4">
                    <file-upload :clear="clear" @change="fileUpload"></file-upload>
                </v-col>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" small @click="insertDialog = false,clear = false">确定</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showImageDialog" width="30%">
            <v-img :src="showUrl" ></v-img>
        </v-dialog>
        <!--加载框-->
        <v-dialog v-model="loadDialog"
                  hide-overlay
                  persistent
                  width="300">
            <v-card
                    color="primary"
                    dark>
                <v-card-text>
                    正在处理。。。
                    <v-progress-linear
                            indeterminate
                            color="white"
                            class="mb-0"
                    ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    import fileUpload from "../../../components/fileUpload";
    import {getImageMsg, setStatus, deleteItem, mediaUpload} from "../../../api/dingTalk";
    import {getConfig} from '@/api/systemConfig'


    export default {
        name:"dingLinkImage",
        components:{fileUpload},
        data: () => ({
            loadDialog:false,

            insertDialog:false,
            clear:false,

            deleteDialog:false,
            tempItem:null,

            headers: [
                { text: '图片名称', value: 'name', sortable: false },
                { text: '上传时间', value: 'createTime' , sortable: false},
                { text: '使用状态', value: 'status', sortable: false },
                { text: '操作', value: 'actions', sortable: false },
            ],
            desserts: [],

            showImageDialog:false,
            serverHost:'',
            showUrl:'',

        }),

        watch:{
        },

        created() {
            this.loadImageMSG()
            getConfig("FTP_SERVER_PATH").then(result=>{
                if(result.id != null){
                    this.serverHost = result.value
                }else{
                    alert('服务器未配置文件上传路径')
                }
            })
        },

        filters: {
            formatTimer: function (value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                // let h = date.getHours();
                // h = h < 10 ? "0" + h : h;
                // let m = date.getMinutes();
                // m = m < 10 ? "0" + m : m;
                // let s = date.getSeconds();
                // s = s < 10 ? "0" + s : s;
                return y + "-" + MM + "-" + d;
            },
            formatStatus: function (value) {
                if (value == 0){
                    return '未使用'
                }else if (value == 1){
                    return '已使用'
                }
            }
        },

        methods:{
            loadImageMSG(){
                getImageMsg().then(res => {
                    this.desserts = res
                })
            },
            deleteD(item){
                this.deleteDialog = true
                this.tempItem = item
            },
            deleteItem(item){
                deleteItem({id:item.id}).then(res => {
                    if (res == 1){
                        this.loadImageMSG()
                        this.tempItem = null
                    }
                })
            },
            deleteCancel(){
                this.deleteDialog = false
                this.$nextTick(() => {
                    this.tempItem = null
                })
            },
            deleteConfirm(){
                this.deleteItem(this.tempItem)
                this.deleteDialog = false
            },
            updateStatus(item){
                this.loadDialog = true
                setStatus({id:item.id}).then(res => {
                    if (res != 0){
                        this.loadImageMSG()
                        this.loadDialog = false
                    }
                })
            },
            insertImage(){
                console.log(this.clear)
                this.clear = true
                this.insertDialog = true
            },
            fileUpload(res){
                for (let x = 0; x < res.files.length; x++) {
                    mediaUpload(res.files[x]).then(res => {
                        if (res != null){
                            this.loadImageMSG()
                        }
                    })
                }
            },
            showImage(item){
                this.showUrl = `${this.serverHost}` + item.picUrl
                this.showImageDialog = true
            }

        },

    }
</script>
