import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    baseline: {
      executor: 'constant-vus',
      vus: 100,
      duration: '1m',
    },
    // Uncomment for stress/spike testing
    // stress: {
    //   executor: 'ramping-vus',
    //   startVUs: 0,
    //   stages: [
    //     { duration: '2m', target: 200 },
    //     { duration: '5m', target: 200 },
    //     { duration: '2m', target: 0 },
    //   ],
    // },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'], // less than 1% failure rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000'; // Default to backend

export default function () {
  // Simulate fetching active auctions
  const res = http.get(`${BASE_URL}/api/auctions/active`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
