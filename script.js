import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'

function initializeForceSimulation(svgSelector, datafile, corrSvg, tooltip1Id, tooltip2Id) {
	var width = window.innerWidth * 0.5,
		height = 500

	fetch(datafile)
		.then((response) => response.json())
		.then((data) => {
			const nodes = data.nodes.map((node) => ({
				name: node.name,
				value: +node.value,
				colour: node.colour,
			}))

			const links = data.links.map((link) => ({
				source: link.source,
				target: link.target,
				value: +link.value,
			}))

			// Config
			var strength = -300
			var distance = 10

			var simulation = d3
				.forceSimulation(nodes)
				.force('charge', d3.forceManyBody().strength(strength))
				.force('center', d3.forceCenter(width / 2, height / 2))
				.force('collide', d3.forceCollide().radius(35))
				.force('link', d3.forceLink().links(links).distance(distance))

			var zoom = d3.zoom().scaleExtent([0.1, 10]).on('zoom', zoomed)

			var svg = d3.select(svgSelector).attr('width', width).attr('height', height).call(zoom) // Call the zoom function on the SVG element

			var container = svg.append('g') // Create a container for the nodes and links

			function updateLinks() {
				var u = container
					.selectAll('.link')
					.data(links)
					.join('line')
					.attr('class', 'link')
					.attr('x1', function (d) {
						return d.source.x
					})
					.attr('y1', function (d) {
						return d.source.y
					})
					.attr('x2', function (d) {
						return d.target.x
					})
					.attr('y2', function (d) {
						return d.target.y
					})
					.attr('stroke', '#e3e1e1')
			}

			function updateNodes() {
				let u = container
					.selectAll('.node')
					.data(nodes)
					.join('text')
					.attr('class', 'node')
					.text(function (d) {
						return d.name
					})
					.attr('x', function (d) {
						return d.x
					})
					.attr('y', function (d) {
						return d.y
					})
					.attr('dy', function (d) {
						return 15
					})
					.attr('fill', function (d) {
						return d.colour
					})

				container
					.selectAll('circle')
					.data(nodes)
					.join('circle')
					.attr('r', 5)
					.attr('cx', function (d) {
						return d.x
					})
					.attr('cy', function (d) {
						return d.y
					})
					.attr('fill', function (d) {
						return d.colour
					})
					.on('click', function (event, d) {
						var nodeName = d.name //Get the name of the node clicked

						container.selectAll('.link').attr('stroke', function (link) {
							//Change color of links based on the node clicked
							if (link.source === d || link.target === d) {
								console.log(nodeName)
								d3.select(corrSvg)
									.selectAll('.link')
									.attr('stroke', function (linked) {
										if (linked.source.name === nodeName || linked.target.name === nodeName) {
											return d.colour
										} else {
											return '#ccc'
										}
									})

								return d.colour
							} else {
								return '#ccc'
							}
						})

						// Update the tooltip, with the value of the node clicked and the corresponding node in the other graph

						let selectedNode = d3
							.select(corrSvg)
							.selectAll('.node')
							.filter(function (d) {
								return d.name === nodeName
							})

						let otherVal
						if (!selectedNode.empty()) {
							otherVal = selectedNode.datum().value
							document.querySelector('#' + tooltip2Id).innerHTML =
								'Number of scenes ' +
								capitalizeFirstLetter(selectedNode.datum().name) +
								' appeared in: ' +
								otherVal
						} else {
							document.querySelector('#' + tooltip2Id).innerHTML = 'Number of scenes: 0'
						}

						document.querySelector('#' + tooltip1Id).innerHTML =
							'Number of scenes ' + capitalizeFirstLetter(d.name) + ' appeared in: ' + d.value
					})
			}

			function capitalizeFirstLetter(string) {
				return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
			}

			function ticked() {
				updateLinks()
				updateNodes()
			}

			function zoomed(event) {
				container.attr('transform', event.transform)
			}

			function updateDistance() {
				console.log(svgSelector)
				if (svgSelector === '#svg1') {
					var distanceTag = '.distance1'
				} else {
					var distanceTag = '.distance2'
				}
				document.querySelector(distanceTag).addEventListener('input', function (event) {
					distance = event.target.value
					console.log(distance)

					simulation.force('link').distance(distance)
					simulation.alpha(1).restart()
				})
			}

			updateDistance()

			const valueSliderTag = svgSelector === '#svg1' ? '.valueSlider1' : '.valueSlider2'
			document.querySelector(valueSliderTag).addEventListener('input', function (event) {
				const valueThreshold = +event.target.value

				// Determine visibility based on valueThreshold for nodes and links
				const updateVisibility = (node) => (node.value > valueThreshold ? 'visible' : 'hidden')

				// Update visibility for circles
				container.selectAll('circle').style('visibility', (d) => updateVisibility(d))

				// For nodes (text labels) and links, you need to similarly update their visibility
				container.selectAll('.node').style('visibility', (d) => updateVisibility(d))
				container
					.selectAll('.link')
					.style('visibility', (link) =>
						updateVisibility(link.source) === 'visible' && updateVisibility(link.target) === 'visible'
							? 'visible'
							: 'hidden'
					)
			})

			simulation.on('tick', ticked)
		})
		.catch((error) => console.error('Error fetching JSON:', error))
}

export default initializeForceSimulation
