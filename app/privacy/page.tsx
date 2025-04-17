"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/ui/dashboard-layout"
import { Shield } from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <DashboardLayout title="Privacy Policy" description="How we handle your data and protect your privacy">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>Last Updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-xl font-semibold text-white mt-6">1. Information We Collect</h2>

            <p>When you use our Free Fire Tools, we may collect the following information:</p>
            <ul className="list-disc pl-6 mt-2 text-white/80">
              <li>Free Fire player IDs that you input into our tools</li>
              <li>Region information related to the player IDs</li>
              <li>Guest account data that you upload for processing</li>
              <li>Usage data such as how you interact with our tools</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-6">2. How We Use Your Information</h2>

            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 text-white/80">
              <li>Provide and maintain our services</li>
              <li>Process your requests for player information, ban status, or other Free Fire data</li>
              <li>Improve and optimize our tools and services</li>
              <li>Detect and prevent technical issues or abuse</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-6">3. Data Security</h2>

            <p>
              We implement appropriate security measures to protect your data. However, no method of transmission over
              the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6">4. Third-Party Services</h2>

            <p>
              Our tools interact with Free Fire's public APIs and other third-party services to retrieve player
              information. These third-party services have their own privacy policies, and we recommend you review their
              terms.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6">5. Data Retention</h2>

            <p>
              We retain the information you provide only for as long as necessary to fulfill the purposes outlined in
              this Privacy Policy. We will retain and use your information to the extent necessary to comply with our
              legal obligations, resolve disputes, and enforce our policies.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6">6. Children's Privacy</h2>

            <p>
              Our services are not intended for use by children under the age of 13. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and you are aware that your
              child has provided us with personal information, please contact us.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6">7. Changes to This Privacy Policy</h2>

            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6">8. Contact Us</h2>

            <p>If you have any questions about this Privacy Policy, please contact us via Instagram @rahulexez.</p>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}
