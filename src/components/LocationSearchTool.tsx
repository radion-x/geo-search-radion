import { useState, useCallback, useRef } from 'react'
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
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Geocoding function using Nominatim API (OpenStreetMap)
  const handleGeocode = async () => {
    if (!location.trim()) {
      toast.error('Please enter a location')
      return
    }

    setIsGeocoding(true)
    
    try {
      // Use Nominatim API for geocoding (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'LocationSearchTool/1.0'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Geocoding request failed')
      }
      
      const data = await response.json()
      
      if (data.length === 0) {
        toast.error('Location not found. Please try a different search term.')
        return
      }
      
      const result = data[0]
      const locationData: LocationData = {
        name: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        country: result.address?.country || 'Unknown'
      }
      
      setCurrentLocation(locationData)
      toast.success(`Location found: ${locationData.name.split(',')[0]}`)
    } catch (error) {
      console.error('Geocoding error:', error)
      toast.error('Failed to geocode location. Please try again.')
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

    // Construct Google search URL exactly like valentin.app
    // Use Google's location parameters without modifying the search query
    const lat = currentLocation.latitude
    const lng = currentLocation.longitude
    const locationName = currentLocation.name.split(',')[0]
    
    // Create the search URL with location-based parameters like valentin.app
    const baseUrl = 'https://www.google.com/search'
    const params = new URLSearchParams({
      q: searchQuery, // Keep the original search query unchanged
      // Use Google's location parameters to set geographic context
      near: `${lat},${lng}`, // Geographic coordinates
      uule: `w+CAIQICID${btoa(locationName).replace(/=/g, '')}`, // Encoded location name
      // Additional parameters for location context
      gl: currentLocation.country === 'Australia' ? 'au' : 
          currentLocation.country === 'United States' ? 'us' :
          currentLocation.country === 'United Kingdom' ? 'gb' : 'us',
      hl: 'en',
      sourceid: 'chrome',
      ie: 'UTF-8',
    })
    
    const searchUrl = `${baseUrl}?${params.toString()}`
    window.open(searchUrl, '_blank')
    
    toast.success(`Searching "${searchQuery}" from ${locationName}`)
  }

  // Debounced autocomplete function
  const handleLocationInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocation(value)
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    if (value.length > 2) {
      // Debounce the API call by 300ms
      timeoutRef.current = setTimeout(async () => {
        setIsLoadingSuggestions(true)
        
        try {
          // Use Nominatim API for autocomplete suggestions
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'LocationSearchTool/1.0'
              }
            }
          )
          
          if (response.ok) {
            const data = await response.json()
            const suggestions = data.map((item: any) => item.display_name).slice(0, 3)
            setLocationSuggestions(suggestions)
          }
        } catch (error) {
          console.error('Autocomplete error:', error)
          // Fallback to mock suggestions on error
          const mockSuggestions = [
            `${value}, NSW, Australia`,
            `${value}, USA`,
            `${value}, UK`
          ]
          setLocationSuggestions(mockSuggestions)
        } finally {
          setIsLoadingSuggestions(false)
        }
      }, 300)
    } else {
      setLocationSuggestions([])
      setIsLoadingSuggestions(false)
    }
  }, [])

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
                  {(locationSuggestions.length > 0 || isLoadingSuggestions) && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                      {isLoadingSuggestions ? (
                        <div className="px-4 py-3 text-gray-500 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Finding locations...
                        </div>
                      ) : (
                        locationSuggestions.map((suggestion, index) => (
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
                        ))
                      )}
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
                    <div className="font-semibold">{currentLocation.name.split(',').slice(0, 2).join(', ')}</div>
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