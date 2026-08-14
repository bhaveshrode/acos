import { IntegrationComposition } from "./IntegrationComposition.js";

/**
 * IntegrationFactory acting as the central composition root gateway for external adapters.
 */
export class IntegrationFactory {
  constructor(
    public readonly composition: IntegrationComposition = new IntegrationComposition()
  ) {}

  public get payments() {
    return this.composition.payments;
  }

  public get blockchain() {
    return this.composition.blockchain;
  }

  public get communications() {
    return this.composition.communications;
  }

  public get identity() {
    return this.composition.identity;
  }

  public get cloud() {
    return this.composition.cloud;
  }

  public get accounting() {
    return this.composition.accounting;
  }

  public get crm() {
    return this.composition.crm;
  }

  public get ecommerce() {
    return this.composition.ecommerce;
  }

  public get storage() {
    return this.composition.storage;
  }

  public get webhooks() {
    return this.composition.webhooks;
  }

  public get synchronization() {
    return this.composition.synchronization;
  }

  public get security() {
    return this.composition.security;
  }

  public get configuration() {
    return this.composition.configuration;
  }

  public get monitoring() {
    return this.composition.monitoring;
  }
}
