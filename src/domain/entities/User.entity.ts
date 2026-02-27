/**
 * User Entity
 * Core business entity representing a user in the system
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dni: string;
  cuitCuil: string;
  verificationStatus: "pending" | "verified" | "rejected" | "suspended";
  webAccessEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  photoUrl?: string | null;
}

export class UserEntity implements User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone: string,
    public readonly dni: string,
    public readonly cuitCuil: string,
    public readonly verificationStatus:
      | "pending"
      | "verified"
      | "rejected"
      | "suspended",
    public readonly webAccessEnabled: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly photoUrl?: string | null,
  ) {}

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public isVerified(): boolean {
    return this.verificationStatus === "verified";
  }

  public canAccessWeb(): boolean {
    return this.webAccessEnabled && this.isVerified();
  }
}
