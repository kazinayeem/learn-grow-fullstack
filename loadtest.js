import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const successCounter = new Counter('success_count');

// Test configuration - Progressive load test
export let options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Spike to 200 users
    { duration: '3m', target: 200 },  // Stay at 200
    { duration: '2m', target: 500 },  // Spike to 500
    { duration: '1m', target: 500 },  // Stay at 500
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests under 2s
    'errors': ['rate<0.1'],               // Error rate under 10%
    'http_req_failed': ['rate<0.05'],     // Failed requests under 5%
  },
};

const BASE_URL = 'http://174.129.111.162';
const API_URL = `${BASE_URL}:5000/api`;

export default function () {
  // Test homepage
  group('Homepage', function () {
    const res = http.get(BASE_URL);
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 2s': (r) => r.timings.duration < 2000,
    });
    
    errorRate.add(!success);
    if (success) successCounter.add(1);
  });

  sleep(1);

  // Test API endpoints
  group('API - Course List', function () {
    const res = http.get(`${API_URL}/course`);
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 1s': (r) => r.timings.duration < 1000,
    });
    
    apiDuration.add(res.timings.duration);
    errorRate.add(!success);
  });

  sleep(1);

  // Test blog endpoint
  group('API - Blog List', function () {
    const res = http.get(`${API_URL}/blog?limit=20`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 1s': (r) => r.timings.duration < 1000,
    });
  });

  sleep(1);

  // Test health check
  group('API - Health Check', function () {
    const res = http.get(`${API_URL}/health`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'fast response': (r) => r.timings.duration < 100,
    });
  });

  sleep(2);
}
