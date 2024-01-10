import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { Configuration, Service } from "../types";
import { ServiceNotFoundException } from "../exceptions";

class ServiceClient {
  configuration: Configuration;
  constructor(config: Configuration) {
    this.configuration = config;
  }
  private async getService(
    serviceName: string,
    serviceVersion?: string
  ): Promise<Service> {
    try {
      const response: AxiosResponse<Service> = await axios.get(
        `${this.configuration.registry.instanceUrl}/find/${serviceName}/${
          serviceVersion ?? this.configuration.version
        }`
      );
      return response.data;
    } catch (error) {
      this.handleServiceError(
        error,
        serviceName,
        serviceVersion ?? this.configuration.version
      );
    }
  }

  private handleServiceError(
    error: any,
    serviceName: string,
    serviceVersion: string
  ): never {
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;
      if (axiosError.response?.status === 404) {
        throw new ServiceNotFoundException(
          `No matching service found for ${serviceName}:${serviceVersion}`
        );
      }
    }
    throw error;
  }

  public async callService(
    serviceName: string,
    requestOptions: AxiosRequestConfig
  ): Promise<any> {
    try {
      const { host, port } = await this.getService(serviceName);
      requestOptions.url = `http://${host}:${port}/${requestOptions.url}`;
      const response: AxiosResponse<any> = await axios(requestOptions);
      return response.data;
    } catch (error) {
      this.handleCallServiceError(error);
    }
  }

  private handleCallServiceError(error: any): never {
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;
      if (
        [400, 401, 403, 404, 500].includes(axiosError.response?.status ?? 0)
      ) {
        const errors =
          (axiosError.response?.data as any)?.errors ??
          (axiosError.response?.data as any);

        throw {
          status: axiosError.response?.status,
          errors,
        };
      }
    }
    if (
      typeof error === "object" &&
      error instanceof ServiceNotFoundException
    ) {
      throw error;
    }

    throw {
      status: 500,
      errors: error.message,
    };
  }
}

export default ServiceClient;
