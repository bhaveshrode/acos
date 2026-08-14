import { OperationsComposition } from "./OperationsComposition.js";

/**
 * OperationsFactory composition gateway routing subcomponent instances to operations clients.
 */
export class OperationsFactory {
  constructor(
    public readonly composition: OperationsComposition = new OperationsComposition()
  ) {}

  public get deployment() {
    return this.composition.deployment;
  }

  public get containers() {
    return this.composition.containers;
  }

  public get monitoring() {
    return this.composition.monitoring;
  }

  public get logging() {
    return this.composition.logging;
  }

  public get tracing() {
    return this.composition.tracing;
  }

  public get metrics() {
    return this.composition.metrics;
  }

  public get secrets() {
    return this.composition.secrets;
  }

  public get scheduler() {
    return this.composition.scheduler;
  }

  public get backups() {
    return this.composition.backups;
  }

  public get scaling() {
    return this.composition.scaling;
  }

  public get gateway() {
    return this.composition.gateway;
  }

  public get observability() {
    return this.composition.observability;
  }

  public get diagnostics() {
    return this.composition.diagnostics;
  }

  public get maintenance() {
    return this.composition.maintenance;
  }
}
