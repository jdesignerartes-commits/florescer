"use client";

import { useEffect, useRef, useState } from "react";
import { getExercisePoseSet, type PoseAngles } from "@/lib/exercise-poses";

const LEN = {
  torso: 24,
  headR: 8,
  upperArm: 15,
  forearm: 13,
  upperLeg: 19,
  lowerLeg: 17,
};

const HIP = { x: 50, y: 74 };
const SHOULDER_SPAN = 5;
const HIP_SPAN = 4;

// Ângulo "hora do relógio": 0 = pra cima, 90 = direita, 180 = baixo, sentido horário.
function project(x: number, y: number, len: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: x + len * Math.sin(rad), y: y - len * Math.cos(rad) };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpPose(a: PoseAngles, b: PoseAngles, t: number): PoseAngles {
  return {
    torso: lerp(a.torso, b.torso, t),
    armL: lerp(a.armL, b.armL, t),
    armLElbow: lerp(a.armLElbow, b.armLElbow, t),
    armR: lerp(a.armR, b.armR, t),
    armRElbow: lerp(a.armRElbow, b.armRElbow, t),
    legL: lerp(a.legL, b.legL, t),
    legLKnee: lerp(a.legLKnee, b.legLKnee, t),
    legR: lerp(a.legR, b.legR, t),
    legRKnee: lerp(a.legRKnee, b.legRKnee, t),
    rotate: lerp(a.rotate, b.rotate, t),
    hipYOffset: lerp(a.hipYOffset, b.hipYOffset, t),
  };
}

function buildPoints(pose: PoseAngles) {
  const hip = { x: HIP.x, y: HIP.y + pose.hipYOffset };
  const shoulder = project(hip.x, hip.y, LEN.torso, pose.torso);
  const head = project(shoulder.x, shoulder.y, LEN.headR + 3, pose.torso);

  const shoulderL = { x: shoulder.x - SHOULDER_SPAN, y: shoulder.y };
  const shoulderR = { x: shoulder.x + SHOULDER_SPAN, y: shoulder.y };
  const elbowL = project(shoulderL.x, shoulderL.y, LEN.upperArm, pose.armL);
  const wristL = project(elbowL.x, elbowL.y, LEN.forearm, pose.armLElbow);
  const elbowR = project(shoulderR.x, shoulderR.y, LEN.upperArm, pose.armR);
  const wristR = project(elbowR.x, elbowR.y, LEN.forearm, pose.armRElbow);

  const hipL = { x: hip.x - HIP_SPAN, y: hip.y };
  const hipR = { x: hip.x + HIP_SPAN, y: hip.y };
  const kneeL = project(hipL.x, hipL.y, LEN.upperLeg, pose.legL);
  const ankleL = project(kneeL.x, kneeL.y, LEN.lowerLeg, pose.legLKnee);
  const kneeR = project(hipR.x, hipR.y, LEN.upperLeg, pose.legR);
  const ankleR = project(kneeR.x, kneeR.y, LEN.lowerLeg, pose.legRKnee);

  return { hip, shoulder, head, shoulderL, elbowL, wristL, shoulderR, elbowR, wristR, hipL, kneeL, ankleL, hipR, kneeR, ankleR };
}

export function ExerciseFigure({
  exerciseId,
  className,
}: {
  exerciseId: string;
  className?: string;
}) {
  const poseSet = getExercisePoseSet(exerciseId);
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (poseSet.mode === "hold") return;
    const start = performance.now();
    const durationMs = 1400;

    function tick(now: number) {
      const elapsed = (now - start) % (durationMs * 2);
      const raw = elapsed < durationMs ? elapsed / durationMs : 2 - elapsed / durationMs;
      const eased = raw * raw * (3 - 2 * raw); // smoothstep
      setT(eased);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [poseSet, exerciseId]);

  const pose =
    poseSet.mode === "hold" ? poseSet.pose : lerpPose(poseSet.from, poseSet.to, t);
  const pts = buildPoints(pose);
  const rotate = poseSet.mode === "hold" ? poseSet.pose.rotate : lerpPose(poseSet.from, poseSet.to, t).rotate;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Ilustração da postura do exercício"
    >
      <g
        transform={`rotate(${rotate} ${HIP.x} ${HIP.y})`}
        style={
          poseSet.mode === "hold"
            ? { animation: "exercise-figure-hold 2.6s ease-in-out infinite" }
            : undefined
        }
        stroke="var(--color-oliva)"
        strokeWidth="4.2"
        strokeLinecap="round"
        fill="none"
      >
        <line x1={pts.hip.x} y1={pts.hip.y} x2={pts.shoulder.x} y2={pts.shoulder.y} />
        <line x1={pts.shoulderL.x} y1={pts.shoulderL.y} x2={pts.elbowL.x} y2={pts.elbowL.y} />
        <line x1={pts.elbowL.x} y1={pts.elbowL.y} x2={pts.wristL.x} y2={pts.wristL.y} />
        <line x1={pts.shoulderR.x} y1={pts.shoulderR.y} x2={pts.elbowR.x} y2={pts.elbowR.y} />
        <line x1={pts.elbowR.x} y1={pts.elbowR.y} x2={pts.wristR.x} y2={pts.wristR.y} />
        <line x1={pts.hipL.x} y1={pts.hipL.y} x2={pts.kneeL.x} y2={pts.kneeL.y} />
        <line x1={pts.kneeL.x} y1={pts.kneeL.y} x2={pts.ankleL.x} y2={pts.ankleL.y} />
        <line x1={pts.hipR.x} y1={pts.hipR.y} x2={pts.kneeR.x} y2={pts.kneeR.y} />
        <line x1={pts.kneeR.x} y1={pts.kneeR.y} x2={pts.ankleR.x} y2={pts.ankleR.y} />
        <circle cx={pts.head.x} cy={pts.head.y} r={LEN.headR} fill="var(--color-oliva)" stroke="none" />
      </g>
    </svg>
  );
}
