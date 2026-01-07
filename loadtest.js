import http from "k6/http";
import { check, sleep } from "k6";

// =======================
// ⚙️ Load Test Options
// =======================
export const options = {
  stages: [
    { duration: "20s", target: 10 },
    { duration: "40s", target: 30 },
    { duration: "40s", target: 60 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.05"],
  },
};

// =======================
// 🔗 Config
// =======================
const BASE_URL = "https://learnandgrow.io";

// 🔐 ACCESS TOKEN (Bearer)
// ❌ NEVER hardcode in real repo
const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NTkzOTE0ZWJjYmFkNmRmMzk1MjQyZCIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzY3NzE2OTY5LCJleHAiOjE3NjgzMjE3Njl9.nB8zl_gtJPXzenPiyf03tNz4BMN5bCNB8l_AUz5Rcx8";

// =======================
// 🔑 Request Params
// =======================
const params = {
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
};

// =======================
// 🚀 Load Test Logic
// =======================
export default function () {
  const res1 = http.get(
    `${BASE_URL}/api/users/instructor-stats`,
    params
  );

  const res2 = http.get(
    `${BASE_URL}/api/course/get-featured-courses`,
    params
  );

  const res3 = http.get(
    `${BASE_URL}/api/course/get-courses-count`,
    params
  );

  check(res1, { "instructor-stats 200": (r) => r.status === 200 });
  check(res2, { "featured-courses 200": (r) => r.status === 200 });
  check(res3, { "courses-count 200": (r) => r.status === 200 });

  sleep(1);
}
