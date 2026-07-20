export const routes = {
  home: '/',
  howItWorks: '/how-it-works',
  login: '/login',
  register: '/register',

  student: {
    dashboard: '/student',
    applications: '/student/applications',
    newRequest: '/student/requests/new',
    requestDetail: (requestId: string | number) => `/student/requests/${requestId}`,
  },

  chair: {
    dashboard: '/chair',
    forceChangePassword: '/chair/force-change-password',
    reviewPage: (requestId: string | number) => `/chair/review/${requestId}`,
  },

  logout: '/logout',
} as const

export function routePath(path: string) {
  return path.replace(/^\//, '')
}