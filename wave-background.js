import { createNoise2D } from 'https://cdn.jsdelivr.net/npm/simplex-noise@4.0.3/+esm'

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('waveBackground')
    const svg = document.getElementById('waveBackgroundSvg')
    const pointer = container?.querySelector('.wave-background__pointer')

    if (!(container instanceof HTMLDivElement) || !(svg instanceof SVGSVGElement)) {
        return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    const noise2D = createNoise2D()
    const paths = []
    const lines = []
    const mouse = {
        x: window.innerWidth * 0.55,
        y: window.innerHeight * 0.3,
        lx: window.innerWidth * 0.55,
        ly: window.innerHeight * 0.3,
        sx: window.innerWidth * 0.55,
        sy: window.innerHeight * 0.3,
        vs: 0,
        a: 0,
        set: false,
    }

    let bounds = null
    let animationFrameId = null

    const config = {
        baseStroke: 'rgba(110, 235, 255, 0.26)',
        gapX: isCoarsePointer ? 30 : 22,
        gapY: isCoarsePointer ? 24 : 18,
        amplitudeX: prefersReducedMotion ? 6 : isCoarsePointer ? 8 : 11,
        amplitudeY: prefersReducedMotion ? 3 : isCoarsePointer ? 4 : 6,
        cursorRange: isCoarsePointer ? 110 : 180,
        cursorForce: isCoarsePointer || prefersReducedMotion ? 0 : 0.00032,
        driftX: prefersReducedMotion ? 0 : 0.007,
        driftY: prefersReducedMotion ? 0 : 0.003,
    }

    const moved = (point, withCursorForce = true) => ({
        x: point.x + point.wave.x + (withCursorForce ? point.cursor.x : 0),
        y: point.y + point.wave.y + (withCursorForce ? point.cursor.y : 0),
    })

    const updatePointerVars = () => {
        container.style.setProperty('--wave-x', `${mouse.sx}px`)
        container.style.setProperty('--wave-y', `${mouse.sy}px`)

        if (pointer) {
            pointer.style.opacity = prefersReducedMotion || isCoarsePointer ? '0' : '0.34'
        }
    }

    const setSize = () => {
        bounds = container.getBoundingClientRect()
        svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`)
        svg.setAttribute('width', `${bounds.width}`)
        svg.setAttribute('height', `${bounds.height}`)
        updatePointerVars()
    }

    const setLines = () => {
        if (!bounds) {
            return
        }

        lines.length = 0
        paths.forEach((path) => path.remove())
        paths.length = 0

        const overscanWidth = bounds.width + 180
        const overscanHeight = bounds.height + 60
        const totalLines = Math.ceil(overscanWidth / config.gapX)
        const totalPoints = Math.ceil(overscanHeight / config.gapY)
        const xStart = (bounds.width - config.gapX * totalLines) / 2
        const yStart = (bounds.height - config.gapY * totalPoints) / 2

        for (let lineIndex = 0; lineIndex < totalLines; lineIndex += 1) {
            const points = []

            for (let pointIndex = 0; pointIndex < totalPoints; pointIndex += 1) {
                points.push({
                    x: xStart + config.gapX * lineIndex,
                    y: yStart + config.gapY * pointIndex,
                    wave: { x: 0, y: 0 },
                    cursor: { x: 0, y: 0, vx: 0, vy: 0 },
                })
            }

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            path.setAttribute('fill', 'none')
            path.setAttribute('stroke', config.baseStroke)
            path.setAttribute('stroke-width', isCoarsePointer ? '1.1' : '1')
            path.setAttribute('stroke-linecap', 'round')

            svg.appendChild(path)
            paths.push(path)
            lines.push(points)
        }
    }

    const updateMousePosition = (clientX, clientY) => {
        if (!bounds) {
            return
        }

        mouse.x = clientX - bounds.left
        mouse.y = clientY - bounds.top

        if (!mouse.set) {
            mouse.sx = mouse.x
            mouse.sy = mouse.y
            mouse.lx = mouse.x
            mouse.ly = mouse.y
            mouse.set = true
        }

        updatePointerVars()
    }

    const movePoints = (time) => {
        lines.forEach((points) => {
            points.forEach((point) => {
                const move = noise2D(
                    (point.x + time * config.driftX) * 0.0028,
                    (point.y + time * config.driftY) * 0.0019,
                ) * 8

                point.wave.x = Math.cos(move) * config.amplitudeX
                point.wave.y = Math.sin(move) * config.amplitudeY

                if (!config.cursorForce) {
                    point.cursor.vx *= 0.9
                    point.cursor.vy *= 0.9
                    point.cursor.x += point.cursor.vx
                    point.cursor.y += point.cursor.vy
                    return
                }

                const dx = point.x - mouse.sx
                const dy = point.y - mouse.sy
                const distance = Math.hypot(dx, dy)
                const limit = Math.max(config.cursorRange, mouse.vs)

                if (distance < limit) {
                    const strength = 1 - distance / limit
                    const force = Math.cos(distance * 0.0014) * strength

                    point.cursor.vx += Math.cos(mouse.a) * force * limit * mouse.vs * config.cursorForce
                    point.cursor.vy += Math.sin(mouse.a) * force * limit * mouse.vs * config.cursorForce
                }

                point.cursor.vx += (0 - point.cursor.x) * 0.01
                point.cursor.vy += (0 - point.cursor.y) * 0.01
                point.cursor.vx *= 0.95
                point.cursor.vy *= 0.95
                point.cursor.x += point.cursor.vx
                point.cursor.y += point.cursor.vy
                point.cursor.x = Math.min(42, Math.max(-42, point.cursor.x))
                point.cursor.y = Math.min(42, Math.max(-42, point.cursor.y))
            })
        })
    }

    const drawLines = () => {
        lines.forEach((points, lineIndex) => {
            if (points.length < 2 || !paths[lineIndex]) {
                return
            }

            const firstPoint = moved(points[0], false)
            let definition = `M ${firstPoint.x} ${firstPoint.y}`

            for (let pointIndex = 1; pointIndex < points.length; pointIndex += 1) {
                const currentPoint = moved(points[pointIndex])
                definition += ` L ${currentPoint.x} ${currentPoint.y}`
            }

            paths[lineIndex].setAttribute('d', definition)
        })
    }

    const render = (time = 0) => {
        mouse.sx += (mouse.x - mouse.sx) * 0.08
        mouse.sy += (mouse.y - mouse.sy) * 0.08

        const dx = mouse.x - mouse.lx
        const dy = mouse.y - mouse.ly
        const distance = Math.hypot(dx, dy)

        mouse.vs += (distance - mouse.vs) * 0.12
        mouse.vs = Math.min(80, mouse.vs)
        mouse.lx = mouse.x
        mouse.ly = mouse.y
        mouse.a = Math.atan2(dy, dx)

        updatePointerVars()
        movePoints(time)
        drawLines()

        if (!prefersReducedMotion) {
            animationFrameId = window.requestAnimationFrame(render)
        }
    }

    const refresh = () => {
        if (animationFrameId !== null) {
            window.cancelAnimationFrame(animationFrameId)
            animationFrameId = null
        }

        setSize()
        setLines()
        render(0)
    }

    const handleMouseMove = (event) => {
        updateMousePosition(event.clientX, event.clientY)
    }

    const handleTouchMove = (event) => {
        const touch = event.touches[0]

        if (!touch) {
            return
        }

        updateMousePosition(touch.clientX, touch.clientY)
    }

    refresh()

    window.addEventListener('resize', refresh)

    if (!isCoarsePointer && !prefersReducedMotion) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    if (!prefersReducedMotion) {
        window.addEventListener('touchmove', handleTouchMove, { passive: true })
    }
})
