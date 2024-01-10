import axios from "axios";

type RegistryClientConfig = {
  instanceUrl: string;
  serviceName: string;
  serviceVersion: string;
  servicePort: number;
  heartbeatRate?: number;
};

class ServiceRegistryClient {
  configuration: RegistryClientConfig;
  interval?: NodeJS.Timeout;
  constructor(config: RegistryClientConfig) {
    this.configuration = config;
  }

  async register() {
    try {
      await axios.put(
        `${this.configuration.instanceUrl}/register/${this.configuration.serviceName}/${this.configuration.serviceVersion}/${this.configuration.servicePort}`
      );
    } catch (error) {
      console.error(error);
    }
  }
  async unregister() {
    try {
      const response = await axios.delete(
        `${this.configuration.instanceUrl}/register/${this.configuration.serviceName}/${this.configuration.serviceVersion}/${this.configuration.servicePort}`
      );
    } catch (error) {
      console.error(error);
    }
  }

  async start() {
    await this.register();
    this.interval = setInterval(
      this.register,
      this.configuration.heartbeatRate ?? 10000
    );
  }

  async stop() {
    clearInterval(this.interval);
    await this.unregister();
  }
}

export default ServiceRegistryClient;
