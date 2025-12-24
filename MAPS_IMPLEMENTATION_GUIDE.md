# Maps Integration Implementation Guide

## Quick Integration Steps for Each Screen

### 1. Emergency Tracking Screen - Full Integration

**Location**: `app/emergency/tracking.tsx`

**Add to JSX (after the import statement is already added):**

```tsx
// Inside the return statement, add this section after the header
{
  location && (
    <GoogleMap
      initialLocation={location}
      markers={[
        // Emergency location marker
        {
          id: "emergency",
          latitude: emergency?.latitude || location.latitude,
          longitude: emergency?.longitude || location.longitude,
          title: "Emergency Location",
          description: emergency?.description || "Your emergency",
          type: "emergency",
        },
        // Nearby responders
        ...nearbyResponders.ambulances.map((ambulance) => ({
          id: ambulance._id,
          latitude: ambulance.latitude,
          longitude: ambulance.longitude,
          title: ambulance.name,
          description: "Ambulance on the way",
          type: "ambulance",
        })),
        ...nearbyResponders.doctors.map((doctor) => ({
          id: doctor._id,
          latitude: doctor.latitude,
          longitude: doctor.longitude,
          title: doctor.name,
          description: doctor.specialization,
          type: "doctor",
        })),
      ]}
      showUserLocation={true}
      showRadius={true}
      radiusKm={10}
      mapHeight={height * 0.45}
    />
  );
}
```

---

### 2. Nearby Facilities Screen - Enhancement

**Location**: `app/nearby/index.tsx`

**Steps:**

1. Import GoogleMap at the top
2. Add `showMapView` state:

```tsx
const [showMapView, setShowMapView] = useState(false);
```

3. Add toggle button in header
4. Wrap map component conditionally:

```tsx
{showMapView ? (
  <GoogleMap
    initialLocation={location}
    markers={facilities.map(facility => ({
      id: facility._id,
      latitude: facility.latitude,
      longitude: facility.longitude,
      title: facility.name,
      description: facility.specialization || facility.type,
      type: activeTab,
    }))}
    showUserLocation={true}
    showRadius={true}
    radiusKm={radius}
    mapHeight={height * 0.7}
  />
) : (
  // Existing list view
)}
```

---

### 3. Ambulance Booking Screen

**Location**: `app/ambulance/book.tsx`

**Enhancement:**

```tsx
// Add map showing nearest ambulances
<GoogleMap
  initialLocation={userLocation}
  markers={nearbyAmbulances.map((ambulance) => ({
    id: ambulance._id,
    latitude: ambulance.latitude,
    longitude: ambulance.longitude,
    title: ambulance.name,
    description: `ETA: ${ambulance.eta} min`,
    type: "ambulance",
  }))}
  showUserLocation={true}
  showRadius={true}
  radiusKm={5}
  mapHeight={height * 0.35}
/>
```

---

### 4. Appointments Booking Screen

**Location**: `app/appointments/book.tsx`

**Enhancement:**

```tsx
// Show doctor location if available
{
  selectedDoctor && selectedDoctor.latitude && (
    <GoogleMap
      initialLocation={userLocation}
      markers={[
        {
          id: selectedDoctor._id,
          latitude: selectedDoctor.latitude,
          longitude: selectedDoctor.longitude,
          title: selectedDoctor.name,
          description: selectedDoctor.address,
          type: "doctor",
        },
      ]}
      showUserLocation={true}
      mapHeight={height * 0.3}
    />
  );
}
```

---

### 5. Profile Screen - Location History

**Location**: `app/profile/index.tsx`

**Enhancement:**

```tsx
// Show user's saved locations
<GoogleMap
  initialLocation={userLocation}
  markers={[
    {
      id: "home",
      latitude: userProfile.homeLocation?.latitude,
      longitude: userProfile.homeLocation?.longitude,
      title: "Home",
      type: "user",
    },
    {
      id: "work",
      latitude: userProfile.workLocation?.latitude,
      longitude: userProfile.workLocation?.longitude,
      title: "Work",
      type: "user",
    },
  ]}
  showUserLocation={true}
  mapHeight={height * 0.35}
/>
```

---

## Integration Checklist

- [ ] Add GoogleMap import to screen
- [ ] Prepare marker data from API/state
- [ ] Add map component to JSX
- [ ] Style container for proper sizing
- [ ] Test marker display
- [ ] Test user location tracking
- [ ] Verify responsive height
- [ ] Test on different devices
- [ ] Add loading state for map
- [ ] Handle location permission errors

---

## Important Notes

1. **Marker Data Structure** - Always ensure markers have:

   - `id` (unique identifier)
   - `latitude` and `longitude` (valid numbers)
   - `title` (display name)
   - `type` (for color coding)

2. **Location Permissions** - Always check permission status before:

   - Using map component
   - Showing user location
   - Tracking movement

3. **Performance** - For screens with many markers:

   - Limit to ~15-20 markers per view
   - Use marker clustering for larger datasets
   - Cache marker data when possible

4. **Testing** - Always test:
   - Map on actual device
   - With real location data
   - On different zoom levels
   - With and without location permission

---

## Module Exports

All components are exported from their respective files:

```tsx
// GoogleMap
export default function GoogleMap({ ... })

// ModernButton
export default function ModernButton({ ... })

// ResponsiveCard
export default function ResponsiveCard({ ... })
```

Import them with:

```tsx
import GoogleMap from "../../components/GoogleMap";
import ModernButton from "../../components/ModernButton";
import ResponsiveCard from "../../components/ResponsiveCard";
```

---

## API Response Format Expected

```tsx
// For professionals (doctors, nurses)
{
  data: [
    {
      _id: string,
      name: string,
      specialization: string,
      latitude: number,
      longitude: number,
      rating: number,
      phone: string,
      address: string,
    },
  ];
}

// For ambulances
{
  data: [
    {
      _id: string,
      name: string,
      latitude: number,
      longitude: number,
      eta: number, // in minutes
      phone: string,
      status: "available" | "busy" | "offline",
    },
  ];
}
```

---

**Happy Coding!** 🗺️📱
