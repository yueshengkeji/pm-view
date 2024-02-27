<template>
  <div>
    <v-text-field placeholder="模糊查询" v-model="searchInput" @change="loadMaterial"></v-text-field>

    <v-form>
      <v-row>
        <v-col lg="3">
          <v-text-field v-model="materialNameInput" @change="loadMaterial"
                        placeholder="材料名称"></v-text-field>
        </v-col>
        <v-col lg="3">
          <v-text-field v-model="materialModelInput" @change="loadMaterial"
                        placeholder="型号"></v-text-field>
        </v-col>
        <v-col lg="3">
          <v-text-field v-model="materialBrandInput" @change="loadMaterial"
                        placeholder="品牌"></v-text-field>
        </v-col>
        <v-col lg="3">
          <v-btn color="primary" @click="importBtn">
            <v-icon>mdi-upload</v-icon>
            导入辅材
          </v-btn>
          <input style="position: absolute;width:100%;height: 100%;opacity: 0" v-show="false"
                 type="file"
                 ref="excelUpload"
                 id="excelUpload" @change="implUserExcel" accept=".xlsx,.xls"/>
          <v-btn @click="downloadExcel" title="材料库选择材料">下载导入格式</v-btn>
          <v-btn @click="exportHandler">导出</v-btn>
        </v-col>
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
      </v-row>
    </v-form>
    <v-data-table item-key="id"
                  ref="materialTable"
                  :items="materialData"
                  :loading="loading"
                  @click:row="handleRowClick"
                  :options.sync="options"
                  :items-per-page="10"
                  :server-items-length="queryMaterialParam.total"
                  :headers="headers2"
                  show-select
                  @input="selectMaterial"
                  :value="materials">
      <template v-slot:item.action="{item}">
        <v-btn color="error" x-small @click="deleteHeader(item)">删除</v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="deleteHeaderDialog" width="30%">
      <v-card class="pa-5">
        确定取消：《{{ deleteItem.name }}》辅材吗？
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteMaterial" color="error">确定</v-btn>
          <v-btn @click="deleteHeaderDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

</template>

<script>
import excelExport from '@/utils/excel-export';
import materialApi from '@/api/material'

export default {
  name: "fucai-material",
  data: () => ({
    materialDialog: false,
    materialNameInput: "",
    materialModelInput: "",
    materialBrandInput: "",
    materialData: [],
    caseMaterialMap: [],
    searchInput: "",
    loading: false,
    //材料查询参数
    queryMaterialParam: {
      offset: 1,
      limit: 10,
      total: 0,
      sort: "pm00217",
      order: "DESC",
      str: null,
      materialName: null,
      materialBrand: null,
      materialModel: null,
      isLoadFuCai: "1"
    },

    headers2: [
      {text: '名称', value: 'name'},
      {text: '型号', value: 'model'},
      {text: '品牌', value: 'brand', width: '15%'},
      {text: '单位', value: 'unit.name'},
      {text: '成本单价', value: 'planPrice'},
      {text: '操作', value: 'action'},
    ],
    materials: [],
    options: {},
    percentage: {
      show: false,
      number: 0,
    },
    linerActive: false,
    content: null,
    groupStyle: [],
    selectedMaterials: [],
    deleteItem: {},
    deleteHeaderDialog: false,
  }),
  watch: {
    options: {
      handler() {
        this.loadMaterial();
      },
      deep: true
    },
  },
  created() {

  },
  methods: {
    deleteMaterial() {
      materialApi.deleteFucai(this.deleteItem.id).then(() => {
        this.loadMaterial()
      }).finally(() => this.deleteHeaderDialog = false)
    },
    deleteHeader(item) {
      this.deleteItem = item
      this.deleteHeaderDialog = true
    },
    exportHandler() {
      let data = []
      let idx = 1
      this.materialData.forEach(item => {
        item.index = idx
        item.unitName = item.unit.name
        data.push(item)
        idx++
      })
      excelExport([
        {key: 'index', title: '序号'},
        {key: 'name', title: '材料名称'},
        {key: 'model', title: '规格型号'},
        {key: 'brand', title: '品牌'},
        {key: 'unitName', title: '单位'},
        {key: 'storageSum', title: '数量'},
        {key: 'planPrice', title: '单价'},
        {key: 'remark', title: '备注'},
      ], data, "辅材导出.xlsx");
    },
    downloadExcel() {
      excelExport([
        {key: 'index', title: '序号'},
        {key: 'name', title: '材料名称'},
        {key: 'model', title: '规格型号'},
        {key: 'brand', title: '品牌'},
        {key: 'unitName', title: '单位'},
        {key: 'storageSum', title: '数量'},
        {key: 'planPrice', title: '单价'},
        {key: 'remark', title: '备注'},
      ], [
        {index: '', name: '', model: "", brand: "", unitName: "", sum: "", price: "", remark: ""},
      ], "辅材库导入模板.xlsx");
    },
    verifyMaterial(m) {
      return (m.material !== null &&
          this.isNotNull(m.material.name) &&
          this.isNotNull(m.material.unit) &&
          this.isNotNull(m.material.unit.name) &&
          this.isNotNull(m.material.brand));
    },
    implUserExcel(e) {
      import("xlsx").then(xlsx => {
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
            let newMater = xlsx.utils.sheet_to_json(worksheet, {header: ["series", "name", "model", "brand", "unitName", "planSum", "planPrice", "remark"]});
            let total = newMater.length;
            for (let x = 1; x < newMater.length; x++) {
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
              console.log("for index ", x, than.linerActive);
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
              materialApi.addmaterial(than.selectedMaterials, "1").then(() => {
                than.content = "导入成功";
                than.percentage.number = 100;
                than.contentShow = true;
                than.loadMaterial();
              })
            }
          });
        };
        if (e.target.files[0] != null) {
          //读取数据
          reader.readAsBinaryString(e.target.files[0]);
        }
      })


      // this.file = e.target.files[0];
      // this.exportDialog = true;
    },
    getColor() {
      let r = parseInt(Math.random() * 256)
      let g = parseInt(Math.random() * 256)
      let b = parseInt(Math.random() * 256)
      return `rgba(${r},${g},${b},0.3)`
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
    importBtn() {
      this.$refs.excelUpload.click();
    },

    select() {
      this.$emit("select", this.materials)
      this.materials = []
    },
    selectMaterial(items) {
      this.materials = items;
    },
    handleRowClick(rowData, item) {
      // this.$refs.materialTable.toggleRowSelection(rowData);
      item.select(!item.isSelected);
    },
    currentMaterialChange(offset) {
      this.queryMaterialParam.offset = offset;
      this.loadMaterial();
    },

    loadMaterial() {
      let than = this;
      than.loading = true;
      this.queryMaterialParam.str = encodeURIComponent(this.searchInput);
      this.queryMaterialParam.materialName = encodeURIComponent(this.materialNameInput);
      this.queryMaterialParam.materialModel = encodeURIComponent(this.materialModelInput);
      this.queryMaterialParam.materialBrand = encodeURIComponent(this.materialBrandInput);
      this.queryMaterialParam.limit = this.options.itemsPerPage
      this.queryMaterialParam.offset = this.options.page

      materialApi.getmaterial(than.queryMaterialParam).then(result => {
        for (let x = 0; x < result.rows.length; x++) {
          try {
            result.rows[x].isShow = false;
          } catch (e) {
            console.log(e);
          }
        }
        than.materialData = result.rows;
        than.queryMaterialParam.total = result.total;
        than.loading = false;
      }).catch(e => {
        console.log("异常信息", e);
      });
    }
  }
}
</script>

<style scoped>

</style>