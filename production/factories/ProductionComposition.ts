import { EnvironmentManager } from "../environment/EnvironmentManager.js";
import { RollbackManager } from "../release/RollbackManager.js";
import { ReleaseManager } from "../release/ReleaseManager.js";
import { SmokeTestRunner } from "../smoke/SmokeTestRunner.js";
import { PilotLimits } from "../pilot/PilotLimits.js";
import { PilotManager } from "../pilot/PilotManager.js";
import { ProductionJourneyRunner } from "../journeys/ProductionJourneyRunner.js";
import { IncidentManager } from "../incidents/IncidentManager.js";
import { LaunchMetrics } from "../metrics/LaunchMetrics.js";
import { FeedbackManager } from "../feedback/FeedbackManager.js";
import { RolloutManager } from "../rollout/RolloutManager.js";
import { SupportManager } from "../support/SupportManager.js";
import { ProductionLaunchCertifier } from "../certification/ProductionLaunchCertifier.js";

/**
 * ProductionComposition coordinating rollout and operational launch metrics.
 */
export class ProductionComposition {
  public readonly environment = new EnvironmentManager();
  public readonly rollback = new RollbackManager();
  public readonly release = new ReleaseManager(this.rollback);
  public readonly smoke = new SmokeTestRunner();

  public readonly pilotLimits = new PilotLimits(10, 10000, ["stripe", "circle"]);
  public readonly pilot = new PilotManager(this.pilotLimits);

  public readonly journeys = new ProductionJourneyRunner();
  public readonly incidents = new IncidentManager();

  public readonly metrics = new LaunchMetrics();
  public readonly feedback = new FeedbackManager();
  public readonly rollout = new RolloutManager();
  public readonly support = new SupportManager();
  public readonly certifier = new ProductionLaunchCertifier();

  constructor() {
    Object.freeze(this);
  }
}
