import Vue from 'vue'
import Router from 'vue-router'

// Containers
import RootContainer from '../containers/RootContainer'

// Views
import Dashboard from '../views/Dashboard'
import Tasklists from '../views/Tasklists'
import Tasklist from '../views/Tasklist'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/',
      redirect: 'dashboard',
      name: 'Home',
      component: RootContainer,
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: Dashboard
        },
      ]
    }
  ]
})
