import request from '@/utils/request'

export function loginByUsername(username, password) {
  const data = {
    username,
    password
  }
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/loginOut',
    method: 'post'
  })
}

// export function getUserInfo(id) {
//   return request({
//     url: '/user/info',
//     method: 'get',
//     params: { id }
//   })
// }

