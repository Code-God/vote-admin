// import Cookies from 'js-cookie'

import {
  getUserList,
  updateUserInfo,
  deleteUser
} from '@/api/active'
import {
  parseTime
} from '@/utils'
import {
  Message
} from 'element-ui'

const active = {
  state: {
    userList: [],
    listLoading: true,
    total: null,
    laudSum: '0',
    listQuery: {
      pageIndex: 1,
      pageSize: 10,
      review: null,
      contact: null,
      userName: null,
      order: null,
      orderBy: null
    },
    timeDate: []
  },
  mutations: {
    SET_USERLIST: (state, payload) => {
      state.userList = payload.userList;
      state.total = payload.userCount.count;
      state.laudSum = payload.userCount.laudSum;
    },
    SET_LOADING: (state, payload) => {
      state.listLoading = payload
    },
    SET_LISTQUERY: (state, payload) => {
      state.listQuery = payload
    },
    SET_TIMEDATE: (state, payload) => {
      state.timeDate = payload
    },
    SET_SORTREVIEW: (state, payload) => {
      state.listQuery.review = payload;
    },
    RESET_LISTQUERY: (state, payload) => {
      state.listQuery = {
        pageIndex: 1,
        pageSize: 10,
        review: null,
        contact: null,
        userName: null,
        order: null,
        orderBy: null
      };
      state.timeDate = []
    }
  },
  actions: {
    getUserList(store) {
      return new Promise((resolve, reject) => {
        store.commit('SET_LOADING', true);
        let query = {};
        if (store.state.timeDate.length > 0) {
          query = Object.assign({ ...store.state.listQuery
          }, {
            startDate: parseTime(store.state.timeDate[0]),
            endDate: parseTime(store.state.timeDate[1])
          })
        } else {
          query = Object.assign({ ...store.state.listQuery
          });
          if (query.review === '') {
            Reflect.deleteProperty(query, 'review');
          }
          if (query.userName === '') {
            Reflect.deleteProperty(query, 'userName');
          }
          if (query.contact === '') {
            Reflect.deleteProperty(query, 'contact');
          }
          if (query.order === '') {
            Reflect.deleteProperty(query, 'order');
          }
          if (query.orderBy === '') {
            Reflect.deleteProperty(query, 'orderBy');
          }
        }
        getUserList(query).then(response => {
          const data = response.data;
          data.userList.forEach(element => {
            element.laud = parseInt(element.laud)
          });
          store.commit('SET_USERLIST', data);
          this.commit('SET_LOADING', false);
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    updateUserInfo({
      commit
    }, payload) {
      return new Promise((resolve, reject) => {
        updateUserInfo(payload).then(response => {
          Message({
            message: response.message,
            type: 'success',
            duration: 3 * 1000
          });
          resolve(response);
        }).catch(error => {
          reject(error)
        })
      })
    },
    deleteUser({
      commit
    }, payload) {
      return new Promise((resolve, reject) => {
        deleteUser(payload).then(response => {
          Message({
            message: response.message,
            type: 'success',
            duration: 3 * 1000
          });
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    updateListQuery(store, payload) {
      return new Promise((resolve, reject) => {
        store.commit('SET_LISTQUERY', Object.assign({ ...store.state.listQuery
        }, payload));
        resolve()
      })
    },
    updateTimeDate(store, payload) {
      return new Promise((resolve, reject) => {
        store.commit('SET_TIMEDATE', payload);
        resolve()
      })
    },
    resetQuery({ commit }, payload) {
      this.commit('RESET_LISTQUERY')
    }
  }
}

export default active
