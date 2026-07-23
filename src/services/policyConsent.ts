interface ConsentRecord {
  acceptedTermsAt: string | null;
  acceptedPrivacyAt: string | null;
}

export function canEnterApp(consent: ConsentRecord): boolean {
  return Boolean(consent.acceptedTermsAt && consent.acceptedPrivacyAt);
}

export function createConsentPatch(isoTimestamp: string): { acceptedTermsAt: string; acceptedPrivacyAt: string } {
  return {
    acceptedTermsAt: isoTimestamp,
    acceptedPrivacyAt: isoTimestamp
  };
}
