<template>
    <div>
        <v-col cols="12">
            <h3 class="text-center" v-if="fileTitle != '附件预览'">{{ fileTitle }}</h3>
            <v-row dense>
                <v-col v-for="(file,i) in files"
                       :key="i"
                       class="d-flex child-flex align-center"

                       cols="12">
                    <iframe style="border: 0px;width:100%;min-height:920px;" :key="i"
                            v-if="file.suffix == 'pdf' && !file.pdfImg" :src="file.showPath"></iframe>
                    <template v-else-if="file.suffix == 'pdf' && file.pdfImg">
                        <div>
                            <v-img v-for="p in file.pdfImgPath"
                                   :key="p"
                                   contain
                                   :alt="file.fileName"
                                   :aspect-ratio="16/9"
                                   width="100%"
                                   :height="450"
                                   :src="p"
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
                        </div>
                    </template>
                    <v-card class="pl-5 overflow-y-auto" @contextmenu="show($event,file)" :ripple="false"
                            v-else-if="file.suffix == 'html'" v-html="file.content"
                            :key="i"></v-card>
                    <v-img v-else-if="isImg(file)"
                           @mouseup="previewV2($event,file)"
                           @mouseout="cancelPreview($event,file)"
                           @mousedown="mouseDownHeader($event)"
                           @mousemove.stop="drag($event)"
                           @dblclick="largeImg($event)"
                           @contextmenu="show($event,file)"
                           :lazy-src="'/assets/ftptemp/'+file.id+'.JPEG'"
                           contain
                           :alt="file.fileName"
                           :aspect-ratio="16/9"
                           :height="450"
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
                    <v-card v-else-if="file.suffix == 'txt'" >
                        <iframe style="border: 0px;width:100%;min-height:920px;background-color: white" :key="i" @contextmenu="show($event,file)" :ripple="false"
                                :src="file.showPath"></iframe>
<!--                        <div class="d-block" @contextmenu="show($event,file)">-->
<!--                            <p>-->
<!--                                <a target="_blank" :key="file.showPath" :href="file.showPath"-->
<!--                                   :download="file.fileName">{{ file.fileName }}</a>-->
<!--                            </p>-->
<!--                            {{ file.content }}-->
<!--                        </div>-->
                    </v-card>
                    <template v-else>
                        <a target="_blank" :key="file.showPath" :href="file.showPath"
                           :download="file.fileName">{{ file.fileName }}</a>
                    </template>
                </v-col>
            </v-row>
            <v-menu v-model="showMenu"
                    :position-x="x"
                    :position-y="y"
                    absolute
                    offset-y>
                <v-list>
                    <v-list-item @click="downloadFile" link>
                        <v-list-item-title>下载</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-col>
    </div>
</template>
<script>
    // import axios from "axios";
    import {getConfig} from '@/api/systemConfig'

    export default {
        name: 'filePreview',
        // components: {VueOfficeDocx,VueOfficeExcel},
        props: {
            filesItem: Array
        },
        data: () => ({
            file: null,
            fileTitle: '附件预览',
            files: [],
            showMenu: false,
            x: 0,
            y: 0,
            imgOpt: {x: 0, y: 0, l: 0, t: 0, isDown: false, click: true},
            ftpFolder: null,
            serverHost: '',
        }),
        created() {
            if (this.filesItem != null) {
                this.files = this.filesItem
            }
            getConfig("FTP_SERVER_PATH").then(result => {
                if (result.id != null) {
                    this.serverHost = result.value
                } else {
                    console.log('服务器未配置文件上传路径')
                }
            })
        },
        mounted() {

        },
        watch: {
            filesItem: {
                handler() {
                    if (this.filesItem != null) {
                        this.files = this.filesItem
                    }
                },
                deep: true
            }
        },
        methods: {
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
                let regular = new RegExp(/(ico|bmp|jpg|png|tif|gif|pcx|tga|exif|fpx|svg|psd|cdr|pcd|dxf|ufo|eps|ai|raw|WMF|webp|jpeg|avif)$/)
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

                            this.imgOpt.isDown = false
                            div = div.children[1]
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
                }, 200)
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
                this.imgOpt.isDown = true
                window.setTimeout(() => {
                    if (!this.imgOpt.dblClick) {
                        if (this.$vuetify.breakpoint.xs) {
                            return;
                        }
                        //获取x坐标和y坐标
                        // let div = e.target
                        // if (div.getAttribute("class").indexOf("v-responsive__content") != -1) {
                        //     div = div.parentElement
                        // }
                        this.imgOpt.x = e.offsetX
                        this.imgOpt.y = e.offsetY
                    }
                }, 50)
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
                    }, 200)
                } else {
                    this.imgOpt.dblClick = false
                }
            },
            downloadFile() {
                if (this.file) {

                    let a = document.createElement("a");
                    a.filename = this.file.fileName;
                    a.download = this.file.fileName || 'download.jpg';
                    let name = this.file.name
                    let idx = name.indexOf("/")
                    if (idx == -1) {
                        idx = name.indexOf("\\")
                    }
                    if (idx != -1) {
                        name = name.substring(idx + 1)
                    }
                    if (this.file.suffix == "html") {
                        a.href = this.serverHost + this.file.name + this.file.id + this.file.fileName.substring(this.file.fileName.lastIndexOf("."));
                    } else if (this.isImg(this.file)) {

                        a.href = this.file.showPath
                        a.target="_blank"
                        a.click()
                        return;
                    } else {
                        a.href = this.file.showPath + "?response-content-type=application%2Foctet-stream";
                    }
                    a.click();

                    // document.body.removeChild(a);
                }
            },

        }
    }
</script>
