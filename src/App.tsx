import { LocationSearchTool } from "@/components/LocationSearchTool"
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <div className="min-h-screen bg-background">
      <LocationSearchTool />
      <Toaster />
    </div>
  )
}

export default App