"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Menu, X, Github, Linkedin, Mail } from "lucide-react"

export function PortfolioHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    closed: { opacity: 0, y: -10 },
    open: { opacity: 1, y: 0 },
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Developer Portfolio
          </h1>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          className="hidden md:flex items-center space-x-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <NavLink href="#projects">Projects</NavLink>
          <NavLink href="#skills">Skills</NavLink>
          <NavLink href="#contact">Contact</NavLink>
          <div className="flex items-center space-x-3">
            <SocialIcon icon={<Github size={18} />} href="https://github.com" />
            <SocialIcon icon={<Linkedin size={18} />} href="https://linkedin.com" />
          </div>
        </motion.nav>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          onClick={toggleMenu}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        className="md:hidden absolute w-full bg-black/80 backdrop-blur-lg"
        initial="closed"
        animate={isMenuOpen ? "open" : "closed"}
        variants={menuVariants}
      >
        <motion.nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
          <motion.div variants={itemVariants}>
            <NavLink href="#projects" mobile onClick={toggleMenu}>
              Projects
            </NavLink>
          </motion.div>
          <motion.div variants={itemVariants}>
            <NavLink href="#skills" mobile onClick={toggleMenu}>
              Skills
            </NavLink>
          </motion.div>
          <motion.div variants={itemVariants}>
            <NavLink href="#contact" mobile onClick={toggleMenu}>
              Contact
            </NavLink>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center space-x-4 pt-4">
            <SocialIcon icon={<Github size={20} />} href="https://github.com" />
            <SocialIcon icon={<Linkedin size={20} />} href="https://linkedin.com" />
            <SocialIcon icon={<Mail size={20} />} href="mailto:contact@example.com" />
          </motion.div>
        </motion.nav>
      </motion.div>
    </header>
  )
}

function NavLink({
  href,
  children,
  mobile = false,
  onClick,
}: {
  href: string
  children: React.ReactNode
  mobile?: boolean
  onClick?: () => void
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`${
        mobile
          ? "text-lg font-medium text-white hover:text-purple-300 transition-colors block py-2"
          : "text-sm font-medium text-white/80 hover:text-white transition-colors"
      }`}
    >
      {children}
    </a>
  )
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {icon}
    </motion.a>
  )
}
