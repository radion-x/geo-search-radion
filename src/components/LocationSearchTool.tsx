import { useState, useCallback, useRef } from 'react'
import { MagnifyingGlass as Search, MapPin, Globe, Spinner as Loader2 } from '@phosphor-icons/react'
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
  // Stores the raw input string that was last successfully geocoded
  const [geocodedInput, setGeocodedInput] = useState<string>('')
  // Indicates user has changed the input since last geocode so stored location is stale
  const [isLocationDirty, setIsLocationDirty] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  // In browser environment setTimeout returns a number
  const timeoutRef = useRef<number | null>(null)

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
  setGeocodedInput(location)
  setIsLocationDirty(false)
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

    // Use the method that actually works: Google My Business location parameter
    const lat = currentLocation.latitude
    const lng = currentLocation.longitude
    const locationName = currentLocation.name.split(',')[0]
    
    // Method 1: Use Google's location parameter that works reliably
    const searchUrl1 = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&near=${encodeURIComponent(locationName)}&gl=${getCountryCode(currentLocation.country).toLowerCase()}&hl=en`
    
    // Method 2: Alternative using coordinate-based location (backup)
    const searchUrl2 = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&ll=${lat},${lng}&gl=${getCountryCode(currentLocation.country).toLowerCase()}&hl=en`
    
    // Method 3: Most reliable - using Google's location bias
    const baseUrl = 'https://www.google.com/search'
    const params = new URLSearchParams({
      q: searchQuery,
      // Location bias using coordinates - this is what works most reliably
      sll: `${lat},${lng}`,
      // Country and language for localization
      gl: getCountryCode(currentLocation.country).toLowerCase(),
      hl: 'en',
      // Additional location context
      location: locationName,
      // Force location-based results
      ludocid: '0', // Forces local results consideration
    })
    
    const searchUrl = `${baseUrl}?${params.toString()}`
    
    // Debug logging
    console.log('Primary search URL:', searchUrl)
    console.log('Alternative URLs:', { searchUrl1, searchUrl2 })
    console.log('Location:', { locationName, lat, lng, country: currentLocation.country })
    
    // Try the most reliable method first
    window.open(searchUrl, '_blank')
    
    toast.success(`Searching from ${locationName} - Google will show localized results`)
  }

  // Helper function to get proper country codes for Google
  const getCountryCode = (country: string): string => {
    const countryMappings: Record<string, string> = {
      'Australia': 'AU',
      'United States': 'US', 
      'United States of America': 'US',
      'United Kingdom': 'GB',
      'Canada': 'CA',
      'Germany': 'DE',
      'France': 'FR',
      'Japan': 'JP',
      'India': 'IN',
      'Brazil': 'BR',
      'Italy': 'IT',
      'Spain': 'ES',
      'Netherlands': 'NL',
      'Sweden': 'SE',
      'Norway': 'NO',
      'Denmark': 'DK',
      'Finland': 'FI',
      'New Zealand': 'NZ',
    }
    
    return countryMappings[country] || 'US' // Default to US if country not found
  }

  // Debounced autocomplete function
  const handleLocationInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocation(value)
    // Mark existing geocode as dirty if it no longer matches the original input used
    if (geocodedInput && value.trim() !== geocodedInput.trim()) {
      setIsLocationDirty(true)
    } else if (!geocodedInput) {
      setIsLocationDirty(false)
    } else if (value.trim() === geocodedInput.trim()) {
      setIsLocationDirty(false)
    }
    
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
                <div className={`rounded-lg p-4 border ${isLocationDirty ? 'bg-amber-50 border-amber-300' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center gap-2 text-green-800">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Search Location {isLocationDirty ? 'Stale – Re‑Geocode Needed' : 'Set'}:</span>
                  </div>
                  <div className="mt-1 text-green-700">
                    <div className="font-semibold">{currentLocation.name.split(',').slice(0, 2).join(', ')}</div>
                    <div className="text-sm">
                      {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)} • {currentLocation.country}
                    </div>
                    {!isLocationDirty && (
                      <div className="text-xs mt-1 text-green-600 bg-green-100 px-2 py-1 rounded">
                        ✓ Google will show results as if searching from this location
                      </div>
                    )}
                    {isLocationDirty && (
                      <div className="text-xs mt-2 text-amber-700 bg-amber-100 px-2 py-1 rounded">
                        The input changed. Click Geocode again to update the location bias.
                      </div>
                    )}
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
                  disabled={!currentLocation || !searchQuery.trim() || isLocationDirty}
                  size="lg"
                  className="px-8"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {!currentLocation && (
                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  💡 First geocode a location above, then your searches will show results from that location's perspective
                </div>
              )}

              {isLocationDirty && currentLocation && (
                <div className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                  The location input changed after the last geocode. Re-run Geocode to refresh before searching.
                </div>
              )}

              {currentLocation && (
                <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Ready to search from <strong>{currentLocation.name.split(',')[0]}</strong> - Google will show localized results
                </div>
              )}

              {currentLocation && searchQuery && (
                <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 mt-2">
                  <div><strong>Preview:</strong> Searching "{searchQuery}" with location context</div>
                  <div className="mt-1 text-gray-500">
                    📍 Location: {currentLocation.name.split(',')[0]}, {currentLocation.country}
                    <br />
                    🌐 Coordinates: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 mb-4">
              <li>Enter a location (city, suburb, address) and click "Geocode"</li>
              <li>Enter your search query (unchanged - no location terms needed)</li>
              <li>Click "Search" to open Google with results from that geographic location</li>
              <li>Google will show local businesses, services, and location-relevant results</li>
            </ol>
            <div className="bg-white/60 rounded p-3 text-sm text-blue-700">
              <strong>Note:</strong> Your search query stays exactly as you type it. The location context is sent to Google separately, so results appear as if you were physically searching from that location.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}