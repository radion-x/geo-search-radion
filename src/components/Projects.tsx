import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, GithubLogo } from "@phosphor-icons/react"

type Project = {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  image: string
  liveUrl?: string
  githubUrl?: string
}

const projects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "Modern e-commerce solution with React, Node.js, and Stripe integration. Features include product management, user authentication, and order processing.",
    tags: ["React", "Node.js", "PostgreSQL", "Stripe", "TypeScript"],
    category: "Full-Stack",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&crop=center",
    liveUrl: "https://demo.example.com",
    githubUrl: "https://github.com/example/ecommerce"
  },
  {
    id: "2", 
    title: "Task Management App",
    description: "Collaborative task management tool with real-time updates, drag-and-drop functionality, and team collaboration features.",
    tags: ["React", "Socket.io", "MongoDB", "Express", "Tailwind"],
    category: "Full-Stack",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&crop=center",
    liveUrl: "https://tasks.example.com",
    githubUrl: "https://github.com/example/tasks"
  },
  {
    id: "3",
    title: "Weather Dashboard",
    description: "Beautiful weather application with location-based forecasts, interactive maps, and customizable widgets.",
    tags: ["React", "OpenWeather API", "Chart.js", "CSS Grid"],
    category: "Frontend", 
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&h=400&fit=crop&crop=center",
    liveUrl: "https://weather.example.com",
    githubUrl: "https://github.com/example/weather"
  },
  {
    id: "4",
    title: "Portfolio Website",
    description: "Minimalist portfolio design with smooth animations, responsive layout, and optimized performance.",
    tags: ["React", "Framer Motion", "Tailwind", "Vite"],
    category: "Frontend",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=center",
    liveUrl: "https://portfolio.example.com",
    githubUrl: "https://github.com/example/portfolio"
  },
  {
    id: "5",
    title: "REST API Service",
    description: "Scalable REST API with authentication, rate limiting, and comprehensive documentation. Built with best practices.",
    tags: ["Node.js", "Express", "JWT", "Docker", "Swagger"],
    category: "Backend",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop&crop=center",
    githubUrl: "https://github.com/example/api"
  },
  {
    id: "6",
    title: "Data Analytics Tool",
    description: "Interactive data visualization dashboard with real-time charts, filtering capabilities, and export functionality.",
    tags: ["React", "D3.js", "Python", "FastAPI", "PostgreSQL"],
    category: "Full-Stack",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center",
    liveUrl: "https://analytics.example.com",
    githubUrl: "https://github.com/example/analytics"
  }
]

const categories = ["All", "Full-Stack", "Frontend", "Backend"]

export function Projects() {
  const [activeCategory, setActiveCategory] = useState("All")
  
  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter(project => project.category === activeCategory)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A selection of my recent work, showcasing different technologies and approaches to solving complex problems.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className="transition-all duration-200"
            >
              {category}
            </Button>
          ))}
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project) => (
            <motion.div key={project.id} variants={item}>
              <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {project.title}
                    <div className="flex gap-2">
                      {project.liveUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open(project.liveUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {project.githubUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open(project.githubUrl, '_blank')}
                        >
                          <GithubLogo className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}