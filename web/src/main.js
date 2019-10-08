import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

Vue.filter('join', function (value) {
  if (!value) return ''
  return value.join(", ");
})


new Vue({
  render: h => h(App),
}).$mount('#app')