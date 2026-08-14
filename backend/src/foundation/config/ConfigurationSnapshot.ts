import {
  AppConfig,
  DatabaseConfig,
  EventConfig,
  LoggingConfig,
  SecurityConfig,
  PaymentConfig,
  AiConfig
} from "./ConfigurationSection.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";

/**
 * Root class holding strongly-typed configuration snapshots.
 * Enforces deep immutability across all settings.
 */
export class ConfigurationSnapshot {
  public readonly app: AppConfig;
  public readonly database: DatabaseConfig;
  public readonly event: EventConfig;
  public readonly logging: LoggingConfig;
  public readonly security: SecurityConfig;
  public readonly payment: PaymentConfig;
  public readonly ai: AiConfig;

  constructor(props: {
    app: AppConfig;
    database: DatabaseConfig;
    event: EventConfig;
    logging: LoggingConfig;
    security: SecurityConfig;
    payment: PaymentConfig;
    ai: AiConfig;
  }) {
    this.app = props.app;
    this.database = props.database;
    this.event = props.event;
    this.logging = props.logging;
    this.security = props.security;
    this.payment = props.payment;
    this.ai = props.ai;

    ObjectUtils.deepFreeze(this);
  }
}
