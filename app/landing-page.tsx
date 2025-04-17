"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Gamepad2, Shield, Zap, Users, LogIn } from "lucide-react"
import AnimatedBackground from "@/components/animated-background"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-black text-white overflow-hidden">
      {/* Simple animated background instead of particles */}
      <AnimatedBackground />

      {/* Hero Section */}
      <div className="relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

          {/* Free Fire themed background elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[15%] left-[10%] w-72 h-72 bg-red-500/20 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <Gamepad2 className="h-6 w-6 text-blue-400 mr-2" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Exe Toolz
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-navy-900 hover:bg-white/90">Get Started</Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Ultimate{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Free Fire
              </span>{" "}
              Tools Hub
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-white/70 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Enhance your Free Fire experience with our comprehensive suite of tools. Check ban status, view player
              profiles, boost stats, and more.
            </motion.p>
          </div>
        </div>

        {/* Floating Game Elements */}
        <motion.div
          className="absolute top-40 right-10 hidden lg:block"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.7, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <img
            src="/placeholder.svg?height=120&width=120"
            alt="Free Fire Character"
            className="h-30 w-30 object-contain"
          />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-10 hidden lg:block"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.7, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <img
            src="/placeholder.svg?height=100&width=100"
            alt="Free Fire Weapon"
            className="h-24 w-24 object-contain"
          />
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="bg-navy-950/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Free Fire Tools</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you get the most out of your Free Fire gaming experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-blue-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ban Checker</h3>
              <p className="text-white/70">Check if a Free Fire account has been banned and view ban details.</p>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-purple-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Player Info</h3>
              <p className="text-white/70">Get detailed information about any Free Fire player profile.</p>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-green-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Zap className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Profile Booster</h3>
              <p className="text-white/70">Boost your profile statistics with our advanced tools.</p>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-amber-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Gamepad2 className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Guest Tools</h3>
              <p className="text-white/70">Manage guest accounts and generate tokens for Free Fire.</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* About Section - New */}
      <div className="py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About Exe Toolz</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              The ultimate platform for Free Fire players looking to enhance their gaming experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4 text-white">Why Choose Exe Toolz?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-900/30 p-2 rounded-full mt-1">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Secure & Reliable</h4>
                    <p className="text-white/70">
                      All our tools are designed with security in mind, ensuring your account information is always
                      protected.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-900/30 p-2 rounded-full mt-1">
                    <Zap className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Constantly Updated</h4>
                    <p className="text-white/70">
                      We regularly update our tools to ensure compatibility with the latest Free Fire updates and
                      features.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-900/30 p-2 rounded-full mt-1">
                    <Users className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Community Driven</h4>
                    <p className="text-white/70">
                      Built by gamers for gamers, our platform is constantly evolving based on community feedback.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-4 text-white">Platform Statistics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/80">Active Users</span>
                    <span className="font-medium text-white">10,000+</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: "85%" }}
                      transition={{ duration: 1, delay: 0.2 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/80">Tools Available</span>
                    <span className="font-medium text-white">6</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: "60%" }}
                      transition={{ duration: 1, delay: 0.3 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/80">User Satisfaction</span>
                    <span className="font-medium text-white">95%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: "95%" }}
                      transition={{ duration: 1, delay: 0.4 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Portfolio/Showcase Section - Improved */}
      <div className="py-20 relative bg-navy-950/70">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tool Showcase</h2>
            <p className="text-white/70 max-w-2xl mx-auto">Take a look at our powerful Free Fire tools in action</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="aspect-video bg-navy-900/50 relative">
                <img
                  src="/placeholder.svg?height=300&width=600"
                  alt="Ban Checker Tool"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="p-4">
                    <h3 className="text-xl font-bold">Ban Checker</h3>
                    <p className="text-sm text-white/70">Verify account status instantly</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-white/80">
                  Our ban checker tool allows you to instantly verify if a Free Fire account has been banned. Get
                  detailed information about the ban status, duration, and reason.
                </p>
                <div className="mt-4 flex justify-end">
                  <Link href="/ban-checker">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Try It Now
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="aspect-video bg-navy-900/50 relative">
                <img
                  src="/placeholder.svg?height=300&width=600"
                  alt="Player Info Tool"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="p-4">
                    <h3 className="text-xl font-bold">Player Info</h3>
                    <p className="text-sm text-white/70">Detailed player statistics</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-white/80">
                  Get comprehensive information about any Free Fire player. View their stats, rank, guild information,
                  and more with our advanced player info tool.
                </p>
                <div className="mt-4 flex justify-end">
                  <Link href="/player-info">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Try It Now
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Testimonials Section - New */}
      <div className="py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Users Say</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Hear from our community about how Exe Toolz has enhanced their Free Fire experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Alex",
                role: "Pro Player",
                quote:
                  "The ban checker tool saved me from buying a banned account. Definitely a must-have for serious players!",
              },
              {
                name: "Sarah",
                role: "Content Creator",
                quote:
                  "I use the player info tool for all my videos. It gives me detailed stats that I can't find anywhere else.",
              },
              {
                name: "Mike",
                role: "Casual Gamer",
                quote:
                  "The guest combiner tool is amazing! I was able to recover all my guest accounts in just a few minutes.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="mb-4">
                  <svg
                    className="h-8 w-8 text-blue-400 opacity-50"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                <p className="text-white/80 mb-6">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-white">{testimonial.name}</h4>
                    <p className="text-sm text-white/60">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy-950 py-8 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Gamepad2 className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Exe Toolz
              </span>
            </div>
            <div className="flex gap-6">
              <Link href="/terms" className="text-white/70 hover:text-white text-sm">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="text-white/70 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <a
                href="https://instagram.com/rahulexez"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white text-sm"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-white/50 text-sm">
            <p>© {new Date().getFullYear()} Exe Toolz. All rights reserved.</p>
            <p className="mt-1 text-xs">
              Not affiliated with Garena or Free Fire. All game content belongs to their respective owners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
