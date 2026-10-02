// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_state_dao.dart';

// ignore_for_file: type=lint
mixin _$UserStateDaoMixin on DatabaseAccessor<AppDatabase> {
  $LocalUserStateTableTable get localUserStateTable =>
      attachedDatabase.localUserStateTable;
  UserStateDaoManager get managers => UserStateDaoManager(this);
}

class UserStateDaoManager {
  final _$UserStateDaoMixin _db;
  UserStateDaoManager(this._db);
  $$LocalUserStateTableTableTableManager get localUserStateTable =>
      $$LocalUserStateTableTableTableManager(
        _db.attachedDatabase,
        _db.localUserStateTable,
      );
}
