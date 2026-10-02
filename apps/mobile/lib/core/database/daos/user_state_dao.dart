import 'package:drift/drift.dart';
import '../app_database.dart';
import '../tables/local_user_state_table.dart';

part 'user_state_dao.g.dart';

@DriftAccessor(tables: [LocalUserStateTable])
class UserStateDao extends DatabaseAccessor<AppDatabase>
    with _$UserStateDaoMixin {
  UserStateDao(super.db);

  /// Streams the current local user record.
  Stream<LocalUserState?> watchCurrentUser() {
    return (select(localUserStateTable)..limit(1)).watchSingleOrNull();
  }

  /// Gets the current local user record.
  Future<LocalUserState?> getCurrentUser() {
    return (select(localUserStateTable)..limit(1)).getSingleOrNull();
  }

  /// Saves or updates the local user record.
  Future<void> saveUser(LocalUserStateTableCompanion user) {
    return into(localUserStateTable).insertOnConflictUpdate(user);
  }

  /// Clears the user record (e.g. on logout).
  Future<int> clearAllUsers() {
    return delete(localUserStateTable).go();
  }
}
