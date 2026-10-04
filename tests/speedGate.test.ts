/**
 * Simulation and Unit Verification Test for Speed-Gated ML Inference Pipeline
 */

import {
  SPEED_GATE_IDLE_KMH,
  SPEED_GATE_WALK_KMH,
  MS_TO_KMH,
} from "../services/telemetry/config";

interface SpeedGateEvaluation {
  action: "idle_local" | "walk_local" | "ml_request";
  mode: string;
  speedKmh: number;
}

function evaluateSpeedGate(speedMs: number): SpeedGateEvaluation {
  const rawSpeedMs = Number.isFinite(speedMs) ? Math.max(0, speedMs) : 0;
  const speedKmh = rawSpeedMs * MS_TO_KMH;

  if (speedKmh < SPEED_GATE_IDLE_KMH) {
    return { action: "idle_local", mode: "idle", speedKmh };
  } else if (speedKmh < SPEED_GATE_WALK_KMH) {
    return { action: "walk_local", mode: "walk", speedKmh };
  } else {
    return { action: "ml_request", mode: "vehicle_ml", speedKmh };
  }
}

function runTests() {
  console.log("==========================================");
  console.log("RUNNING SPEED-GATED INFERENCE UNIT TESTS");
  console.log("==========================================");

  // 1. Boundary tests
  const boundaryCases = [
    { name: "Zero Speed (0 km/h)", speedKmh: 0.0, expected: "idle_local" },
    { name: "Below Idle Boundary (0.49 km/h)", speedKmh: 0.49, expected: "idle_local" },
    { name: "Exact Idle Boundary (0.50 km/h)", speedKmh: 0.50, expected: "walk_local" },
    { name: "Typical Walking (2.50 km/h)", speedKmh: 2.50, expected: "walk_local" },
    { name: "Below Walk Boundary (4.99 km/h)", speedKmh: 4.99, expected: "walk_local" },
    { name: "Exact Vehicle Boundary (5.00 km/h)", speedKmh: 5.00, expected: "ml_request" },
    { name: "City Driving (25.00 km/h)", speedKmh: 25.00, expected: "ml_request" },
    { name: "Train Speed (75.00 km/h)", speedKmh: 75.00, expected: "ml_request" },
    { name: "NaN / Invalid Speed", speedKmh: NaN, expected: "idle_local" },
  ];

  let passedBoundaries = 0;
  for (const tc of boundaryCases) {
    const speedMs = Number.isNaN(tc.speedKmh) ? NaN : tc.speedKmh / MS_TO_KMH;
    const res = evaluateSpeedGate(speedMs);
    const pass = res.action === tc.expected;
    if (pass) {
      passedBoundaries++;
      console.log(`[PASS] ${tc.name}: ${res.speedKmh.toFixed(2)} km/h -> ${res.action}`);
    } else {
      console.error(`[FAIL] ${tc.name}: expected ${tc.expected}, got ${res.action}`);
    }
  }

  // 2. 5-Window Sequential Simulation
  console.log("\n------------------------------------------");
  console.log("SIMULATING 5 SEQUENTIAL 2-MINUTE WINDOWS");
  console.log("------------------------------------------");

  const simulatedWindows = [
    { windowIndex: 0, speedKmh: 0.2, desc: "User sitting at desk" },
    { windowIndex: 1, speedKmh: 1.5, desc: "User walking to store" },
    { windowIndex: 2, speedKmh: 6.0, desc: "User on slow bicycle" },
    { windowIndex: 3, speedKmh: 3.0, desc: "User walking in park" },
    { windowIndex: 4, speedKmh: 8.0, desc: "User in city transit / bus" },
  ];

  let mlRequestCount = 0;
  let localIdleCount = 0;
  let localWalkCount = 0;

  for (const win of simulatedWindows) {
    const speedMs = win.speedKmh / MS_TO_KMH;
    const evalRes = evaluateSpeedGate(speedMs);

    if (evalRes.action === "idle_local") {
      localIdleCount++;
      console.log(`Window #${win.windowIndex} (${win.desc}): ${win.speedKmh} km/h -> Classified 'idle' locally. [Bypass ML]`);
    } else if (evalRes.action === "walk_local") {
      localWalkCount++;
      console.log(`Window #${win.windowIndex} (${win.desc}): ${win.speedKmh} km/h -> Classified 'walk' locally. [Bypass ML]`);
    } else {
      mlRequestCount++;
      console.log(`Window #${win.windowIndex} (${win.desc}): ${win.speedKmh} km/h -> Speed >= 5.0 km/h -> [DISPATCH ML REQUEST]`);
    }
  }

  console.log("\n------------------------------------------");
  console.log("SIMULATION RESULTS:");
  console.log(`- Local Idle classifications: ${localIdleCount}`);
  console.log(`- Local Walk classifications: ${localWalkCount}`);
  console.log(`- ML Network Requests:        ${mlRequestCount} (expected: 2)`);

  const windowSimPassed = (mlRequestCount === 2 && localIdleCount === 1 && localWalkCount === 2);

  if (windowSimPassed && passedBoundaries === boundaryCases.length) {
    console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<");
  } else {
    console.error("\n>>> SOME TESTS FAILED <<<");
    process.exit(1);
  }
}

runTests();
