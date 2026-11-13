import { PrismaClient } from "@prisma/client";
import { TransactionScope } from "../../adapters/transactions/scopes/TransactionScope.js";

export interface BusinessProfile {
  organizationId: string;
  businessType: string;
  country: string;
  contactInfo: string;
}

export class PrismaBusinessProfileRepository {
  constructor(private prisma: PrismaClient) {}

  private get db(): any {
    return TransactionScope.current ?? this.prisma;
  }

  public async findByOrganization(organizationId: string): Promise<BusinessProfile | null> {
    const row = await this.db.businessProfile.findUnique({ where: { organizationId } });
    if (!row) return null;
    return {
      organizationId: row.organizationId,
      businessType: row.businessType,
      country: row.country,
      contactInfo: row.contactInfo
    };
  }

  public async save(profile: BusinessProfile): Promise<void> {
    await this.db.businessProfile.upsert({
      where: { organizationId: profile.organizationId },
      create: {
        organizationId: profile.organizationId,
        businessType: profile.businessType,
        country: profile.country,
        contactInfo: profile.contactInfo
      },
      update: {
        businessType: profile.businessType,
        country: profile.country,
        contactInfo: profile.contactInfo
      }
    });
  }
}
