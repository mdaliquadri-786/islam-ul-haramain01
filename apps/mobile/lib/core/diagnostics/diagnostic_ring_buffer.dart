import 'dart:async';
import 'diagnostic_models.dart';
import 'diagnostic_storage.dart';

/// Privacy-first local diagnostic ring buffer.
/// Enforces a hard cap of 50 diagnostic records, evicting the oldest records first.
/// Failures in buffer read/write are safely swallowed to ensure zero impact on worship features.
class DiagnosticRingBuffer {
  static const int defaultMaxCapacity = 50;
  final int maxCapacity;
  final DiagnosticStorage _storage;
  final List<DiagnosticEvent> _cachedEvents = [];
  bool _initialized = false;
  final Completer<void> _initCompleter = Completer<void>();

  DiagnosticRingBuffer({
    DiagnosticStorage? storage,
    this.maxCapacity = defaultMaxCapacity,
  }) : _storage = storage ?? SecureDiagnosticStorage() {
    _init();
  }

  Future<void> _init() async {
    try {
      final loaded = await _storage.loadEvents();
      _cachedEvents.clear();
      _cachedEvents.addAll(loaded);
      _enforceCapacity();
    } catch (_) {
      // Fail closed into safe clean state
      _cachedEvents.clear();
    } finally {
      _initialized = true;
      if (!_initCompleter.isCompleted) {
        _initCompleter.complete();
      }
    }
  }

  Future<void> _ensureInitialized() async {
    if (!_initialized) {
      await _initCompleter.future;
    }
  }

  /// Appends a new [DiagnosticEvent] to the ring buffer.
  /// If capacity exceeds [maxCapacity], oldest events are evicted immediately.
  Future<void> add(DiagnosticEvent event) async {
    try {
      await _ensureInitialized();
      _cachedEvents.add(event);
      _enforceCapacity();
      await _storage.saveEvents(_cachedEvents);
    } catch (_) {
      // Fail safely: Never crash the calling application due to diagnostics
    }
  }

  /// Retrieves an unmodifiable copy of all stored diagnostic events in chronological order.
  Future<List<DiagnosticEvent>> getEvents() async {
    try {
      await _ensureInitialized();
      return List.unmodifiable(_cachedEvents);
    } catch (_) {
      return const [];
    }
  }

  /// Removes successfully transmitted events by their unique IDs.
  Future<void> removeEvents(List<String> eventIds) async {
    try {
      await _ensureInitialized();
      if (eventIds.isEmpty) return;
      final idsSet = eventIds.toSet();
      _cachedEvents.removeWhere((e) => idsSet.contains(e.id));
      await _storage.saveEvents(_cachedEvents);
    } catch (_) {
      // Fail safely
    }
  }

  /// Clears the entire diagnostic buffer.
  Future<void> clear() async {
    try {
      await _ensureInitialized();
      _cachedEvents.clear();
      await _storage.clear();
    } catch (_) {
      // Fail safely
    }
  }

  /// Returns current number of buffered events.
  int get currentSize => _cachedEvents.length;

  void _enforceCapacity() {
    if (_cachedEvents.length > maxCapacity) {
      // Sort chronologically ascending to safely evict the true oldest records
      _cachedEvents.sort((a, b) => a.timestamp.compareTo(b.timestamp));
      while (_cachedEvents.length > maxCapacity) {
        _cachedEvents.removeAt(0);
      }
    }
  }
}
