import { motion } from "framer-motion"
import { GithubLogo, LinkedinLogo, TwitterLogo, Heart } from "@phosphor-icons/react"

export function Footer() {
  const socialLinks = [
    { icon: GithubLogo, href: "https://github.com/valentin", label: "GitHub" },
    { icon: LinkedinLogo, href: "https://linkedin.com/in/valentin", label: "LinkedIn" },
    { icon: TwitterLogo, href: "https://twitter.com/valentin", label: "Twitter" }
  ]

  return (
    <footer className="bg-muted/30 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="flex space-x-6">
            {socialLinks.map((link) => {
              const Icon = link.icon
              return (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-6 w-6" />
                </motion.a>
              )
            })}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" weight="fill" />
            <span>by Valentin</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Valentin. All rights reserved.
          </div>
        </motion.div>
      </div>
    </footer>
  )
}