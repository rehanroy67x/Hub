"use client"

import { useEffect, useRef } from "react"

interface ParticlesBackgroundProps {
  id?: string
}

export default function ParticlesBackground({ id = "particles-js" }: ParticlesBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load particles.js script
    const script = document.createElement("script")
    script.src = "/particles.js"
    script.async = true
    document.body.appendChild(script)

    // Initialize particles once script is loaded
    script.onload = () => {
      if (typeof (window as any).pJS !== "undefined") {
        ;(window as any).pJS(id, {
          particles: {
            number: {
              value: 80,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: ["#3b82f6", "#6366f1", "#8b5cf6", "#4f46e5"],
            },
            shape: {
              type: "circle",
              stroke: {
                width: 0,
                color: "#000000",
              },
            },
            opacity: {
              value: 0.5,
              random: false,
              anim: {
                enable: false,
                speed: 1,
                opacity_min: 0.1,
                sync: false,
              },
            },
            size: {
              value: 3,
              random: true,
              anim: {
                enable: false,
                speed: 40,
                size_min: 0.1,
                sync: false,
              },
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#6366f1",
              opacity: 0.4,
              width: 1,
            },
            move: {
              enable: true,
              speed: 2,
              direction: "none",
              random: false,
              straight: false,
              out_mode: "out",
              bounce: false,
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: {
                enable: true,
                mode: "grab",
              },
              onclick: {
                enable: true,
                mode: "push",
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 140,
                line_linked: {
                  opacity: 1,
                },
              },
              push: {
                particles_nb: 4,
              },
            },
          },
          retina_detect: true,
        })
      }
    }

    return () => {
      document.body.removeChild(script)
      // Clean up particles instance if it exists
      if ((window as any).pJS && (window as any).pJS[id]) {
        delete (window as any).pJS[id]
      }
    }
  }, [id])

  return (
    <div
      id={id}
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ position: "absolute", width: "100%", height: "100%" }}
    >
      <canvas className="particles-js-canvas-el" style={{ width: "100%", height: "100%" }}></canvas>
    </div>
  )
}
