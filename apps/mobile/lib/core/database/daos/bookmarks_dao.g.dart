// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bookmarks_dao.dart';

// ignore_for_file: type=lint
mixin _$BookmarksDaoMixin on DatabaseAccessor<AppDatabase> {
  $LocalBookmarksTableTable get localBookmarksTable =>
      attachedDatabase.localBookmarksTable;
  BookmarksDaoManager get managers => BookmarksDaoManager(this);
}

class BookmarksDaoManager {
  final _$BookmarksDaoMixin _db;
  BookmarksDaoManager(this._db);
  $$LocalBookmarksTableTableTableManager get localBookmarksTable =>
      $$LocalBookmarksTableTableTableManager(
        _db.attachedDatabase,
        _db.localBookmarksTable,
      );
}
