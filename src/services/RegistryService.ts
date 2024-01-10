import semver from "semver";
import { Service } from "../types";

class Registry {
  services: Service[];
  timeout: number;
  constructor() {
    this.services = [];
    this.timeout = 15;
  }

  getKey({ host, name, port, version }: Service) {
    return `${name}::${version}::${host}::${port}`;
  }

  serviceExists(service: Service) {
    return this.serviceIndex(service) !== -1;
  }

  serviceIndex(service: Service) {
    return this.services.findIndex(
      (service_) => this.getKey(service) === this.getKey(service_)
    );
  }

  register(service: Service) {
    this.cleanUp();
    // If no service in registry
    const serviceIndex = this.serviceIndex(service);
    if (serviceIndex === -1) {
      // add service to registry
      this.services.push({
        ...service,
        timestamp: Date.now() / 1000, //epock time converted toseconds
      });
      console.info(
        `[+]Added service ${service.name} ${service.version} at ${service.host}:${service.port}`
      );
      // console.log(this.services);

      return service;
    }

    // if service exist the update timestamp preventing timeout
    this.services[serviceIndex] = {
      ...this.services[serviceIndex],
      timestamp: Date.now() / 1000,
    };
    console.log(
      `[+]Udated service ${service.name} ${service.version} at ${service.host}:${service.port}`
    );
    // console.log(this.services);
    return service;
  }

  unregister(service: Service) {
    const serviece = this.services.splice(this.serviceIndex(service), 1)[0];
    // console.log(this.services);

    return service;
  }

  cleanUp() {
    const now = Date.now() / 1000;
    this.services = this.services.filter(
      ({ timestamp }) => (timestamp as number) + this.timeout > now
    );
  }

  get(name: string, version: string) {
    this.cleanUp();
    const candidates = this.services.filter(
      (service) =>
        service.name === name && semver.satisfies(service.version, version)
    );
    // Load balance by randomly selecting service
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}

export default Registry;
