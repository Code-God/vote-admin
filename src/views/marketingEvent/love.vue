<template>
  <div class="app-container">
    <div class="filter-container-wechat">
      <div>
        <el-tag size="medium">点赞总数：{{laudSum}}</el-tag>
      </div>
      <div><span class="demonstration">{{$t('table.date')}}</span>：
        <el-date-picker v-model="timeDate" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" :default-time="['12:00:00']">
        </el-date-picker>
      </div>
      <el-input style="width: 100px;" class="filter-item" :placeholder="$t('table.userName')"
                v-model="listQuery.userName" @keyup.enter.native="searchData">
      </el-input>
      <el-input style="width: 150px;" class="filter-item" :placeholder="$t('table.contact')" v-model="listQuery.contact"
                @keyup.enter.native="searchData">
      </el-input>
      <el-select style="width: 140px" class="filter-item" v-model="listQuery.review">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <div>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="searchData">{{$t('table.search')}}
        </el-button>
      </div>
      <div>
        <el-button class="filter-item" type="primary" @click="resetListQuery">{{$t('table.reset')}}</el-button>
      </div>
    </div>
    <el-table :data="userList" border style="width: 100%" v-loading="listLoading" @sort-change="handleSort" ref="table"
              :default-sort="{prop: 'date', order: 'descending'}">
      <el-table-column width="150px" align="center" :label="$t('table.id')" prop="id" sortable="custom">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" :label="$t('table.date')" prop="createDate" sortable="custom">
        <template slot-scope="scope">
          <span>{{scope.row.createDate | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" :label="$t('table.image')">
        <template slot-scope="scope">
          <img :src="scope.row.photoUrl | resizeImg" width="50" @click="showDialogPic(scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column prop="userName" align="center" :label="$t('table.userName')" sortable="custom">
      </el-table-column>
      <el-table-column prop="laud" :label="$t('table.laud')" width="100" align="center" sortable="custom">
      </el-table-column>
      <el-table-column prop="contact" :label="$t('table.contact')" align="center">
      </el-table-column>
      <el-table-column prop="review" align="center" :label="$t('table.review')">
        <template slot-scope="scope">
          <span>{{scope.row.review === '1'?'已审核': '已下架'}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">
            {{$t('table.edit')}}
          </el-button>
          <el-button v-if="scope.row.review === '1'" size="mini" @click="handleClick(scope.row)" type="default">
            {{$t('table.close')}}
          </el-button>
          <el-button v-if="scope.row.review === '2'" size="mini" @click="handleClick(scope.row)" type="success">
            {{$t('table.review')}}
          </el-button>
          <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.row)">{{$t('table.delete')}}</el-button> -->
          <el-button size="mini" type="danger" @click="deleteData(scope.row)">{{$t('table.delete')}}</el-button>
          <!-- <el-button type="text" @click="deleteData">点击打开 Message Box</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="listQuery.pageIndex" :page-sizes="[10,20]" :page-size="listQuery.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog title="编辑" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="100px"
               style='width: 400px; margin-left:50px;'>
        <el-form-item :label="$t('table.userName')" prop="userName">
          <el-input v-model="temp.userName" type="input"></el-input>
        </el-form-item>
        <el-form-item :label="$t('table.laud')" prop="laud">
          <el-input v-model="temp.laud" type="number"></el-input>
        </el-form-item>
        <el-form-item :label="$t('table.contact')" prop="contact">
          <el-input v-model="temp.contact" type="input"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="照片"
      :visible.sync="picDialogVisible"
      center>
      <div class="pic_dialog">
        <img :src="picUrl" style="margin:0 auto; max-width:60%;"/>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    mapState,
    mapActions
  } from 'vuex'

  export default {
    created() {
      this.getUserList();
    },
    data() {
      return {
        picDialogVisible: false,
        picUrl: '',
        temp: {
          userName: '',
          laud: 0,
          contact: ''
        },
        sortOptions: [{
          label: '全部',
          key: '0'
        }, {
          label: '已审核',
          key: '1'
        }, {
          label: '已下架',
          key: '2'
        }],
        dialogFormVisible: false,
        rules: {
          userName: [{
            required: true,
            message: '请输入用户姓名'
          }],
          laud: [{
            required: true,
            message: '请输入点赞数'
          }],
          contact: [{
            required: true,
            message: '请输入联系方式'
          }]
        }
      }
    },
    watch: {
      picDialogVisible: function() {
        if (!this.picDialogVisible) {
          this.picUrl = '';
        }
      }
    },
    methods: {
      ...mapActions(['getUserList', 'updateUserInfo', 'deleteUser', 'updateListQuery', 'updateTimeDate', 'resetQuery']),
      deleteData(p) {
        this.$confirm('此操作删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.handleDelete(p);
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      showDialogPic(p) {
        this.picDialogVisible = true;
        this.picUrl = p.photoUrl;
      },
      searchData() {
        this.$refs['table'].clearSort();
        this.getUserList();
      },
      handleSort(e) {
        if (e.order) {
          let orderBy = '';
          if (e.order === 'ascending') {
            orderBy = 'asc';
          } else {
            orderBy = 'desc';
          }
          this.updateListQuery({
            order: e.prop,
            orderBy: orderBy,
            pageIndex: 1,
            pageSize: 10
          }).then(() => {
            this.getUserList();
          })
        } else {
          this.updateListQuery({
            order: null,
            orderBy: null
          }).then(() => {
            this.getUserList();
          })
        }
      },
      resetListQuery() {
        this.resetQuery();
      },
      handleClick(row) {
        row.review = row.review === '1' ? '2' : '1';
        this.updateUserInfo({
          ...row
        }).then((response) => {
          this.getUserList()
        });
      },
      handleSizeChange(val) {
        this.updateListQuery({
          pageSize: val
        }).then(() => {
          this.getUserList()
        })
      },
      handleCurrentChange(val) {
        this.updateListQuery({
          pageIndex: val
        }).then(() => {
          this.getUserList();
        })
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row); // copy obj
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData(d) {
        const {
          id,
          userName,
          laud,
          contact,
          review
        } = this.temp;
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.updateUserInfo({
              id,
              userName,
              laud,
              contact,
              review
            }).then((response) => {
              this.dialogFormVisible = false;
              this.getUserList()
            })
          }
        })
      },
      handleDelete(row) {
        this.deleteUser({
          id: row.id
        }).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getUserList();
        })
      }
    },
    computed: {
      ...mapState({
        userList: state => state.active.userList,
        listLoading: state => state.active.listLoading,
        total: state => state.active.total,
        listQuery: state => state.active.listQuery,
        laudSum: state => state.active.laudSum
      }),
      timeDate: {
        get() {
          return this.$store.state.active.timeDate;
        },
        set(value) {
          if (!value) {
            value = [];
          }
          this.updateTimeDate(value);
        }
      },
      review: {
        get() {
          return this.$store.state.active.listQuery.review;
        },
        set(value) {
          this.updateListQuery({
            review: value
          })
        }
      },
      contact: {
        get() {
          return this.$store.state.active.listQuery.contact;
        },
        set(value) {
          if (!value) {
            value = null;
          }
          this.updateListQuery({
            contact: value
          })
        }
      },
      userName: {
        get() {
          return this.$store.state.active.listQuery.userName;
        },
        set(value) {
          if (!value) {
            value = null;
          }
          this.updateListQuery({
            userName: value
          })
        }
      }
    }
  }
</script>

<style>
  .filter-container-wechat {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    min-height: 60px;
  }

  .filter-container-wechat > div {
    margin-right: 20px;
    margin-bottom: 10px;
  }

  .pic_dialog {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

