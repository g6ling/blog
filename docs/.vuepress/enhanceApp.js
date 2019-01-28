import Vuex from 'vuex'

export default ({
  Vue, // the version of Vue being used in the VuePress app
  // options, // the options for the root Vue instance
  router, // the router instance for the app
  // siteData // site metadata
}) => {
  Vue.use(Vuex)

  const store = new Vuex.Store({
    state: { 
      sidebar: {
        mode: 'all', // 'tag', 'tags', 'group',
        name: 'All Posts',
        option: '', // 'tag 이름', 'group 이름'
      }
    },
    mutations: {
      changeSidebar: (state, sidebar) => { state.sidebar = sidebar }
    },
    actions: {
      changeSidebar: ({ commit }, sidebar) =>  { commit('changeSidebar', sidebar) }
    },
  })
  Vue.mixin({ store })
  
  // router.afterEach((to, from) => {
  //   if (from.path !== to.path) {
  //     if (typeof window !== 'undefined' && window.DISQUS) {
  //       setTimeout(() => {
  //         console.log('DISQUS is exists and try to load!')
  //         window.DISQUS.reset({ reload: true })
  //       }, 0)
  //     }
  //   } else {
  //     // same page but hash changed
  //   }
  // })
}