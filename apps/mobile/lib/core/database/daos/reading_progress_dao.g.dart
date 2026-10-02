// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reading_progress_dao.dart';

// ignore_for_file: type=lint
mixin _$ReadingProgressDaoMixin on DatabaseAccessor<AppDatabase> {
  $LocalReadingProgressTableTable get localReadingProgressTable =>
      attachedDatabase.localReadingProgressTable;
  ReadingProgressDaoManager get managers => ReadingProgressDaoManager(this);
}

class ReadingProgressDaoManager {
  final _$ReadingProgressDaoMixin _db;
  ReadingProgressDaoManager(this._db);
  $$LocalReadingProgressTableTableTableManager get localReadingProgressTable =>
      $$LocalReadingProgressTableTableTableManager(
        _db.attachedDatabase,
        _db.localReadingProgressTable,
      );
}
