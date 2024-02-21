import initializeForceSimulation from './script.js'
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'

let data1 = document.getElementById('dataSelect1').value
let data2 = document.getElementById('dataSelect2').value

initializeForceSimulation('#svg1', data1, '#svg2', 'tooltip1', 'tooltip2')
initializeForceSimulation('#svg2', data2, '#svg1', 'tooltip2', 'tooltip1')

document.getElementById('dataSelect1').addEventListener('change', function () {
	let newData1 = document.getElementById('dataSelect1').value
	d3.select('#svg1').selectAll('*').remove()
	initializeForceSimulation('#svg1', newData1, '#svg2', 'tooltip1', 'tooltip2')
})

document.getElementById('dataSelect2').addEventListener('change', function () {
	let newData2 = document.getElementById('dataSelect2').value
	d3.select('#svg2').selectAll('*').remove()
	initializeForceSimulation('#svg2', newData2, '#svg1', 'tooltip2', 'tooltip1')
})
