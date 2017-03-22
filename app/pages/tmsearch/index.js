import '../../assets/tmsearch.less'

import Vue from 'vue'
import FastClick from 'fastclick'
import App from './app'

FastClick.attach(document.body)

new Vue({
  el: '#app',
  render: h => h(App)
})
