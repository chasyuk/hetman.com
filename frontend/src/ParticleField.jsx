import { useEffect, useRef } from 'react'

export function ParticleField({ particleCount = 60, className = '' }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        let animId

        const particles = []

        const resize = () => {
            canvas.width = canvas.offsetWidth * devicePixelRatio
            canvas.height = canvas.offsetHeight * devicePixelRatio
            ctx.scale(devicePixelRatio, devicePixelRatio)
        }

        const init = () => {
            resize()
            const w = canvas.offsetWidth
            const h = canvas.offsetHeight
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: Math.random() * 1.8 + 0.4,
                    dx: (Math.random() - 0.5) * 0.3,
                    dy: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.5 + 0.15,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.02 + 0.005,
                })
            }
        }

        const draw = () => {
            const w = canvas.offsetWidth
            const h = canvas.offsetHeight
            ctx.clearRect(0, 0, w, h)

            for (const p of particles) {
                p.x += p.dx
                p.y += p.dy
                p.pulse += p.pulseSpeed

                if (p.x < -10) p.x = w + 10
                if (p.x > w + 10) p.x = -10
                if (p.y < -10) p.y = h + 10
                if (p.y > h + 10) p.y = -10

                const flicker = Math.sin(p.pulse) * 0.2 + 0.8
                const alpha = p.opacity * flicker

                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(217, 119, 6, ${alpha})`
                ctx.fill()

                // subtle glow
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(217, 119, 6, ${alpha * 0.12})`
                ctx.fill()
            }

            // connection lines between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 120) {
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(217, 119, 6, ${0.06 * (1 - dist / 120)})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }

            animId = requestAnimationFrame(draw)
        }

        init()
        draw()

        window.addEventListener('resize', resize)
        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', resize)
        }
    }, [particleCount])

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    )
}
