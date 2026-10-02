import 'package:drift/drift.dart';

/// Client-local user authentication and profile state.
/// Strictly isolated to the local device.
@DataClassName('LocalUserState')
class LocalUserStateTable extends Table {
  @override
  String get tableName => 'local_user_state';

  /// Primary identifier (matches Supabase auth.users UUID when authenticated).
  TextColumn get id => text()();

  /// User email (nullable for anonymous / offline guest).
  TextColumn get email => text().nullable()();

  /// Display name / Kunya / handle.
  TextColumn get displayName => text().nullable()();

  /// Avatar URL.
  TextColumn get avatarUrl => text().nullable()();

  /// Role (e.g. 'authenticated', 'scholar', 'admin', 'guest').
  TextColumn get role => text().withDefault(const Constant('authenticated'))();

  /// Whether this is a local-only guest session before account linking.
  BoolColumn get isAnonymous => boolean().withDefault(const Constant(false))();

  /// Last successful cloud synchronization timestamp.
  DateTimeColumn get lastSyncedAt => dateTime().nullable()();

  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}
