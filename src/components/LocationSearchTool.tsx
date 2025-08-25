import { useState } from 'react'
import { Search, MapPin, Globe, Loader2 } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface LocationData {
  name: string
  latitude: number
  longitude: number
  country: string
}

export function LocationSearchTool() {
  const [location, setLocation] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])

  // Mock geocoding function - in a real implementation, this would use a geocoding API
  const handleGeocode = async () => {
    if (!location.trim()) {
      toast.error('Please enter a location')
      return
    }

    setIsGeocoding(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock location data - in real implementation, use geocoding API
      const mockLocationData: LocationData = {
        name: location,
        latitude: -33.8688 + Math.random() * 10 - 5, // Random coordinates for demo
        longitude: 151.2093 + Math.random() * 10 - 5,
        country: 'Australia' // Mock country
      }
      
      setCurrentLocation(mockLocationData)
      toast.success(`Location found: ${mockLocationData.name}`)
    } catch (error) {
      toast.error('Failed to geocode location')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query')
      return
    }
    
    if (!currentLocation) {
      toast.error('Please geocode a location first')
      return
    }

    // Construct Google search URL with location parameters
    const searchParams = new URLSearchParams({
      q: searchQuery,
      near: currentLocation.name,
      // Add more location-specific parameters as needed
    })
    
    const searchUrl = `https://www.google.com/search?${searchParams.toString()}`
    window.open(searchUrl, '_blank')
    
    toast.success(`Searching from ${currentLocation.name}`)
  }

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocation(value)
    
    // Mock autocomplete suggestions
    if (value.length > 2) {
      const mockSuggestions = [
        `${value}, NSW, Australia`,
        `${value}, VIC, Australia`,
        `${value}, QLD, Australia`,
        `${value}, USA`,
        `${value}, UK`
      ].slice(0, 3)
      setLocationSuggestions(mockSuggestions)
    } else {
      setLocationSuggestions([])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto pt-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Location Search</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search Google from any location worldwide. Enter a location, geocode it, then search as if you were there.
          </p>
        </div>

        {/* Main Tool */}
        <div className="space-y-8">
          {/* Location Input Section */}
          <Card className="p-8 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Set Location</h2>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Enter city, suburb, or address..."
                    value={location}
                    onChange={handleLocationInputChange}
                    className="text-lg py-3"
                  />
                  
                  {/* Autocomplete suggestions */}
                  {locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                          onClick={() => {
                            setLocation(suggestion)
                            setLocationSuggestions([])
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleGeocode}
                  disabled={isGeocoding || !location.trim()}
                  size="lg"
                  className="px-8"
                >
                  {isGeocoding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Geocoding...
                    </>
                  ) : (
                    'Geocode'
                  )}
                </Button>
              </div>

              {/* Current Location Display */}
              {currentLocation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Location Set:</span>
                  </div>
                  <div className="mt-1 text-green-700">
                    <div className="font-semibold">{currentLocation.name}</div>
                    <div className="text-sm">
                      {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)} • {currentLocation.country}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Search Section */}
          <Card className="p-8 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Search from Location</h2>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter your search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-lg py-3"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <Button 
                  onClick={handleSearch}
                  disabled={!currentLocation || !searchQuery.trim()}
                  size="lg"
                  className="px-8"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {!currentLocation && (
                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  💡 First geocode a location above, then enter your search query here
                </div>
              )}
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Enter a location (city, suburb, address) in the first field</li>
              <li>Click "Geocode" to find and validate the location coordinates</li>
              <li>Enter your search query in the second field</li>
              <li>Click "Search" to open Google search results from that location</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}