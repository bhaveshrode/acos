import { JsonSerializer } from "./JsonSerializer.js";
import { RequestDeserializer } from "./RequestDeserializer.js";
import { ResponseSerializer } from "./ResponseSerializer.js";
import { ContentTypeResolver } from "./ContentTypeResolver.js";
import { ResponseFormatter } from "./ResponseFormatter.js";
import { DateTimeConverter } from "./DateTimeConverter.js";
import { EnumConverter } from "./EnumConverter.js";
import { ValueObjectConverter } from "./ValueObjectConverter.js";

/**
 * SerializationFactory orchestrator building serializers, deserializers, resolvers, and custom converter wrappers.
 */
export class SerializationFactory {
  public static createJsonSerializer(): JsonSerializer {
    return new JsonSerializer();
  }

  public static createRequestDeserializer(jsonSerializer: JsonSerializer): RequestDeserializer {
    return new RequestDeserializer(jsonSerializer);
  }

  public static createResponseSerializer(jsonSerializer: JsonSerializer): ResponseSerializer {
    return new ResponseSerializer(jsonSerializer);
  }

  public static createContentTypeResolver(): ContentTypeResolver {
    return new ContentTypeResolver();
  }

  public static createResponseFormatter(): ResponseFormatter {
    return new ResponseFormatter();
  }

  public static createDateTimeConverter(): DateTimeConverter {
    return new DateTimeConverter();
  }

  public static createEnumConverter(): EnumConverter {
    return new EnumConverter();
  }

  public static createValueObjectConverter(): ValueObjectConverter {
    return new ValueObjectConverter();
  }
}
