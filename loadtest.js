import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 1000 }, // ramp-up
    { duration: '1m', target: 1000 },  // steady load
    { duration: '30s', target: 500 },  // ramp-down
    { duration: '30s', target: 0 },    // cooldown
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests < 500ms
    http_req_failed: ['rate<0.01'],   // <1% error
  },
};

export default function () {
  const url =
    'https://oriyet.org/api/events?page=1&limit=12&status=published&event_status=upcoming';

  const res = http.get(url);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response is json': (r) =>
      r.headers['Content-Type'] &&
      r.headers['Content-Type'].includes('application/json'),
  });

  sleep(1);
}
