# Rating and Feedback System Documentation

## Overview

The **5-Star Rating & Feedback System** allows buyers to rate farmers after completing contracts. Ratings are displayed on farmer profiles and dashboards, helping build trust and transparency in the platform.

---

## 🎯 Key Features

### For Buyers:
- ✅ Rate farmers (1-5 stars) after contract completion
- ✅ Add detailed feedback comments
- ✅ Submit ratings only for completed contracts
- ✅ One rating per farmer (can be updated)

### For Farmers:
- ✅ Display overall rating on profile
- ✅ Show total number of ratings received
- ✅ View all ratings with comments
- ✅ See rating distribution breakdown
- ✅ Receive notifications when rated

### For All Users:
- ✅ View farmer ratings and reviews
- ✅ See rating statistics
- ✅ Check rating authenticity (verified buyers only)

---

## 📊 Database Schema

### User Model Updates
```prisma
model User {
  // ... existing fields
  rating       Float?   @default(0)
  totalRatings Int      @default(0)
  ratingsReceived FarmerRating[] @relation("RatingsReceived")
  ratingsGiven    FarmerRating[] @relation("RatingsGiven")
}
```

### FarmerRating Model
```prisma
model FarmerRating {
  id        String   @id @default(uuid())
  farmerId  String
  raterId   String
  rating    Int      // 1-5 stars
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  farmer    User     @relation("RatingsReceived", fields: [farmerId], references: [id])
  rater     User     @relation("RatingsGiven", fields: [raterId], references: [id])
}
```

---

## 🔌 API Endpoints

### Base URL: `/api/ratings`

#### 1. **Get Farmer Ratings**
```http
GET /api/ratings/farmer/:farmerId
```

**Response:**
```json
{
  "farmer": {
    "id": "uuid",
    "name": "John Doe",
    "rating": 4.8,
    "totalRatings": 25,
    "role": "FARMER"
  },
  "ratings": [
    {
      "id": "uuid",
      "farmerId": "uuid",
      "raterId": "uuid",
      "rating": 5,
      "comment": "Excellent quality and service!",
      "createdAt": "2026-03-25T19:05:29.839Z",
      "rater": {
        "id": "uuid",
        "name": "Jane Smith",
        "role": "BUYER"
      }
    }
  ],
  "distribution": {
    "5": 20,
    "4": 3,
    "3": 1,
    "2": 1,
    "1": 0
  },
  "averageRating": 4.8,
  "totalRatings": 25
}
```

---

#### 2. **Create Rating** (Buyers Only)
```http
POST /api/ratings
Authorization: Bearer <buyer-token>
Content-Type: application/json

{
  "farmerId": "uuid",
  "rating": 5,
  "comment": "Excellent quality and timely delivery!",
  "contractId": "uuid"  // Optional reference
}
```

**Conditions:**
- Only BUYER role can create ratings
- Must have a COMPLETED contract with the farmer
- Can only rate each farmer once

**Response:**
```json
{
  "message": "Rating submitted successfully",
  "rating": {
    "id": "uuid",
    "farmerId": "uuid",
    "raterId": "uuid",
    "rating": 5,
    "comment": "Excellent quality and timely delivery!",
    "rater": {
      "name": "Jane Smith",
      "role": "BUYER"
    }
  }
}
```

---

#### 3. **Update Rating**
```http
PUT /api/ratings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated feedback"
}
```

**Conditions:**
- Only the person who gave the rating can update it
- Rating must be between 1-5

---

#### 4. **Delete Rating**
```http
DELETE /api/ratings/:id
Authorization: Bearer <token>
```

**Permissions:**
- Admin can delete any rating
- Users can delete their own ratings

---

### User Profile with Ratings

#### Get User Profile
```http
GET /api/users/:userId/profile
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "FARMER",
    "phone": "+91 9876543210",
    "address": "123 Farm Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "rating": 4.8,
    "totalRatings": 25,
    "createdAt": "2025-01-01T00:00:00Z",
    "averageRating": 4.8,
    "totalRatingsCount": 25
  },
  "ratings": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Excellent!",
      "createdAt": "2026-03-25T19:05:29.839Z",
      "rater": {
        "name": "Jane Smith",
        "role": "BUYER"
      }
    }
  ],
  "distribution": {
    "5": 20,
    "4": 3,
    "3": 1,
    "2": 1,
    "1": 0
  }
}
```

---

## 🎨 Frontend Integration

### TypeScript Types

```typescript
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  rating?: number        // Average rating (0-5)
  totalRatings?: number  // Total count of ratings
  createdAt: string
  originalRole?: UserRole | null
}

export interface FarmerRating {
  id: string
  farmerId: string
  raterId: string
  rating: number          // 1-5 stars
  comment?: string
  createdAt: string
  updatedAt: string
  rater?: User
}
```

---

### React Component Example

{% raw %}
```tsx
import { useState, useEffect } from 'react';
import api from '../utils/api';

function FarmerProfile({ farmerId }) {
  const [farmer, setFarmer] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [distribution, setDistribution] = useState({});
  
  useEffect(() => {
    fetchFarmerRatings();
  }, [farmerId]);
  
  const fetchFarmerRatings = async () => {
    const response = await api.get(`/ratings/farmer/${farmerId}`);
    setFarmer(response.data.farmer);
    setRatings(response.data.ratings);
    setDistribution(response.data.distribution);
  };
  
  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };
  
  return (
    <div className="farmer-profile">
      {/* Farmer Info */}
      <div className="farmer-header">
        <h2>{farmer.name}</h2>
        <div className="rating-summary">
          <span className="stars">{renderStars(Math.round(farmer.rating))}</span>
          <span className="rating-value">{farmer.rating}/5</span>
          <span className="rating-count">({farmer.totalRatings} reviews)</span>
        </div>
      </div>
      
      {/* Rating Distribution */}
      <div className="rating-distribution">
        <h3>Rating Breakdown</h3>
        {[5, 4, 3, 2, 1].map(stars => (
          <div key={stars} className="rating-bar">
            <span>{stars} ⭐</span>
            <div className="bar">
              <div 
                className="fill" 
                style={{ width: `${(distribution[stars] / farmer.totalRatings) * 100}%` }}
              />
            </div>
            <span>{distribution[stars]}</span>
          </div>
        ))}
      </div>
      
      {/* Individual Ratings */}
      <div className="ratings-list">
        <h3>Customer Reviews</h3>
        {ratings.map(rating => (
          <div key={rating.id} className="rating-card">
            <div className="rating-header">
              <span className="stars">{renderStars(rating.rating)}</span>
              <span className="date">
                {new Date(rating.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="comment">{rating.comment}</p>
            <p className="reviewer">
              - {rating.rater.name} ({rating.rater.role})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```
{% endraw %}

---

### Rating Form Component

{% raw %}
```tsx
function RatingForm({ farmerId, contractId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/ratings', {
        farmerId,
        rating,
        comment,
        contractId
      });
      
      alert('Thank you for your rating!');
      onSuccess();
    } catch (error) {
      alert('Failed to submit rating: ' + error.response?.data?.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="rating-form">
      <h3>Rate Your Experience</h3>
      
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          >
            ⭐
          </button>
        ))}
      </div>
      
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)"
        rows={4}
      />
      
      <button type="submit" disabled={rating === 0}>
        Submit Rating
      </button>
    </form>
  );
}
```
{% endraw %}

---

## 📱 Display on Dashboard

### Dashboard Stats Card

{% raw %}
```tsx
function DashboardStats({ user }) {
  return (
    <div className="stats-card">
      <h3>Your Reputation</h3>
      
      {user.role === 'FARMER' && (
        <div className="reputation-stats">
          <div className="rating-display">
            <span className="big-stars">
              {renderStars(Math.round(user.rating || 0))}
            </span>
            <span className="rating-number">{user.rating || 0}/5</span>
            <span className="total-ratings">
              Based on {user.totalRatings || 0} reviews
            </span>
          </div>
          
          <Link to="/profile/ratings" className="view-ratings-btn">
            View All Ratings
          </Link>
        </div>
      )}
      
      {/* Other stats... */}
    </div>
  );
}
```
{% endraw %}

---

## 🔐 Security & Validation

### Rating Eligibility
1. **Only Buyers Can Rate**: BUYER role required
2. **Completed Contract Required**: Must have COMPLETED contract with farmer
3. **One Rating Per Farmer**: Each buyer can rate a farmer only once
4. **Verified Reviews**: Only genuine transaction participants

### Access Control
- Buyers can only rate farmers they've worked with
- Farmers cannot rate themselves
- Admins can moderate/delete any rating
- Users can only update/delete their own ratings

---

## 📊 Rating Calculation

### Average Rating Formula
```javascript
averageRating = sum(all_ratings) / total_ratings
rounded to 2 decimal places
```

### Example:
```
Ratings: [5, 4, 5, 3, 5]
Sum: 27
Count: 5
Average: 27 / 5 = 5.4 → 5.40
```

---

## 🔔 Notifications

### When Rating is Submitted
- **Type**: `FARMER_RATED`
- **Recipient**: Farmer
- **Message**: "You received a {X}-star rating from {buyer_name}: {comment}"

---

## 🧪 Testing

### Test Scenarios

1. **Buyer rates farmer after completed contract**
   ```bash
   POST /api/ratings
   # Expected: Rating created successfully
   ```

2. **Buyer tries to rate without completed contract**
   ```bash
   POST /api/ratings
   # Expected: 403 Error - "Can only rate after completing a contract"
   ```

3. **Buyer tries to rate same farmer twice**
   ```bash
   POST /api/ratings
   # Expected: 400 Error - "Already rated this farmer"
   ```

4. **Farmer's rating updates automatically**
   ```javascript
   // Before: farmer.rating = 4.5, totalRatings = 10
   // After new 5-star rating:
   // farmer.rating = 4.55, totalRatings = 11
   ```

---

## 📝 Files Created/Modified

### Backend:
- ✅ `server/src/routes/ratings.ts` - Rating API routes
- ✅ `server/src/routes/users.ts` - Profile endpoint with ratings
- ✅ `server/src/server.ts` - Route registration
- ✅ `server/prisma/schema.prisma` - FarmerRating model
- ✅ `server/testRatingSystem.js` - Test script

### Frontend:
- ✅ `client/src/types/index.ts` - TypeScript interfaces

---

## 🎉 Benefits

1. **Trust Building**: Verified ratings from real transactions
2. **Quality Incentive**: Farmers motivated to provide good service
3. **Informed Decisions**: Buyers can choose reputable farmers
4. **Platform Credibility**: Transparent review system
5. **Performance Tracking**: Farmers can monitor their reputation

---

## 🚀 Next Steps

1. Add rating display to farmer profile page
2. Create rating widget for dashboard
3. Add rating filter/search functionality
4. Implement rating badges (e.g., "Top Rated Farmer")
5. Add photo uploads to reviews (future enhancement)

---

## 📞 Support

For issues or questions about the rating system, contact the development team.

**Test Status**: ✅ Backend Complete | ⏳ Frontend Integration Pending
