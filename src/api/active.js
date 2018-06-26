import request from '@/utils/request'

export function getUserList(query) {
  return request({
    url: '/userList',
    method: 'get',
    params: query
  })
}

export function updateUserInfo(params) {
  return request({
    url: '/user',
    method: 'put',
    data: {
      ...params
    }
  })
}

export function deleteUser(params) {
  return request({
    url: '/user',
    method: 'delete',
    data: {
      ...params
    }
  })
}
