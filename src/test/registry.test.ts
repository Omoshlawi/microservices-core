import { default as Registry } from "../services/RegistryService";
import semver from "semver";

describe("Registry", () => {
  let registry: Registry;

  beforeEach(() => {
    registry = new Registry();
  });

  describe("register()", () => {
    it("should add a new service to the registry", () => {
      const service = {
        name: "test-service",
        version: "1.0.0",
        host: "localhost",
        port: 8080,
      };
      registry.register(service);
      expect(registry.services.length).toBe(1);
      expect(registry.services[0]).toEqual({
        ...service,
        timestamp: expect.any(Number), // Ensure timestamp is set
      });
    });

    it("should update the timestamp of an existing service", () => {
      const service = {
        name: "test-service",
        version: "1.0.0",
        host: "localhost",
        port: 8080,
      };
      registry.register(service);
      const initialTimestamp = registry.services[0].timestamp;

      // Wait for a short time to ensure timestamp changes
      jest.advanceTimersByTime(1000);

      registry.register(service);
      expect(registry.services[0].timestamp).toBeGreaterThan(initialTimestamp!);
    });
  });

  describe("unregister()", () => {
    it("should remove a service from the registry", () => {
      const service = {
        name: "test-service",
        version: "1.0.0",
        host: "localhost",
        port: 8080,
      };
      registry.register(service);
      registry.unregister(service);
      expect(registry.services.length).toBe(0);
    });
  });

  describe("get()", () => {
    it("should return a matching service based on name and version", () => {
      registry.register({
        name: "test-service",
        version: "1.0.0",
        host: "localhost",
        port: 8080,
      });
      registry.register({
        name: "test-service",
        version: "2.0.0",
        host: "localhost",
        port: 8081,
      });
      const service = registry.get("test-service", "^1.0.0");
      expect(service).toEqual({
        name: "test-service",
        version: "1.0.0",
        host: "localhost",
        port: 8080,
      });
    });

    it("should return undefined if no matching service is found", () => {
      const service = registry.get("non-existent-service", "1.0.0");
      expect(service).toBeUndefined();
    });
  });

  describe("cleanUp()", () => {
    it("should remove expired services", () => {
      registry.timeout = 1; // Set a short timeout for testing
      const service = {
        name: "test-service",
        version: "1.0.0",
        host: "localhost",
        port: 8080,
      };
      registry.register(service);

      jest.advanceTimersByTime(2000); // Advance time beyond timeout
      registry.cleanUp();
      expect(registry.services.length).toBe(0);
    });
  });

  describe("getKey()", () => {
    it("should generate a unique key for a service", () => {
      const service1 = {
        name: "test-service",
        version: "1.0.0",
        host: "localhost",
        port: 8080,
      };
      const service2 = {
        name: "test-service",
        version: "1.0.0",
        host: "localhost",
        port: 8081,
      };
      expect(registry.getKey(service1)).not.toBe(registry.getKey(service2));
    });
  });
});
