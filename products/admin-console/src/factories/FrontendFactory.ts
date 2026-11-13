import { ApplicationFactory } from "../app/ApplicationFactory.js";
import { FrontendConfigurationFactory } from "../configuration/FrontendConfigurationFactory.js";
import { ThemeFactory } from "../themes/ThemeFactory.js";
import { RoutingFactory } from "../routing/RoutingFactory.js";
import { ApiFactory } from "../api/ApiFactory.js";
import { StateFactory } from "../state/StateFactory.js";
import { AuthenticationFactory } from "../authentication/AuthenticationFactory.js";
import { AuthorizationFactory } from "../authorization/AuthorizationFactory.js";
import { ComponentsFactory } from "../components/ComponentsFactory.js";
import { LayoutsFactory } from "../layouts/LayoutsFactory.js";
import { FormsFactory } from "../forms/FormsFactory.js";
import { ValidationFactory } from "../validation/ValidationFactory.js";
import { PagesFactory } from "../pages/PagesFactory.js";
import { NotificationsFactory } from "../notifications/NotificationsFactory.js";
import { WorkflowFactory } from "../workflow/WorkflowFactory.js";
import { AnalyticsFactory } from "../analytics/AnalyticsFactory.js";
import { WebSocketFactory } from "../websocket/WebSocketFactory.js";

/**
 * FrontendFactory serving as the centralized composition gateway for all sub-factories.
 */
export class FrontendFactory {
  constructor(
    public readonly app: ApplicationFactory = new ApplicationFactory(),
    public readonly configuration: FrontendConfigurationFactory = new FrontendConfigurationFactory(),
    public readonly theme: ThemeFactory = new ThemeFactory(),
    public readonly routing: RoutingFactory = new RoutingFactory(),
    public readonly api: ApiFactory = new ApiFactory(),
    public readonly state: StateFactory = new StateFactory(),
    public readonly authentication: AuthenticationFactory = new AuthenticationFactory(),
    public readonly authorization: AuthorizationFactory = new AuthorizationFactory(),
    public readonly components: ComponentsFactory = new ComponentsFactory(),
    public readonly layouts: LayoutsFactory = new LayoutsFactory(),
    public readonly forms: FormsFactory = new FormsFactory(),
    public readonly validation: ValidationFactory = new ValidationFactory(),
    public readonly pages: PagesFactory = new PagesFactory(),
    public readonly notifications: NotificationsFactory = new NotificationsFactory(),
    public readonly workflow: WorkflowFactory = new WorkflowFactory(),
    public readonly analytics: AnalyticsFactory = new AnalyticsFactory(),
    public readonly websocket: WebSocketFactory = new WebSocketFactory()
  ) {}
}
