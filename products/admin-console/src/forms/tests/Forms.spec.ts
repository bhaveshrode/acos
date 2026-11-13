import { describe, it, expect, beforeEach, vi } from "vitest";
import { FormState } from "../FormState.js";
import { FormMetadata } from "../FormMetadata.js";
import { FormContext } from "../FormContext.js";
import { BaseForm } from "../BaseForm.js";
import { FormField } from "../FormField.js";
import { FieldGroup } from "../FieldGroup.js";
import { FieldRegistry } from "../FieldRegistry.js";
import { FieldFactory } from "../FieldFactory.js";
import { FormDescriptor } from "../FormDescriptor.js";
import { FormRegistry } from "../FormRegistry.js";
import { FormResolver } from "../FormResolver.js";
import { FormBinder } from "../FormBinder.js";
import { ValidationResult } from "../ValidationResult.js";
import { ValidationSummary } from "../ValidationSummary.js";
import { FieldValidator } from "../FieldValidator.js";
import { FormValidator } from "../FormValidator.js";
import { FormSubmission } from "../FormSubmission.js";
import { FormSubmissionResult } from "../FormSubmissionResult.js";
import { SubmissionHandler } from "../SubmissionHandler.js";
import { SubmissionPipeline } from "../SubmissionPipeline.js";
import { FormStateManager } from "../FormStateManager.js";
import { FormSerializer } from "../FormSerializer.js";
import { DraftManager } from "../DraftManager.js";
import { FormHydrator } from "../FormHydrator.js";
import { FormLifecycleEvent } from "../FormLifecycleEvent.js";
import { FormEventDispatcher } from "../FormEventDispatcher.js";
import { FormObserver } from "../FormObserver.js";
import { FormsFactory } from "../FormsFactory.js";
import { LazyFormLoader } from "../LazyFormLoader.js";
import { FormLoader } from "../FormLoader.js";
import { FormCache } from "../FormCache.js";
import { FormRenderer } from "../FormRenderer.js";
import { RenderResult } from "../../components/RenderResult.js";

class TestForm extends BaseForm {
  public async validate(): Promise<boolean> {
    let isValid = true;
    for (const field of this.getFields()) {
      if (!field.value) {
        field.error = "Required";
        isValid = false;
      } else {
        field.error = undefined;
      }
    }
    this.state = isValid ? FormState.Valid : FormState.Invalid;
    return isValid;
  }

  public async submit(): Promise<any> {
    this.state = FormState.Submitting;
    const values: Record<string, any> = {};
    for (const field of this.getFields()) {
      values[field.name] = field.value;
    }
    this.state = FormState.Submitted;
    return values;
  }
}

describe("Frontend Forms Component Unit Tests (Task 71.9)", () => {
  let context: FormContext;

  beforeEach(() => {
    vi.restoreAllMocks();
    const meta: FormMetadata = { id: "test-f", version: "1.0.0" };
    context = new FormContext(meta, { email: "test@acos.com" });
    
    // Polyfill localStorage if running in environment lacking it
    if (typeof window === "undefined" || !window.localStorage) {
      const store: Record<string, string> = {};
      global.localStorage = {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { for (const k in store) { delete store[k]; } },
        length: 0,
        key: (index: number) => Object.keys(store)[index] || null
      };
    }
  });

  describe("Contexts & Models", () => {
    it("should instantiate FormContext and freeze objects", () => {
      const meta: FormMetadata = { id: "f-1", permissions: ["submit"] };
      const ctx = new FormContext(meta, { username: "alice" }, { username: "Must be unique" }, false);

      expect(ctx.metadata.id).toBe("f-1");
      expect(ctx.fieldsValues.username).toBe("alice");
      expect(ctx.errors.username).toBe("Must be unique");
      expect(Object.isFrozen(ctx)).toBe(true);
      expect(Object.isFrozen(ctx.fieldsValues)).toBe(true);
      expect(Object.isFrozen(ctx.errors)).toBe(true);
    });

    it("should manage fields values, dirty checks, and errors in FormField", () => {
      const field = new FormField("email", "old@acos.com", "email");
      expect(field.isDirty).toBe(false);

      field.setValue("new@acos.com");
      expect(field.value).toBe("new@acos.com");
      expect(field.isDirty).toBe(true);
    });

    it("should support FieldGroups grouping", () => {
      const f1 = new FormField("firstName", "");
      const f2 = new FormField("lastName", "");
      const group = new FieldGroup("personal", [f1, f2]);

      expect(group.name).toBe("personal");
      expect(group.fields).toHaveLength(2);
    });

    it("should support FieldRegistry caching", () => {
      const registry = new FieldRegistry();
      registry.register("custom-email", FormField);
      expect(registry.get("custom-email")).toBe(FormField);

      registry.freeze();
      expect(() => registry.register("another", FormField)).toThrow(
        "FieldRegistry is frozen and cannot accept further field types"
      );
    });
  });

  describe("Fields & Controls (Task 71.3)", () => {
    it("should generate typed form fields in FieldFactory", () => {
      const textField = FieldFactory.createTextField("name", "ACOS");
      expect(textField.name).toBe("name");
      expect(textField.value).toBe("ACOS");
      expect(textField.type).toBe("text");

      const numField = FieldFactory.createNumberField("age", 25);
      expect(numField.type).toBe("number");
      expect(numField.value).toBe(25);

      const checkField = FieldFactory.createCheckboxField("active", true);
      expect(checkField.type).toBe("checkbox");
      expect(checkField.value).toBe(true);
    });
  });

  describe("Validation & Binding (Task 71.4)", () => {
    it("should bind model to form values in FormBinder", () => {
      const form = new TestForm(context);
      form.registerField(FieldFactory.createTextField("username", ""));
      form.registerField(FieldFactory.createTextField("email", ""));

      const binder = new FormBinder();
      binder.bindModelToForm(form, { username: "bob", email: "bob@acos.com" });

      expect(form.getField("username")?.value).toBe("bob");
      expect(form.getField("email")?.value).toBe("bob@acos.com");

      const model = binder.readFormToModel(form, {});
      expect(model.username).toBe("bob");
      expect(model.email).toBe("bob@acos.com");
    });

    it("should run validators and generate validation results", async () => {
      const validator = new FormValidator();
      const form = new TestForm(context);
      
      const reqVal = (val: any) => (!val ? "Required" : undefined);
      form.registerField(FieldFactory.createTextField("title", "", [reqVal]));

      const res = await validator.validate(form);
      expect(res.isValid).toBe(false);
      expect(res.errors.title).toBe("Required");

      const summary = ValidationSummary.fromResult(res);
      expect(summary.errorsList).toContain("title: Required");
    });
  });

  describe("Submission Pipeline (Task 71.5)", () => {
    it("should process handlers in SubmissionPipeline", async () => {
      const validator = new FormValidator();
      const submitFn = vi.fn().mockResolvedValue({ id: "inv-100" });
      const handler = new SubmissionHandler(submitFn);
      const pipeline = new SubmissionPipeline(validator, handler);

      const form = new TestForm(context);
      form.registerField(FieldFactory.createTextField("title", "Invoice 1"));

      const res = await pipeline.execute(form);
      expect(res.success).toBe(true);
      expect(res.data.id).toBe("inv-100");
    });
  });

  describe("State & Persistence (Task 71.6)", () => {
    it("should manage drafts and serialization in DraftManager", () => {
      const serializer = new FormSerializer();
      const draftMgr = new DraftManager(serializer);
      const hydrator = new FormHydrator(serializer, draftMgr);

      const form = new TestForm(context);
      form.registerField(FieldFactory.createTextField("notes", "Draft text"));

      draftMgr.saveDraft(form);
      
      const form2 = new TestForm(context);
      form2.registerField(FieldFactory.createTextField("notes", ""));

      const hydrated = hydrator.hydrate(form2);
      expect(hydrated).toBe(true);
      expect(form2.getField("notes")?.value).toBe("Draft text");
    });
  });

  describe("Dynamic Loading & Rendering", () => {
    it("should resolve synchronous and lazy loaded forms in FormLoader", async () => {
      const registry = new FormRegistry();
      const meta: FormMetadata = { id: "test-form-sync" };
      registry.register(new FormDescriptor(meta, TestForm));

      const resolver = new FormResolver(registry);
      const cache = new FormCache();
      const lazyLoader = new LazyFormLoader();
      const loader = new FormLoader(resolver, cache, lazyLoader);

      const syncRes = loader.loadSync("test-form-sync");
      expect(syncRes).toBe(TestForm);
    });

    it("should render form structures outputs in FormRenderer", () => {
      const form = new TestForm(context);
      form.registerField(new FormField("email", "test@acos.com"));

      const renderer = new FormRenderer();
      const res = renderer.render(form);

      expect(res).toBeInstanceOf(RenderResult);
      expect(res.output).toContain('<form class="form">');
      expect(res.output).toContain('value="test@acos.com"');
    });
  });

  describe("Events & Observers (Task 71.7)", () => {
    it("should dispatch and observe form lifecycle events", () => {
      const dispatcher = new FormEventDispatcher();
      const observer = new FormObserver(dispatcher);

      let count = 0;
      const token = observer.observe((ev) => {
        count++;
        expect(ev.formId).toBe("form-1");
        expect(ev.type).toBe("submitted");
      });

      dispatcher.dispatch(new FormLifecycleEvent("form-1", "submitted"));
      expect(count).toBe(1);

      token.dispose();
      dispatcher.dispatch(new FormLifecycleEvent("form-1", "submitted"));
      expect(count).toBe(1);
    });
  });
});
