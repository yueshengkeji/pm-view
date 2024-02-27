<template>
    <div>
        <v-col cols="12">
            <v-progress-linear
                    :value="proReport.progressNow"
                    color="green"
                    height="25"
                    style="margin-top: 20px"
            >
                <strong>当前进度百分比{{ Math.ceil(proReport.progressNow) }}%</strong>
            </v-progress-linear>
        </v-col>
        <v-col cols="12">
            <v-row dense>
                <v-col v-for="(file,i) in files"
                       :key="i"
                       class="d-flex child-flex align-center"
                       :lg="(file.suffix == 'pdf' || file.suffix == 'html') ? 12 : 4"
                       :md="(file.suffix == 'pdf' || file.suffix == 'html') ? 12 : 4"
                       cols="12">
                    <iframe style="border: 0px;width:100%;min-height:520px;" :key="i"
                            v-if="file.suffix == 'pdf'" :src="file.showPath"></iframe>
                    <v-card class="pl-5" @contextmenu="show($event,file)" :ripple="false"
                            v-else-if="file.suffix == 'html'"
                            :key="i"></v-card>
                    <v-img v-else-if="isImg(file)"
                           @mouseup="previewV2($event,file)"
                           @mouseout="cancelPreview($event,file)"
                           @mousedown="mouseDownHeader($event)"
                           @mousemove.stop="drag($event)"
                           @dblclick="largeImg($event)"
                           :alt="file.fileName"
                           :aspect-ratio="16/9"
                           :src="file.showPath"
                           class="grey lighten-2 pointer prev-img">
                        <template v-slot:placeholder>
                            <v-row class="fill-height ma-0"
                                   align="center"
                                   justify="center">
                                <v-progress-circular indeterminate
                                                     color="grey lighten-5"></v-progress-circular>
                            </v-row>
                        </template>
                    </v-img>
                </v-col>
            </v-row>

        </v-col>
    </div>
</template>
<script>
    import proTaskProgressReport from "../../../api/proTaskProgressReport";
    import {getConfig} from '@/api/systemConfig'


    export default {
        name:'detail',
        props:{
            id:String
        },
        data:() => ({
            searchId:null,

            proReport: null,

            filesUrls:[],
            fileItem:{
                showPath:null,
                suffix:null,
            },
            files:[],
            showMenu:false,
            x: 0,
            y: 0,
            imgOpt: {x: 0, y: 0, l: 0, t: 0, isDown: false, click: true},
        }),

        watch:{
            id: {
                handler() {
                    this.reset()
                    if (this.id != null) {
                        this.searchId = this.id
                        this.getById()
                    }
                },
                deep: true,
            },
        },

        created() {
            getConfig("FTP_SERVER_PATH").then(result=>{
                if(result.id != null){
                    this.serverHost = result.value
                }else{
                    this.error = '服务器未配置文件上传路径'
                    this.disabled = true
                }
            })
            this.reset()
            if (this.id != null){
                this.searchId = this.id
                this.getById()
            }
        },

        methods:{
            getById(){
                proTaskProgressReport.getById({id:this.searchId}).then(res => {
                    this.proReport = res
                    if (this.proReport.picUrl != null){
                        this.filesUrls = this.proReport.picUrl.split(",")
                        this.filesInit(this.filesUrls)
                    }
                })
            },

            filesInit(filesUrls){
                  for (let i = 0;i < filesUrls.length;i++){
                      console.log(filesUrls[i])
                      let index = filesUrls[i].lastIndexOf(".");
                      index = index == -1 ? filesUrls[i].length : index + 1;
                      let suffix = filesUrls[i].substring(index, filesUrls[i].length);
                      this.fileItem.suffix = suffix.toLowerCase();
                      this.fileItem.showPath = `${this.serverHost}` + filesUrls[i]
                      this.files.push(this.fileItem)
                      this.fileItem = {
                          suffix: null,
                          showPath: null
                      }
                  }
                  console.log(this.files)
            },

            show(e, file) {
                this.file = file
                e.preventDefault()
                this.showMenu = false
                this.x = e.clientX
                this.y = e.clientY
                this.$nextTick(() => {
                    this.showMenu = true
                })
            },
            isImg(file) {
                let regular = new RegExp(/(bmp|jpg|png|tif|gif|pcx|tga|exif|fpx|svg|psd|cdr|pcd|dxf|ufo|eps|ai|raw|WMF|webp|jpeg)$/)
                let isImg = regular.test(file.suffix);
                return isImg;
            },
            previewV2(e, img) {
                window.setTimeout(() => {
                    if (!this.imgOpt.dblClick) {
                        if (this.$vuetify.breakpoint.xs) {
                            this.preview(img)
                            return
                        } else {
                            let div = e.target
                            if (div.getAttribute("class").indexOf("v-responsive__content") != -1) {
                                div = div.parentElement
                            }

                            div = div.children[1]
                            this.imgOpt.isDown = false
                            //:class="'prev-img-'+file.rotate"
                            if (this.imgOpt.click) {
                                let cla = div.getAttribute("class")
                                if (img.rotate == null) {
                                    this.$set(img, "rotate", 0)
                                }
                                cla = cla.replaceAll(("prev-img-" + img.rotate), "")
                                img.rotate = img.rotate + 90
                                if (img.rotate >= 360) {
                                    img.rotate = 0
                                    div.setAttribute("class", cla)
                                } else {
                                    div.setAttribute("class", cla + " prev-img-" + img.rotate)
                                }
                            }
                            window.setTimeout(() => {
                                this.imgOpt.click = true
                            }, 100)
                        }
                    }

                }, 250)
            },
            cancelPreview(e, img) {
                if (this.$vuetify.breakpoint.xs) {
                    return
                }
                let div = e.target
                if (div.getAttribute("class").indexOf("v-responsive__content") != -1) {
                    div = div.parentElement
                }
                let cla = div.getAttribute("class")
                cla = cla.replaceAll("prev-img-large", "")
                div.setAttribute('class', cla)

                cla = div.children[1].getAttribute("class")
                cla = cla.replaceAll("prev-img-" + img.rotate, "")
                div.children[1].setAttribute("class", cla)

                img.rotate = 0
                this.imgOpt.isDown = false
                div.style.left = '0px'
                div.style.top = '0px'
            },
            mouseDownHeader(e) {
                window.setTimeout(() => {

                    if (!this.imgOpt.dblClick) {
                        if (this.$vuetify.breakpoint.xs) {

                            return;
                        }
                        //获取x坐标和y坐标
                        let div = e.target
                        if (div.getAttribute("class").indexOf("v-responsive__content") != -1) {
                            div = div.parentElement
                        }
                        this.imgOpt.x = e.offsetX
                        this.imgOpt.y = e.offsetY
                        this.imgOpt.isDown = true
                    }
                }, 250)
            },
            drag: function (e) {
                if (this.$vuetify.breakpoint.xs) {
                    return;
                }
                if (!this.imgOpt.isDown) {
                    return true;
                }
                this.imgOpt.click = false
                let div = e.target
                if (div.getAttribute("class").indexOf("v-responsive__content") != -1) {
                    div = div.parentElement
                }
                let offset = {
                    x: parseFloat(div.style.left),
                    y: parseFloat(div.style.top),
                }
                if (isNaN(offset.x)) {
                    offset.x = 0
                }
                if (isNaN(offset.y)) {
                    offset.y = 0
                }
                //获取x和y
                let nx = e.offsetX - this.imgOpt.x + offset.x
                let ny = e.offsetY - this.imgOpt.y + offset.y
                div.style.left = nx + 'px'
                div.style.top = ny + 'px'
            },
            largeImg(e) {
                if (this.imgOpt.click) {
                    this.imgOpt.dblClick = true
                    let div = e.target
                    if (div.getAttribute("class").indexOf("v-responsive__content") != -1) {
                        div = div.parentElement
                    }
                    let cla = div.getAttribute("class")
                    if (cla.indexOf('prev-img-large') != -1) {
                        cla = cla.replaceAll(("prev-img-large"), "")
                    } else {
                        cla += " prev-img-large"
                    }
                    div.setAttribute("class", cla)

                    window.setTimeout(() => {
                        this.imgOpt.dblClick = false
                        this.imgOpt.isDown = false
                    }, 300)
                }else{
                    this.imgOpt.dblClick = false
                }
            },

            reset(){
                this.proReport = {
                    projectName: null,
                    projectId: null,
                    content: null,
                    constructionNode: null,
                    constructorsNumber: null,
                    planForTomorrow: null,
                    picUrl: null,
                    progressNow: null,
                }
                this.files = []
                this.filesUrls = []
                this.fileItem = {
                    showPath:null,
                    suffix:null,
                }
            },
        },

    }
</script>
