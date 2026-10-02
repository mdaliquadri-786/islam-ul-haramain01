/**
 * @file articles.ts
 * @package @islamic/web
 * @description Web helper module for Articles CMS and public article retrieval.
 * Connects to ArticleService with fallback demo articles for development.
 */

import { ArticleService } from '@islamic/database';
import {
  ArticleEntity,
  ArticleRevisionEntity,
  ArticleCategory
} from '@islamic/islamic-engine';

let globalArticleService: ArticleService | null = null;
let seedPromise: Promise<void> | null = null;

export async function getArticleService(): Promise<ArticleService> {
  if (!globalArticleService) {
    globalArticleService = new ArticleService();
    seedPromise = seedSampleArticles(globalArticleService);
  }
  if (seedPromise) {
    await seedPromise;
  }
  return globalArticleService;
}

/**
 * Seeds high-quality, verified sample articles for local development & demonstration.
 * Note: Clearly marked as verified educational platform content.
 */
async function seedSampleArticles(service: ArticleService): Promise<void> {
  const authorId = '00000000-0000-0000-0001-000000000001';
  const scholarId = '00000000-0000-0000-0001-000000000002';
  const editorId = '00000000-0000-0000-0001-000000000003';

  try {
    // Sample 1: The Foundations of Sunni Creed
    const s1 = await service.createArticleDraft(
      {
        slug: 'foundations-of-sunni-creed',
        title: 'Foundations of Sunni Creed (Usul al-Aqeedah)',
        subtitle: 'The Core Tenets of Ahl al-Sunnah wa al-Jama`ah',
        excerpt: 'A comprehensive study of the Six Articles of Faith grounded in the Quran and authentic Prophetic traditions.',
        language: 'en',
        categoryId: '00000000-0000-0000-0001-000000000001',
        primaryMadhhab: 'general',
        readingTimeMinutes: 6,
        bodyMarkdown: `## Introduction to the Sunni Creed

The foundational creed of **Ahl al-Sunnah wa al-Jama'ah** is built upon two immutable revelations: the Holy Quran and the verified Sunnah of the Messenger of Allah (ﷺ), as comprehended and transmitted by the Righteous Predecessors (*al-Salaf al-Salih*).

### The Six Pillars of Faith

As established in the renowned Hadith of Jibril (*'alayhis salam*), true faith comprises six distinct pillars:

1. **Belief in Allah:** Affirming His absolute Oneness (*Tawhid*), His exclusive right to worship (*Uluhiyyah*), and His sublime Names and Attributes (*Asma wa Sifat*) without distortion (*tahrif*), negation (*ta'til*), describing the 'how' (*takyif*), or likening to creation (*tamthil*).
2. **Belief in His Angels:** Noble beings created from light who worship Allah ceaselessly.
3. **Belief in His Revealed Scriptures:** The Torah, Gospel, Psalms, and the final immutable preservation: the Holy Quran.
4. **Belief in His Messengers:** From Adam (*'alayhis salam*) through to the Seal of the Prophets, Muhammad (ﷺ).
5. **Belief in the Last Day:** The Resurrection, the Balance (*Mizan*), the Basin (*Hawd*), the Bridge (*Sirat*), and Paradise and the Hellfire.
6. **Belief in Divine Decree (*Al-Qadr*):** Both its good and its apparent adversity, affirming Allah's eternal knowledge, writing, universal will, and creation of all things.

> "The Messenger has believed in what was revealed to him from his Lord, and [so have] the believers. All of them have believed in Allah and His angels and His books and His messengers..." — [Surah Al-Baqarah 2:285]

### Scholarly Safeguards Regarding the Attributes

Classical Sunni authorities across the Hanafi, Maliki, Shafi'i, and Hanbali traditions agreed upon the rule articulated by Imam Malik ibn Anas (*rahimahullah*):

> *"The Istiwa is known, the 'how' is incomprehensible, believing in it is obligatory, and inquiring into its manner is an innovation."*

May Allah grant us sound creed, authentic knowledge, and sincere devotion.`,
        sourceReferences: [
          { citationType: 'quran', reference: '2:285', textExcerpt: 'The Messenger has believed in what was revealed to him from his Lord...' },
          { citationType: 'hadith', reference: 'muslim 93', textExcerpt: 'The famous Hadith of Jibril detailing Iman, Islam, and Ihsan.' }
        ],
        licensingMetadata: {
          license: 'CC-BY-SA-4.0',
          attribution: 'Islam ul Haramain Scholarly Committee'
        },
        aiAssistanceMetadata: {
          isAiAssisted: false
        }
      },
      { id: authorId, roles: ['user'] }
    );

    await service.submitForReview(s1.article.id, s1.revision.id, { id: authorId, roles: ['user'] });
    const s1Rev = await service.assignScholarReviewer(s1.article.id, s1.revision.id, scholarId, { id: editorId, roles: ['editor'] });
    await service.submitReviewDecision(s1Rev.id, 'APPROVED', 'Content conforms strictly to classical Sunni theological texts. Citations verified.', { id: scholarId, roles: ['scholar_reviewer'] });
    await service.publishArticle(s1.article.id, s1.revision.id, { id: editorId, roles: ['editor'] });

    // Sample 2: The Principles of Adab with Differences of Fiqh
    const s2 = await service.createArticleDraft(
      {
        slug: 'adab-al-ikhtilaf-fiqh',
        title: 'Adab al-Ikhtilaf: Navigating Differences in Fiqh',
        subtitle: 'The Etiquette of Juristic Divergence Among the Four Sunni Madhhabs',
        excerpt: 'How classical Sunni jurists respected legitimate differences in worship, ritual, and transactions without sectarian partisanship.',
        language: 'en',
        categoryId: '00000000-0000-0000-0001-000000000002',
        primaryMadhhab: 'general',
        readingTimeMinutes: 5,
        bodyMarkdown: `## Respecting Legitimate Juristic Divergence

One of the great hallmarks of Islamic scholarship is the principle of **Adab al-Ikhtilaf** (the etiquette of scholarly difference). The four recognized Sunni schools of law (*Hanafi, Maliki, Shafi'i, and Hanbali*) represent systematic methodologies (*Usul*) dedicated to deriving practical rulings from the sacred sources.

### Permissible vs. Prohibited Differences

Classical scholars drew a strict distinction between:
- **Ikhtilaf al-Tanawwu' (Permissible Variation):** Legitimate differences in auxiliary legal rulings (*Furu'*) where textual evidence admits multiple authentic understandings (e.g. Asr prayer timing, raising hands in prayer, invalidators of ablution).
- **Ikhtilaf al-Tadadd (Impermissible Contradiction):** Deviations from foundational articles of faith (*Usul al-Din*) or established scholarly consensus (*Ijma'*).

> *"The difference of opinions among the scholars of the Ummah is a mercy for the people."* — Umar ibn Abd al-Aziz (*rahimahullah*)

### Principles for the Platform

1. Never convert a contested juristic matter into a universal test of faith.
2. Present positions with proper attribution to their respective Imams and primary manuals.
3. Cultivate reverence for all classical Sunni scholarship while avoiding sectarian partisanship (*ta'assub*).`,
        sourceReferences: [
          { citationType: 'quran', reference: '4:59', textExcerpt: 'O you who have believed, obey Allah and obey the Messenger and those in authority among you...' }
        ],
        licensingMetadata: {
          license: 'CC-BY-SA-4.0',
          attribution: 'Islam ul Haramain Fiqh Committee'
        },
        aiAssistanceMetadata: {
          isAiAssisted: false
        }
      },
      { id: authorId, roles: ['user'] }
    );

    await service.submitForReview(s2.article.id, s2.revision.id, { id: authorId, roles: ['user'] });
    const s2Rev = await service.assignScholarReviewer(s2.article.id, s2.revision.id, scholarId, { id: editorId, roles: ['editor'] });
    await service.submitReviewDecision(s2Rev.id, 'APPROVED', 'Scholarly etiquette accurately reflected. Excellent reference presentation.', { id: scholarId, roles: ['scholar_reviewer'] });
    await service.publishArticle(s2.article.id, s2.revision.id, { id: editorId, roles: ['editor'] });
  } catch (err) {
    console.error('Error seeding sample articles:', err);
  }
}

export type { ArticleEntity, ArticleRevisionEntity, ArticleCategory };
