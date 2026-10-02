/**
 * @file governance.ts
 * @package @islamic/islamic-engine
 * @description Enforcement of Islamic Methodology, AI Restrictions,
 *              and Content Licensing Rules for Articles.
 */

import type {
  ArticleAiAssistanceMetadata,
  ArticleLicensingMetadata
} from './types.js';

export interface GovernanceValidationResult {
  valid: boolean;
  issues: string[];
}

/**
 * Validates AI Governance rules for article drafting and review:
 * - AI cannot act as a Mufti or approve articles autonomously.
 * - AI-assisted content must have explicit human verification documented before submission.
 * - AI cannot be a reviewer or publisher.
 */
export function validateAiGovernance(
  aiMetadata: ArticleAiAssistanceMetadata,
  isSubmissionAttempt = false
): GovernanceValidationResult {
  const issues: string[] = [];

  if (aiMetadata.isAiAssisted) {
    if (!aiMetadata.toolUsed || aiMetadata.toolUsed.trim().length === 0) {
      issues.push('AI Governance Violation: Articles with AI assistance must declare the tool/system used.');
    }

    if (!aiMetadata.promptPurpose || aiMetadata.promptPurpose.trim().length === 0) {
      issues.push('AI Governance Violation: Articles with AI assistance must declare the scope/purpose of the AI assistance.');
    }

    if (isSubmissionAttempt) {
      if (!aiMetadata.humanVerifiedBy || aiMetadata.humanVerifiedBy.trim().length === 0) {
        issues.push('AI Governance Violation: AI-assisted drafts must be 100% reviewed and certified by a human author before submission for scholarly review.');
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Validates Article Licensing rules in alignment with docs/CONTENT_LICENSE_MATRIX.md:
 * - Must declare an explicit licensing standard.
 * - Cannot claim Public Domain without documented justification.
 */
export function validateLicensing(
  licensing: ArticleLicensingMetadata
): GovernanceValidationResult {
  const issues: string[] = [];

  if (!licensing.license || licensing.license.trim().length === 0) {
    issues.push('Licensing Violation: Article must declare an explicit license (e.g. CC-BY-SA-4.0).');
  }

  if (!licensing.attribution || licensing.attribution.trim().length === 0) {
    issues.push('Licensing Violation: Article must declare an attribution notice.');
  }

  if (licensing.isPublicDomain && (!licensing.sourceUrl || licensing.sourceUrl.trim().length === 0)) {
    issues.push('Licensing Violation: Public Domain claims require documented source URL evidence.');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
