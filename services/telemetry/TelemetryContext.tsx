import React, { createContext, useContext, ReactNode } from "react";
import { useTelemetryPipeline } from "./useTelemetryPipeline";
import { MlPredictionResult, PipelineState } from "./types";

type TelemetryContextType = {
  isActive: boolean;
  pipelineState: PipelineState;
  vehicleType: string | null;
  lastPrediction: MlPredictionResult | null;
  startPipeline: () => void;
  stopPipeline: () => void;
};

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider = ({ children }: { children: ReactNode }) => {
  const telemetry = useTelemetryPipeline();

  return (
    <TelemetryContext.Provider value={telemetry}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
};
