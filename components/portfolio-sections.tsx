"use client"

import { motion } from "framer-motion"
import { Code, Shield, Zap, Send } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function PortfolioSections() {
  return (
    <div className="space-y-24 py-12">
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </div>
  )
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      className="text-center mb-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
        {title}
      </h2>
      <p className="text-white/60 max-w-2xl mx-auto">{subtitle}</p>
    </motion.div>
  )
}

function ProjectsSection() {
  const projects = [
    {
      title: "Free Fire Ban Checker",
      description: "A tool to check if a Free Fire player account has been banned.",
      icon: <Shield className="h-10 w-10 text-purple-400" />,
      tags: ["Next.js", "API Integration", "Framer Motion"],
    },
    {
      title: "Portfolio Website",
      description: "Professional portfolio showcasing developer skills and projects.",
      icon: <Code className="h-10 w-10 text-blue-400" />,
      tags: ["React", "Tailwind CSS", "TypeScript"],
    },
    {
      title: "Game Analytics Dashboard",
      description: "Real-time analytics dashboard for game performance metrics.",
      icon: <Zap className="h-10 w-10 text-green-400" />,
      tags: ["Next.js", "Chart.js", "Real-time Data"],
    },
  ]

  return (
    <section id="projects" className="container mx-auto px-4">
      <SectionTitle title="Featured Projects" subtitle="Explore some of my recent work and technical implementations" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full backdrop-blur-sm bg-white/5 border-white/10 overflow-hidden group">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-4">{project.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors">
                  {project.title}
                </h3>
                <p className="text-white/70 mb-4 flex-grow">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function SkillsSection() {
  const skills = [
    {
      category: "Frontend Development",
      items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    },
    {
      category: "Backend Development",
      items: ["Node.js", "Express", "API Design", "Authentication", "Database Design"],
    },
    {
      category: "Tools & Platforms",
      items: ["Git", "GitHub", "Vercel", "VS Code", "Figma"],
    },
  ]

  return (
    <section
      id="skills"
      className="container mx-auto px-4 bg-gradient-to-b from-transparent to-purple-900/20 py-16 rounded-3xl"
    >
      <SectionTitle title="Technical Skills" subtitle="Technologies and tools I specialize in" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {skills.map((skillGroup, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-white">{skillGroup.category}</h3>
            <ul className="space-y-2">
              {skillGroup.items.map((skill, i) => (
                <li key={i} className="flex items-center text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2"></div>
                  {skill}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section id="contact" className="container mx-auto px-4">
      <SectionTitle title="Get In Touch" subtitle="Interested in working together? Let's connect!" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8"
      >
        <div className="text-center mb-8">
          <p className="text-white/80 mb-6">
            I'm currently available for freelance work and open to new opportunities. If you have a project that needs
            some creative coding, feel free to reach out!
          </p>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none px-6 py-6 h-auto">
            <Send className="mr-2 h-5 w-5" />
            Send Message
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <h4 className="text-white font-medium mb-1">Email</h4>
            <a href="mailto:contact@example.com" className="text-purple-400 hover:text-purple-300 text-sm">
              contact@example.com
            </a>
          </div>
          <div className="p-4">
            <h4 className="text-white font-medium mb-1">LinkedIn</h4>
            <a href="https://linkedin.com" className="text-purple-400 hover:text-purple-300 text-sm">
              /in/developer
            </a>
          </div>
          <div className="p-4">
            <h4 className="text-white font-medium mb-1">GitHub</h4>
            <a href="https://github.com" className="text-purple-400 hover:text-purple-300 text-sm">
              @developer
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
