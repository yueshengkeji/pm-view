<template>
  <div>
    <v-card class="pa-5">
      <v-form ref="formPlan">
        <v-row dense>
          <v-col lg="6" md="6" cols="12">
            <v-autocomplete
                :loading="materialLoading"
                dense
                auto-select-first

                autofocus
                ref="project"
                v-model="formPlan.project"
                :search-input.sync="searchProject"
                :items="projects"
                item-text="name"
                :rules="rules.project"
                return-object
                label="项目名称"
                @input="handleSelect"
                placeholder="请输入项目名称"></v-autocomplete>
          </v-col>
          <v-col lg="6" md="6" cols="12">
            <v-text-field
                          dense
                          :loading="materialLoading"
                          label="计划单名称"
                          ref="planName"
                          v-model="formPlan.name"
                          :rules="rules.name"
                          maxlength="100">

            </v-text-field>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col lg="6" md="6" cols="12">
            <v-text-field dense
                          :rules="rules.remark"
                          label="备注信息"

                          :loading="materialLoading"
                          v-model="formPlan.remark"></v-text-field>
          </v-col>
          <v-col lg="4" md="4" cols="12" v-if="!offEdit">
            <easyFlow ref="easyflow"
                      dense
                      :change="flowChange"
                      :start="startFlow"
                      :instance="flowModel"
                      :offEdit="offEdit"
                      :success="startFlowSuccess"
                      :searchName="false"
                      coding="13270"></easyFlow>
          </v-col>
          <v-col md="6" cols="12" v-if="offEdit">
            <v-chip>成本合计：{{ moneys.toFixed(2) }}元</v-chip>
            <v-chip class="ml-1">共{{ selectedMaterials.length }}项材料</v-chip>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col>
            <v-progress-linear :value="percentage.number"
                               v-show="percentage.show"
                               :height="18"
                               rounded
                               :active="linerActive">

              <template v-slot:default="{value}">

                <span v-if="value !== 100" style="color:#FFFF">{{ content + ' ' + value + '%' }}</span>

                <span v-else style="color:#FFFF">{{ content }}</span>

              </template>
            </v-progress-linear>
            <v-data-table item-key="id"
                          hide-default-footer
                          :height="materialTableHeight"
                          :loading="materialLoading"
                          ref="selectMaterialTable"
                          :headers="headers"
                          :items-per-page="selectedMaterials.length"
                          :items="selectedMaterials">

              <template v-slot:item.planSum="{item}">
                <v-edit-dialog
                    :return-value.sync="planSum"
                    cancel-text="取消"
                    save-text="确定"
                    large
                    @save="editExit('planSum',item)"
                    @cancel="cancel"
                    @open="open('planSum',item)"
                    @close="closeEdit">
                  {{ item.planSum }}
                  <template v-slot:input>
                    <v-text-field
                        @focus="$event.target.select()"

                        type="number"
                        v-model="planSum"
                        label="计划数量"></v-text-field>
                  </template>
                </v-edit-dialog>
              </template>

              <template v-slot:item.planPrice="{item}">
                <v-edit-dialog
                    :return-value.sync="planPrice"
                    cancel-text="取消"
                    save-text="确定"
                    large
                    @save="editExit('planPrice',item)"
                    @cancel="cancel"
                    @open="open('planPrice',item)"
                    @close="closeEdit">
                  {{ item.planPrice }}
                  <template v-slot:input>
                    <v-text-field
                        @focus="$event.target.select()"

                        type="number"
                        v-model="planPrice"
                        label="计划单价"></v-text-field>
                  </template>
                </v-edit-dialog>
              </template>

              <template v-slot:item.action="{item}">
                <v-btn small
                       @click="handleDeleteMaterial(item.index, item,'selectedMaterials')">删除
                </v-btn>
              </template>

              <template v-slot:item.cnfStr="{item}">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <div color="primary"
                         dark
                         v-bind="attrs"
                         v-on="on">
                      <div v-if="item.cnfStr != null && item.cnfStr.length > 10">
                        {{ item.cnfStr.substring(0, 10) }}
                      </div>
                      <div v-else>{{ item.cnfStr }}</div>
                    </div>
                  </template>
                  <div>{{ item.cnfStr }}</div>
                </v-tooltip>

              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-form>
      <v-card-actions v-show="showTool">
        <v-spacer></v-spacer>
        <template>
          <p class="mr-1">材料总数：{{ selectedMaterials.length }}</p>
        </template>
        <template>
          <p class="mr-1">成本总价：{{ moneys.toFixed(2) }}元</p>
        </template>
        <v-btn color="grey lighten-2" @click="downloadExcelTemp">
          <v-icon>mdi-download</v-icon>
          下载模板
        </v-btn>
        <v-btn color="primary" @click="importBtn" :disabled="offEdit">
          <v-icon>mdi-upload</v-icon>
          导入材料
        </v-btn>
        <input style="position: absolute;width:100%;height: 100%;opacity: 0" v-show="false"
               type="file"
               ref="excelUpload"
               id="excelUpload" @change="implUserExcel" accept=".xlsx,.xls"/>
        <v-btn color="primary" class="ml-1" @click="showMaterialDialog" :disabled="offEdit">
          材料库
        </v-btn>

        <v-btn @click="close">取 消</v-btn>
        <v-btn type="primary" @click="submitPlan('formPlan')" :disabled="offEdit" color="primary">提 交</v-btn>
      </v-card-actions>
    </v-card>
    <!--系统材料库选择-->
    <select-material @close="closeMaterial" :show="materialDialog" @select="loadSelectedMaterial"></select-material>
    <!--导入材料错误列表修正-->
    <v-dialog v-model="exportDialog">
      <v-card v-if="!showErrorEdit">
        <v-card-title>导入材料错误列表修正</v-card-title>
        <v-data-table :items="errorMaterData"
                      item-key="index"
                      height="500"
                      @click:row="editError"
                      :headers="headers3">
          <template v-slot:item.property="{item}">
            <div class="red">{{ item.property }}</div>
          </template>
        </v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="ignoreErrorMaterial" color="warning">忽略</v-btn>
          <v-btn @click="enterErrorMaterial" color="primary">确定</v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-else>
        <v-form>
          <v-container>
            <v-row>
              <v-col md="4">
                <v-text-field label="材料名称" v-model="errorRow.material.name"></v-text-field>
              </v-col>
              <v-col md="4">
                <v-text-field label="技术参数" v-model="errorRow.cnfStr"></v-text-field>
              </v-col>
              <v-col md="4">
                <v-text-field label="规格型号" v-model="errorRow.material.model"></v-text-field>
              </v-col>
              <v-col md="4">
                <v-text-field label="品牌" v-model="errorRow.material.brand"></v-text-field>
              </v-col>
              <v-col md="4">
                <v-text-field label="单位" v-model="errorRow.material.unit.name"></v-text-field>
              </v-col>
              <v-col md="4">
                <v-text-field label="计划数量/工程量" v-model="errorRow.planSum"></v-text-field>
              </v-col>
              <v-col md="4">
                <v-text-field label="计划单价" v-model="errorRow.planPrice"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showErrorEdit = false" color="primary">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar top v-model="contentShow">{{ content }}</v-snackbar>
  </div>
</template>

<script>
import xlsx from 'xlsx';
import excelExport from '@/utils/excel-export';
import planApi from '@/api/plan'
import projectApi from '@/api/project'

import easyFlow from '@/components/easyflow/easyFlow'
import materialApi from '@/api/material'
import selectMaterial from '@/components/material/select'

export default {
  name: "add-plan",
  components: {
    easyFlow,
    selectMaterial
  },
  data() {
    return {
      totalMoney: 0,
      linerActive: false,
      moneys: 0,
      planSum: 0,
      planPrice: 0,
      searchProject: null,
      projects: [],
      flowModel: null,
      startFlow: false,
      contentShow: false,
      content: null,
      options: {},

      headers3: [
        {text: '序号', value: 'index'},
        {text: '系统名称', value: 'taskId'},
        {text: '名称', value: 'material.name'},
        {text: '型号', value: 'material.model'},
        {text: '品牌', value: 'material.brand'},
        {text: '单位', value: 'material.unit.name'},
        {text: '计划数量', value: 'planSum'},
        {text: '单价', value: 'planPrice'},
        {text: "合计", value: 'money'},
        {text: "技术参数", value: 'cnfStr'},
        {text: "错误信息", value: 'material.property'},
        {text: "操作", value: 'action'},
      ],
      headers: [
        {text: '序号', value: 'index'},
        {text: '系统名称', value: 'taskId', width: '15%'},
        {text: '名称', value: 'material.name', width: '15%'},
        {text: '型号', value: 'material.model', width: '15%'},
        {text: '品牌', value: 'material.brand',width:'100px'},
        {text: '单位', value: 'material.unit.name'},
        {text: '计划数量', value: 'planSum'},
        {text: '单价', value: 'planPrice'},
        {text: "合计", value: 'money'},
        {text: "技术参数", value: 'cnfStr', width: '15%'},
        {text: "操作", value: 'action'},
      ],
      //原始材料库

      //流程数组
      flowArray: [],
      //表单验证
      rules: {
        project: [
          v => !!v || "请选择项目"
        ],
        name: [
          v => !!v || "请输入计划单名称",
          v => !!v && v.length < 100 || "最多一百个字符"
        ],
        remark: [
          v => !!v || v.length < 4000 || "最多4000个字符"
        ]
        /*flow: [
          {required: true, message: "请选择审批流程", trigger: "blur"}
        ]*/
      },
      //显示材料选择对话框
      materialDialog: false,

      file: null,
      exportDialog: false,
      errorMaterData: [],

      groupStyle: {},
      //计划单明细对话框状态，1=添加中，2=修改，3=明细
      detailDetailType: 1,
      deletePlanMaterial: [],
      isUpdate: false,
      //表单绑定对象
      formPlan: {project: {name: null}, name: "", remark: ''},
      //材料导入进度条
      percentage: {
        number: 0,
        show: false,
      },
      sums: [],
      selectedMaterials: [],
      //禁止编辑
      materialTableHeight: 350,
      materialLoading: false,

      showErrorEdit: false,
      errorRow: {
        material: {
          brand: null,
          name: null,
          model: null,
          unit: {name: null}
        },
        cnfStr: null,
        id: null,
        planPrice: null,
        planSum: null,
        taskId: null,
        unitName: null,
      },

      //禁止编辑
      offEdit: false,
    }
  },
  props: {
    edit: {
      type: Boolean,
      default: true
    },
    dataChange: null,
    frameId: null,
    close: {
      type: Function,
      default: () => {
      }
    },
    showTool: {
      type: Boolean,
      default: false
    },
  },
  watch: {
    edit: {
      handler() {
        console.log("edit", this.edit)
        this.offEdit = this.edit
      },
      deep: true
    },
    searchProject(str) {
      this.loadProject(str)
    },
    frameId: {
      handler() {
        if (this.frameId != null) {
          this.loadData()
        } else {
          this.reset()
        }
      },
      deep: true
    },
  },
  created() {
    if(!this.showTool){
      this.headers.splice(this.headers.length-1,1)
    }
    if (this.frameId != null) {
      this.loadData()
    }
    this.loadProject("")
    this.offEdit = this.edit;

  },
  methods: {
    loadProject(str) {
      projectApi.getProject({str: encodeURIComponent(str)}).then(result => {
        if (result instanceof Array) {
          result.forEach(item => {
            if (item.state == 0) {
              item.disabled = true
              item.name = item.name + "《未审核，无法选择》"
            }
          })
          this.projects = result;
        }
      }).catch((e, s) => {
        console.log(e, s);
      })
    },
    closeMaterial(isOpen) {
      this.materialDialog = isOpen
    },
    loadSelectedMaterial(items) {
      items.forEach((m) => {
        this.selectedMaterials.push({
          taskId: '',
          index: this.selectedMaterials.length + 1,
          planSum: 0,
          planPrice: 0,
          material: m,
          id: this.getId(),
          isShow: false
        });
      });
      this.materialDialog = false
    },
    editError(row, prop) {
      console.log(row, prop);
      this.errorRow = row;
      this.showErrorEdit = true;
    },
    cancel() {

    },
    closeEdit() {

    },
    open(column, material) {
      this[column] = material[column];
    },
    openDetailDialog(rowData, isUpdate) {
      this.deletePlanMaterial = [];
      this.isUpdate = isUpdate;
      if (rowData.project == null) {
        rowData.project = {name: "该项目已被删除！"};
      } else {
        this.projects.push(rowData.project);
      }
      let than = this;
      if (rowData.materialList === undefined) {
        than.materialLoading = true;
        than.moneys = 0;
        planApi.loadPlanMaterial({planId: rowData.id}).then(result => {
          rowData.materialList = result;
          if (result.length > 0) {
            for (let i = 0; i < result.length; i++) {
              result[i].isShow = false;
              result[i].index = i + 1;
              than.moneys += result[i].money;
            }
            than.selectedMaterials = result;
          } else {
            than.selectedMaterials = [];
          }
        }).finally(() => {
          than.materialLoading = false;
        });
      } else {
        than.materialLoading = true;
        for (let i = 0; i < rowData.materialList.length; i++) {
          let mr = rowData.materialList[i]
          mr.index = i + 1;
          than.moneys += mr.money;
        }
        than.selectedMaterials = rowData.materialList;
        than.materialLoading = false;
      }
      if (rowData.appMark == 1) {
        this.offEdit = true
      } else {
        this.offEdit = this.edit
      }
      this.formPlan = rowData;
    },
    //选择项目
    handleSelect() {
      this.formPlan.name = this.formPlan.project.name + "-";
      this.$refs['planName'].focus();
    },
    //  打开选择材料窗口
    showMaterialDialog() {
      this.materialDialog = true;
    },


    handleDeleteMaterial(index, rowData, data) {
      this[data].splice((index - 1), 1);
      if (rowData.planId !== undefined) {
        this.deletePlanMaterial.push(rowData.id);
      }
      this[data].forEach((item, idx) => {
        item.index = idx + 1;
      })
    },
    editExit(columnName, row) {
      row.isShow = false;
      row[columnName] = this[columnName];
      row.money = (row.planSum * row.planPrice).toFixed(2);
      this.moneys = 0;
      this.selectedMaterials.forEach(item => {
        if (item.money != null) {
          this.moneys += parseFloat(item.money);
        }
      })
    },
    importBtn() {
      if (this.formPlan.project.id === undefined || this.formPlan.project.id === "") {
        this.content = "请选择项目";
        this.contentShow = true;
      } else {
        this.$refs.excelUpload.click();
      }

    },
    implUserExcel(e) {
      let reader = new FileReader();
      let than = this;
      reader.onload = function (e) {
        than.errorMaterData = [];
        const workbook = xlsx.read(e.target.result, {type: 'binary'});
        let sheetList = workbook.SheetNames
        let materGroup = false;
        let thanGroupName = "";
        let groupMater = null;
        sheetList.forEach(async (name) => {
          than.offEdit = true;
          than.linerActive = true;
          than.content = "正在处理材料清单"
          than.percentage.show = true;
          let worksheet = workbook.Sheets[name];
          let newMater = xlsx.utils.sheet_to_json(worksheet, {header: ["series", "name", "cnfStr", "model", "brand", "unitName", "planSum", "planPrice"]});
          let total = newMater.length;
          for (let x = 0; x < newMater.length; x++) {
            than.linerActive = true;
            than.content = "正在处理材料清单,第" + x + "行"
            newMater[x].isShow = false;
            newMater[x].material = {
              name: newMater[x].name,
              model: newMater[x].model,
              brand: newMater[x].brand,
              unit: {name: newMater[x].unitName},
            }
            await than.sheetToMaterial(than.sheetMaterialModel(newMater[x], x, thanGroupName, total, materGroup, groupMater)).then((result) => {
              if (result != null) {
                groupMater = result.groupMater;
              }
              // materGroup = group;
            }).catch((e) => {
              console.log("材料导入异常", e)
            });
          }
          if (than.errorMaterData.length > 0) {
            than.exportDialog = true;
          }

          /*
           * 上传材料到基础数据库
           */
          if (than.selectedMaterials.length > 0) {
            than.content = "正在上传校正,请等待...";
            than.contentShow = true;
            materialApi.addmaterial(than.selectedMaterials).then((result) => {
              than.moneys = 0;
              result.forEach((item, index) => {
                item.index = index + 1;
                than.moneys += item.money;
                if (item.material.property != null && item.material.property != "") {
                  console.log("材料导入失败：", item);
                  than.errorMaterData.push(item);
                  than.exportDialog = true;
                  result.splice(index, 1);
                } else {
                  item.isShow = false;
                }
              });
              than.selectedMaterials = result;
              than.content = "导入成功";
              than.percentage.number = 100;
              than.contentShow = true;
            }).finally(() => {
              than.offEdit = false;
            });
          }
        });


      };
      if (e.target.files[0] != null) {
        //读取数据
        reader.readAsBinaryString(e.target.files[0]);
      }

      // this.file = e.target.files[0];
      // this.exportDialog = true;
    },
    sheetToMaterial(sheetModel) {
      let than = this;
      return new Promise((resolve, reject) => {
        window.setTimeout((sheetModel, than) => {
          if (sheetModel.m.material != null) {
            than.percentage.number = parseInt(sheetModel.index / sheetModel.total * 100);
            if (sheetModel.m.material.name == null) {
              reject(sheetModel);
              return;
            }
            if (!sheetModel.materGroup && sheetModel.m.material.name === "设备名称" && sheetModel.m.material.model === "规格型号") {
              sheetModel.materGroup = true;
            } else if (sheetModel.m.material.name !== undefined
                && sheetModel.m.material.name.indexOf("系统名称") !== -1
                && sheetModel.m.material.unitName === undefined) {
              //记录当前系统名称
              sheetModel.thanGroupName = sheetModel.m.material.name.replace("系统名称", "").replace("：", "").replace(":", "");
              sheetModel.groupMater = {
                material: {name: sheetModel.thanGroupName},
                id: than.getId(),
                planSum: "",
              };
              //  分配分组颜色
              than.groupStyle[sheetModel.thanGroupName] = {backgroundColor: than.getColor()};
            } else if (than.verifyMaterial(sheetModel.m)) {
              sheetModel.groupMater = sheetModel.groupMater == null ? {material: {name: "1"}} : sheetModel.groupMater;
              //合法材料
              sheetModel.m.taskId = sheetModel.groupMater.material.name;
              sheetModel.m.id = than.getId();
              try {
                sheetModel.m.planPrice = sheetModel.m.planPrice === undefined ? 0 : sheetModel.m.planPrice;
                sheetModel.m.money = (sheetModel.m.planSum * sheetModel.m.planPrice).toFixed(2);
                sheetModel.m.money = isNaN(sheetModel.m.money) ? 0 : sheetModel.m.money;
                if (sheetModel.m.cnfStr != null && sheetModel.m.cnfStr.length > 200) {
                  sheetModel.m.cnfStr = sheetModel.m.cnfStr.substring(0, 199);
                }
              } catch (e) {
                sheetModel.m.money = 0;
              }
              than.selectedMaterials.push(sheetModel.m);
            } else {
              sheetModel.groupMater = sheetModel.groupMater == null ? {material: {name: "1"}} : sheetModel.groupMater;
              //材料不合法
              sheetModel.m.taskId = sheetModel.groupMater.material.name;
              sheetModel.m.id = than.getId();
              than.errorMaterData.push(sheetModel.m);
            }
            resolve(sheetModel);
          }
        }, 1, sheetModel, than);
      });
    },
    sheetMaterialModel(m, index, thanGroupName, total, materGroup, groupMater) {
      m.material.name = this.materialTrim(m.material.name);
      m.material.model = this.materialTrim(m.material.model);
      m.cnfStr = this.materialTrim(m.cnfStr);
      m.material.brand = this.materialTrim(m.material.brand);
      m.material.unit.name = this.materialTrim(m.material.unit.name);
      return {
        m: m,
        index: index,
        thanGroupName: thanGroupName,
        total: total,
        materGroup: materGroup,
        groupMater: groupMater,
      }
    },
    materialTrim(str) {
      if (str == null) {
        return null;
      } else {
        str = "" + str;
      }
      try {
        return str.replace(/\s/g, "").replace(/[\r\n]/g, "");
      } catch (e) {
        console.log(str);
        return null;
      }
    },
    ignoreErrorMaterial() {
      this.exportDialog = false
      this.errorMaterData = []
      this.offEdit = false
      this.content = "导入完成"
      this.percentage.number = 100
    },
    enterErrorMaterial() {
      let than = this;
      let importMater = [];
      this.errorMaterData.forEach((m, i) => {
        if (than.verifyMaterial(m)) {
          m.index = this.selectedMaterials.length
          try {
            m.money = (m.planSum * m.planPrice).toFixed(2)
          } catch (e) {
            m.money = 0
          }
          importMater.push(m)
          than.errorMaterData.splice(i, 1);
        }
      });

      materialApi.addmaterial(importMater).then((result) => {
        result.forEach((item, index) => {
          if (item.property != null) {
            than.errorMaterData.push(item)
            than.exportDialog = true
            result.splice(index, 1)
          } else {
            item.index = than.selectedMaterials.length
            item.isShow = false
            than.selectedMaterials.push(item)
          }
        });
      }).finally(() => {
        if (this.errorMaterData.length <= 0) {
          this.ignoreErrorMaterial()
        }
      });
    },
    verifyMaterial(m) {
      if (m.material != null) {
        if (!this.isNotNull(m.material.name) || m.material.name.length > 500) {
          m.material.property = "材料名称不能为空/字符过长(限制500字符)"
        } else if (!this.isNotNull(m.planSum) || isNaN(parseFloat(m.planSum))) {
          m.material.property = "计划单价不能为空/计划数量不符合数字规范"
        } else if (!this.isNotNull(m.material.unit)) {
          m.material.property = "材料单位不能为空"
        } else if (!this.isNotNull(m.material.unit.name) || m.material.unit.name.length > 50) {
          m.material.property = "材料单位不能为空/字符过长(限制50字符)"
        } else if (!this.isNotNull(m.material.brand) || m.material.brand.length > 30) {
          m.material.property = "品牌不能为空/字符过长(限制30字符)"
        } else if (this.isNotNull(m.material.model) && m.material.model.length > 4000) {
          m.material.property = "型号字符过长(限制30字符)"
        } else {
          return true
        }
      } else {
        return false
      }
    },
    percentageFormat(percentage) {
      return percentage === 100 ? "完成" : `${percentage}%`;
    },
    getId() {
      if (this.tempId == null) {
        this.tempId = [];
      }
      let id = "S" + parseInt(new Date().getTime() / 1000) + "-" + Math.ceil(Math.random() * 100000);
      if (this.tempId[id]) {
        // console.log("id重复", this.tempId[id]);
      }
      this.tempId[id] = true;
      return id;
    },
    materialGroupStyle({row}) {
      // console.log(this.groupStyle, row.taskId);
      return this.groupStyle[row.taskId];
    },
    getColor() {
      let r = parseInt(Math.random() * 256)
      let g = parseInt(Math.random() * 256)
      let b = parseInt(Math.random() * 256)
      return `rgba(${r},${g},${b},0.3)`
    },
    flowChange(flow) {
      console.log("选择流程", flow);
    },
    nextFlow() {
      this.flowModel = {
        message: {
          title: this.formPlan.name,
          content: this.formPlan.remark,
          frameCoding: 13270,
          frameId: this.formPlan.id,
          frameColumn: "pm07101"
        },
      }
      this.$refs.easyflow.startFlow(this.flowModel.message)
    },
    submitPlan(ruleForm) {
      if (this.formPlan.id != null && !this.isUpdate) {
        this.content = "该单据已经添加，正在发起流程";
        this.contentShow = true;
        this.nextFlow();
        return;
      }

      for (let x = 0; x < this.selectedMaterials.length; x++) {
        if (this.selectedMaterials[x].planSum <= 0) {
          this.content = '第' + (x + 1) + "行,计划数量不能小于0！";
          this.contentShow = true;
          return;
        } else if (this.selectedMaterials[x].planPrice <= 0) {
          this.content = '第' + (x + 1) + "行,计划单价不能小于0！";
          this.contentShow = true;
          return;
        } else if (this.selectedMaterials[x].cnfStr != null && this.selectedMaterials[x].cnfStr.length > 1000) {
          this.content = '第' + (x + 1) + "行,技术参数字符过长！";
          this.contentShow = true;
          return;
        } else if (this.selectedMaterials[x].taskId != null && this.selectedMaterials[x].taskId.length > 500) {
          this.content = '第' + (x + 1) + "行,系统名称过长！";
          this.contentShow = true;
          return;
        }
      }
      this.formPlan.materialList = this.selectedMaterials;
      let than = this;
      let valid = this.$refs[ruleForm].validate();
      if (valid) {
        let ajax;
        if (this.isUpdate) {
          ajax = planApi.updatePlan(this.formPlan);
        } else {
          ajax = planApi.addPlan(this.formPlan);
        }

        ajax.then(result => {
          if (!than.isUpdate) {
            than.formPlan = result;
          }
          this.nextFlow()
          window.setTimeout(() => {
            if (than.dataChange != null && typeof than.dataChange === "function") {
              than.dataChange({type: "insert", data: result});
            }
          }, 500);

          than.deletePlanMaterial.forEach(item => {
            planApi.deleteMaterial(item);
          });
          planApi.deletePlanMaterial = [];
        })
      } else {
        return false;
      }
    },
    reset() {
      this.formPlan = {
        project: {},
        name: "",
        remark: '',
        materialList: [],
        id: null,
      }
      this.moneys = 0;
      this.selectedMaterials = [];
      this.materialData = [];
      this.errorMaterData = [];
      this.startFlow = false
      this.isUpdate = this.edit
    },
    startFlowSuccess() {
      this.reset();

      //流程发起成功
      if (this.close != null) {
        this.close();
      }
    },
    /**
     * 下载导入模板
     */
    downloadExcelTemp() {
      excelExport([
        {key: 'index', title: '序号'},
        {key: 'name', title: '设备名称'},
        {key: 'remark', title: '技术参数'},
        {key: 'model', title: '规格型号'},
        {key: 'brand', title: '推荐品牌'},
        {key: 'unitName', title: '单位'},
        {key: 'sum', title: '工程量'},
        {key: 'price', title: '单价'},
      ], [
        {index: '1', name: '子系统名称：监控系统', remark: "", model: "", brand: "", unitName: "", sum: "", price: ""},
        {
          index: '2',
          name: '此行开始录入"监控系统"设备列表',
          remark: "",
          model: "",
          brand: "",
          unitName: "",
          sum: "",
          price: ""
        },
        {index: '3', name: '子系统名称：网络系统', remark: "", model: "", brand: "", unitName: "", sum: "", price: ""},
        {
          index: '4',
          name: '此行开始录入"网络系统"设备列表',
          remark: "",
          model: "",
          brand: "",
          unitName: "",
          sum: "",
          price: ""
        },
      ], "项目材料计划单导入模板.xlsx");
    },
    loadData() {
      this.materialLoading = true;
      planApi.getPlanById(this.frameId).then(p => {
        this.openDetailDialog(p, this.showTool);
      }).finally(() => {
        this.materialLoading = false;
      });
    }
  }
}
</script>

<style scoped>

</style>
