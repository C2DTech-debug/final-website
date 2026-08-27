// tests/load/k6-local.js
// Optimized for testing on your local machine without exhausting Windows TCP sockets

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

const failureRate = new Rate("failed_requests");
const homeDuration = new Trend("homepage_duration");
const apiBundleDuration = new Trend("api_bundle_duration");

export const options = {
  stages: [
    { duration: "30s", target: 50 },   // Warm up (50 users)
    { duration: "1m", target: 200 },   // Moderate local load (200 concurrent users)
    { duration: "1m", target: 500 },   // Peak local load (500 concurrent users)
    { duration: "30s", target: 0 },    // Cooldown
  ],
  thresholds: {
    failed_requests: ["rate<0.02"],    // Less than 2% failure rate
    http_req_duration: ["p(95)<500"],  // 95% under 500ms
  },
};

const BASE_URL = __ENV.TARGET_URL || "http://localhost:3000";
const API_BASE_URL = __ENV.API_TARGET_URL || "http://localhost:5000";

export default function () {
  // 1. Homepage
  group("01_Homepage", function () {
    const res = http.get(`${BASE_URL}/`);
    const isOk = check(res, {
      "homepage 200": (r) => r.status === 200,
    });
    failureRate.add(!isOk);
    homeDuration.add(res.timings.duration);
  });

  sleep(1);

  // 2. Public Data Bundle
  group("02_Public_Bundle", function () {
    const res = http.get(`${API_BASE_URL}/api/v1/public/home-bundle`);
    const isOk = check(res, {
      "bundle 200": (r) => r.status === 200,
    });
    failureRate.add(!isOk);
    apiBundleDuration.add(res.timings.duration);
  });

  sleep(1);
}
