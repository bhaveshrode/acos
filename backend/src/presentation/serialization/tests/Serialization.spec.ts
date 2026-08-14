import { describe, it, expect, beforeEach } from "vitest";
import { SerializationContext } from "../SerializationContext.js";
import { SerializationException } from "../SerializationException.js";
import { JsonSerializer } from "../JsonSerializer.js";
import { RequestDeserializer } from "../RequestDeserializer.js";
import { ResponseSerializer } from "../ResponseSerializer.js";
import { ContentTypeResolver } from "../ContentTypeResolver.js";
import { SerializationPolicy } from "../SerializationPolicy.js";
import { DateTimeConverter } from "../DateTimeConverter.js";
import { EnumConverter } from "../EnumConverter.js";
import { ValueObjectConverter } from "../ValueObjectConverter.js";
import { ResponseFormatter } from "../ResponseFormatter.js";
import { SerializerRegistry } from "../SerializerRegistry.js";
import { SerializationFactory } from "../SerializationFactory.js";

enum TestStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE"
}

describe("Presentation Serialization Component Tests (Task 45.8)", () => {
  beforeEach(() => {
    SerializerRegistry.clear();
  });

  describe("SerializationContext & Exception", () => {
    it("should store options accurately", () => {
      const context = new SerializationContext({
        contentType: "application/json",
        prettyPrint: true,
        apiVersion: "v2"
      });
      expect(context.options.contentType).toBe("application/json");
      expect(context.options.prettyPrint).toBe(true);
      expect(context.options.apiVersion).toBe("v2");
    });

    it("should expose standard exception message", () => {
      const error = new SerializationException("Formatting failure");
      expect(error.message).toBe("Formatting failure");
      expect(error.name).toBe("SerializationException");
    });
  });

  describe("JsonSerializer, RequestDeserializer, and ResponseSerializer", () => {
    it("should serialize objects and obey prettyPrint formatting options", () => {
      const serializer = new JsonSerializer();
      const obj = { id: 1, name: "ACOS" };

      const minified = serializer.serialize(obj);
      expect(minified).toBe(JSON.stringify(obj));

      const context = new SerializationContext({ prettyPrint: true });
      const prettified = serializer.serialize(obj, context);
      expect(prettified).toBe(JSON.stringify(obj, null, 2));
    });

    it("should throw SerializationException when serializing circular objects", () => {
      const serializer = new JsonSerializer();
      const circular: any = {};
      circular.self = circular;

      expect(() => {
        serializer.serialize(circular);
      }).toThrow(SerializationException);
    });

    it("should parse valid JSON or throw SerializationException", () => {
      const serializer = new JsonSerializer();
      expect(serializer.deserialize<any>('{"x":10}')).toEqual({ x: 10 });

      expect(() => {
        serializer.deserialize("invalid-json-string");
      }).toThrow(SerializationException);
    });

    it("should deserialize request bodies from strings and Buffer envelopes", () => {
      const js = new JsonSerializer();
      const rd = new RequestDeserializer(js);

      const data = { id: 99 };
      const strBody = JSON.stringify(data);
      const bufBody = Buffer.from(strBody);

      expect(rd.deserialize<any>(strBody)).toEqual(data);
      expect(rd.deserialize<any>(bufBody)).toEqual(data);
    });

    it("should wrap response serialization cleanly", () => {
      const js = new JsonSerializer();
      const rs = new ResponseSerializer(js);
      const output = rs.serializeResponse({ status: "ok" });
      expect(output).toBe('{"status":"ok"}');
    });
  });

  describe("Content Negotiation helpers", () => {
    it("should resolve request and response content types based on headers", () => {
      const resolver = new ContentTypeResolver();

      expect(resolver.resolveResponseContentType("application/xml")).toBe("application/xml");
      expect(resolver.resolveResponseContentType("application/json, text/plain")).toBe("application/json");
      expect(resolver.resolveResponseContentType()).toBe("application/json");

      expect(resolver.resolveRequestContentType("application/json; charset=utf-8")).toBe("application/json");
      expect(resolver.resolveRequestContentType()).toBe("application/json");
    });

    it("should construct policy rules", () => {
      const policy = new SerializationPolicy(["text/plain"], "text/plain");
      expect(policy.supportedMediaTypes).toEqual(["text/plain"]);
      expect(policy.defaultMediaType).toBe("text/plain");
    });
  });

  describe("Custom converters & formatters", () => {
    it("should convert Date objects to and from ISO strings", () => {
      const converter = new DateTimeConverter();
      const now = new Date();
      const iso = converter.format(now);

      expect(iso).toBe(now.toISOString());
      expect(converter.parse(iso).getTime()).toBe(now.getTime());
    });

    it("should translate enum keys and values", () => {
      const converter = new EnumConverter();

      expect(converter.toValue(TestStatus, "Active")).toBe("ACTIVE");
      expect(converter.toKey(TestStatus, "ACTIVE")).toBe("Active");
    });

    it("should unwrap props or value from simulated ValueObject wrappers", () => {
      const converter = new ValueObjectConverter();

      const vo1 = { props: { amount: 100 } };
      const vo2 = { value: "ACOS-TOKEN" };
      const plain = { name: "Bob" };

      expect(converter.serialize(vo1)).toEqual({ amount: 100 });
      expect(converter.serialize(vo2)).toBe("ACOS-TOKEN");
      expect(converter.serialize(plain)).toEqual(plain);
    });

    it("should format consistent successful and error shapes using ResponseFormatter", () => {
      const formatter = new ResponseFormatter();

      expect(formatter.formatSuccess({ items: [] })).toEqual({
        success: true,
        data: { items: [] }
      });

      expect(formatter.formatError("Failed connection", "DB_ERROR")).toEqual({
        success: false,
        error: {
          message: "Failed connection",
          code: "DB_ERROR"
        }
      });
    });
  });

  describe("SerializerRegistry & SerializationFactory", () => {
    it("should register and resolve converters and custom serializers", () => {
      const mockConverter = { mock: true };
      const mockSerializer = { type: "xml" };

      SerializerRegistry.registerConverter("MockConv", mockConverter);
      SerializerRegistry.registerSerializer("application/xml", mockSerializer);

      expect(SerializerRegistry.getConverter("MockConv")).toBe(mockConverter);
      expect(SerializerRegistry.getSerializer("application/xml")).toBe(mockSerializer);
    });

    it("should build serialization pipelines using SerializationFactory", () => {
      const js = SerializationFactory.createJsonSerializer();
      expect(js).toBeInstanceOf(JsonSerializer);

      expect(SerializationFactory.createRequestDeserializer(js)).toBeInstanceOf(RequestDeserializer);
      expect(SerializationFactory.createResponseSerializer(js)).toBeInstanceOf(ResponseSerializer);
      expect(SerializationFactory.createContentTypeResolver()).toBeInstanceOf(ContentTypeResolver);
      expect(SerializationFactory.createResponseFormatter()).toBeInstanceOf(ResponseFormatter);
      expect(SerializationFactory.createDateTimeConverter()).toBeInstanceOf(DateTimeConverter);
      expect(SerializationFactory.createEnumConverter()).toBeInstanceOf(EnumConverter);
      expect(SerializationFactory.createValueObjectConverter()).toBeInstanceOf(ValueObjectConverter);
    });
  });
});
