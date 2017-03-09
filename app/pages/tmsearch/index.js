import Vue from 'vue'
import FastClick from 'fastclick'
import App from './app'

require('../../assets/tmsearch.less')

FastClick.attach(document.body)

new Vue({
  el: '#app',
  render: h => h(App)
})
