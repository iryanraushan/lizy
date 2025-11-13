# LIZY - Property Management Platform

LIZY is a comprehensive property management platform that connects property providers with seekers, offering a seamless experience for finding and managing rental and sale properties across India.

## 🏗️ Tech Stack

### Backend
- **Framework:** Django 5.2.6 with Django REST Framework
- **Database:** PostgreSQL
- **Authentication:** JWT (Simple JWT) with token blacklisting
- **API:** RESTful API with filtering, pagination, and search
- **Cloud Storage:** Google Cloud Storage for image management
- **Email Service:** SMTP (Gmail) for notifications
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Additional Libraries:**
  - CORS Headers for cross-origin requests
  - Django Filters for advanced filtering
  - Pillow for image processing

### Frontend
- **Framework:** React Native with Expo
- **Navigation:** React Navigation 7
- **State Management:** Context API
- **UI Components:** Custom components with Expo Vector Icons
- **Maps:** Expo Maps for location services
- **Image Handling:** Expo Image Picker & Manipulator
- **Notifications:** Expo Notifications
- **Development:** TypeScript support, ESLint configuration

### Infrastructure
- **Development:** Local development with hot reload
- **Image Storage:** Google Cloud Storage bucket
- **Push Notifications:** Firebase integration
- **Email Service:** Gmail SMTP integration

## 🚀 Key Features

### For Property Seekers
- **Advanced Search & Filters:** Search properties by type, location, price range, amenities, and more
- **Property Browsing:** Browse through various property types (apartments, PG, houses, commercial spaces)
- **Favorites System:** Save and manage favorite properties
- **Interactive Maps:** View properties on map with location details
- **Real-time Messaging:** Chat directly with property providers
- **Profile Management:** Manage personal profile and preferences
- **Push Notifications:** Get notified about new properties and messages

### For Property Providers
- **Property Listing:** Add detailed property listings with images and amenities
- **Analytics Dashboard:** Track property views, favorites, and performance metrics
- **Property Management:** Edit, activate/deactivate property listings
- **Messaging System:** Communicate with potential tenants/buyers
- **Notification System:** Receive alerts when properties are favorited or viewed
- **Bulk Operations:** Manage multiple properties efficiently

### Core Functionality

#### Property Management
- **Property Types:** Support for 20+ property types including:
  - Apartments (1BHK, 2BHK, 3BHK, 4BHK+)
  - Rooms (Single, Double, Triple)
  - PG accommodations with various sharing options
  - Independent houses, villas, cottages
  - Commercial spaces (offices, shops, warehouses)
  - Land/plots

- **Comprehensive Filtering:**
  - Property type and category
  - Price range (minimum/maximum)
  - Location (city, area)
  - Room configuration
  - Furnishing status
  - Gender preferences
  - Availability status

#### User Management
- **Dual Role System:** Users can be either Providers or Seekers
- **Profile Features:**
  - Email-based authentication
  - Profile image management
  - Bio and contact information
  - Role-based permissions
  - Email verification system

#### Communication System
- **Real-time Messaging:** Dedicated chat rooms between seekers and providers
- **Push Notifications:** Multi-platform notification system for:
  - New messages
  - Property updates
  - Favorites notifications
  - Custom announcements

#### Analytics & Insights
- **Property Analytics:**
  - Total views and unique viewers
  - Favorites count
  - Weekly and monthly statistics
  - Performance tracking

- **Provider Dashboard:**
  - Total properties overview
  - Active/inactive property counts
  - Comprehensive view analytics
  - Top-performing properties
  - Recent activity tracking

#### Support System
- **Problem Reporting:** Built-in support system with categorized issue reporting:
  - Technical issues
  - Account problems
  - Property listing issues
  - General inquiries

## 📱 Mobile App Features

### User Experience
- **Intuitive Navigation:** Bottom tab navigation with dedicated sections
- **Image Management:** 
  - Multiple image upload for properties
  - Image cropping and resizing
  - Lazy loading for optimal performance
- **Location Services:**
  - GPS-based location picker
  - Interactive map integration
  - Location-based property search
- **Offline Support:** Cached data for better performance

### Platform Support
- **Cross-Platform:** iOS and Android support via React Native
- **Responsive Design:** Optimized for various screen sizes
- **Native Features:**
  - Push notifications
  - Image picker
  - Location services
  - Device storage

## 🗄️ Database Schema

### Core Models

#### Users (CustomUser)
- Unique 16-character alphanumeric IDs
- Email-based authentication
- Provider/Seeker role system
- Profile management with bio and images
- Verification status tracking

#### Properties
- Comprehensive property information
- 20+ property types and categories
- Pricing, location, and amenity data
- Image storage integration
- Owner relationship and status management

#### Messaging System
- Chat rooms between users
- Message history with soft delete
- Real-time communication support

#### Analytics
- Property view tracking
- Favorite system
- User engagement metrics
- Performance analytics

## 🔧 Installation & Setup

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
expo start
```

### Environment Configuration
- Configure PostgreSQL database
- Set up Google Cloud Storage credentials
- Configure Firebase for push notifications
- Set up email SMTP settings


---

LIZY provides a complete ecosystem for property management, combining modern technology with user-friendly interfaces to create an efficient platform for property seekers and providers in the Indian real estate market.
