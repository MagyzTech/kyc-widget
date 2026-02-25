import axios, { AxiosInstance } from 'axios';
import type {
  BVNVerificationPayload,
  DocumentVerificationPayload,
  AddressUpdatePayload,
  CombinedVerificationPayload,
  Tier2KYCPayload,
  KYCStatus,
  KYCResult,
} from '../types';

export class KYCApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, accessToken: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async getKYCStatus(): Promise<KYCStatus> {
    const { data } = await this.client.get('/kyc/v2/status');
    return data.data;
  }

  async getUserData(): Promise<any> {
    const { data } = await this.client.get('/user/');
    return data.data;
  }

  async verifyCombined(payload: CombinedVerificationPayload): Promise<KYCResult> {
    const { data } = await this.client.post('/kyc/v2/verify', payload);
    return data.data;
  }

  async verifyBVN(payload: BVNVerificationPayload): Promise<KYCResult> {
    const { data } = await this.client.post('/kyc/v2/level-1/verify-bvn', payload);
    return data.data;
  }

  async verifyDocument(payload: DocumentVerificationPayload): Promise<KYCResult> {
    const { data } = await this.client.post('/kyc/v2/level-2/verify-document', payload);
    return data.data;
  }

  async updateAddress(payload: AddressUpdatePayload): Promise<KYCResult> {
    const { data } = await this.client.patch('/kyc/v2/level-2/update-address', payload);
    return data.data;
  }

  async verifyTier2KYC(payload: Tier2KYCPayload): Promise<KYCResult> {
    const { data } = await this.client.post('/kyc/v2/level-2/verify-kyc', payload);
    return data.data;
  }
}
