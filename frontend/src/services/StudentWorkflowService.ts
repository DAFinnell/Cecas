import type { ExtraCreditRequestResponse, StudentPointsSummary } from "../types/extraCredit.types";
import type { UserProfileResponse } from "../types/user.types";

class StudentWorkflowService {
  private readonly USER_BASE = '/api/users'; 
  private readonly EXTRA_CREDIT_REQUEST_BASE = '/api/extra-credit-requests';
 
  public async getUserProfile(): Promise<UserProfileResponse> {
    const res = await fetch(`${this.USER_BASE}/me`, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
    return res.json();
  }

  public async getMyPoints(): Promise<StudentPointsSummary> {
    const res = await fetch(`${this.USER_BASE}/me/points`, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`Failed to load points (${res.status})`);
    return res.json();
  }

  public async getRequests(): Promise<ExtraCreditRequestResponse[]> {
    const res = await fetch(this.EXTRA_CREDIT_REQUEST_BASE, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`Failed to load requests (${res.status})`);
    return res.json();
  }
}
export default new StudentWorkflowService();