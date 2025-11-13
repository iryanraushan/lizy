# Image Upload Implementation - Spring Boot Style

## Backend Implementation

### 1. GCS Service (`utils/gcs_storage.py`)
- Clean implementation without legacy code
- Generates unique image IDs
- Handles signed URLs with 7-day expiration
- Proper error handling and validation

### 2. Profile Views (`accounts/profile_views.py`)
- `/images/profile/upload/` - Upload new image
- `/images/profile/update/` - Update existing image
- `/images/profile/remove/` - Remove image
- `/images/profile/url/` - Get image URL

### 3. URL Configuration (`accounts/urls.py`)
- Clean URLs following Spring Boot pattern
- No legacy endpoints

## Frontend Implementation

### 1. Image API Service (`services/imageAPI.js`)
- `handleProfileImageOperation()` - Main method like Spring Boot
- `uploadProfileImage()` - Upload new image
- `updateProfileImage()` - Update existing image
- `removeProfileImage()` - Remove image
- `getProfileImageUrl()` - Get image URL

### 2. EditProfileImagePicker Component
- Handles image selection and cropping
- Shows preview with pending indicator
- Manages upload states

### 3. EditProfileScreen Component
- Complete profile editing screen
- Integrates image picker
- Handles all form fields with validation
- Character counters for inputs

## Usage Example

```jsx
import EditProfileScreen from '../components/EditProfileScreen';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { showToast } = useToast();
  const { currentUser, updateUser, refreshCurrentUser } = useAuth();

  return (
    <EditProfileScreen
      currentUser={currentUser}
      updateUser={updateUser}
      refreshCurrentUser={refreshCurrentUser}
      showToast={showToast}
    />
  );
};
```

## Key Features

1. **Spring Boot Pattern**: Matches the provided Spring Boot implementation
2. **Image ID Management**: Uses unique IDs instead of direct URLs
3. **Signed URLs**: 7-day expiration for security
4. **Preview System**: Shows pending changes before save
5. **Error Handling**: Comprehensive error handling throughout
6. **Loading States**: Proper loading indicators
7. **Validation**: File size and type validation
8. **Character Limits**: Input validation with counters

## Server Startup

When you run the Django server, you'll see:
```
Running startup checks...
GCS connected successfully
Startup checks completed.
```

This confirms GCS is properly configured and connected.