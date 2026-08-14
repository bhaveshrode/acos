/**
 * Infrastructure snapshot model for the User aggregate.
 */
export interface UserSnapshot {
  id: string;
  email: string;
  passwordHash: string;
  status: string;
  name: string;
  verificationToken: {
    token: string;
    expiresAt: Date;
  } | null;
  passwordResetToken: {
    token: string;
    expiresAt: Date;
  } | null;
  loginAttempts: Array<{
    ipAddress: string;
    timestamp: Date;
    successful: boolean;
  }>;
  sessions: Array<{
    sessionId: string;
    refreshToken: string;
    expiresAt: Date;
    status: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
