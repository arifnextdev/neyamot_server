import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DomainService {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async checkDomain(name: string) {
    const apiKey = this.configService.get<string>('WHOIS_API_KEY');
    const url = `https://domain-availability.whoisxmlapi.com/api/v1?apiKey=${apiKey}&domainName=${name}&outputFormat=JSON`;

    try {
      const response = await this.http.get(url).toPromise();
      if (!response) {
        throw new Error('No response from domain availability API');
      }
      if (response.status !== 200) {
        throw new Error(
          `Error fetching domain availability: ${response.statusText}`,
        );
      }
      if (!response.data || !response.data.domainAvailability) {
        throw new Error('Invalid domain availability response');
      }
      return response.data;
    } catch (error) {
      console.error('Error checking domain:', error);
      return { error: 'Error checking domain availability' };
    }
  }
}
