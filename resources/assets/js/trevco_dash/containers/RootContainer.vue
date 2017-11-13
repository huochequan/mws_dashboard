<template>
  <div class="app">
    <!-- <AppHeader/> -->
    <div class="app-body">
      <!-- <Sidebar :navItems="nav"/> -->
      <main class="main">
        <!-- <breadcrumb :list="list"/> -->
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
// import { Header as AppHeader, Sidebar, Footer as AppFooter, Breadcrumb } from '../components/'

export default {
  name: 'RootContainer',
  components: {
  },
  data () {
    return {
    }
  },
  computed: {
    name () {
      return this.$route.name
    },
    list () {
      return this.$route.matched
    }
  }
}
</script>
