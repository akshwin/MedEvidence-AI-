# Usage Analytics & Monitoring Implementation

## ✅ What Was Implemented

### 1. **Database Models** ✅
- **`ApiUsage`** - Tracks every API call with:
  - User ID (nullable for anonymous usage)
  - Endpoint and HTTP method
  - Status code and response time
  - Request/response sizes
  - Error messages
  - IP address and user agent
  - Timestamp

- **`PerformanceMetric`** - Tracks performance metrics:
  - Metric type (response_time, error_rate, throughput)
  - Endpoint-specific or global
  - Value and timestamp
  - Metadata

### 2. **Backend Implementation** ✅

#### Middleware (`backend/app/middleware/usage_tracking.py`)
- **UsageTrackingMiddleware** - Automatically tracks all API calls
- Tracks response times, status codes, errors
- Non-blocking (doesn't slow down requests)
- Skips health checks and static files

#### API Endpoints (`backend/app/api/routes/dashboard.py`)
- **`GET /api/dashboard/usage/stats`** - Comprehensive usage statistics
  - Total queries/searches (all time, today, this week, this month)
  - Average response time
  - Error rate
  - Most used endpoints
  - Usage by day (last 30 days)

- **`GET /api/dashboard/usage/endpoints`** - Endpoint-specific analytics
  - Request counts per endpoint
  - Average response times
  - Error counts
  - Success rates

- **`GET /api/dashboard/usage/recent`** - Recent API call logs
  - Last N API calls with full details
  - Status codes, response times, errors

#### Sentry Integration (`backend/app/services/sentry_service.py`)
- Error tracking with Sentry SDK
- Performance monitoring (10% sampling)
- Context-aware error reporting
- Configurable via `SENTRY_DSN` environment variable

### 3. **Frontend Implementation** ✅

#### Component (`frontend/components/UsageAnalytics.tsx`)
- **Usage Analytics Dashboard** with:
  - Key metrics cards (queries, searches, response time, error rate)
  - Usage chart (bar chart showing daily usage)
  - Endpoint performance table
  - Recent API calls log
  - Period selector (today/week/month)
  - Auto-refresh capability

#### Integration
- Added "Analytics" tab to dashboard
- Integrated with existing dashboard API
- Real-time data loading
- Error handling and loading states

## 🚀 How to Use

### 1. **Install Dependencies**

```bash
cd backend
pip install -r requirements.txt
```

This will install `sentry-sdk[fastapi]` for error tracking.

### 2. **Initialize Database**

The new tables will be created automatically when you run:

```bash
python init_db.py
```

Or they'll be created on first run if using SQLAlchemy auto-create.

### 3. **Configure Sentry (Optional)**

Add to your `.env` file:

```env
SENTRY_DSN=your-sentry-dsn-here
```

Get a Sentry DSN from [sentry.io](https://sentry.io) (free tier available).

### 4. **Start the Backend**

```bash
uvicorn app.main:app --reload
```

The middleware will automatically start tracking all API calls.

### 5. **View Analytics**

1. Log in to your account
2. Go to Dashboard
3. Click on the **"Analytics"** tab
4. View your usage statistics, performance metrics, and recent API calls

## 📊 Features

### Usage Tracking
- ✅ Tracks every API call automatically
- ✅ Records response times
- ✅ Tracks errors and status codes
- ✅ User-specific analytics
- ✅ Endpoint-specific metrics

### Performance Monitoring
- ✅ Average response time tracking
- ✅ Error rate calculation
- ✅ Endpoint performance comparison
- ✅ Daily usage trends

### Error Tracking (Sentry)
- ✅ Automatic error capture
- ✅ Performance monitoring
- ✅ Context-aware error reporting
- ✅ Production-ready error tracking

### Frontend Dashboard
- ✅ Real-time usage statistics
- ✅ Interactive charts
- ✅ Endpoint performance table
- ✅ Recent API calls log
- ✅ Period filtering (today/week/month)

## 🔧 Configuration

### Environment Variables

```env
# Enable/disable usage tracking (default: true)
ENABLE_USAGE_TRACKING=true

# Enable/disable performance monitoring (default: true)
ENABLE_PERFORMANCE_MONITORING=true

# Sentry DSN for error tracking (optional)
SENTRY_DSN=your-sentry-dsn-here
```

### Middleware Configuration

The middleware automatically:
- Skips tracking for `/health`, `/docs`, `/openapi.json`, `/`
- Tracks authenticated and anonymous users
- Handles errors gracefully (won't break requests if tracking fails)

## 📈 API Usage Examples

### Get Usage Statistics

```typescript
const stats = await dashboardApi.getUsageStats()
// Returns:
// {
//   total_queries: 150,
//   total_searches: 75,
//   queries_today: 10,
//   searches_today: 5,
//   queries_this_week: 50,
//   searches_this_week: 25,
//   queries_this_month: 120,
//   searches_this_month: 60,
//   average_response_time_ms: 1250.5,
//   error_rate: 2.5,
//   most_used_endpoints: [...],
//   usage_by_day: [...]
// }
```

### Get Endpoint Usage

```typescript
const endpoints = await dashboardApi.getEndpointUsage(30) // Last 30 days
// Returns array of endpoint usage stats
```

### Get Recent Usage Logs

```typescript
const logs = await dashboardApi.getRecentUsage(50) // Last 50 calls
// Returns array of API call logs
```

## 🎯 Use Cases

1. **Usage Monitoring** - Track how much users are using the API
2. **Performance Optimization** - Identify slow endpoints
3. **Error Tracking** - Monitor error rates and types
4. **Billing** - Track usage for subscription tiers
5. **Debugging** - View recent API calls to debug issues
6. **Analytics** - Understand user behavior and API usage patterns

## 🔒 Privacy & Security

- User-specific tracking (only shows your own usage)
- IP addresses stored for analytics (can be anonymized)
- No sensitive data in logs
- Compliant with privacy requirements

## 🚨 Important Notes

1. **Database Growth** - Usage logs can grow large over time. Consider:
   - Archiving old logs
   - Implementing retention policies
   - Using database partitioning

2. **Performance Impact** - The middleware is designed to be non-blocking, but:
   - Database writes happen synchronously (consider async writes)
   - Large request/response sizes are tracked but not stored
   - Health checks are skipped to avoid overhead

3. **Sentry Setup** - Sentry is optional but recommended for production:
   - Free tier available
   - Easy setup
   - Provides error tracking and performance monitoring

## 📝 Next Steps

1. **Set up Sentry** for production error tracking
2. **Configure retention policies** for old usage data
3. **Add usage limits** based on subscription tiers
4. **Implement alerts** for high error rates or slow responses
5. **Add export functionality** for usage reports

## ✅ Testing

To test the implementation:

1. Make some API calls (queries, searches)
2. Go to Dashboard → Analytics tab
3. Verify that:
   - Usage statistics are displayed
   - Charts show your usage
   - Endpoint performance is tracked
   - Recent API calls are logged

## 🎉 Summary

You now have a complete usage analytics and monitoring system that:
- ✅ Tracks all API usage automatically
- ✅ Provides comprehensive analytics dashboard
- ✅ Monitors performance metrics
- ✅ Tracks errors with Sentry integration
- ✅ Shows real-time usage statistics

The system is production-ready and can be used for:
- User analytics
- Performance monitoring
- Error tracking
- Usage-based billing
- Debugging and troubleshooting



