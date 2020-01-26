const width = window.innerWidth
const height = window.innerHeight

document.body.style.position = 'relative'
document.body.style.backgroundColor = 'black'

const createLayer = () => {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', width)
    canvas.setAttribute('height', height)
    canvas.style.position = 'absolute'
    document.body.append(canvas)
    return canvas.getContext('2d')
}

const ctx = createLayer()
const ctx2 = createLayer()

const xRange = [0, 10 * Math.PI]
const yRange = [-1, 1]

const scaleX = d3
    .scaleLinear()
    .domain(xRange)
    .range([0, width])

const scaleY = d3
    .scaleLinear()
    .domain(yRange)
    .range([height, 0])

ctx.strokeStyle = '#ffffff50'
ctx.moveTo(scaleX(xRange[0]), scaleY(Math.sin(xRange[0])))
for (let x = xRange[0]; x <= xRange[1]; x += 0.01) {
    ctx.lineTo(scaleX(x), scaleY(Math.sin(x)))
}
ctx.stroke()

const drawDot = (t, s) => {
    ctx2.beginPath()
    const x = (xRange[0] + t * 0.00001 * s) % xRange[1]
    ctx2.moveTo(scaleX(x), scaleY(Math.sin(x)))
    ctx2.arc(scaleX(x), scaleY(Math.sin(x)), 5, 0, 2 * Math.PI)
    ctx2.fill()
} 

const numDots = 100

d3.timer(t => {
    ctx2.clearRect(0, 0, width, height)
    for (i = 1; i <= numDots; i++) {
        ctx2.fillStyle = d3.interpolateSpectral(i / numDots)
        drawDot(t, i)
    }
})
