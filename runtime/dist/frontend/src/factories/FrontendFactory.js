"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendFactory = void 0;
const ApplicationFactory_js_1 = require("../app/ApplicationFactory.js");
const FrontendConfigurationFactory_js_1 = require("../configuration/FrontendConfigurationFactory.js");
const ThemeFactory_js_1 = require("../themes/ThemeFactory.js");
const RoutingFactory_js_1 = require("../routing/RoutingFactory.js");
const ApiFactory_js_1 = require("../api/ApiFactory.js");
const StateFactory_js_1 = require("../state/StateFactory.js");
const AuthenticationFactory_js_1 = require("../authentication/AuthenticationFactory.js");
const AuthorizationFactory_js_1 = require("../authorization/AuthorizationFactory.js");
const ComponentsFactory_js_1 = require("../components/ComponentsFactory.js");
const LayoutsFactory_js_1 = require("../layouts/LayoutsFactory.js");
const FormsFactory_js_1 = require("../forms/FormsFactory.js");
const ValidationFactory_js_1 = require("../validation/ValidationFactory.js");
const PagesFactory_js_1 = require("../pages/PagesFactory.js");
const NotificationsFactory_js_1 = require("../notifications/NotificationsFactory.js");
const WorkflowFactory_js_1 = require("../workflow/WorkflowFactory.js");
const AnalyticsFactory_js_1 = require("../analytics/AnalyticsFactory.js");
const WebSocketFactory_js_1 = require("../websocket/WebSocketFactory.js");
/**
 * FrontendFactory serving as the centralized composition gateway for all sub-factories.
 */
class FrontendFactory {
    app;
    configuration;
    theme;
    routing;
    api;
    state;
    authentication;
    authorization;
    components;
    layouts;
    forms;
    validation;
    pages;
    notifications;
    workflow;
    analytics;
    websocket;
    constructor(app = new ApplicationFactory_js_1.ApplicationFactory(), configuration = new FrontendConfigurationFactory_js_1.FrontendConfigurationFactory(), theme = new ThemeFactory_js_1.ThemeFactory(), routing = new RoutingFactory_js_1.RoutingFactory(), api = new ApiFactory_js_1.ApiFactory(), state = new StateFactory_js_1.StateFactory(), authentication = new AuthenticationFactory_js_1.AuthenticationFactory(), authorization = new AuthorizationFactory_js_1.AuthorizationFactory(), components = new ComponentsFactory_js_1.ComponentsFactory(), layouts = new LayoutsFactory_js_1.LayoutsFactory(), forms = new FormsFactory_js_1.FormsFactory(), validation = new ValidationFactory_js_1.ValidationFactory(), pages = new PagesFactory_js_1.PagesFactory(), notifications = new NotificationsFactory_js_1.NotificationsFactory(), workflow = new WorkflowFactory_js_1.WorkflowFactory(), analytics = new AnalyticsFactory_js_1.AnalyticsFactory(), websocket = new WebSocketFactory_js_1.WebSocketFactory()) {
        this.app = app;
        this.configuration = configuration;
        this.theme = theme;
        this.routing = routing;
        this.api = api;
        this.state = state;
        this.authentication = authentication;
        this.authorization = authorization;
        this.components = components;
        this.layouts = layouts;
        this.forms = forms;
        this.validation = validation;
        this.pages = pages;
        this.notifications = notifications;
        this.workflow = workflow;
        this.analytics = analytics;
        this.websocket = websocket;
    }
}
exports.FrontendFactory = FrontendFactory;
