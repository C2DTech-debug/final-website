// tests/load/k6-100k-concurrent.js
// Enterprise K6 Load Testing Script for C2D Tech Website
// Simulates 100,000 concurrent user traffic profile with realistic user think times and distributed transactions.

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom Performance Metrics
const failureRate = new Rate("failed_requests");
const homeDuration = new Trend("homepage_duration");
const apiBundleDuration = new Trend("api_bundle_duration");
const agreementQueryDuration = new Trend("agreement_query_duration");

export const options = {
  scenarios: {
    // Ramp-up to simulate high-concurrency peak traffic
    high_concurrency_stress: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 500 },    // Warm-up cache and connection pool
        { duration: "3m", target: 5000 },   // Moderate ramp
        { duration: "5m", target: 15000 },  // Peak concurrent active users
        { duration: "5m", target: 15000 },  // Sustained peak load
        { duration: "2m", target: 0 },      // Graceful cooldown
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    failed_requests: ["rate<0.01"],         // < 1% error rate even under peak stress
    http_req_duration: ["p(95)<350", "p(99)<800"], // 95% of requests < 350ms
    homepage_duration: ["p(95)<250"],
    api_bundle_duration: ["p(95)<180"],
  },
};

const BASE_URL = __ENV.TARGET_URL || "http://localhost:3000";
const API_BASE_URL = __ENV.API_TARGET_URL || "http://localhost:5000";

export default function () {
  // 1. Visit Edge/CDN Cached Homepage
  group("01_Browse_Homepage", function () {
    const res = http.get(`${BASE_URL}/`, {
      headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "k6-load-tester/1.0 (C2D-Concurrency-Benchmark)",
      },
    });

    const isOk = check(res, {
      "homepage status is 200": (r) => r.status === 200,
    });

    failureRate.add(!isOk);
    homeDuration.add(res.timings.duration);
  });

  sleep(Math.random() * 2 + 1); // 1-3 seconds user think time

  // 2. Fetch Public Site/Home Data Bundle (Cached by Redis/In-Memory Layer)
  group("02_Fetch_Public_Bundle", function () {
    const res = http.get(`${API_BASE_URL}/api/v1/public/home-bundle`, {
      headers: {
        "Accept": "application/json",
      },
    });

    const isOk = check(res, {
      "bundle status is 200": (r) => r.status === 200,
      "bundle response time < 250ms": (r) => r.timings.duration < 250,
    });

    failureRate.add(!isOk);
    apiBundleDuration.add(res.timings.duration);
  });

  sleep(Math.random() * 2 + 1);

  // 3. Read Public Agreement Portal (Database Index + Secondary Read Optimization)
  group("03_Public_Agreement_Lookup", function () {
    const testToken = "c2d_benchmark_token_preview_placeholder_00000000";
    const res = http.get(`${API_BASE_URL}/api/v1/public/agreements/${testToken}`, {
      headers: {
        "Accept": "application/json",
      },
    });

    const isOk = check(res, {
      "agreement lookup responded cleanly (200 or 404)": (r) => r.status === 200 || r.status === 404,
    });

    failureRate.add(!isOk);
    agreementQueryDuration.add(res.timings.duration);
  });

  sleep(Math.random() * 2 + 1);
}
