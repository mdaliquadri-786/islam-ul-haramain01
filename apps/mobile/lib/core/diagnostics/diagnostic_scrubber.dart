/// Deterministic, privacy-preserving scrubber for mobile diagnostics.
/// Strips personal identifying information (PII), authentication credentials,
/// coordinates, and sacred devotional queries before error persistence or transmission.
class DiagnosticScrubber {
  // Authentication & Secrets
  static final RegExp _bearerPattern =
      RegExp(r'Bearer\s+[A-Za-z0-9\-._~+/]+=*', caseSensitive: false);
  static final RegExp _jwtPattern =
      RegExp(r'\beyJ[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,}\b');
  static final RegExp _apiKeyPattern =
      RegExp(r'\b(?:sbp_|AIza|sk_live_|key-)[A-Za-z0-9_\-]{8,}\b');
  static final RegExp _secretAssignmentPattern = RegExp(
      r'\b(?:service_role|supabase_service|password|secret|api_key)\s*[:=]\s*[^\s,;]+',
      caseSensitive: false);
  static final RegExp _cookiePattern =
      RegExp(r'\b(?:cookie|session|sb-[^=]+-auth-token)\s*=\s*[^\s;]+',
          caseSensitive: false);
  static final RegExp _authHeaderPattern =
      RegExp(r'authorization\s*:\s*[^\n\r]+', caseSensitive: false);

  // Contact & Network PII
  static final RegExp _emailPattern =
      RegExp(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+');
  static final RegExp _phonePattern =
      RegExp(r'(?:\+|00)\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{3,4}[-.\s]?\d{3,9}');
  static final RegExp _ipv4Pattern =
      RegExp(r'\b(?:\d{1,3}\.){3}\d{1,3}\b');
  static final RegExp _ipv6Pattern =
      RegExp(r'\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b');

  // Geolocation & Compass Telemetry
  static final RegExp _coordinateAssignmentPattern = RegExp(
      r'\b(?:lat|latitude|lon|lng|longitude)\s*[:=]\s*-?\d+(?:\.\d+)?',
      caseSensitive: false);
  static final RegExp _coordinatePairPattern =
      RegExp(r'-?\b[0-8]?\d\.\d{4,},\s*-?(?:1[0-7]\d|\d{1,2})\.\d{4,}\b');
  static final RegExp _headingPattern =
      RegExp(r'\b(?:bearing|heading|azimuth)\s*[:=]\s*-?\d+(?:\.\d+)?',
          caseSensitive: false);

  // Sacred Devotional Data & Religious Search Queries
  static final RegExp _religiousSearchPattern = RegExp(
      r'\b(?:quran|surah|ayah|ayat|hadith|bukhari|muslim|hisnul|dua|supplication|dhikr|tasbeeh|rabbana|reflection|personal_note)\s*[:=]\s*[^.\n\r,;]+',
      caseSensitive: false);
  static final RegExp _madhhabMethodPattern = RegExp(
      r'\b(hanafi|shafi|maliki|hanbali|umm_al_qura|karachi|muslim_world_league|isna|egyptian)\b',
      caseSensitive: false);

  // Local File System Paths containing user home directories
  static final RegExp _userPathPattern =
      RegExp(r'(?:Users|home)[/\\][a-zA-Z0-9_-]+[/\\]', caseSensitive: false);

  /// Sanitizes arbitrary error text or exception messages.
  /// If uncertain, redacts aggressively.
  static String sanitize(String input) {
    if (input.isEmpty) return input;

    String sanitized = input;

    // 1. Redact Authorization headers & secrets
    sanitized = sanitized.replaceAllMapped(_authHeaderPattern, (_) => 'authorization: [REDACTED_HEADER]');
    sanitized = sanitized.replaceAllMapped(_bearerPattern, (_) => 'Bearer [REDACTED_TOKEN]');
    sanitized = sanitized.replaceAllMapped(_jwtPattern, (_) => '[REDACTED_JWT]');
    sanitized = sanitized.replaceAllMapped(_apiKeyPattern, (_) => '[REDACTED_KEY]');
    sanitized = sanitized.replaceAllMapped(_secretAssignmentPattern, (_) => '[REDACTED_SECRET]');
    sanitized = sanitized.replaceAllMapped(_cookiePattern, (_) => '[REDACTED_COOKIE]');

    // 2. Redact PII (emails, phones, IPs)
    sanitized = sanitized.replaceAllMapped(_emailPattern, (_) => '[REDACTED_EMAIL]');
    sanitized = sanitized.replaceAllMapped(_phonePattern, (_) => '[REDACTED_PHONE]');
    sanitized = sanitized.replaceAllMapped(_ipv4Pattern, (_) => '[REDACTED_IP]');
    sanitized = sanitized.replaceAllMapped(_ipv6Pattern, (_) => '[REDACTED_IPV6]');

    // 3. Redact Coordinates & Compass Bearing
    sanitized = sanitized.replaceAllMapped(_coordinateAssignmentPattern, (_) => '[REDACTED_COORDINATES]');
    sanitized = sanitized.replaceAllMapped(_coordinatePairPattern, (_) => '[REDACTED_COORDINATES]');
    sanitized = sanitized.replaceAllMapped(_headingPattern, (_) => '[REDACTED_HEADING]');

    // 4. Redact Sacred Religious Data & Preferences
    sanitized = sanitized.replaceAllMapped(_religiousSearchPattern, (_) => '[REDACTED_RELIGIOUS_DATA]');
    sanitized = sanitized.replaceAllMapped(_madhhabMethodPattern, (_) => '[REDACTED_MADHHAB_OR_METHOD]');

    // 5. Redact Local User File Paths
    sanitized = sanitized.replaceAllMapped(_userPathPattern, (_) => 'Users/[REDACTED_USER]/');

    return sanitized;
  }

  /// Sanitizes a [StackTrace] into safe, redacted string format.
  static String sanitizeStackTrace(StackTrace? stackTrace) {
    if (stackTrace == null) return '';
    return sanitize(stackTrace.toString());
  }
}
