"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/ui/dashboard-layout"
import { FileText } from "lucide-react"

export default function TermsAndConditions() {
  return (
    <DashboardLayout
      title="Terms and Conditions"
      description="Please read these terms carefully before using our services"
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Terms and Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>Last Updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-xl font-semibold text-white mt-6">1. Acceptance of Terms</h2>

            <p>
              By accessing or using Free Fire Tools, you agree to be bound by these Terms and Conditions. If you
              disagree with any part of the terms, you may not access the service.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6">2. Description of Service</h2>

            <p>
              Free Fire Tools provides utilities for Free Fire game including ban checking, player information
              retrieval, profile visit tools, and guest account combining. These tools are provided for educational and
              informational purposes only.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6">3. Use Limitations</h2>

            <p>
              You agree to use our services only for lawful purposes and in accordance with the Terms. You agree not to
              use our services:
            </p>
            <ul className="list-disc pl-6 mt-2 text-white/80">
              <li>In any way that violates any applicable national or international law or regulation</li>
              <li>To exploit, harm, or attempt to exploit or harm minors in any way</li>
              <li>
                To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the service
              </li>
              <li>To engage in any activity that interferes with or disrupts the service</li>
              <li>To violate Garena Free Fire's terms of service</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-6">4. Disclaimer</h2>

            <p>
              The tools and information provided are for educational purposes only. We are not affiliated with, endorsed
              by, or officially connected to Garena or Free Fire. All game-related content, including names, brands, and
              images, are trademarks and copyrights of their respective owners.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6">5. Limitation of Liability</h2>

            <p>
              In no event shall Free Fire Tools be liable for any indirect, incidental, special, consequential or
              punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible
              losses, resulting from your access to or use of or inability to access or use the service.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6">6. Changes to Terms</h2>

            <p>
              We reserve the right to modify or replace these Terms at any time. It is your responsibility to review
              these Terms periodically for changes.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6">7. Contact Us</h2>

            <p>If you have any questions about these Terms, please contact us via Instagram @rahulexez.</p>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}
