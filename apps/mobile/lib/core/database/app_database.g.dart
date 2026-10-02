// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $LocalUserStateTableTable extends LocalUserStateTable
    with TableInfo<$LocalUserStateTableTable, LocalUserState> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalUserStateTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _emailMeta = const VerificationMeta('email');
  @override
  late final GeneratedColumn<String> email = GeneratedColumn<String>(
    'email',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _displayNameMeta = const VerificationMeta(
    'displayName',
  );
  @override
  late final GeneratedColumn<String> displayName = GeneratedColumn<String>(
    'display_name',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _avatarUrlMeta = const VerificationMeta(
    'avatarUrl',
  );
  @override
  late final GeneratedColumn<String> avatarUrl = GeneratedColumn<String>(
    'avatar_url',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _roleMeta = const VerificationMeta('role');
  @override
  late final GeneratedColumn<String> role = GeneratedColumn<String>(
    'role',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('authenticated'),
  );
  static const VerificationMeta _isAnonymousMeta = const VerificationMeta(
    'isAnonymous',
  );
  @override
  late final GeneratedColumn<bool> isAnonymous = GeneratedColumn<bool>(
    'is_anonymous',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("is_anonymous" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  static const VerificationMeta _lastSyncedAtMeta = const VerificationMeta(
    'lastSyncedAt',
  );
  @override
  late final GeneratedColumn<DateTime> lastSyncedAt = GeneratedColumn<DateTime>(
    'last_synced_at',
    aliasedName,
    true,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    email,
    displayName,
    avatarUrl,
    role,
    isAnonymous,
    lastSyncedAt,
    createdAt,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_user_state';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalUserState> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('email')) {
      context.handle(
        _emailMeta,
        email.isAcceptableOrUnknown(data['email']!, _emailMeta),
      );
    }
    if (data.containsKey('display_name')) {
      context.handle(
        _displayNameMeta,
        displayName.isAcceptableOrUnknown(
          data['display_name']!,
          _displayNameMeta,
        ),
      );
    }
    if (data.containsKey('avatar_url')) {
      context.handle(
        _avatarUrlMeta,
        avatarUrl.isAcceptableOrUnknown(data['avatar_url']!, _avatarUrlMeta),
      );
    }
    if (data.containsKey('role')) {
      context.handle(
        _roleMeta,
        role.isAcceptableOrUnknown(data['role']!, _roleMeta),
      );
    }
    if (data.containsKey('is_anonymous')) {
      context.handle(
        _isAnonymousMeta,
        isAnonymous.isAcceptableOrUnknown(
          data['is_anonymous']!,
          _isAnonymousMeta,
        ),
      );
    }
    if (data.containsKey('last_synced_at')) {
      context.handle(
        _lastSyncedAtMeta,
        lastSyncedAt.isAcceptableOrUnknown(
          data['last_synced_at']!,
          _lastSyncedAtMeta,
        ),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalUserState map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalUserState(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      email: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}email'],
      ),
      displayName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}display_name'],
      ),
      avatarUrl: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}avatar_url'],
      ),
      role: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}role'],
      )!,
      isAnonymous: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}is_anonymous'],
      )!,
      lastSyncedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}last_synced_at'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $LocalUserStateTableTable createAlias(String alias) {
    return $LocalUserStateTableTable(attachedDatabase, alias);
  }
}

class LocalUserState extends DataClass implements Insertable<LocalUserState> {
  /// Primary identifier (matches Supabase auth.users UUID when authenticated).
  final String id;

  /// User email (nullable for anonymous / offline guest).
  final String? email;

  /// Display name / Kunya / handle.
  final String? displayName;

  /// Avatar URL.
  final String? avatarUrl;

  /// Role (e.g. 'authenticated', 'scholar', 'admin', 'guest').
  final String role;

  /// Whether this is a local-only guest session before account linking.
  final bool isAnonymous;

  /// Last successful cloud synchronization timestamp.
  final DateTime? lastSyncedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  const LocalUserState({
    required this.id,
    this.email,
    this.displayName,
    this.avatarUrl,
    required this.role,
    required this.isAnonymous,
    this.lastSyncedAt,
    required this.createdAt,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    if (!nullToAbsent || email != null) {
      map['email'] = Variable<String>(email);
    }
    if (!nullToAbsent || displayName != null) {
      map['display_name'] = Variable<String>(displayName);
    }
    if (!nullToAbsent || avatarUrl != null) {
      map['avatar_url'] = Variable<String>(avatarUrl);
    }
    map['role'] = Variable<String>(role);
    map['is_anonymous'] = Variable<bool>(isAnonymous);
    if (!nullToAbsent || lastSyncedAt != null) {
      map['last_synced_at'] = Variable<DateTime>(lastSyncedAt);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  LocalUserStateTableCompanion toCompanion(bool nullToAbsent) {
    return LocalUserStateTableCompanion(
      id: Value(id),
      email: email == null && nullToAbsent
          ? const Value.absent()
          : Value(email),
      displayName: displayName == null && nullToAbsent
          ? const Value.absent()
          : Value(displayName),
      avatarUrl: avatarUrl == null && nullToAbsent
          ? const Value.absent()
          : Value(avatarUrl),
      role: Value(role),
      isAnonymous: Value(isAnonymous),
      lastSyncedAt: lastSyncedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastSyncedAt),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory LocalUserState.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalUserState(
      id: serializer.fromJson<String>(json['id']),
      email: serializer.fromJson<String?>(json['email']),
      displayName: serializer.fromJson<String?>(json['displayName']),
      avatarUrl: serializer.fromJson<String?>(json['avatarUrl']),
      role: serializer.fromJson<String>(json['role']),
      isAnonymous: serializer.fromJson<bool>(json['isAnonymous']),
      lastSyncedAt: serializer.fromJson<DateTime?>(json['lastSyncedAt']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'email': serializer.toJson<String?>(email),
      'displayName': serializer.toJson<String?>(displayName),
      'avatarUrl': serializer.toJson<String?>(avatarUrl),
      'role': serializer.toJson<String>(role),
      'isAnonymous': serializer.toJson<bool>(isAnonymous),
      'lastSyncedAt': serializer.toJson<DateTime?>(lastSyncedAt),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  LocalUserState copyWith({
    String? id,
    Value<String?> email = const Value.absent(),
    Value<String?> displayName = const Value.absent(),
    Value<String?> avatarUrl = const Value.absent(),
    String? role,
    bool? isAnonymous,
    Value<DateTime?> lastSyncedAt = const Value.absent(),
    DateTime? createdAt,
    DateTime? updatedAt,
  }) => LocalUserState(
    id: id ?? this.id,
    email: email.present ? email.value : this.email,
    displayName: displayName.present ? displayName.value : this.displayName,
    avatarUrl: avatarUrl.present ? avatarUrl.value : this.avatarUrl,
    role: role ?? this.role,
    isAnonymous: isAnonymous ?? this.isAnonymous,
    lastSyncedAt: lastSyncedAt.present ? lastSyncedAt.value : this.lastSyncedAt,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  LocalUserState copyWithCompanion(LocalUserStateTableCompanion data) {
    return LocalUserState(
      id: data.id.present ? data.id.value : this.id,
      email: data.email.present ? data.email.value : this.email,
      displayName: data.displayName.present
          ? data.displayName.value
          : this.displayName,
      avatarUrl: data.avatarUrl.present ? data.avatarUrl.value : this.avatarUrl,
      role: data.role.present ? data.role.value : this.role,
      isAnonymous: data.isAnonymous.present
          ? data.isAnonymous.value
          : this.isAnonymous,
      lastSyncedAt: data.lastSyncedAt.present
          ? data.lastSyncedAt.value
          : this.lastSyncedAt,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalUserState(')
          ..write('id: $id, ')
          ..write('email: $email, ')
          ..write('displayName: $displayName, ')
          ..write('avatarUrl: $avatarUrl, ')
          ..write('role: $role, ')
          ..write('isAnonymous: $isAnonymous, ')
          ..write('lastSyncedAt: $lastSyncedAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    email,
    displayName,
    avatarUrl,
    role,
    isAnonymous,
    lastSyncedAt,
    createdAt,
    updatedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalUserState &&
          other.id == this.id &&
          other.email == this.email &&
          other.displayName == this.displayName &&
          other.avatarUrl == this.avatarUrl &&
          other.role == this.role &&
          other.isAnonymous == this.isAnonymous &&
          other.lastSyncedAt == this.lastSyncedAt &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class LocalUserStateTableCompanion extends UpdateCompanion<LocalUserState> {
  final Value<String> id;
  final Value<String?> email;
  final Value<String?> displayName;
  final Value<String?> avatarUrl;
  final Value<String> role;
  final Value<bool> isAnonymous;
  final Value<DateTime?> lastSyncedAt;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const LocalUserStateTableCompanion({
    this.id = const Value.absent(),
    this.email = const Value.absent(),
    this.displayName = const Value.absent(),
    this.avatarUrl = const Value.absent(),
    this.role = const Value.absent(),
    this.isAnonymous = const Value.absent(),
    this.lastSyncedAt = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalUserStateTableCompanion.insert({
    required String id,
    this.email = const Value.absent(),
    this.displayName = const Value.absent(),
    this.avatarUrl = const Value.absent(),
    this.role = const Value.absent(),
    this.isAnonymous = const Value.absent(),
    this.lastSyncedAt = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id);
  static Insertable<LocalUserState> custom({
    Expression<String>? id,
    Expression<String>? email,
    Expression<String>? displayName,
    Expression<String>? avatarUrl,
    Expression<String>? role,
    Expression<bool>? isAnonymous,
    Expression<DateTime>? lastSyncedAt,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (email != null) 'email': email,
      if (displayName != null) 'display_name': displayName,
      if (avatarUrl != null) 'avatar_url': avatarUrl,
      if (role != null) 'role': role,
      if (isAnonymous != null) 'is_anonymous': isAnonymous,
      if (lastSyncedAt != null) 'last_synced_at': lastSyncedAt,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalUserStateTableCompanion copyWith({
    Value<String>? id,
    Value<String?>? email,
    Value<String?>? displayName,
    Value<String?>? avatarUrl,
    Value<String>? role,
    Value<bool>? isAnonymous,
    Value<DateTime?>? lastSyncedAt,
    Value<DateTime>? createdAt,
    Value<DateTime>? updatedAt,
    Value<int>? rowid,
  }) {
    return LocalUserStateTableCompanion(
      id: id ?? this.id,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      role: role ?? this.role,
      isAnonymous: isAnonymous ?? this.isAnonymous,
      lastSyncedAt: lastSyncedAt ?? this.lastSyncedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (email.present) {
      map['email'] = Variable<String>(email.value);
    }
    if (displayName.present) {
      map['display_name'] = Variable<String>(displayName.value);
    }
    if (avatarUrl.present) {
      map['avatar_url'] = Variable<String>(avatarUrl.value);
    }
    if (role.present) {
      map['role'] = Variable<String>(role.value);
    }
    if (isAnonymous.present) {
      map['is_anonymous'] = Variable<bool>(isAnonymous.value);
    }
    if (lastSyncedAt.present) {
      map['last_synced_at'] = Variable<DateTime>(lastSyncedAt.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalUserStateTableCompanion(')
          ..write('id: $id, ')
          ..write('email: $email, ')
          ..write('displayName: $displayName, ')
          ..write('avatarUrl: $avatarUrl, ')
          ..write('role: $role, ')
          ..write('isAnonymous: $isAnonymous, ')
          ..write('lastSyncedAt: $lastSyncedAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $AppSettingsTableTable extends AppSettingsTable
    with TableInfo<$AppSettingsTableTable, AppSetting> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $AppSettingsTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('default'),
  );
  static const VerificationMeta _themeModeMeta = const VerificationMeta(
    'themeMode',
  );
  @override
  late final GeneratedColumn<String> themeMode = GeneratedColumn<String>(
    'theme_mode',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('system'),
  );
  static const VerificationMeta _localeMeta = const VerificationMeta('locale');
  @override
  late final GeneratedColumn<String> locale = GeneratedColumn<String>(
    'locale',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('en'),
  );
  static const VerificationMeta _arabicScriptMeta = const VerificationMeta(
    'arabicScript',
  );
  @override
  late final GeneratedColumn<String> arabicScript = GeneratedColumn<String>(
    'arabic_script',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('uthmani'),
  );
  static const VerificationMeta _arabicFontSizeMeta = const VerificationMeta(
    'arabicFontSize',
  );
  @override
  late final GeneratedColumn<double> arabicFontSize = GeneratedColumn<double>(
    'arabic_font_size',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
    defaultValue: const Constant(26.0),
  );
  static const VerificationMeta _translationFontSizeMeta =
      const VerificationMeta('translationFontSize');
  @override
  late final GeneratedColumn<double> translationFontSize =
      GeneratedColumn<double>(
        'translation_font_size',
        aliasedName,
        false,
        type: DriftSqlType.double,
        requiredDuringInsert: false,
        defaultValue: const Constant(16.0),
      );
  static const VerificationMeta _prayerCalculationMethodMeta =
      const VerificationMeta('prayerCalculationMethod');
  @override
  late final GeneratedColumn<String> prayerCalculationMethod =
      GeneratedColumn<String>(
        'prayer_calculation_method',
        aliasedName,
        false,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
        defaultValue: const Constant('muslim_world_league'),
      );
  static const VerificationMeta _prayerMadhabMeta = const VerificationMeta(
    'prayerMadhab',
  );
  @override
  late final GeneratedColumn<String> prayerMadhab = GeneratedColumn<String>(
    'prayer_madhab',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('shafi'),
  );
  static const VerificationMeta _selectedReciterIdMeta = const VerificationMeta(
    'selectedReciterId',
  );
  @override
  late final GeneratedColumn<String> selectedReciterId =
      GeneratedColumn<String>(
        'selected_reciter_id',
        aliasedName,
        false,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
        defaultValue: const Constant('mishary-rashid-alafasy'),
      );
  static const VerificationMeta _notificationsEnabledMeta =
      const VerificationMeta('notificationsEnabled');
  @override
  late final GeneratedColumn<bool> notificationsEnabled = GeneratedColumn<bool>(
    'notifications_enabled',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("notifications_enabled" IN (0, 1))',
    ),
    defaultValue: const Constant(true),
  );
  static const VerificationMeta _offlineSyncEnabledMeta =
      const VerificationMeta('offlineSyncEnabled');
  @override
  late final GeneratedColumn<bool> offlineSyncEnabled = GeneratedColumn<bool>(
    'offline_sync_enabled',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("offline_sync_enabled" IN (0, 1))',
    ),
    defaultValue: const Constant(true),
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    themeMode,
    locale,
    arabicScript,
    arabicFontSize,
    translationFontSize,
    prayerCalculationMethod,
    prayerMadhab,
    selectedReciterId,
    notificationsEnabled,
    offlineSyncEnabled,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'app_settings';
  @override
  VerificationContext validateIntegrity(
    Insertable<AppSetting> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('theme_mode')) {
      context.handle(
        _themeModeMeta,
        themeMode.isAcceptableOrUnknown(data['theme_mode']!, _themeModeMeta),
      );
    }
    if (data.containsKey('locale')) {
      context.handle(
        _localeMeta,
        locale.isAcceptableOrUnknown(data['locale']!, _localeMeta),
      );
    }
    if (data.containsKey('arabic_script')) {
      context.handle(
        _arabicScriptMeta,
        arabicScript.isAcceptableOrUnknown(
          data['arabic_script']!,
          _arabicScriptMeta,
        ),
      );
    }
    if (data.containsKey('arabic_font_size')) {
      context.handle(
        _arabicFontSizeMeta,
        arabicFontSize.isAcceptableOrUnknown(
          data['arabic_font_size']!,
          _arabicFontSizeMeta,
        ),
      );
    }
    if (data.containsKey('translation_font_size')) {
      context.handle(
        _translationFontSizeMeta,
        translationFontSize.isAcceptableOrUnknown(
          data['translation_font_size']!,
          _translationFontSizeMeta,
        ),
      );
    }
    if (data.containsKey('prayer_calculation_method')) {
      context.handle(
        _prayerCalculationMethodMeta,
        prayerCalculationMethod.isAcceptableOrUnknown(
          data['prayer_calculation_method']!,
          _prayerCalculationMethodMeta,
        ),
      );
    }
    if (data.containsKey('prayer_madhab')) {
      context.handle(
        _prayerMadhabMeta,
        prayerMadhab.isAcceptableOrUnknown(
          data['prayer_madhab']!,
          _prayerMadhabMeta,
        ),
      );
    }
    if (data.containsKey('selected_reciter_id')) {
      context.handle(
        _selectedReciterIdMeta,
        selectedReciterId.isAcceptableOrUnknown(
          data['selected_reciter_id']!,
          _selectedReciterIdMeta,
        ),
      );
    }
    if (data.containsKey('notifications_enabled')) {
      context.handle(
        _notificationsEnabledMeta,
        notificationsEnabled.isAcceptableOrUnknown(
          data['notifications_enabled']!,
          _notificationsEnabledMeta,
        ),
      );
    }
    if (data.containsKey('offline_sync_enabled')) {
      context.handle(
        _offlineSyncEnabledMeta,
        offlineSyncEnabled.isAcceptableOrUnknown(
          data['offline_sync_enabled']!,
          _offlineSyncEnabledMeta,
        ),
      );
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  AppSetting map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return AppSetting(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      themeMode: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}theme_mode'],
      )!,
      locale: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}locale'],
      )!,
      arabicScript: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}arabic_script'],
      )!,
      arabicFontSize: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}arabic_font_size'],
      )!,
      translationFontSize: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}translation_font_size'],
      )!,
      prayerCalculationMethod: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}prayer_calculation_method'],
      )!,
      prayerMadhab: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}prayer_madhab'],
      )!,
      selectedReciterId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}selected_reciter_id'],
      )!,
      notificationsEnabled: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}notifications_enabled'],
      )!,
      offlineSyncEnabled: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}offline_sync_enabled'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $AppSettingsTableTable createAlias(String alias) {
    return $AppSettingsTableTable(attachedDatabase, alias);
  }
}

class AppSetting extends DataClass implements Insertable<AppSetting> {
  /// Primary key (single record singleton id, e.g. 'default').
  final String id;

  /// UI theme mode: 'system', 'light', 'dark'.
  final String themeMode;

  /// Application locale code: 'en', 'ar', 'ur'.
  final String locale;

  /// Arabic script rendering style: 'uthmani' or 'indopak'.
  final String arabicScript;

  /// Arabic typography font size in points.
  final double arabicFontSize;

  /// Translation typography font size in points.
  final double translationFontSize;

  /// Prayer calculation method identifier (e.g. 'muslim_world_league', 'umm_al_qura', 'egyptian', 'karachi', 'tehran', 'north_america', 'kuwait').
  final String prayerCalculationMethod;

  /// Madhab for Asr calculation: 'shafi' (standard) or 'hanafi'.
  final String prayerMadhab;

  /// Preferred default reciter ID for audio playback.
  final String selectedReciterId;

  /// Notifications enabled flag.
  final bool notificationsEnabled;

  /// Offline background synchronization preference.
  final bool offlineSyncEnabled;

  /// Last updated timestamp.
  final DateTime updatedAt;
  const AppSetting({
    required this.id,
    required this.themeMode,
    required this.locale,
    required this.arabicScript,
    required this.arabicFontSize,
    required this.translationFontSize,
    required this.prayerCalculationMethod,
    required this.prayerMadhab,
    required this.selectedReciterId,
    required this.notificationsEnabled,
    required this.offlineSyncEnabled,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['theme_mode'] = Variable<String>(themeMode);
    map['locale'] = Variable<String>(locale);
    map['arabic_script'] = Variable<String>(arabicScript);
    map['arabic_font_size'] = Variable<double>(arabicFontSize);
    map['translation_font_size'] = Variable<double>(translationFontSize);
    map['prayer_calculation_method'] = Variable<String>(
      prayerCalculationMethod,
    );
    map['prayer_madhab'] = Variable<String>(prayerMadhab);
    map['selected_reciter_id'] = Variable<String>(selectedReciterId);
    map['notifications_enabled'] = Variable<bool>(notificationsEnabled);
    map['offline_sync_enabled'] = Variable<bool>(offlineSyncEnabled);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  AppSettingsTableCompanion toCompanion(bool nullToAbsent) {
    return AppSettingsTableCompanion(
      id: Value(id),
      themeMode: Value(themeMode),
      locale: Value(locale),
      arabicScript: Value(arabicScript),
      arabicFontSize: Value(arabicFontSize),
      translationFontSize: Value(translationFontSize),
      prayerCalculationMethod: Value(prayerCalculationMethod),
      prayerMadhab: Value(prayerMadhab),
      selectedReciterId: Value(selectedReciterId),
      notificationsEnabled: Value(notificationsEnabled),
      offlineSyncEnabled: Value(offlineSyncEnabled),
      updatedAt: Value(updatedAt),
    );
  }

  factory AppSetting.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return AppSetting(
      id: serializer.fromJson<String>(json['id']),
      themeMode: serializer.fromJson<String>(json['themeMode']),
      locale: serializer.fromJson<String>(json['locale']),
      arabicScript: serializer.fromJson<String>(json['arabicScript']),
      arabicFontSize: serializer.fromJson<double>(json['arabicFontSize']),
      translationFontSize: serializer.fromJson<double>(
        json['translationFontSize'],
      ),
      prayerCalculationMethod: serializer.fromJson<String>(
        json['prayerCalculationMethod'],
      ),
      prayerMadhab: serializer.fromJson<String>(json['prayerMadhab']),
      selectedReciterId: serializer.fromJson<String>(json['selectedReciterId']),
      notificationsEnabled: serializer.fromJson<bool>(
        json['notificationsEnabled'],
      ),
      offlineSyncEnabled: serializer.fromJson<bool>(json['offlineSyncEnabled']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'themeMode': serializer.toJson<String>(themeMode),
      'locale': serializer.toJson<String>(locale),
      'arabicScript': serializer.toJson<String>(arabicScript),
      'arabicFontSize': serializer.toJson<double>(arabicFontSize),
      'translationFontSize': serializer.toJson<double>(translationFontSize),
      'prayerCalculationMethod': serializer.toJson<String>(
        prayerCalculationMethod,
      ),
      'prayerMadhab': serializer.toJson<String>(prayerMadhab),
      'selectedReciterId': serializer.toJson<String>(selectedReciterId),
      'notificationsEnabled': serializer.toJson<bool>(notificationsEnabled),
      'offlineSyncEnabled': serializer.toJson<bool>(offlineSyncEnabled),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  AppSetting copyWith({
    String? id,
    String? themeMode,
    String? locale,
    String? arabicScript,
    double? arabicFontSize,
    double? translationFontSize,
    String? prayerCalculationMethod,
    String? prayerMadhab,
    String? selectedReciterId,
    bool? notificationsEnabled,
    bool? offlineSyncEnabled,
    DateTime? updatedAt,
  }) => AppSetting(
    id: id ?? this.id,
    themeMode: themeMode ?? this.themeMode,
    locale: locale ?? this.locale,
    arabicScript: arabicScript ?? this.arabicScript,
    arabicFontSize: arabicFontSize ?? this.arabicFontSize,
    translationFontSize: translationFontSize ?? this.translationFontSize,
    prayerCalculationMethod:
        prayerCalculationMethod ?? this.prayerCalculationMethod,
    prayerMadhab: prayerMadhab ?? this.prayerMadhab,
    selectedReciterId: selectedReciterId ?? this.selectedReciterId,
    notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
    offlineSyncEnabled: offlineSyncEnabled ?? this.offlineSyncEnabled,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  AppSetting copyWithCompanion(AppSettingsTableCompanion data) {
    return AppSetting(
      id: data.id.present ? data.id.value : this.id,
      themeMode: data.themeMode.present ? data.themeMode.value : this.themeMode,
      locale: data.locale.present ? data.locale.value : this.locale,
      arabicScript: data.arabicScript.present
          ? data.arabicScript.value
          : this.arabicScript,
      arabicFontSize: data.arabicFontSize.present
          ? data.arabicFontSize.value
          : this.arabicFontSize,
      translationFontSize: data.translationFontSize.present
          ? data.translationFontSize.value
          : this.translationFontSize,
      prayerCalculationMethod: data.prayerCalculationMethod.present
          ? data.prayerCalculationMethod.value
          : this.prayerCalculationMethod,
      prayerMadhab: data.prayerMadhab.present
          ? data.prayerMadhab.value
          : this.prayerMadhab,
      selectedReciterId: data.selectedReciterId.present
          ? data.selectedReciterId.value
          : this.selectedReciterId,
      notificationsEnabled: data.notificationsEnabled.present
          ? data.notificationsEnabled.value
          : this.notificationsEnabled,
      offlineSyncEnabled: data.offlineSyncEnabled.present
          ? data.offlineSyncEnabled.value
          : this.offlineSyncEnabled,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('AppSetting(')
          ..write('id: $id, ')
          ..write('themeMode: $themeMode, ')
          ..write('locale: $locale, ')
          ..write('arabicScript: $arabicScript, ')
          ..write('arabicFontSize: $arabicFontSize, ')
          ..write('translationFontSize: $translationFontSize, ')
          ..write('prayerCalculationMethod: $prayerCalculationMethod, ')
          ..write('prayerMadhab: $prayerMadhab, ')
          ..write('selectedReciterId: $selectedReciterId, ')
          ..write('notificationsEnabled: $notificationsEnabled, ')
          ..write('offlineSyncEnabled: $offlineSyncEnabled, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    themeMode,
    locale,
    arabicScript,
    arabicFontSize,
    translationFontSize,
    prayerCalculationMethod,
    prayerMadhab,
    selectedReciterId,
    notificationsEnabled,
    offlineSyncEnabled,
    updatedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AppSetting &&
          other.id == this.id &&
          other.themeMode == this.themeMode &&
          other.locale == this.locale &&
          other.arabicScript == this.arabicScript &&
          other.arabicFontSize == this.arabicFontSize &&
          other.translationFontSize == this.translationFontSize &&
          other.prayerCalculationMethod == this.prayerCalculationMethod &&
          other.prayerMadhab == this.prayerMadhab &&
          other.selectedReciterId == this.selectedReciterId &&
          other.notificationsEnabled == this.notificationsEnabled &&
          other.offlineSyncEnabled == this.offlineSyncEnabled &&
          other.updatedAt == this.updatedAt);
}

class AppSettingsTableCompanion extends UpdateCompanion<AppSetting> {
  final Value<String> id;
  final Value<String> themeMode;
  final Value<String> locale;
  final Value<String> arabicScript;
  final Value<double> arabicFontSize;
  final Value<double> translationFontSize;
  final Value<String> prayerCalculationMethod;
  final Value<String> prayerMadhab;
  final Value<String> selectedReciterId;
  final Value<bool> notificationsEnabled;
  final Value<bool> offlineSyncEnabled;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const AppSettingsTableCompanion({
    this.id = const Value.absent(),
    this.themeMode = const Value.absent(),
    this.locale = const Value.absent(),
    this.arabicScript = const Value.absent(),
    this.arabicFontSize = const Value.absent(),
    this.translationFontSize = const Value.absent(),
    this.prayerCalculationMethod = const Value.absent(),
    this.prayerMadhab = const Value.absent(),
    this.selectedReciterId = const Value.absent(),
    this.notificationsEnabled = const Value.absent(),
    this.offlineSyncEnabled = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  AppSettingsTableCompanion.insert({
    this.id = const Value.absent(),
    this.themeMode = const Value.absent(),
    this.locale = const Value.absent(),
    this.arabicScript = const Value.absent(),
    this.arabicFontSize = const Value.absent(),
    this.translationFontSize = const Value.absent(),
    this.prayerCalculationMethod = const Value.absent(),
    this.prayerMadhab = const Value.absent(),
    this.selectedReciterId = const Value.absent(),
    this.notificationsEnabled = const Value.absent(),
    this.offlineSyncEnabled = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  static Insertable<AppSetting> custom({
    Expression<String>? id,
    Expression<String>? themeMode,
    Expression<String>? locale,
    Expression<String>? arabicScript,
    Expression<double>? arabicFontSize,
    Expression<double>? translationFontSize,
    Expression<String>? prayerCalculationMethod,
    Expression<String>? prayerMadhab,
    Expression<String>? selectedReciterId,
    Expression<bool>? notificationsEnabled,
    Expression<bool>? offlineSyncEnabled,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (themeMode != null) 'theme_mode': themeMode,
      if (locale != null) 'locale': locale,
      if (arabicScript != null) 'arabic_script': arabicScript,
      if (arabicFontSize != null) 'arabic_font_size': arabicFontSize,
      if (translationFontSize != null)
        'translation_font_size': translationFontSize,
      if (prayerCalculationMethod != null)
        'prayer_calculation_method': prayerCalculationMethod,
      if (prayerMadhab != null) 'prayer_madhab': prayerMadhab,
      if (selectedReciterId != null) 'selected_reciter_id': selectedReciterId,
      if (notificationsEnabled != null)
        'notifications_enabled': notificationsEnabled,
      if (offlineSyncEnabled != null)
        'offline_sync_enabled': offlineSyncEnabled,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  AppSettingsTableCompanion copyWith({
    Value<String>? id,
    Value<String>? themeMode,
    Value<String>? locale,
    Value<String>? arabicScript,
    Value<double>? arabicFontSize,
    Value<double>? translationFontSize,
    Value<String>? prayerCalculationMethod,
    Value<String>? prayerMadhab,
    Value<String>? selectedReciterId,
    Value<bool>? notificationsEnabled,
    Value<bool>? offlineSyncEnabled,
    Value<DateTime>? updatedAt,
    Value<int>? rowid,
  }) {
    return AppSettingsTableCompanion(
      id: id ?? this.id,
      themeMode: themeMode ?? this.themeMode,
      locale: locale ?? this.locale,
      arabicScript: arabicScript ?? this.arabicScript,
      arabicFontSize: arabicFontSize ?? this.arabicFontSize,
      translationFontSize: translationFontSize ?? this.translationFontSize,
      prayerCalculationMethod:
          prayerCalculationMethod ?? this.prayerCalculationMethod,
      prayerMadhab: prayerMadhab ?? this.prayerMadhab,
      selectedReciterId: selectedReciterId ?? this.selectedReciterId,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      offlineSyncEnabled: offlineSyncEnabled ?? this.offlineSyncEnabled,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (themeMode.present) {
      map['theme_mode'] = Variable<String>(themeMode.value);
    }
    if (locale.present) {
      map['locale'] = Variable<String>(locale.value);
    }
    if (arabicScript.present) {
      map['arabic_script'] = Variable<String>(arabicScript.value);
    }
    if (arabicFontSize.present) {
      map['arabic_font_size'] = Variable<double>(arabicFontSize.value);
    }
    if (translationFontSize.present) {
      map['translation_font_size'] = Variable<double>(
        translationFontSize.value,
      );
    }
    if (prayerCalculationMethod.present) {
      map['prayer_calculation_method'] = Variable<String>(
        prayerCalculationMethod.value,
      );
    }
    if (prayerMadhab.present) {
      map['prayer_madhab'] = Variable<String>(prayerMadhab.value);
    }
    if (selectedReciterId.present) {
      map['selected_reciter_id'] = Variable<String>(selectedReciterId.value);
    }
    if (notificationsEnabled.present) {
      map['notifications_enabled'] = Variable<bool>(notificationsEnabled.value);
    }
    if (offlineSyncEnabled.present) {
      map['offline_sync_enabled'] = Variable<bool>(offlineSyncEnabled.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('AppSettingsTableCompanion(')
          ..write('id: $id, ')
          ..write('themeMode: $themeMode, ')
          ..write('locale: $locale, ')
          ..write('arabicScript: $arabicScript, ')
          ..write('arabicFontSize: $arabicFontSize, ')
          ..write('translationFontSize: $translationFontSize, ')
          ..write('prayerCalculationMethod: $prayerCalculationMethod, ')
          ..write('prayerMadhab: $prayerMadhab, ')
          ..write('selectedReciterId: $selectedReciterId, ')
          ..write('notificationsEnabled: $notificationsEnabled, ')
          ..write('offlineSyncEnabled: $offlineSyncEnabled, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalBookmarksTableTable extends LocalBookmarksTable
    with TableInfo<$LocalBookmarksTableTable, LocalBookmark> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalBookmarksTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _userIdMeta = const VerificationMeta('userId');
  @override
  late final GeneratedColumn<String> userId = GeneratedColumn<String>(
    'user_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _contentTypeMeta = const VerificationMeta(
    'contentType',
  );
  @override
  late final GeneratedColumn<String> contentType = GeneratedColumn<String>(
    'content_type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _contentReferenceMeta = const VerificationMeta(
    'contentReference',
  );
  @override
  late final GeneratedColumn<String> contentReference = GeneratedColumn<String>(
    'content_reference',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _surahNumberMeta = const VerificationMeta(
    'surahNumber',
  );
  @override
  late final GeneratedColumn<int> surahNumber = GeneratedColumn<int>(
    'surah_number',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _ayahNumberMeta = const VerificationMeta(
    'ayahNumber',
  );
  @override
  late final GeneratedColumn<int> ayahNumber = GeneratedColumn<int>(
    'ayah_number',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _hadithCollectionMeta = const VerificationMeta(
    'hadithCollection',
  );
  @override
  late final GeneratedColumn<String> hadithCollection = GeneratedColumn<String>(
    'hadith_collection',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _hadithNumberMeta = const VerificationMeta(
    'hadithNumber',
  );
  @override
  late final GeneratedColumn<int> hadithNumber = GeneratedColumn<int>(
    'hadith_number',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _duaCategoryMeta = const VerificationMeta(
    'duaCategory',
  );
  @override
  late final GeneratedColumn<String> duaCategory = GeneratedColumn<String>(
    'dua_category',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _articleIdMeta = const VerificationMeta(
    'articleId',
  );
  @override
  late final GeneratedColumn<String> articleId = GeneratedColumn<String>(
    'article_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _bookIdMeta = const VerificationMeta('bookId');
  @override
  late final GeneratedColumn<String> bookId = GeneratedColumn<String>(
    'book_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _folderNameMeta = const VerificationMeta(
    'folderName',
  );
  @override
  late final GeneratedColumn<String> folderName = GeneratedColumn<String>(
    'folder_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('default'),
  );
  static const VerificationMeta _noteMeta = const VerificationMeta('note');
  @override
  late final GeneratedColumn<String> note = GeneratedColumn<String>(
    'note',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _tagsMeta = const VerificationMeta('tags');
  @override
  late final GeneratedColumn<String> tags = GeneratedColumn<String>(
    'tags',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('[]'),
  );
  static const VerificationMeta _clientMutationIdMeta = const VerificationMeta(
    'clientMutationId',
  );
  @override
  late final GeneratedColumn<String> clientMutationId = GeneratedColumn<String>(
    'client_mutation_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _clientVersionMeta = const VerificationMeta(
    'clientVersion',
  );
  @override
  late final GeneratedColumn<int> clientVersion = GeneratedColumn<int>(
    'client_version',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(1),
  );
  static const VerificationMeta _serverRevisionMeta = const VerificationMeta(
    'serverRevision',
  );
  @override
  late final GeneratedColumn<int> serverRevision = GeneratedColumn<int>(
    'server_revision',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(1),
  );
  static const VerificationMeta _lastClientMutationIdMeta =
      const VerificationMeta('lastClientMutationId');
  @override
  late final GeneratedColumn<String> lastClientMutationId =
      GeneratedColumn<String>(
        'last_client_mutation_id',
        aliasedName,
        true,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  static const VerificationMeta _deletedAtMeta = const VerificationMeta(
    'deletedAt',
  );
  @override
  late final GeneratedColumn<DateTime> deletedAt = GeneratedColumn<DateTime>(
    'deleted_at',
    aliasedName,
    true,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _syncStatusMeta = const VerificationMeta(
    'syncStatus',
  );
  @override
  late final GeneratedColumn<String> syncStatus = GeneratedColumn<String>(
    'sync_status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('pending_insert'),
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    userId,
    contentType,
    contentReference,
    surahNumber,
    ayahNumber,
    hadithCollection,
    hadithNumber,
    duaCategory,
    articleId,
    bookId,
    folderName,
    note,
    tags,
    clientMutationId,
    clientVersion,
    serverRevision,
    lastClientMutationId,
    createdAt,
    updatedAt,
    deletedAt,
    syncStatus,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_bookmarks';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalBookmark> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('user_id')) {
      context.handle(
        _userIdMeta,
        userId.isAcceptableOrUnknown(data['user_id']!, _userIdMeta),
      );
    } else if (isInserting) {
      context.missing(_userIdMeta);
    }
    if (data.containsKey('content_type')) {
      context.handle(
        _contentTypeMeta,
        contentType.isAcceptableOrUnknown(
          data['content_type']!,
          _contentTypeMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_contentTypeMeta);
    }
    if (data.containsKey('content_reference')) {
      context.handle(
        _contentReferenceMeta,
        contentReference.isAcceptableOrUnknown(
          data['content_reference']!,
          _contentReferenceMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_contentReferenceMeta);
    }
    if (data.containsKey('surah_number')) {
      context.handle(
        _surahNumberMeta,
        surahNumber.isAcceptableOrUnknown(
          data['surah_number']!,
          _surahNumberMeta,
        ),
      );
    }
    if (data.containsKey('ayah_number')) {
      context.handle(
        _ayahNumberMeta,
        ayahNumber.isAcceptableOrUnknown(data['ayah_number']!, _ayahNumberMeta),
      );
    }
    if (data.containsKey('hadith_collection')) {
      context.handle(
        _hadithCollectionMeta,
        hadithCollection.isAcceptableOrUnknown(
          data['hadith_collection']!,
          _hadithCollectionMeta,
        ),
      );
    }
    if (data.containsKey('hadith_number')) {
      context.handle(
        _hadithNumberMeta,
        hadithNumber.isAcceptableOrUnknown(
          data['hadith_number']!,
          _hadithNumberMeta,
        ),
      );
    }
    if (data.containsKey('dua_category')) {
      context.handle(
        _duaCategoryMeta,
        duaCategory.isAcceptableOrUnknown(
          data['dua_category']!,
          _duaCategoryMeta,
        ),
      );
    }
    if (data.containsKey('article_id')) {
      context.handle(
        _articleIdMeta,
        articleId.isAcceptableOrUnknown(data['article_id']!, _articleIdMeta),
      );
    }
    if (data.containsKey('book_id')) {
      context.handle(
        _bookIdMeta,
        bookId.isAcceptableOrUnknown(data['book_id']!, _bookIdMeta),
      );
    }
    if (data.containsKey('folder_name')) {
      context.handle(
        _folderNameMeta,
        folderName.isAcceptableOrUnknown(data['folder_name']!, _folderNameMeta),
      );
    }
    if (data.containsKey('note')) {
      context.handle(
        _noteMeta,
        note.isAcceptableOrUnknown(data['note']!, _noteMeta),
      );
    }
    if (data.containsKey('tags')) {
      context.handle(
        _tagsMeta,
        tags.isAcceptableOrUnknown(data['tags']!, _tagsMeta),
      );
    }
    if (data.containsKey('client_mutation_id')) {
      context.handle(
        _clientMutationIdMeta,
        clientMutationId.isAcceptableOrUnknown(
          data['client_mutation_id']!,
          _clientMutationIdMeta,
        ),
      );
    }
    if (data.containsKey('client_version')) {
      context.handle(
        _clientVersionMeta,
        clientVersion.isAcceptableOrUnknown(
          data['client_version']!,
          _clientVersionMeta,
        ),
      );
    }
    if (data.containsKey('server_revision')) {
      context.handle(
        _serverRevisionMeta,
        serverRevision.isAcceptableOrUnknown(
          data['server_revision']!,
          _serverRevisionMeta,
        ),
      );
    }
    if (data.containsKey('last_client_mutation_id')) {
      context.handle(
        _lastClientMutationIdMeta,
        lastClientMutationId.isAcceptableOrUnknown(
          data['last_client_mutation_id']!,
          _lastClientMutationIdMeta,
        ),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    }
    if (data.containsKey('deleted_at')) {
      context.handle(
        _deletedAtMeta,
        deletedAt.isAcceptableOrUnknown(data['deleted_at']!, _deletedAtMeta),
      );
    }
    if (data.containsKey('sync_status')) {
      context.handle(
        _syncStatusMeta,
        syncStatus.isAcceptableOrUnknown(data['sync_status']!, _syncStatusMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalBookmark map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalBookmark(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      userId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}user_id'],
      )!,
      contentType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}content_type'],
      )!,
      contentReference: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}content_reference'],
      )!,
      surahNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}surah_number'],
      ),
      ayahNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}ayah_number'],
      ),
      hadithCollection: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}hadith_collection'],
      ),
      hadithNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}hadith_number'],
      ),
      duaCategory: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}dua_category'],
      ),
      articleId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}article_id'],
      ),
      bookId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}book_id'],
      ),
      folderName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}folder_name'],
      )!,
      note: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}note'],
      ),
      tags: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}tags'],
      )!,
      clientMutationId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}client_mutation_id'],
      ),
      clientVersion: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}client_version'],
      )!,
      serverRevision: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}server_revision'],
      )!,
      lastClientMutationId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}last_client_mutation_id'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}updated_at'],
      )!,
      deletedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}deleted_at'],
      ),
      syncStatus: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}sync_status'],
      )!,
    );
  }

  @override
  $LocalBookmarksTableTable createAlias(String alias) {
    return $LocalBookmarksTableTable(attachedDatabase, alias);
  }
}

class LocalBookmark extends DataClass implements Insertable<LocalBookmark> {
  /// Primary UUID string.
  final String id;

  /// User ID owning this bookmark (matches auth.users UUID).
  final String userId;

  /// Content discriminator: 'quran', 'hadith', 'dua', 'article', 'book'.
  final String contentType;

  /// Canonical reference string (e.g. 'quran:1:1', 'bukhari:1', 'hisn:1', 'slug', 'riyad-al-salihin:1:1').
  final String contentReference;

  /// Typed reference fields for indexing
  final int? surahNumber;
  final int? ayahNumber;
  final String? hadithCollection;
  final int? hadithNumber;
  final String? duaCategory;
  final String? articleId;
  final String? bookId;

  /// Personalization fields
  final String folderName;
  final String? note;

  /// JSON-encoded array of tag strings (e.g. '["favorites", "memorization"]').
  final String tags;

  /// Mobile-aware synchronization support (Milestone 5.4 sync engine preparation)
  final String? clientMutationId;
  final int clientVersion;
  final int serverRevision;
  final String? lastClientMutationId;
  final DateTime createdAt;
  final DateTime updatedAt;

  /// Soft-delete timestamp for bi-directional sync tombstone tracking
  final DateTime? deletedAt;

  /// Sync state: 'synced', 'pending_insert', 'pending_update', 'pending_delete'.
  final String syncStatus;
  const LocalBookmark({
    required this.id,
    required this.userId,
    required this.contentType,
    required this.contentReference,
    this.surahNumber,
    this.ayahNumber,
    this.hadithCollection,
    this.hadithNumber,
    this.duaCategory,
    this.articleId,
    this.bookId,
    required this.folderName,
    this.note,
    required this.tags,
    this.clientMutationId,
    required this.clientVersion,
    required this.serverRevision,
    this.lastClientMutationId,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.syncStatus,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['user_id'] = Variable<String>(userId);
    map['content_type'] = Variable<String>(contentType);
    map['content_reference'] = Variable<String>(contentReference);
    if (!nullToAbsent || surahNumber != null) {
      map['surah_number'] = Variable<int>(surahNumber);
    }
    if (!nullToAbsent || ayahNumber != null) {
      map['ayah_number'] = Variable<int>(ayahNumber);
    }
    if (!nullToAbsent || hadithCollection != null) {
      map['hadith_collection'] = Variable<String>(hadithCollection);
    }
    if (!nullToAbsent || hadithNumber != null) {
      map['hadith_number'] = Variable<int>(hadithNumber);
    }
    if (!nullToAbsent || duaCategory != null) {
      map['dua_category'] = Variable<String>(duaCategory);
    }
    if (!nullToAbsent || articleId != null) {
      map['article_id'] = Variable<String>(articleId);
    }
    if (!nullToAbsent || bookId != null) {
      map['book_id'] = Variable<String>(bookId);
    }
    map['folder_name'] = Variable<String>(folderName);
    if (!nullToAbsent || note != null) {
      map['note'] = Variable<String>(note);
    }
    map['tags'] = Variable<String>(tags);
    if (!nullToAbsent || clientMutationId != null) {
      map['client_mutation_id'] = Variable<String>(clientMutationId);
    }
    map['client_version'] = Variable<int>(clientVersion);
    map['server_revision'] = Variable<int>(serverRevision);
    if (!nullToAbsent || lastClientMutationId != null) {
      map['last_client_mutation_id'] = Variable<String>(lastClientMutationId);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    if (!nullToAbsent || deletedAt != null) {
      map['deleted_at'] = Variable<DateTime>(deletedAt);
    }
    map['sync_status'] = Variable<String>(syncStatus);
    return map;
  }

  LocalBookmarksTableCompanion toCompanion(bool nullToAbsent) {
    return LocalBookmarksTableCompanion(
      id: Value(id),
      userId: Value(userId),
      contentType: Value(contentType),
      contentReference: Value(contentReference),
      surahNumber: surahNumber == null && nullToAbsent
          ? const Value.absent()
          : Value(surahNumber),
      ayahNumber: ayahNumber == null && nullToAbsent
          ? const Value.absent()
          : Value(ayahNumber),
      hadithCollection: hadithCollection == null && nullToAbsent
          ? const Value.absent()
          : Value(hadithCollection),
      hadithNumber: hadithNumber == null && nullToAbsent
          ? const Value.absent()
          : Value(hadithNumber),
      duaCategory: duaCategory == null && nullToAbsent
          ? const Value.absent()
          : Value(duaCategory),
      articleId: articleId == null && nullToAbsent
          ? const Value.absent()
          : Value(articleId),
      bookId: bookId == null && nullToAbsent
          ? const Value.absent()
          : Value(bookId),
      folderName: Value(folderName),
      note: note == null && nullToAbsent ? const Value.absent() : Value(note),
      tags: Value(tags),
      clientMutationId: clientMutationId == null && nullToAbsent
          ? const Value.absent()
          : Value(clientMutationId),
      clientVersion: Value(clientVersion),
      serverRevision: Value(serverRevision),
      lastClientMutationId: lastClientMutationId == null && nullToAbsent
          ? const Value.absent()
          : Value(lastClientMutationId),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      deletedAt: deletedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(deletedAt),
      syncStatus: Value(syncStatus),
    );
  }

  factory LocalBookmark.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalBookmark(
      id: serializer.fromJson<String>(json['id']),
      userId: serializer.fromJson<String>(json['userId']),
      contentType: serializer.fromJson<String>(json['contentType']),
      contentReference: serializer.fromJson<String>(json['contentReference']),
      surahNumber: serializer.fromJson<int?>(json['surahNumber']),
      ayahNumber: serializer.fromJson<int?>(json['ayahNumber']),
      hadithCollection: serializer.fromJson<String?>(json['hadithCollection']),
      hadithNumber: serializer.fromJson<int?>(json['hadithNumber']),
      duaCategory: serializer.fromJson<String?>(json['duaCategory']),
      articleId: serializer.fromJson<String?>(json['articleId']),
      bookId: serializer.fromJson<String?>(json['bookId']),
      folderName: serializer.fromJson<String>(json['folderName']),
      note: serializer.fromJson<String?>(json['note']),
      tags: serializer.fromJson<String>(json['tags']),
      clientMutationId: serializer.fromJson<String?>(json['clientMutationId']),
      clientVersion: serializer.fromJson<int>(json['clientVersion']),
      serverRevision: serializer.fromJson<int>(json['serverRevision']),
      lastClientMutationId: serializer.fromJson<String?>(
        json['lastClientMutationId'],
      ),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      deletedAt: serializer.fromJson<DateTime?>(json['deletedAt']),
      syncStatus: serializer.fromJson<String>(json['syncStatus']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'userId': serializer.toJson<String>(userId),
      'contentType': serializer.toJson<String>(contentType),
      'contentReference': serializer.toJson<String>(contentReference),
      'surahNumber': serializer.toJson<int?>(surahNumber),
      'ayahNumber': serializer.toJson<int?>(ayahNumber),
      'hadithCollection': serializer.toJson<String?>(hadithCollection),
      'hadithNumber': serializer.toJson<int?>(hadithNumber),
      'duaCategory': serializer.toJson<String?>(duaCategory),
      'articleId': serializer.toJson<String?>(articleId),
      'bookId': serializer.toJson<String?>(bookId),
      'folderName': serializer.toJson<String>(folderName),
      'note': serializer.toJson<String?>(note),
      'tags': serializer.toJson<String>(tags),
      'clientMutationId': serializer.toJson<String?>(clientMutationId),
      'clientVersion': serializer.toJson<int>(clientVersion),
      'serverRevision': serializer.toJson<int>(serverRevision),
      'lastClientMutationId': serializer.toJson<String?>(lastClientMutationId),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'deletedAt': serializer.toJson<DateTime?>(deletedAt),
      'syncStatus': serializer.toJson<String>(syncStatus),
    };
  }

  LocalBookmark copyWith({
    String? id,
    String? userId,
    String? contentType,
    String? contentReference,
    Value<int?> surahNumber = const Value.absent(),
    Value<int?> ayahNumber = const Value.absent(),
    Value<String?> hadithCollection = const Value.absent(),
    Value<int?> hadithNumber = const Value.absent(),
    Value<String?> duaCategory = const Value.absent(),
    Value<String?> articleId = const Value.absent(),
    Value<String?> bookId = const Value.absent(),
    String? folderName,
    Value<String?> note = const Value.absent(),
    String? tags,
    Value<String?> clientMutationId = const Value.absent(),
    int? clientVersion,
    int? serverRevision,
    Value<String?> lastClientMutationId = const Value.absent(),
    DateTime? createdAt,
    DateTime? updatedAt,
    Value<DateTime?> deletedAt = const Value.absent(),
    String? syncStatus,
  }) => LocalBookmark(
    id: id ?? this.id,
    userId: userId ?? this.userId,
    contentType: contentType ?? this.contentType,
    contentReference: contentReference ?? this.contentReference,
    surahNumber: surahNumber.present ? surahNumber.value : this.surahNumber,
    ayahNumber: ayahNumber.present ? ayahNumber.value : this.ayahNumber,
    hadithCollection: hadithCollection.present
        ? hadithCollection.value
        : this.hadithCollection,
    hadithNumber: hadithNumber.present ? hadithNumber.value : this.hadithNumber,
    duaCategory: duaCategory.present ? duaCategory.value : this.duaCategory,
    articleId: articleId.present ? articleId.value : this.articleId,
    bookId: bookId.present ? bookId.value : this.bookId,
    folderName: folderName ?? this.folderName,
    note: note.present ? note.value : this.note,
    tags: tags ?? this.tags,
    clientMutationId: clientMutationId.present
        ? clientMutationId.value
        : this.clientMutationId,
    clientVersion: clientVersion ?? this.clientVersion,
    serverRevision: serverRevision ?? this.serverRevision,
    lastClientMutationId: lastClientMutationId.present
        ? lastClientMutationId.value
        : this.lastClientMutationId,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
    deletedAt: deletedAt.present ? deletedAt.value : this.deletedAt,
    syncStatus: syncStatus ?? this.syncStatus,
  );
  LocalBookmark copyWithCompanion(LocalBookmarksTableCompanion data) {
    return LocalBookmark(
      id: data.id.present ? data.id.value : this.id,
      userId: data.userId.present ? data.userId.value : this.userId,
      contentType: data.contentType.present
          ? data.contentType.value
          : this.contentType,
      contentReference: data.contentReference.present
          ? data.contentReference.value
          : this.contentReference,
      surahNumber: data.surahNumber.present
          ? data.surahNumber.value
          : this.surahNumber,
      ayahNumber: data.ayahNumber.present
          ? data.ayahNumber.value
          : this.ayahNumber,
      hadithCollection: data.hadithCollection.present
          ? data.hadithCollection.value
          : this.hadithCollection,
      hadithNumber: data.hadithNumber.present
          ? data.hadithNumber.value
          : this.hadithNumber,
      duaCategory: data.duaCategory.present
          ? data.duaCategory.value
          : this.duaCategory,
      articleId: data.articleId.present ? data.articleId.value : this.articleId,
      bookId: data.bookId.present ? data.bookId.value : this.bookId,
      folderName: data.folderName.present
          ? data.folderName.value
          : this.folderName,
      note: data.note.present ? data.note.value : this.note,
      tags: data.tags.present ? data.tags.value : this.tags,
      clientMutationId: data.clientMutationId.present
          ? data.clientMutationId.value
          : this.clientMutationId,
      clientVersion: data.clientVersion.present
          ? data.clientVersion.value
          : this.clientVersion,
      serverRevision: data.serverRevision.present
          ? data.serverRevision.value
          : this.serverRevision,
      lastClientMutationId: data.lastClientMutationId.present
          ? data.lastClientMutationId.value
          : this.lastClientMutationId,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      deletedAt: data.deletedAt.present ? data.deletedAt.value : this.deletedAt,
      syncStatus: data.syncStatus.present
          ? data.syncStatus.value
          : this.syncStatus,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalBookmark(')
          ..write('id: $id, ')
          ..write('userId: $userId, ')
          ..write('contentType: $contentType, ')
          ..write('contentReference: $contentReference, ')
          ..write('surahNumber: $surahNumber, ')
          ..write('ayahNumber: $ayahNumber, ')
          ..write('hadithCollection: $hadithCollection, ')
          ..write('hadithNumber: $hadithNumber, ')
          ..write('duaCategory: $duaCategory, ')
          ..write('articleId: $articleId, ')
          ..write('bookId: $bookId, ')
          ..write('folderName: $folderName, ')
          ..write('note: $note, ')
          ..write('tags: $tags, ')
          ..write('clientMutationId: $clientMutationId, ')
          ..write('clientVersion: $clientVersion, ')
          ..write('serverRevision: $serverRevision, ')
          ..write('lastClientMutationId: $lastClientMutationId, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('deletedAt: $deletedAt, ')
          ..write('syncStatus: $syncStatus')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hashAll([
    id,
    userId,
    contentType,
    contentReference,
    surahNumber,
    ayahNumber,
    hadithCollection,
    hadithNumber,
    duaCategory,
    articleId,
    bookId,
    folderName,
    note,
    tags,
    clientMutationId,
    clientVersion,
    serverRevision,
    lastClientMutationId,
    createdAt,
    updatedAt,
    deletedAt,
    syncStatus,
  ]);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalBookmark &&
          other.id == this.id &&
          other.userId == this.userId &&
          other.contentType == this.contentType &&
          other.contentReference == this.contentReference &&
          other.surahNumber == this.surahNumber &&
          other.ayahNumber == this.ayahNumber &&
          other.hadithCollection == this.hadithCollection &&
          other.hadithNumber == this.hadithNumber &&
          other.duaCategory == this.duaCategory &&
          other.articleId == this.articleId &&
          other.bookId == this.bookId &&
          other.folderName == this.folderName &&
          other.note == this.note &&
          other.tags == this.tags &&
          other.clientMutationId == this.clientMutationId &&
          other.clientVersion == this.clientVersion &&
          other.serverRevision == this.serverRevision &&
          other.lastClientMutationId == this.lastClientMutationId &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.deletedAt == this.deletedAt &&
          other.syncStatus == this.syncStatus);
}

class LocalBookmarksTableCompanion extends UpdateCompanion<LocalBookmark> {
  final Value<String> id;
  final Value<String> userId;
  final Value<String> contentType;
  final Value<String> contentReference;
  final Value<int?> surahNumber;
  final Value<int?> ayahNumber;
  final Value<String?> hadithCollection;
  final Value<int?> hadithNumber;
  final Value<String?> duaCategory;
  final Value<String?> articleId;
  final Value<String?> bookId;
  final Value<String> folderName;
  final Value<String?> note;
  final Value<String> tags;
  final Value<String?> clientMutationId;
  final Value<int> clientVersion;
  final Value<int> serverRevision;
  final Value<String?> lastClientMutationId;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<DateTime?> deletedAt;
  final Value<String> syncStatus;
  final Value<int> rowid;
  const LocalBookmarksTableCompanion({
    this.id = const Value.absent(),
    this.userId = const Value.absent(),
    this.contentType = const Value.absent(),
    this.contentReference = const Value.absent(),
    this.surahNumber = const Value.absent(),
    this.ayahNumber = const Value.absent(),
    this.hadithCollection = const Value.absent(),
    this.hadithNumber = const Value.absent(),
    this.duaCategory = const Value.absent(),
    this.articleId = const Value.absent(),
    this.bookId = const Value.absent(),
    this.folderName = const Value.absent(),
    this.note = const Value.absent(),
    this.tags = const Value.absent(),
    this.clientMutationId = const Value.absent(),
    this.clientVersion = const Value.absent(),
    this.serverRevision = const Value.absent(),
    this.lastClientMutationId = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.deletedAt = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalBookmarksTableCompanion.insert({
    required String id,
    required String userId,
    required String contentType,
    required String contentReference,
    this.surahNumber = const Value.absent(),
    this.ayahNumber = const Value.absent(),
    this.hadithCollection = const Value.absent(),
    this.hadithNumber = const Value.absent(),
    this.duaCategory = const Value.absent(),
    this.articleId = const Value.absent(),
    this.bookId = const Value.absent(),
    this.folderName = const Value.absent(),
    this.note = const Value.absent(),
    this.tags = const Value.absent(),
    this.clientMutationId = const Value.absent(),
    this.clientVersion = const Value.absent(),
    this.serverRevision = const Value.absent(),
    this.lastClientMutationId = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.deletedAt = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       userId = Value(userId),
       contentType = Value(contentType),
       contentReference = Value(contentReference);
  static Insertable<LocalBookmark> custom({
    Expression<String>? id,
    Expression<String>? userId,
    Expression<String>? contentType,
    Expression<String>? contentReference,
    Expression<int>? surahNumber,
    Expression<int>? ayahNumber,
    Expression<String>? hadithCollection,
    Expression<int>? hadithNumber,
    Expression<String>? duaCategory,
    Expression<String>? articleId,
    Expression<String>? bookId,
    Expression<String>? folderName,
    Expression<String>? note,
    Expression<String>? tags,
    Expression<String>? clientMutationId,
    Expression<int>? clientVersion,
    Expression<int>? serverRevision,
    Expression<String>? lastClientMutationId,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<DateTime>? deletedAt,
    Expression<String>? syncStatus,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (userId != null) 'user_id': userId,
      if (contentType != null) 'content_type': contentType,
      if (contentReference != null) 'content_reference': contentReference,
      if (surahNumber != null) 'surah_number': surahNumber,
      if (ayahNumber != null) 'ayah_number': ayahNumber,
      if (hadithCollection != null) 'hadith_collection': hadithCollection,
      if (hadithNumber != null) 'hadith_number': hadithNumber,
      if (duaCategory != null) 'dua_category': duaCategory,
      if (articleId != null) 'article_id': articleId,
      if (bookId != null) 'book_id': bookId,
      if (folderName != null) 'folder_name': folderName,
      if (note != null) 'note': note,
      if (tags != null) 'tags': tags,
      if (clientMutationId != null) 'client_mutation_id': clientMutationId,
      if (clientVersion != null) 'client_version': clientVersion,
      if (serverRevision != null) 'server_revision': serverRevision,
      if (lastClientMutationId != null)
        'last_client_mutation_id': lastClientMutationId,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (deletedAt != null) 'deleted_at': deletedAt,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalBookmarksTableCompanion copyWith({
    Value<String>? id,
    Value<String>? userId,
    Value<String>? contentType,
    Value<String>? contentReference,
    Value<int?>? surahNumber,
    Value<int?>? ayahNumber,
    Value<String?>? hadithCollection,
    Value<int?>? hadithNumber,
    Value<String?>? duaCategory,
    Value<String?>? articleId,
    Value<String?>? bookId,
    Value<String>? folderName,
    Value<String?>? note,
    Value<String>? tags,
    Value<String?>? clientMutationId,
    Value<int>? clientVersion,
    Value<int>? serverRevision,
    Value<String?>? lastClientMutationId,
    Value<DateTime>? createdAt,
    Value<DateTime>? updatedAt,
    Value<DateTime?>? deletedAt,
    Value<String>? syncStatus,
    Value<int>? rowid,
  }) {
    return LocalBookmarksTableCompanion(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      contentType: contentType ?? this.contentType,
      contentReference: contentReference ?? this.contentReference,
      surahNumber: surahNumber ?? this.surahNumber,
      ayahNumber: ayahNumber ?? this.ayahNumber,
      hadithCollection: hadithCollection ?? this.hadithCollection,
      hadithNumber: hadithNumber ?? this.hadithNumber,
      duaCategory: duaCategory ?? this.duaCategory,
      articleId: articleId ?? this.articleId,
      bookId: bookId ?? this.bookId,
      folderName: folderName ?? this.folderName,
      note: note ?? this.note,
      tags: tags ?? this.tags,
      clientMutationId: clientMutationId ?? this.clientMutationId,
      clientVersion: clientVersion ?? this.clientVersion,
      serverRevision: serverRevision ?? this.serverRevision,
      lastClientMutationId: lastClientMutationId ?? this.lastClientMutationId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      deletedAt: deletedAt ?? this.deletedAt,
      syncStatus: syncStatus ?? this.syncStatus,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (userId.present) {
      map['user_id'] = Variable<String>(userId.value);
    }
    if (contentType.present) {
      map['content_type'] = Variable<String>(contentType.value);
    }
    if (contentReference.present) {
      map['content_reference'] = Variable<String>(contentReference.value);
    }
    if (surahNumber.present) {
      map['surah_number'] = Variable<int>(surahNumber.value);
    }
    if (ayahNumber.present) {
      map['ayah_number'] = Variable<int>(ayahNumber.value);
    }
    if (hadithCollection.present) {
      map['hadith_collection'] = Variable<String>(hadithCollection.value);
    }
    if (hadithNumber.present) {
      map['hadith_number'] = Variable<int>(hadithNumber.value);
    }
    if (duaCategory.present) {
      map['dua_category'] = Variable<String>(duaCategory.value);
    }
    if (articleId.present) {
      map['article_id'] = Variable<String>(articleId.value);
    }
    if (bookId.present) {
      map['book_id'] = Variable<String>(bookId.value);
    }
    if (folderName.present) {
      map['folder_name'] = Variable<String>(folderName.value);
    }
    if (note.present) {
      map['note'] = Variable<String>(note.value);
    }
    if (tags.present) {
      map['tags'] = Variable<String>(tags.value);
    }
    if (clientMutationId.present) {
      map['client_mutation_id'] = Variable<String>(clientMutationId.value);
    }
    if (clientVersion.present) {
      map['client_version'] = Variable<int>(clientVersion.value);
    }
    if (serverRevision.present) {
      map['server_revision'] = Variable<int>(serverRevision.value);
    }
    if (lastClientMutationId.present) {
      map['last_client_mutation_id'] = Variable<String>(
        lastClientMutationId.value,
      );
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (deletedAt.present) {
      map['deleted_at'] = Variable<DateTime>(deletedAt.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<String>(syncStatus.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalBookmarksTableCompanion(')
          ..write('id: $id, ')
          ..write('userId: $userId, ')
          ..write('contentType: $contentType, ')
          ..write('contentReference: $contentReference, ')
          ..write('surahNumber: $surahNumber, ')
          ..write('ayahNumber: $ayahNumber, ')
          ..write('hadithCollection: $hadithCollection, ')
          ..write('hadithNumber: $hadithNumber, ')
          ..write('duaCategory: $duaCategory, ')
          ..write('articleId: $articleId, ')
          ..write('bookId: $bookId, ')
          ..write('folderName: $folderName, ')
          ..write('note: $note, ')
          ..write('tags: $tags, ')
          ..write('clientMutationId: $clientMutationId, ')
          ..write('clientVersion: $clientVersion, ')
          ..write('serverRevision: $serverRevision, ')
          ..write('lastClientMutationId: $lastClientMutationId, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('deletedAt: $deletedAt, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalReadingProgressTableTable extends LocalReadingProgressTable
    with TableInfo<$LocalReadingProgressTableTable, LocalReadingProgress> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalReadingProgressTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _userIdMeta = const VerificationMeta('userId');
  @override
  late final GeneratedColumn<String> userId = GeneratedColumn<String>(
    'user_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _bookIdMeta = const VerificationMeta('bookId');
  @override
  late final GeneratedColumn<String> bookId = GeneratedColumn<String>(
    'book_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _editionIdMeta = const VerificationMeta(
    'editionId',
  );
  @override
  late final GeneratedColumn<String> editionId = GeneratedColumn<String>(
    'edition_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _volumeNumberMeta = const VerificationMeta(
    'volumeNumber',
  );
  @override
  late final GeneratedColumn<int> volumeNumber = GeneratedColumn<int>(
    'volume_number',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(1),
  );
  static const VerificationMeta _sectionIdMeta = const VerificationMeta(
    'sectionId',
  );
  @override
  late final GeneratedColumn<String> sectionId = GeneratedColumn<String>(
    'section_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _pageNumberMeta = const VerificationMeta(
    'pageNumber',
  );
  @override
  late final GeneratedColumn<int> pageNumber = GeneratedColumn<int>(
    'page_number',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _progressPercentageMeta =
      const VerificationMeta('progressPercentage');
  @override
  late final GeneratedColumn<double> progressPercentage =
      GeneratedColumn<double>(
        'progress_percentage',
        aliasedName,
        false,
        type: DriftSqlType.double,
        requiredDuringInsert: false,
        defaultValue: const Constant(0.0),
      );
  static const VerificationMeta _lastReadAtMeta = const VerificationMeta(
    'lastReadAt',
  );
  @override
  late final GeneratedColumn<DateTime> lastReadAt = GeneratedColumn<DateTime>(
    'last_read_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  static const VerificationMeta _clientMutationIdMeta = const VerificationMeta(
    'clientMutationId',
  );
  @override
  late final GeneratedColumn<String> clientMutationId = GeneratedColumn<String>(
    'client_mutation_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _clientVersionMeta = const VerificationMeta(
    'clientVersion',
  );
  @override
  late final GeneratedColumn<int> clientVersion = GeneratedColumn<int>(
    'client_version',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(1),
  );
  static const VerificationMeta _serverRevisionMeta = const VerificationMeta(
    'serverRevision',
  );
  @override
  late final GeneratedColumn<int> serverRevision = GeneratedColumn<int>(
    'server_revision',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(1),
  );
  static const VerificationMeta _lastClientMutationIdMeta =
      const VerificationMeta('lastClientMutationId');
  @override
  late final GeneratedColumn<String> lastClientMutationId =
      GeneratedColumn<String>(
        'last_client_mutation_id',
        aliasedName,
        true,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  static const VerificationMeta _deletedAtMeta = const VerificationMeta(
    'deletedAt',
  );
  @override
  late final GeneratedColumn<DateTime> deletedAt = GeneratedColumn<DateTime>(
    'deleted_at',
    aliasedName,
    true,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _syncStatusMeta = const VerificationMeta(
    'syncStatus',
  );
  @override
  late final GeneratedColumn<String> syncStatus = GeneratedColumn<String>(
    'sync_status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('pending_insert'),
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    userId,
    bookId,
    editionId,
    volumeNumber,
    sectionId,
    pageNumber,
    progressPercentage,
    lastReadAt,
    clientMutationId,
    clientVersion,
    serverRevision,
    lastClientMutationId,
    createdAt,
    updatedAt,
    deletedAt,
    syncStatus,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_reading_progress';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalReadingProgress> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('user_id')) {
      context.handle(
        _userIdMeta,
        userId.isAcceptableOrUnknown(data['user_id']!, _userIdMeta),
      );
    } else if (isInserting) {
      context.missing(_userIdMeta);
    }
    if (data.containsKey('book_id')) {
      context.handle(
        _bookIdMeta,
        bookId.isAcceptableOrUnknown(data['book_id']!, _bookIdMeta),
      );
    } else if (isInserting) {
      context.missing(_bookIdMeta);
    }
    if (data.containsKey('edition_id')) {
      context.handle(
        _editionIdMeta,
        editionId.isAcceptableOrUnknown(data['edition_id']!, _editionIdMeta),
      );
    }
    if (data.containsKey('volume_number')) {
      context.handle(
        _volumeNumberMeta,
        volumeNumber.isAcceptableOrUnknown(
          data['volume_number']!,
          _volumeNumberMeta,
        ),
      );
    }
    if (data.containsKey('section_id')) {
      context.handle(
        _sectionIdMeta,
        sectionId.isAcceptableOrUnknown(data['section_id']!, _sectionIdMeta),
      );
    }
    if (data.containsKey('page_number')) {
      context.handle(
        _pageNumberMeta,
        pageNumber.isAcceptableOrUnknown(data['page_number']!, _pageNumberMeta),
      );
    }
    if (data.containsKey('progress_percentage')) {
      context.handle(
        _progressPercentageMeta,
        progressPercentage.isAcceptableOrUnknown(
          data['progress_percentage']!,
          _progressPercentageMeta,
        ),
      );
    }
    if (data.containsKey('last_read_at')) {
      context.handle(
        _lastReadAtMeta,
        lastReadAt.isAcceptableOrUnknown(
          data['last_read_at']!,
          _lastReadAtMeta,
        ),
      );
    }
    if (data.containsKey('client_mutation_id')) {
      context.handle(
        _clientMutationIdMeta,
        clientMutationId.isAcceptableOrUnknown(
          data['client_mutation_id']!,
          _clientMutationIdMeta,
        ),
      );
    }
    if (data.containsKey('client_version')) {
      context.handle(
        _clientVersionMeta,
        clientVersion.isAcceptableOrUnknown(
          data['client_version']!,
          _clientVersionMeta,
        ),
      );
    }
    if (data.containsKey('server_revision')) {
      context.handle(
        _serverRevisionMeta,
        serverRevision.isAcceptableOrUnknown(
          data['server_revision']!,
          _serverRevisionMeta,
        ),
      );
    }
    if (data.containsKey('last_client_mutation_id')) {
      context.handle(
        _lastClientMutationIdMeta,
        lastClientMutationId.isAcceptableOrUnknown(
          data['last_client_mutation_id']!,
          _lastClientMutationIdMeta,
        ),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    }
    if (data.containsKey('deleted_at')) {
      context.handle(
        _deletedAtMeta,
        deletedAt.isAcceptableOrUnknown(data['deleted_at']!, _deletedAtMeta),
      );
    }
    if (data.containsKey('sync_status')) {
      context.handle(
        _syncStatusMeta,
        syncStatus.isAcceptableOrUnknown(data['sync_status']!, _syncStatusMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalReadingProgress map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalReadingProgress(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      userId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}user_id'],
      )!,
      bookId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}book_id'],
      )!,
      editionId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}edition_id'],
      ),
      volumeNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}volume_number'],
      )!,
      sectionId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}section_id'],
      ),
      pageNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}page_number'],
      ),
      progressPercentage: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}progress_percentage'],
      )!,
      lastReadAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}last_read_at'],
      )!,
      clientMutationId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}client_mutation_id'],
      ),
      clientVersion: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}client_version'],
      )!,
      serverRevision: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}server_revision'],
      )!,
      lastClientMutationId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}last_client_mutation_id'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}updated_at'],
      )!,
      deletedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}deleted_at'],
      ),
      syncStatus: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}sync_status'],
      )!,
    );
  }

  @override
  $LocalReadingProgressTableTable createAlias(String alias) {
    return $LocalReadingProgressTableTable(attachedDatabase, alias);
  }
}

class LocalReadingProgress extends DataClass
    implements Insertable<LocalReadingProgress> {
  /// Primary UUID string.
  final String id;

  /// User ID owning this reading progress.
  final String userId;

  /// Canonical Book ID (e.g. 'riyad-al-salihin', 'al-arba-in-al-nawawiyyah').
  final String bookId;

  /// Specific digital edition ID (nullable).
  final String? editionId;

  /// Volume number.
  final int volumeNumber;

  /// Specific Section/Chapter UUID (nullable).
  final String? sectionId;

  /// Page or paragraph number (nullable).
  final int? pageNumber;

  /// Progress percentage (0.00 to 100.00).
  final double progressPercentage;

  /// Timestamp when last read.
  final DateTime lastReadAt;

  /// Mobile-aware synchronization support (Milestone 5.4 sync engine preparation)
  final String? clientMutationId;
  final int clientVersion;
  final int serverRevision;
  final String? lastClientMutationId;
  final DateTime createdAt;
  final DateTime updatedAt;

  /// Soft-delete timestamp for bi-directional sync tombstone tracking
  final DateTime? deletedAt;

  /// Sync state: 'synced', 'pending_insert', 'pending_update', 'pending_delete'.
  final String syncStatus;
  const LocalReadingProgress({
    required this.id,
    required this.userId,
    required this.bookId,
    this.editionId,
    required this.volumeNumber,
    this.sectionId,
    this.pageNumber,
    required this.progressPercentage,
    required this.lastReadAt,
    this.clientMutationId,
    required this.clientVersion,
    required this.serverRevision,
    this.lastClientMutationId,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.syncStatus,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['user_id'] = Variable<String>(userId);
    map['book_id'] = Variable<String>(bookId);
    if (!nullToAbsent || editionId != null) {
      map['edition_id'] = Variable<String>(editionId);
    }
    map['volume_number'] = Variable<int>(volumeNumber);
    if (!nullToAbsent || sectionId != null) {
      map['section_id'] = Variable<String>(sectionId);
    }
    if (!nullToAbsent || pageNumber != null) {
      map['page_number'] = Variable<int>(pageNumber);
    }
    map['progress_percentage'] = Variable<double>(progressPercentage);
    map['last_read_at'] = Variable<DateTime>(lastReadAt);
    if (!nullToAbsent || clientMutationId != null) {
      map['client_mutation_id'] = Variable<String>(clientMutationId);
    }
    map['client_version'] = Variable<int>(clientVersion);
    map['server_revision'] = Variable<int>(serverRevision);
    if (!nullToAbsent || lastClientMutationId != null) {
      map['last_client_mutation_id'] = Variable<String>(lastClientMutationId);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    if (!nullToAbsent || deletedAt != null) {
      map['deleted_at'] = Variable<DateTime>(deletedAt);
    }
    map['sync_status'] = Variable<String>(syncStatus);
    return map;
  }

  LocalReadingProgressTableCompanion toCompanion(bool nullToAbsent) {
    return LocalReadingProgressTableCompanion(
      id: Value(id),
      userId: Value(userId),
      bookId: Value(bookId),
      editionId: editionId == null && nullToAbsent
          ? const Value.absent()
          : Value(editionId),
      volumeNumber: Value(volumeNumber),
      sectionId: sectionId == null && nullToAbsent
          ? const Value.absent()
          : Value(sectionId),
      pageNumber: pageNumber == null && nullToAbsent
          ? const Value.absent()
          : Value(pageNumber),
      progressPercentage: Value(progressPercentage),
      lastReadAt: Value(lastReadAt),
      clientMutationId: clientMutationId == null && nullToAbsent
          ? const Value.absent()
          : Value(clientMutationId),
      clientVersion: Value(clientVersion),
      serverRevision: Value(serverRevision),
      lastClientMutationId: lastClientMutationId == null && nullToAbsent
          ? const Value.absent()
          : Value(lastClientMutationId),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      deletedAt: deletedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(deletedAt),
      syncStatus: Value(syncStatus),
    );
  }

  factory LocalReadingProgress.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalReadingProgress(
      id: serializer.fromJson<String>(json['id']),
      userId: serializer.fromJson<String>(json['userId']),
      bookId: serializer.fromJson<String>(json['bookId']),
      editionId: serializer.fromJson<String?>(json['editionId']),
      volumeNumber: serializer.fromJson<int>(json['volumeNumber']),
      sectionId: serializer.fromJson<String?>(json['sectionId']),
      pageNumber: serializer.fromJson<int?>(json['pageNumber']),
      progressPercentage: serializer.fromJson<double>(
        json['progressPercentage'],
      ),
      lastReadAt: serializer.fromJson<DateTime>(json['lastReadAt']),
      clientMutationId: serializer.fromJson<String?>(json['clientMutationId']),
      clientVersion: serializer.fromJson<int>(json['clientVersion']),
      serverRevision: serializer.fromJson<int>(json['serverRevision']),
      lastClientMutationId: serializer.fromJson<String?>(
        json['lastClientMutationId'],
      ),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      deletedAt: serializer.fromJson<DateTime?>(json['deletedAt']),
      syncStatus: serializer.fromJson<String>(json['syncStatus']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'userId': serializer.toJson<String>(userId),
      'bookId': serializer.toJson<String>(bookId),
      'editionId': serializer.toJson<String?>(editionId),
      'volumeNumber': serializer.toJson<int>(volumeNumber),
      'sectionId': serializer.toJson<String?>(sectionId),
      'pageNumber': serializer.toJson<int?>(pageNumber),
      'progressPercentage': serializer.toJson<double>(progressPercentage),
      'lastReadAt': serializer.toJson<DateTime>(lastReadAt),
      'clientMutationId': serializer.toJson<String?>(clientMutationId),
      'clientVersion': serializer.toJson<int>(clientVersion),
      'serverRevision': serializer.toJson<int>(serverRevision),
      'lastClientMutationId': serializer.toJson<String?>(lastClientMutationId),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'deletedAt': serializer.toJson<DateTime?>(deletedAt),
      'syncStatus': serializer.toJson<String>(syncStatus),
    };
  }

  LocalReadingProgress copyWith({
    String? id,
    String? userId,
    String? bookId,
    Value<String?> editionId = const Value.absent(),
    int? volumeNumber,
    Value<String?> sectionId = const Value.absent(),
    Value<int?> pageNumber = const Value.absent(),
    double? progressPercentage,
    DateTime? lastReadAt,
    Value<String?> clientMutationId = const Value.absent(),
    int? clientVersion,
    int? serverRevision,
    Value<String?> lastClientMutationId = const Value.absent(),
    DateTime? createdAt,
    DateTime? updatedAt,
    Value<DateTime?> deletedAt = const Value.absent(),
    String? syncStatus,
  }) => LocalReadingProgress(
    id: id ?? this.id,
    userId: userId ?? this.userId,
    bookId: bookId ?? this.bookId,
    editionId: editionId.present ? editionId.value : this.editionId,
    volumeNumber: volumeNumber ?? this.volumeNumber,
    sectionId: sectionId.present ? sectionId.value : this.sectionId,
    pageNumber: pageNumber.present ? pageNumber.value : this.pageNumber,
    progressPercentage: progressPercentage ?? this.progressPercentage,
    lastReadAt: lastReadAt ?? this.lastReadAt,
    clientMutationId: clientMutationId.present
        ? clientMutationId.value
        : this.clientMutationId,
    clientVersion: clientVersion ?? this.clientVersion,
    serverRevision: serverRevision ?? this.serverRevision,
    lastClientMutationId: lastClientMutationId.present
        ? lastClientMutationId.value
        : this.lastClientMutationId,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
    deletedAt: deletedAt.present ? deletedAt.value : this.deletedAt,
    syncStatus: syncStatus ?? this.syncStatus,
  );
  LocalReadingProgress copyWithCompanion(
    LocalReadingProgressTableCompanion data,
  ) {
    return LocalReadingProgress(
      id: data.id.present ? data.id.value : this.id,
      userId: data.userId.present ? data.userId.value : this.userId,
      bookId: data.bookId.present ? data.bookId.value : this.bookId,
      editionId: data.editionId.present ? data.editionId.value : this.editionId,
      volumeNumber: data.volumeNumber.present
          ? data.volumeNumber.value
          : this.volumeNumber,
      sectionId: data.sectionId.present ? data.sectionId.value : this.sectionId,
      pageNumber: data.pageNumber.present
          ? data.pageNumber.value
          : this.pageNumber,
      progressPercentage: data.progressPercentage.present
          ? data.progressPercentage.value
          : this.progressPercentage,
      lastReadAt: data.lastReadAt.present
          ? data.lastReadAt.value
          : this.lastReadAt,
      clientMutationId: data.clientMutationId.present
          ? data.clientMutationId.value
          : this.clientMutationId,
      clientVersion: data.clientVersion.present
          ? data.clientVersion.value
          : this.clientVersion,
      serverRevision: data.serverRevision.present
          ? data.serverRevision.value
          : this.serverRevision,
      lastClientMutationId: data.lastClientMutationId.present
          ? data.lastClientMutationId.value
          : this.lastClientMutationId,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      deletedAt: data.deletedAt.present ? data.deletedAt.value : this.deletedAt,
      syncStatus: data.syncStatus.present
          ? data.syncStatus.value
          : this.syncStatus,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalReadingProgress(')
          ..write('id: $id, ')
          ..write('userId: $userId, ')
          ..write('bookId: $bookId, ')
          ..write('editionId: $editionId, ')
          ..write('volumeNumber: $volumeNumber, ')
          ..write('sectionId: $sectionId, ')
          ..write('pageNumber: $pageNumber, ')
          ..write('progressPercentage: $progressPercentage, ')
          ..write('lastReadAt: $lastReadAt, ')
          ..write('clientMutationId: $clientMutationId, ')
          ..write('clientVersion: $clientVersion, ')
          ..write('serverRevision: $serverRevision, ')
          ..write('lastClientMutationId: $lastClientMutationId, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('deletedAt: $deletedAt, ')
          ..write('syncStatus: $syncStatus')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    userId,
    bookId,
    editionId,
    volumeNumber,
    sectionId,
    pageNumber,
    progressPercentage,
    lastReadAt,
    clientMutationId,
    clientVersion,
    serverRevision,
    lastClientMutationId,
    createdAt,
    updatedAt,
    deletedAt,
    syncStatus,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalReadingProgress &&
          other.id == this.id &&
          other.userId == this.userId &&
          other.bookId == this.bookId &&
          other.editionId == this.editionId &&
          other.volumeNumber == this.volumeNumber &&
          other.sectionId == this.sectionId &&
          other.pageNumber == this.pageNumber &&
          other.progressPercentage == this.progressPercentage &&
          other.lastReadAt == this.lastReadAt &&
          other.clientMutationId == this.clientMutationId &&
          other.clientVersion == this.clientVersion &&
          other.serverRevision == this.serverRevision &&
          other.lastClientMutationId == this.lastClientMutationId &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.deletedAt == this.deletedAt &&
          other.syncStatus == this.syncStatus);
}

class LocalReadingProgressTableCompanion
    extends UpdateCompanion<LocalReadingProgress> {
  final Value<String> id;
  final Value<String> userId;
  final Value<String> bookId;
  final Value<String?> editionId;
  final Value<int> volumeNumber;
  final Value<String?> sectionId;
  final Value<int?> pageNumber;
  final Value<double> progressPercentage;
  final Value<DateTime> lastReadAt;
  final Value<String?> clientMutationId;
  final Value<int> clientVersion;
  final Value<int> serverRevision;
  final Value<String?> lastClientMutationId;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<DateTime?> deletedAt;
  final Value<String> syncStatus;
  final Value<int> rowid;
  const LocalReadingProgressTableCompanion({
    this.id = const Value.absent(),
    this.userId = const Value.absent(),
    this.bookId = const Value.absent(),
    this.editionId = const Value.absent(),
    this.volumeNumber = const Value.absent(),
    this.sectionId = const Value.absent(),
    this.pageNumber = const Value.absent(),
    this.progressPercentage = const Value.absent(),
    this.lastReadAt = const Value.absent(),
    this.clientMutationId = const Value.absent(),
    this.clientVersion = const Value.absent(),
    this.serverRevision = const Value.absent(),
    this.lastClientMutationId = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.deletedAt = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalReadingProgressTableCompanion.insert({
    required String id,
    required String userId,
    required String bookId,
    this.editionId = const Value.absent(),
    this.volumeNumber = const Value.absent(),
    this.sectionId = const Value.absent(),
    this.pageNumber = const Value.absent(),
    this.progressPercentage = const Value.absent(),
    this.lastReadAt = const Value.absent(),
    this.clientMutationId = const Value.absent(),
    this.clientVersion = const Value.absent(),
    this.serverRevision = const Value.absent(),
    this.lastClientMutationId = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.deletedAt = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       userId = Value(userId),
       bookId = Value(bookId);
  static Insertable<LocalReadingProgress> custom({
    Expression<String>? id,
    Expression<String>? userId,
    Expression<String>? bookId,
    Expression<String>? editionId,
    Expression<int>? volumeNumber,
    Expression<String>? sectionId,
    Expression<int>? pageNumber,
    Expression<double>? progressPercentage,
    Expression<DateTime>? lastReadAt,
    Expression<String>? clientMutationId,
    Expression<int>? clientVersion,
    Expression<int>? serverRevision,
    Expression<String>? lastClientMutationId,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<DateTime>? deletedAt,
    Expression<String>? syncStatus,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (userId != null) 'user_id': userId,
      if (bookId != null) 'book_id': bookId,
      if (editionId != null) 'edition_id': editionId,
      if (volumeNumber != null) 'volume_number': volumeNumber,
      if (sectionId != null) 'section_id': sectionId,
      if (pageNumber != null) 'page_number': pageNumber,
      if (progressPercentage != null) 'progress_percentage': progressPercentage,
      if (lastReadAt != null) 'last_read_at': lastReadAt,
      if (clientMutationId != null) 'client_mutation_id': clientMutationId,
      if (clientVersion != null) 'client_version': clientVersion,
      if (serverRevision != null) 'server_revision': serverRevision,
      if (lastClientMutationId != null)
        'last_client_mutation_id': lastClientMutationId,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (deletedAt != null) 'deleted_at': deletedAt,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalReadingProgressTableCompanion copyWith({
    Value<String>? id,
    Value<String>? userId,
    Value<String>? bookId,
    Value<String?>? editionId,
    Value<int>? volumeNumber,
    Value<String?>? sectionId,
    Value<int?>? pageNumber,
    Value<double>? progressPercentage,
    Value<DateTime>? lastReadAt,
    Value<String?>? clientMutationId,
    Value<int>? clientVersion,
    Value<int>? serverRevision,
    Value<String?>? lastClientMutationId,
    Value<DateTime>? createdAt,
    Value<DateTime>? updatedAt,
    Value<DateTime?>? deletedAt,
    Value<String>? syncStatus,
    Value<int>? rowid,
  }) {
    return LocalReadingProgressTableCompanion(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      bookId: bookId ?? this.bookId,
      editionId: editionId ?? this.editionId,
      volumeNumber: volumeNumber ?? this.volumeNumber,
      sectionId: sectionId ?? this.sectionId,
      pageNumber: pageNumber ?? this.pageNumber,
      progressPercentage: progressPercentage ?? this.progressPercentage,
      lastReadAt: lastReadAt ?? this.lastReadAt,
      clientMutationId: clientMutationId ?? this.clientMutationId,
      clientVersion: clientVersion ?? this.clientVersion,
      serverRevision: serverRevision ?? this.serverRevision,
      lastClientMutationId: lastClientMutationId ?? this.lastClientMutationId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      deletedAt: deletedAt ?? this.deletedAt,
      syncStatus: syncStatus ?? this.syncStatus,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (userId.present) {
      map['user_id'] = Variable<String>(userId.value);
    }
    if (bookId.present) {
      map['book_id'] = Variable<String>(bookId.value);
    }
    if (editionId.present) {
      map['edition_id'] = Variable<String>(editionId.value);
    }
    if (volumeNumber.present) {
      map['volume_number'] = Variable<int>(volumeNumber.value);
    }
    if (sectionId.present) {
      map['section_id'] = Variable<String>(sectionId.value);
    }
    if (pageNumber.present) {
      map['page_number'] = Variable<int>(pageNumber.value);
    }
    if (progressPercentage.present) {
      map['progress_percentage'] = Variable<double>(progressPercentage.value);
    }
    if (lastReadAt.present) {
      map['last_read_at'] = Variable<DateTime>(lastReadAt.value);
    }
    if (clientMutationId.present) {
      map['client_mutation_id'] = Variable<String>(clientMutationId.value);
    }
    if (clientVersion.present) {
      map['client_version'] = Variable<int>(clientVersion.value);
    }
    if (serverRevision.present) {
      map['server_revision'] = Variable<int>(serverRevision.value);
    }
    if (lastClientMutationId.present) {
      map['last_client_mutation_id'] = Variable<String>(
        lastClientMutationId.value,
      );
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (deletedAt.present) {
      map['deleted_at'] = Variable<DateTime>(deletedAt.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<String>(syncStatus.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalReadingProgressTableCompanion(')
          ..write('id: $id, ')
          ..write('userId: $userId, ')
          ..write('bookId: $bookId, ')
          ..write('editionId: $editionId, ')
          ..write('volumeNumber: $volumeNumber, ')
          ..write('sectionId: $sectionId, ')
          ..write('pageNumber: $pageNumber, ')
          ..write('progressPercentage: $progressPercentage, ')
          ..write('lastReadAt: $lastReadAt, ')
          ..write('clientMutationId: $clientMutationId, ')
          ..write('clientVersion: $clientVersion, ')
          ..write('serverRevision: $serverRevision, ')
          ..write('lastClientMutationId: $lastClientMutationId, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('deletedAt: $deletedAt, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SyncQueueTableTable extends SyncQueueTable
    with TableInfo<$SyncQueueTableTable, SyncQueueItem> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SyncQueueTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _clientMutationIdMeta = const VerificationMeta(
    'clientMutationId',
  );
  @override
  late final GeneratedColumn<String> clientMutationId = GeneratedColumn<String>(
    'client_mutation_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _entityTypeMeta = const VerificationMeta(
    'entityType',
  );
  @override
  late final GeneratedColumn<String> entityType = GeneratedColumn<String>(
    'entity_type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _entityIdMeta = const VerificationMeta(
    'entityId',
  );
  @override
  late final GeneratedColumn<String> entityId = GeneratedColumn<String>(
    'entity_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _operationMeta = const VerificationMeta(
    'operation',
  );
  @override
  late final GeneratedColumn<String> operation = GeneratedColumn<String>(
    'operation',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _payloadJsonMeta = const VerificationMeta(
    'payloadJson',
  );
  @override
  late final GeneratedColumn<String> payloadJson = GeneratedColumn<String>(
    'payload_json',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _attemptsMeta = const VerificationMeta(
    'attempts',
  );
  @override
  late final GeneratedColumn<int> attempts = GeneratedColumn<int>(
    'attempts',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _lastAttemptAtMeta = const VerificationMeta(
    'lastAttemptAt',
  );
  @override
  late final GeneratedColumn<DateTime> lastAttemptAt =
      GeneratedColumn<DateTime>(
        'last_attempt_at',
        aliasedName,
        true,
        type: DriftSqlType.dateTime,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _errorMessageMeta = const VerificationMeta(
    'errorMessage',
  );
  @override
  late final GeneratedColumn<String> errorMessage = GeneratedColumn<String>(
    'error_message',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    clientMutationId,
    entityType,
    entityId,
    operation,
    payloadJson,
    attempts,
    lastAttemptAt,
    errorMessage,
    createdAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sync_queue';
  @override
  VerificationContext validateIntegrity(
    Insertable<SyncQueueItem> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('client_mutation_id')) {
      context.handle(
        _clientMutationIdMeta,
        clientMutationId.isAcceptableOrUnknown(
          data['client_mutation_id']!,
          _clientMutationIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_clientMutationIdMeta);
    }
    if (data.containsKey('entity_type')) {
      context.handle(
        _entityTypeMeta,
        entityType.isAcceptableOrUnknown(data['entity_type']!, _entityTypeMeta),
      );
    } else if (isInserting) {
      context.missing(_entityTypeMeta);
    }
    if (data.containsKey('entity_id')) {
      context.handle(
        _entityIdMeta,
        entityId.isAcceptableOrUnknown(data['entity_id']!, _entityIdMeta),
      );
    } else if (isInserting) {
      context.missing(_entityIdMeta);
    }
    if (data.containsKey('operation')) {
      context.handle(
        _operationMeta,
        operation.isAcceptableOrUnknown(data['operation']!, _operationMeta),
      );
    } else if (isInserting) {
      context.missing(_operationMeta);
    }
    if (data.containsKey('payload_json')) {
      context.handle(
        _payloadJsonMeta,
        payloadJson.isAcceptableOrUnknown(
          data['payload_json']!,
          _payloadJsonMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_payloadJsonMeta);
    }
    if (data.containsKey('attempts')) {
      context.handle(
        _attemptsMeta,
        attempts.isAcceptableOrUnknown(data['attempts']!, _attemptsMeta),
      );
    }
    if (data.containsKey('last_attempt_at')) {
      context.handle(
        _lastAttemptAtMeta,
        lastAttemptAt.isAcceptableOrUnknown(
          data['last_attempt_at']!,
          _lastAttemptAtMeta,
        ),
      );
    }
    if (data.containsKey('error_message')) {
      context.handle(
        _errorMessageMeta,
        errorMessage.isAcceptableOrUnknown(
          data['error_message']!,
          _errorMessageMeta,
        ),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SyncQueueItem map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncQueueItem(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      clientMutationId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}client_mutation_id'],
      )!,
      entityType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}entity_type'],
      )!,
      entityId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}entity_id'],
      )!,
      operation: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}operation'],
      )!,
      payloadJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}payload_json'],
      )!,
      attempts: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}attempts'],
      )!,
      lastAttemptAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}last_attempt_at'],
      ),
      errorMessage: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}error_message'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
    );
  }

  @override
  $SyncQueueTableTable createAlias(String alias) {
    return $SyncQueueTableTable(attachedDatabase, alias);
  }
}

class SyncQueueItem extends DataClass implements Insertable<SyncQueueItem> {
  /// Primary UUID string.
  final String id;

  /// Unique client mutation UUID for idempotent deduplication on backend.
  final String clientMutationId;

  /// Target entity discriminator: 'bookmark', 'reading_progress', 'settings'.
  final String entityType;

  /// Target entity ID.
  final String entityId;

  /// Operation: 'INSERT', 'UPDATE', 'DELETE'.
  final String operation;

  /// Serialized JSON payload containing the mutation data.
  final String payloadJson;

  /// Number of sync attempts performed.
  final int attempts;

  /// Timestamp of the last sync attempt.
  final DateTime? lastAttemptAt;

  /// Last error message encountered during sync attempt (if any).
  final String? errorMessage;

  /// Timestamp when mutation was enqueued.
  final DateTime createdAt;
  const SyncQueueItem({
    required this.id,
    required this.clientMutationId,
    required this.entityType,
    required this.entityId,
    required this.operation,
    required this.payloadJson,
    required this.attempts,
    this.lastAttemptAt,
    this.errorMessage,
    required this.createdAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['client_mutation_id'] = Variable<String>(clientMutationId);
    map['entity_type'] = Variable<String>(entityType);
    map['entity_id'] = Variable<String>(entityId);
    map['operation'] = Variable<String>(operation);
    map['payload_json'] = Variable<String>(payloadJson);
    map['attempts'] = Variable<int>(attempts);
    if (!nullToAbsent || lastAttemptAt != null) {
      map['last_attempt_at'] = Variable<DateTime>(lastAttemptAt);
    }
    if (!nullToAbsent || errorMessage != null) {
      map['error_message'] = Variable<String>(errorMessage);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  SyncQueueTableCompanion toCompanion(bool nullToAbsent) {
    return SyncQueueTableCompanion(
      id: Value(id),
      clientMutationId: Value(clientMutationId),
      entityType: Value(entityType),
      entityId: Value(entityId),
      operation: Value(operation),
      payloadJson: Value(payloadJson),
      attempts: Value(attempts),
      lastAttemptAt: lastAttemptAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastAttemptAt),
      errorMessage: errorMessage == null && nullToAbsent
          ? const Value.absent()
          : Value(errorMessage),
      createdAt: Value(createdAt),
    );
  }

  factory SyncQueueItem.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SyncQueueItem(
      id: serializer.fromJson<String>(json['id']),
      clientMutationId: serializer.fromJson<String>(json['clientMutationId']),
      entityType: serializer.fromJson<String>(json['entityType']),
      entityId: serializer.fromJson<String>(json['entityId']),
      operation: serializer.fromJson<String>(json['operation']),
      payloadJson: serializer.fromJson<String>(json['payloadJson']),
      attempts: serializer.fromJson<int>(json['attempts']),
      lastAttemptAt: serializer.fromJson<DateTime?>(json['lastAttemptAt']),
      errorMessage: serializer.fromJson<String?>(json['errorMessage']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'clientMutationId': serializer.toJson<String>(clientMutationId),
      'entityType': serializer.toJson<String>(entityType),
      'entityId': serializer.toJson<String>(entityId),
      'operation': serializer.toJson<String>(operation),
      'payloadJson': serializer.toJson<String>(payloadJson),
      'attempts': serializer.toJson<int>(attempts),
      'lastAttemptAt': serializer.toJson<DateTime?>(lastAttemptAt),
      'errorMessage': serializer.toJson<String?>(errorMessage),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  SyncQueueItem copyWith({
    String? id,
    String? clientMutationId,
    String? entityType,
    String? entityId,
    String? operation,
    String? payloadJson,
    int? attempts,
    Value<DateTime?> lastAttemptAt = const Value.absent(),
    Value<String?> errorMessage = const Value.absent(),
    DateTime? createdAt,
  }) => SyncQueueItem(
    id: id ?? this.id,
    clientMutationId: clientMutationId ?? this.clientMutationId,
    entityType: entityType ?? this.entityType,
    entityId: entityId ?? this.entityId,
    operation: operation ?? this.operation,
    payloadJson: payloadJson ?? this.payloadJson,
    attempts: attempts ?? this.attempts,
    lastAttemptAt: lastAttemptAt.present
        ? lastAttemptAt.value
        : this.lastAttemptAt,
    errorMessage: errorMessage.present ? errorMessage.value : this.errorMessage,
    createdAt: createdAt ?? this.createdAt,
  );
  SyncQueueItem copyWithCompanion(SyncQueueTableCompanion data) {
    return SyncQueueItem(
      id: data.id.present ? data.id.value : this.id,
      clientMutationId: data.clientMutationId.present
          ? data.clientMutationId.value
          : this.clientMutationId,
      entityType: data.entityType.present
          ? data.entityType.value
          : this.entityType,
      entityId: data.entityId.present ? data.entityId.value : this.entityId,
      operation: data.operation.present ? data.operation.value : this.operation,
      payloadJson: data.payloadJson.present
          ? data.payloadJson.value
          : this.payloadJson,
      attempts: data.attempts.present ? data.attempts.value : this.attempts,
      lastAttemptAt: data.lastAttemptAt.present
          ? data.lastAttemptAt.value
          : this.lastAttemptAt,
      errorMessage: data.errorMessage.present
          ? data.errorMessage.value
          : this.errorMessage,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SyncQueueItem(')
          ..write('id: $id, ')
          ..write('clientMutationId: $clientMutationId, ')
          ..write('entityType: $entityType, ')
          ..write('entityId: $entityId, ')
          ..write('operation: $operation, ')
          ..write('payloadJson: $payloadJson, ')
          ..write('attempts: $attempts, ')
          ..write('lastAttemptAt: $lastAttemptAt, ')
          ..write('errorMessage: $errorMessage, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    clientMutationId,
    entityType,
    entityId,
    operation,
    payloadJson,
    attempts,
    lastAttemptAt,
    errorMessage,
    createdAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SyncQueueItem &&
          other.id == this.id &&
          other.clientMutationId == this.clientMutationId &&
          other.entityType == this.entityType &&
          other.entityId == this.entityId &&
          other.operation == this.operation &&
          other.payloadJson == this.payloadJson &&
          other.attempts == this.attempts &&
          other.lastAttemptAt == this.lastAttemptAt &&
          other.errorMessage == this.errorMessage &&
          other.createdAt == this.createdAt);
}

class SyncQueueTableCompanion extends UpdateCompanion<SyncQueueItem> {
  final Value<String> id;
  final Value<String> clientMutationId;
  final Value<String> entityType;
  final Value<String> entityId;
  final Value<String> operation;
  final Value<String> payloadJson;
  final Value<int> attempts;
  final Value<DateTime?> lastAttemptAt;
  final Value<String?> errorMessage;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const SyncQueueTableCompanion({
    this.id = const Value.absent(),
    this.clientMutationId = const Value.absent(),
    this.entityType = const Value.absent(),
    this.entityId = const Value.absent(),
    this.operation = const Value.absent(),
    this.payloadJson = const Value.absent(),
    this.attempts = const Value.absent(),
    this.lastAttemptAt = const Value.absent(),
    this.errorMessage = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SyncQueueTableCompanion.insert({
    required String id,
    required String clientMutationId,
    required String entityType,
    required String entityId,
    required String operation,
    required String payloadJson,
    this.attempts = const Value.absent(),
    this.lastAttemptAt = const Value.absent(),
    this.errorMessage = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       clientMutationId = Value(clientMutationId),
       entityType = Value(entityType),
       entityId = Value(entityId),
       operation = Value(operation),
       payloadJson = Value(payloadJson);
  static Insertable<SyncQueueItem> custom({
    Expression<String>? id,
    Expression<String>? clientMutationId,
    Expression<String>? entityType,
    Expression<String>? entityId,
    Expression<String>? operation,
    Expression<String>? payloadJson,
    Expression<int>? attempts,
    Expression<DateTime>? lastAttemptAt,
    Expression<String>? errorMessage,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (clientMutationId != null) 'client_mutation_id': clientMutationId,
      if (entityType != null) 'entity_type': entityType,
      if (entityId != null) 'entity_id': entityId,
      if (operation != null) 'operation': operation,
      if (payloadJson != null) 'payload_json': payloadJson,
      if (attempts != null) 'attempts': attempts,
      if (lastAttemptAt != null) 'last_attempt_at': lastAttemptAt,
      if (errorMessage != null) 'error_message': errorMessage,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SyncQueueTableCompanion copyWith({
    Value<String>? id,
    Value<String>? clientMutationId,
    Value<String>? entityType,
    Value<String>? entityId,
    Value<String>? operation,
    Value<String>? payloadJson,
    Value<int>? attempts,
    Value<DateTime?>? lastAttemptAt,
    Value<String?>? errorMessage,
    Value<DateTime>? createdAt,
    Value<int>? rowid,
  }) {
    return SyncQueueTableCompanion(
      id: id ?? this.id,
      clientMutationId: clientMutationId ?? this.clientMutationId,
      entityType: entityType ?? this.entityType,
      entityId: entityId ?? this.entityId,
      operation: operation ?? this.operation,
      payloadJson: payloadJson ?? this.payloadJson,
      attempts: attempts ?? this.attempts,
      lastAttemptAt: lastAttemptAt ?? this.lastAttemptAt,
      errorMessage: errorMessage ?? this.errorMessage,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (clientMutationId.present) {
      map['client_mutation_id'] = Variable<String>(clientMutationId.value);
    }
    if (entityType.present) {
      map['entity_type'] = Variable<String>(entityType.value);
    }
    if (entityId.present) {
      map['entity_id'] = Variable<String>(entityId.value);
    }
    if (operation.present) {
      map['operation'] = Variable<String>(operation.value);
    }
    if (payloadJson.present) {
      map['payload_json'] = Variable<String>(payloadJson.value);
    }
    if (attempts.present) {
      map['attempts'] = Variable<int>(attempts.value);
    }
    if (lastAttemptAt.present) {
      map['last_attempt_at'] = Variable<DateTime>(lastAttemptAt.value);
    }
    if (errorMessage.present) {
      map['error_message'] = Variable<String>(errorMessage.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SyncQueueTableCompanion(')
          ..write('id: $id, ')
          ..write('clientMutationId: $clientMutationId, ')
          ..write('entityType: $entityType, ')
          ..write('entityId: $entityId, ')
          ..write('operation: $operation, ')
          ..write('payloadJson: $payloadJson, ')
          ..write('attempts: $attempts, ')
          ..write('lastAttemptAt: $lastAttemptAt, ')
          ..write('errorMessage: $errorMessage, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SyncCursorsTableTable extends SyncCursorsTable
    with TableInfo<$SyncCursorsTableTable, SyncCursorEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SyncCursorsTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _entityTypeMeta = const VerificationMeta(
    'entityType',
  );
  @override
  late final GeneratedColumn<String> entityType = GeneratedColumn<String>(
    'entity_type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _cursorUpdatedAtMeta = const VerificationMeta(
    'cursorUpdatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> cursorUpdatedAt =
      GeneratedColumn<DateTime>(
        'cursor_updated_at',
        aliasedName,
        false,
        type: DriftSqlType.dateTime,
        requiredDuringInsert: true,
      );
  static const VerificationMeta _cursorIdMeta = const VerificationMeta(
    'cursorId',
  );
  @override
  late final GeneratedColumn<String> cursorId = GeneratedColumn<String>(
    'cursor_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _lastSyncCompletedAtMeta =
      const VerificationMeta('lastSyncCompletedAt');
  @override
  late final GeneratedColumn<DateTime> lastSyncCompletedAt =
      GeneratedColumn<DateTime>(
        'last_sync_completed_at',
        aliasedName,
        true,
        type: DriftSqlType.dateTime,
        requiredDuringInsert: false,
      );
  @override
  List<GeneratedColumn> get $columns => [
    entityType,
    cursorUpdatedAt,
    cursorId,
    lastSyncCompletedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sync_cursors';
  @override
  VerificationContext validateIntegrity(
    Insertable<SyncCursorEntry> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('entity_type')) {
      context.handle(
        _entityTypeMeta,
        entityType.isAcceptableOrUnknown(data['entity_type']!, _entityTypeMeta),
      );
    } else if (isInserting) {
      context.missing(_entityTypeMeta);
    }
    if (data.containsKey('cursor_updated_at')) {
      context.handle(
        _cursorUpdatedAtMeta,
        cursorUpdatedAt.isAcceptableOrUnknown(
          data['cursor_updated_at']!,
          _cursorUpdatedAtMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_cursorUpdatedAtMeta);
    }
    if (data.containsKey('cursor_id')) {
      context.handle(
        _cursorIdMeta,
        cursorId.isAcceptableOrUnknown(data['cursor_id']!, _cursorIdMeta),
      );
    } else if (isInserting) {
      context.missing(_cursorIdMeta);
    }
    if (data.containsKey('last_sync_completed_at')) {
      context.handle(
        _lastSyncCompletedAtMeta,
        lastSyncCompletedAt.isAcceptableOrUnknown(
          data['last_sync_completed_at']!,
          _lastSyncCompletedAtMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {entityType};
  @override
  SyncCursorEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncCursorEntry(
      entityType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}entity_type'],
      )!,
      cursorUpdatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}cursor_updated_at'],
      )!,
      cursorId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}cursor_id'],
      )!,
      lastSyncCompletedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}last_sync_completed_at'],
      ),
    );
  }

  @override
  $SyncCursorsTableTable createAlias(String alias) {
    return $SyncCursorsTableTable(attachedDatabase, alias);
  }
}

class SyncCursorEntry extends DataClass implements Insertable<SyncCursorEntry> {
  /// Target entity discriminator: 'bookmark', 'reading_progress', 'prayer_settings'.
  final String entityType;

  /// Server timestamp of the latest synced record (part 1 of composite keyset cursor).
  final DateTime cursorUpdatedAt;

  /// Primary identifier of the latest synced record (part 2 of composite keyset cursor).
  final String cursorId;

  /// Local timestamp when the last successful sync cycle completed.
  final DateTime? lastSyncCompletedAt;
  const SyncCursorEntry({
    required this.entityType,
    required this.cursorUpdatedAt,
    required this.cursorId,
    this.lastSyncCompletedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['entity_type'] = Variable<String>(entityType);
    map['cursor_updated_at'] = Variable<DateTime>(cursorUpdatedAt);
    map['cursor_id'] = Variable<String>(cursorId);
    if (!nullToAbsent || lastSyncCompletedAt != null) {
      map['last_sync_completed_at'] = Variable<DateTime>(lastSyncCompletedAt);
    }
    return map;
  }

  SyncCursorsTableCompanion toCompanion(bool nullToAbsent) {
    return SyncCursorsTableCompanion(
      entityType: Value(entityType),
      cursorUpdatedAt: Value(cursorUpdatedAt),
      cursorId: Value(cursorId),
      lastSyncCompletedAt: lastSyncCompletedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastSyncCompletedAt),
    );
  }

  factory SyncCursorEntry.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SyncCursorEntry(
      entityType: serializer.fromJson<String>(json['entityType']),
      cursorUpdatedAt: serializer.fromJson<DateTime>(json['cursorUpdatedAt']),
      cursorId: serializer.fromJson<String>(json['cursorId']),
      lastSyncCompletedAt: serializer.fromJson<DateTime?>(
        json['lastSyncCompletedAt'],
      ),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'entityType': serializer.toJson<String>(entityType),
      'cursorUpdatedAt': serializer.toJson<DateTime>(cursorUpdatedAt),
      'cursorId': serializer.toJson<String>(cursorId),
      'lastSyncCompletedAt': serializer.toJson<DateTime?>(lastSyncCompletedAt),
    };
  }

  SyncCursorEntry copyWith({
    String? entityType,
    DateTime? cursorUpdatedAt,
    String? cursorId,
    Value<DateTime?> lastSyncCompletedAt = const Value.absent(),
  }) => SyncCursorEntry(
    entityType: entityType ?? this.entityType,
    cursorUpdatedAt: cursorUpdatedAt ?? this.cursorUpdatedAt,
    cursorId: cursorId ?? this.cursorId,
    lastSyncCompletedAt: lastSyncCompletedAt.present
        ? lastSyncCompletedAt.value
        : this.lastSyncCompletedAt,
  );
  SyncCursorEntry copyWithCompanion(SyncCursorsTableCompanion data) {
    return SyncCursorEntry(
      entityType: data.entityType.present
          ? data.entityType.value
          : this.entityType,
      cursorUpdatedAt: data.cursorUpdatedAt.present
          ? data.cursorUpdatedAt.value
          : this.cursorUpdatedAt,
      cursorId: data.cursorId.present ? data.cursorId.value : this.cursorId,
      lastSyncCompletedAt: data.lastSyncCompletedAt.present
          ? data.lastSyncCompletedAt.value
          : this.lastSyncCompletedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SyncCursorEntry(')
          ..write('entityType: $entityType, ')
          ..write('cursorUpdatedAt: $cursorUpdatedAt, ')
          ..write('cursorId: $cursorId, ')
          ..write('lastSyncCompletedAt: $lastSyncCompletedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(entityType, cursorUpdatedAt, cursorId, lastSyncCompletedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SyncCursorEntry &&
          other.entityType == this.entityType &&
          other.cursorUpdatedAt == this.cursorUpdatedAt &&
          other.cursorId == this.cursorId &&
          other.lastSyncCompletedAt == this.lastSyncCompletedAt);
}

class SyncCursorsTableCompanion extends UpdateCompanion<SyncCursorEntry> {
  final Value<String> entityType;
  final Value<DateTime> cursorUpdatedAt;
  final Value<String> cursorId;
  final Value<DateTime?> lastSyncCompletedAt;
  final Value<int> rowid;
  const SyncCursorsTableCompanion({
    this.entityType = const Value.absent(),
    this.cursorUpdatedAt = const Value.absent(),
    this.cursorId = const Value.absent(),
    this.lastSyncCompletedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SyncCursorsTableCompanion.insert({
    required String entityType,
    required DateTime cursorUpdatedAt,
    required String cursorId,
    this.lastSyncCompletedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : entityType = Value(entityType),
       cursorUpdatedAt = Value(cursorUpdatedAt),
       cursorId = Value(cursorId);
  static Insertable<SyncCursorEntry> custom({
    Expression<String>? entityType,
    Expression<DateTime>? cursorUpdatedAt,
    Expression<String>? cursorId,
    Expression<DateTime>? lastSyncCompletedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (entityType != null) 'entity_type': entityType,
      if (cursorUpdatedAt != null) 'cursor_updated_at': cursorUpdatedAt,
      if (cursorId != null) 'cursor_id': cursorId,
      if (lastSyncCompletedAt != null)
        'last_sync_completed_at': lastSyncCompletedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SyncCursorsTableCompanion copyWith({
    Value<String>? entityType,
    Value<DateTime>? cursorUpdatedAt,
    Value<String>? cursorId,
    Value<DateTime?>? lastSyncCompletedAt,
    Value<int>? rowid,
  }) {
    return SyncCursorsTableCompanion(
      entityType: entityType ?? this.entityType,
      cursorUpdatedAt: cursorUpdatedAt ?? this.cursorUpdatedAt,
      cursorId: cursorId ?? this.cursorId,
      lastSyncCompletedAt: lastSyncCompletedAt ?? this.lastSyncCompletedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (entityType.present) {
      map['entity_type'] = Variable<String>(entityType.value);
    }
    if (cursorUpdatedAt.present) {
      map['cursor_updated_at'] = Variable<DateTime>(cursorUpdatedAt.value);
    }
    if (cursorId.present) {
      map['cursor_id'] = Variable<String>(cursorId.value);
    }
    if (lastSyncCompletedAt.present) {
      map['last_sync_completed_at'] = Variable<DateTime>(
        lastSyncCompletedAt.value,
      );
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SyncCursorsTableCompanion(')
          ..write('entityType: $entityType, ')
          ..write('cursorUpdatedAt: $cursorUpdatedAt, ')
          ..write('cursorId: $cursorId, ')
          ..write('lastSyncCompletedAt: $lastSyncCompletedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $LocalUserStateTableTable localUserStateTable =
      $LocalUserStateTableTable(this);
  late final $AppSettingsTableTable appSettingsTable = $AppSettingsTableTable(
    this,
  );
  late final $LocalBookmarksTableTable localBookmarksTable =
      $LocalBookmarksTableTable(this);
  late final $LocalReadingProgressTableTable localReadingProgressTable =
      $LocalReadingProgressTableTable(this);
  late final $SyncQueueTableTable syncQueueTable = $SyncQueueTableTable(this);
  late final $SyncCursorsTableTable syncCursorsTable = $SyncCursorsTableTable(
    this,
  );
  late final BookmarksDao bookmarksDao = BookmarksDao(this as AppDatabase);
  late final ReadingProgressDao readingProgressDao = ReadingProgressDao(
    this as AppDatabase,
  );
  late final AppSettingsDao appSettingsDao = AppSettingsDao(
    this as AppDatabase,
  );
  late final UserStateDao userStateDao = UserStateDao(this as AppDatabase);
  late final SyncQueueDao syncQueueDao = SyncQueueDao(this as AppDatabase);
  late final SyncCursorsDao syncCursorsDao = SyncCursorsDao(
    this as AppDatabase,
  );
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    localUserStateTable,
    appSettingsTable,
    localBookmarksTable,
    localReadingProgressTable,
    syncQueueTable,
    syncCursorsTable,
  ];
}

typedef $$LocalUserStateTableTableCreateCompanionBuilder =
    LocalUserStateTableCompanion Function({
      required String id,
      Value<String?> email,
      Value<String?> displayName,
      Value<String?> avatarUrl,
      Value<String> role,
      Value<bool> isAnonymous,
      Value<DateTime?> lastSyncedAt,
      Value<DateTime> createdAt,
      Value<DateTime> updatedAt,
      Value<int> rowid,
    });
typedef $$LocalUserStateTableTableUpdateCompanionBuilder =
    LocalUserStateTableCompanion Function({
      Value<String> id,
      Value<String?> email,
      Value<String?> displayName,
      Value<String?> avatarUrl,
      Value<String> role,
      Value<bool> isAnonymous,
      Value<DateTime?> lastSyncedAt,
      Value<DateTime> createdAt,
      Value<DateTime> updatedAt,
      Value<int> rowid,
    });

class $$LocalUserStateTableTableFilterComposer
    extends Composer<_$AppDatabase, $LocalUserStateTableTable> {
  $$LocalUserStateTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get email => $composableBuilder(
    column: $table.email,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get displayName => $composableBuilder(
    column: $table.displayName,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get avatarUrl => $composableBuilder(
    column: $table.avatarUrl,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get role => $composableBuilder(
    column: $table.role,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get isAnonymous => $composableBuilder(
    column: $table.isAnonymous,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get lastSyncedAt => $composableBuilder(
    column: $table.lastSyncedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalUserStateTableTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalUserStateTableTable> {
  $$LocalUserStateTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get email => $composableBuilder(
    column: $table.email,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get displayName => $composableBuilder(
    column: $table.displayName,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get avatarUrl => $composableBuilder(
    column: $table.avatarUrl,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get role => $composableBuilder(
    column: $table.role,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get isAnonymous => $composableBuilder(
    column: $table.isAnonymous,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get lastSyncedAt => $composableBuilder(
    column: $table.lastSyncedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalUserStateTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalUserStateTableTable> {
  $$LocalUserStateTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get email =>
      $composableBuilder(column: $table.email, builder: (column) => column);

  GeneratedColumn<String> get displayName => $composableBuilder(
    column: $table.displayName,
    builder: (column) => column,
  );

  GeneratedColumn<String> get avatarUrl =>
      $composableBuilder(column: $table.avatarUrl, builder: (column) => column);

  GeneratedColumn<String> get role =>
      $composableBuilder(column: $table.role, builder: (column) => column);

  GeneratedColumn<bool> get isAnonymous => $composableBuilder(
    column: $table.isAnonymous,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get lastSyncedAt => $composableBuilder(
    column: $table.lastSyncedAt,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$LocalUserStateTableTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalUserStateTableTable,
          LocalUserState,
          $$LocalUserStateTableTableFilterComposer,
          $$LocalUserStateTableTableOrderingComposer,
          $$LocalUserStateTableTableAnnotationComposer,
          $$LocalUserStateTableTableCreateCompanionBuilder,
          $$LocalUserStateTableTableUpdateCompanionBuilder,
          (
            LocalUserState,
            BaseReferences<
              _$AppDatabase,
              $LocalUserStateTableTable,
              LocalUserState
            >,
          ),
          LocalUserState,
          PrefetchHooks Function()
        > {
  $$LocalUserStateTableTableTableManager(
    _$AppDatabase db,
    $LocalUserStateTableTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalUserStateTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LocalUserStateTableTableOrderingComposer(
                $db: db,
                $table: table,
              ),
          createComputedFieldComposer: () =>
              $$LocalUserStateTableTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String?> email = const Value.absent(),
                Value<String?> displayName = const Value.absent(),
                Value<String?> avatarUrl = const Value.absent(),
                Value<String> role = const Value.absent(),
                Value<bool> isAnonymous = const Value.absent(),
                Value<DateTime?> lastSyncedAt = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalUserStateTableCompanion(
                id: id,
                email: email,
                displayName: displayName,
                avatarUrl: avatarUrl,
                role: role,
                isAnonymous: isAnonymous,
                lastSyncedAt: lastSyncedAt,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                Value<String?> email = const Value.absent(),
                Value<String?> displayName = const Value.absent(),
                Value<String?> avatarUrl = const Value.absent(),
                Value<String> role = const Value.absent(),
                Value<bool> isAnonymous = const Value.absent(),
                Value<DateTime?> lastSyncedAt = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalUserStateTableCompanion.insert(
                id: id,
                email: email,
                displayName: displayName,
                avatarUrl: avatarUrl,
                role: role,
                isAnonymous: isAnonymous,
                lastSyncedAt: lastSyncedAt,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$LocalUserStateTableTable, LocalUserState>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $LocalUserStateTableTable,
                    LocalUserState
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalUserStateTableTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalUserStateTableTable,
      LocalUserState,
      $$LocalUserStateTableTableFilterComposer,
      $$LocalUserStateTableTableOrderingComposer,
      $$LocalUserStateTableTableAnnotationComposer,
      $$LocalUserStateTableTableCreateCompanionBuilder,
      $$LocalUserStateTableTableUpdateCompanionBuilder,
      (
        LocalUserState,
        BaseReferences<
          _$AppDatabase,
          $LocalUserStateTableTable,
          LocalUserState
        >,
      ),
      LocalUserState,
      PrefetchHooks Function()
    >;
typedef $$AppSettingsTableTableCreateCompanionBuilder =
    AppSettingsTableCompanion Function({
      Value<String> id,
      Value<String> themeMode,
      Value<String> locale,
      Value<String> arabicScript,
      Value<double> arabicFontSize,
      Value<double> translationFontSize,
      Value<String> prayerCalculationMethod,
      Value<String> prayerMadhab,
      Value<String> selectedReciterId,
      Value<bool> notificationsEnabled,
      Value<bool> offlineSyncEnabled,
      Value<DateTime> updatedAt,
      Value<int> rowid,
    });
typedef $$AppSettingsTableTableUpdateCompanionBuilder =
    AppSettingsTableCompanion Function({
      Value<String> id,
      Value<String> themeMode,
      Value<String> locale,
      Value<String> arabicScript,
      Value<double> arabicFontSize,
      Value<double> translationFontSize,
      Value<String> prayerCalculationMethod,
      Value<String> prayerMadhab,
      Value<String> selectedReciterId,
      Value<bool> notificationsEnabled,
      Value<bool> offlineSyncEnabled,
      Value<DateTime> updatedAt,
      Value<int> rowid,
    });

class $$AppSettingsTableTableFilterComposer
    extends Composer<_$AppDatabase, $AppSettingsTableTable> {
  $$AppSettingsTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get themeMode => $composableBuilder(
    column: $table.themeMode,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get locale => $composableBuilder(
    column: $table.locale,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get arabicScript => $composableBuilder(
    column: $table.arabicScript,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get arabicFontSize => $composableBuilder(
    column: $table.arabicFontSize,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get translationFontSize => $composableBuilder(
    column: $table.translationFontSize,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get prayerCalculationMethod => $composableBuilder(
    column: $table.prayerCalculationMethod,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get prayerMadhab => $composableBuilder(
    column: $table.prayerMadhab,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get selectedReciterId => $composableBuilder(
    column: $table.selectedReciterId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get notificationsEnabled => $composableBuilder(
    column: $table.notificationsEnabled,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get offlineSyncEnabled => $composableBuilder(
    column: $table.offlineSyncEnabled,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$AppSettingsTableTableOrderingComposer
    extends Composer<_$AppDatabase, $AppSettingsTableTable> {
  $$AppSettingsTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get themeMode => $composableBuilder(
    column: $table.themeMode,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get locale => $composableBuilder(
    column: $table.locale,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get arabicScript => $composableBuilder(
    column: $table.arabicScript,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get arabicFontSize => $composableBuilder(
    column: $table.arabicFontSize,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get translationFontSize => $composableBuilder(
    column: $table.translationFontSize,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get prayerCalculationMethod => $composableBuilder(
    column: $table.prayerCalculationMethod,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get prayerMadhab => $composableBuilder(
    column: $table.prayerMadhab,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get selectedReciterId => $composableBuilder(
    column: $table.selectedReciterId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get notificationsEnabled => $composableBuilder(
    column: $table.notificationsEnabled,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get offlineSyncEnabled => $composableBuilder(
    column: $table.offlineSyncEnabled,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$AppSettingsTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $AppSettingsTableTable> {
  $$AppSettingsTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get themeMode =>
      $composableBuilder(column: $table.themeMode, builder: (column) => column);

  GeneratedColumn<String> get locale =>
      $composableBuilder(column: $table.locale, builder: (column) => column);

  GeneratedColumn<String> get arabicScript => $composableBuilder(
    column: $table.arabicScript,
    builder: (column) => column,
  );

  GeneratedColumn<double> get arabicFontSize => $composableBuilder(
    column: $table.arabicFontSize,
    builder: (column) => column,
  );

  GeneratedColumn<double> get translationFontSize => $composableBuilder(
    column: $table.translationFontSize,
    builder: (column) => column,
  );

  GeneratedColumn<String> get prayerCalculationMethod => $composableBuilder(
    column: $table.prayerCalculationMethod,
    builder: (column) => column,
  );

  GeneratedColumn<String> get prayerMadhab => $composableBuilder(
    column: $table.prayerMadhab,
    builder: (column) => column,
  );

  GeneratedColumn<String> get selectedReciterId => $composableBuilder(
    column: $table.selectedReciterId,
    builder: (column) => column,
  );

  GeneratedColumn<bool> get notificationsEnabled => $composableBuilder(
    column: $table.notificationsEnabled,
    builder: (column) => column,
  );

  GeneratedColumn<bool> get offlineSyncEnabled => $composableBuilder(
    column: $table.offlineSyncEnabled,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$AppSettingsTableTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $AppSettingsTableTable,
          AppSetting,
          $$AppSettingsTableTableFilterComposer,
          $$AppSettingsTableTableOrderingComposer,
          $$AppSettingsTableTableAnnotationComposer,
          $$AppSettingsTableTableCreateCompanionBuilder,
          $$AppSettingsTableTableUpdateCompanionBuilder,
          (
            AppSetting,
            BaseReferences<_$AppDatabase, $AppSettingsTableTable, AppSetting>,
          ),
          AppSetting,
          PrefetchHooks Function()
        > {
  $$AppSettingsTableTableTableManager(
    _$AppDatabase db,
    $AppSettingsTableTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$AppSettingsTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$AppSettingsTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$AppSettingsTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> themeMode = const Value.absent(),
                Value<String> locale = const Value.absent(),
                Value<String> arabicScript = const Value.absent(),
                Value<double> arabicFontSize = const Value.absent(),
                Value<double> translationFontSize = const Value.absent(),
                Value<String> prayerCalculationMethod = const Value.absent(),
                Value<String> prayerMadhab = const Value.absent(),
                Value<String> selectedReciterId = const Value.absent(),
                Value<bool> notificationsEnabled = const Value.absent(),
                Value<bool> offlineSyncEnabled = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => AppSettingsTableCompanion(
                id: id,
                themeMode: themeMode,
                locale: locale,
                arabicScript: arabicScript,
                arabicFontSize: arabicFontSize,
                translationFontSize: translationFontSize,
                prayerCalculationMethod: prayerCalculationMethod,
                prayerMadhab: prayerMadhab,
                selectedReciterId: selectedReciterId,
                notificationsEnabled: notificationsEnabled,
                offlineSyncEnabled: offlineSyncEnabled,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> themeMode = const Value.absent(),
                Value<String> locale = const Value.absent(),
                Value<String> arabicScript = const Value.absent(),
                Value<double> arabicFontSize = const Value.absent(),
                Value<double> translationFontSize = const Value.absent(),
                Value<String> prayerCalculationMethod = const Value.absent(),
                Value<String> prayerMadhab = const Value.absent(),
                Value<String> selectedReciterId = const Value.absent(),
                Value<bool> notificationsEnabled = const Value.absent(),
                Value<bool> offlineSyncEnabled = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => AppSettingsTableCompanion.insert(
                id: id,
                themeMode: themeMode,
                locale: locale,
                arabicScript: arabicScript,
                arabicFontSize: arabicFontSize,
                translationFontSize: translationFontSize,
                prayerCalculationMethod: prayerCalculationMethod,
                prayerMadhab: prayerMadhab,
                selectedReciterId: selectedReciterId,
                notificationsEnabled: notificationsEnabled,
                offlineSyncEnabled: offlineSyncEnabled,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$AppSettingsTableTable, AppSetting>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $AppSettingsTableTable,
                    AppSetting
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$AppSettingsTableTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $AppSettingsTableTable,
      AppSetting,
      $$AppSettingsTableTableFilterComposer,
      $$AppSettingsTableTableOrderingComposer,
      $$AppSettingsTableTableAnnotationComposer,
      $$AppSettingsTableTableCreateCompanionBuilder,
      $$AppSettingsTableTableUpdateCompanionBuilder,
      (
        AppSetting,
        BaseReferences<_$AppDatabase, $AppSettingsTableTable, AppSetting>,
      ),
      AppSetting,
      PrefetchHooks Function()
    >;
typedef $$LocalBookmarksTableTableCreateCompanionBuilder =
    LocalBookmarksTableCompanion Function({
      required String id,
      required String userId,
      required String contentType,
      required String contentReference,
      Value<int?> surahNumber,
      Value<int?> ayahNumber,
      Value<String?> hadithCollection,
      Value<int?> hadithNumber,
      Value<String?> duaCategory,
      Value<String?> articleId,
      Value<String?> bookId,
      Value<String> folderName,
      Value<String?> note,
      Value<String> tags,
      Value<String?> clientMutationId,
      Value<int> clientVersion,
      Value<int> serverRevision,
      Value<String?> lastClientMutationId,
      Value<DateTime> createdAt,
      Value<DateTime> updatedAt,
      Value<DateTime?> deletedAt,
      Value<String> syncStatus,
      Value<int> rowid,
    });
typedef $$LocalBookmarksTableTableUpdateCompanionBuilder =
    LocalBookmarksTableCompanion Function({
      Value<String> id,
      Value<String> userId,
      Value<String> contentType,
      Value<String> contentReference,
      Value<int?> surahNumber,
      Value<int?> ayahNumber,
      Value<String?> hadithCollection,
      Value<int?> hadithNumber,
      Value<String?> duaCategory,
      Value<String?> articleId,
      Value<String?> bookId,
      Value<String> folderName,
      Value<String?> note,
      Value<String> tags,
      Value<String?> clientMutationId,
      Value<int> clientVersion,
      Value<int> serverRevision,
      Value<String?> lastClientMutationId,
      Value<DateTime> createdAt,
      Value<DateTime> updatedAt,
      Value<DateTime?> deletedAt,
      Value<String> syncStatus,
      Value<int> rowid,
    });

class $$LocalBookmarksTableTableFilterComposer
    extends Composer<_$AppDatabase, $LocalBookmarksTableTable> {
  $$LocalBookmarksTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get userId => $composableBuilder(
    column: $table.userId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get contentType => $composableBuilder(
    column: $table.contentType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get contentReference => $composableBuilder(
    column: $table.contentReference,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get surahNumber => $composableBuilder(
    column: $table.surahNumber,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get ayahNumber => $composableBuilder(
    column: $table.ayahNumber,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get hadithCollection => $composableBuilder(
    column: $table.hadithCollection,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get hadithNumber => $composableBuilder(
    column: $table.hadithNumber,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get duaCategory => $composableBuilder(
    column: $table.duaCategory,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get articleId => $composableBuilder(
    column: $table.articleId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get bookId => $composableBuilder(
    column: $table.bookId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get folderName => $composableBuilder(
    column: $table.folderName,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get tags => $composableBuilder(
    column: $table.tags,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get clientMutationId => $composableBuilder(
    column: $table.clientMutationId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get clientVersion => $composableBuilder(
    column: $table.clientVersion,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get serverRevision => $composableBuilder(
    column: $table.serverRevision,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get lastClientMutationId => $composableBuilder(
    column: $table.lastClientMutationId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get deletedAt => $composableBuilder(
    column: $table.deletedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get syncStatus => $composableBuilder(
    column: $table.syncStatus,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalBookmarksTableTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalBookmarksTableTable> {
  $$LocalBookmarksTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get userId => $composableBuilder(
    column: $table.userId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get contentType => $composableBuilder(
    column: $table.contentType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get contentReference => $composableBuilder(
    column: $table.contentReference,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get surahNumber => $composableBuilder(
    column: $table.surahNumber,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get ayahNumber => $composableBuilder(
    column: $table.ayahNumber,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get hadithCollection => $composableBuilder(
    column: $table.hadithCollection,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get hadithNumber => $composableBuilder(
    column: $table.hadithNumber,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get duaCategory => $composableBuilder(
    column: $table.duaCategory,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get articleId => $composableBuilder(
    column: $table.articleId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get bookId => $composableBuilder(
    column: $table.bookId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get folderName => $composableBuilder(
    column: $table.folderName,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get tags => $composableBuilder(
    column: $table.tags,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get clientMutationId => $composableBuilder(
    column: $table.clientMutationId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get clientVersion => $composableBuilder(
    column: $table.clientVersion,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get serverRevision => $composableBuilder(
    column: $table.serverRevision,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get lastClientMutationId => $composableBuilder(
    column: $table.lastClientMutationId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get deletedAt => $composableBuilder(
    column: $table.deletedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get syncStatus => $composableBuilder(
    column: $table.syncStatus,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalBookmarksTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalBookmarksTableTable> {
  $$LocalBookmarksTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get userId =>
      $composableBuilder(column: $table.userId, builder: (column) => column);

  GeneratedColumn<String> get contentType => $composableBuilder(
    column: $table.contentType,
    builder: (column) => column,
  );

  GeneratedColumn<String> get contentReference => $composableBuilder(
    column: $table.contentReference,
    builder: (column) => column,
  );

  GeneratedColumn<int> get surahNumber => $composableBuilder(
    column: $table.surahNumber,
    builder: (column) => column,
  );

  GeneratedColumn<int> get ayahNumber => $composableBuilder(
    column: $table.ayahNumber,
    builder: (column) => column,
  );

  GeneratedColumn<String> get hadithCollection => $composableBuilder(
    column: $table.hadithCollection,
    builder: (column) => column,
  );

  GeneratedColumn<int> get hadithNumber => $composableBuilder(
    column: $table.hadithNumber,
    builder: (column) => column,
  );

  GeneratedColumn<String> get duaCategory => $composableBuilder(
    column: $table.duaCategory,
    builder: (column) => column,
  );

  GeneratedColumn<String> get articleId =>
      $composableBuilder(column: $table.articleId, builder: (column) => column);

  GeneratedColumn<String> get bookId =>
      $composableBuilder(column: $table.bookId, builder: (column) => column);

  GeneratedColumn<String> get folderName => $composableBuilder(
    column: $table.folderName,
    builder: (column) => column,
  );

  GeneratedColumn<String> get note =>
      $composableBuilder(column: $table.note, builder: (column) => column);

  GeneratedColumn<String> get tags =>
      $composableBuilder(column: $table.tags, builder: (column) => column);

  GeneratedColumn<String> get clientMutationId => $composableBuilder(
    column: $table.clientMutationId,
    builder: (column) => column,
  );

  GeneratedColumn<int> get clientVersion => $composableBuilder(
    column: $table.clientVersion,
    builder: (column) => column,
  );

  GeneratedColumn<int> get serverRevision => $composableBuilder(
    column: $table.serverRevision,
    builder: (column) => column,
  );

  GeneratedColumn<String> get lastClientMutationId => $composableBuilder(
    column: $table.lastClientMutationId,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get deletedAt =>
      $composableBuilder(column: $table.deletedAt, builder: (column) => column);

  GeneratedColumn<String> get syncStatus => $composableBuilder(
    column: $table.syncStatus,
    builder: (column) => column,
  );
}

class $$LocalBookmarksTableTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalBookmarksTableTable,
          LocalBookmark,
          $$LocalBookmarksTableTableFilterComposer,
          $$LocalBookmarksTableTableOrderingComposer,
          $$LocalBookmarksTableTableAnnotationComposer,
          $$LocalBookmarksTableTableCreateCompanionBuilder,
          $$LocalBookmarksTableTableUpdateCompanionBuilder,
          (
            LocalBookmark,
            BaseReferences<
              _$AppDatabase,
              $LocalBookmarksTableTable,
              LocalBookmark
            >,
          ),
          LocalBookmark,
          PrefetchHooks Function()
        > {
  $$LocalBookmarksTableTableTableManager(
    _$AppDatabase db,
    $LocalBookmarksTableTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalBookmarksTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LocalBookmarksTableTableOrderingComposer(
                $db: db,
                $table: table,
              ),
          createComputedFieldComposer: () =>
              $$LocalBookmarksTableTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> userId = const Value.absent(),
                Value<String> contentType = const Value.absent(),
                Value<String> contentReference = const Value.absent(),
                Value<int?> surahNumber = const Value.absent(),
                Value<int?> ayahNumber = const Value.absent(),
                Value<String?> hadithCollection = const Value.absent(),
                Value<int?> hadithNumber = const Value.absent(),
                Value<String?> duaCategory = const Value.absent(),
                Value<String?> articleId = const Value.absent(),
                Value<String?> bookId = const Value.absent(),
                Value<String> folderName = const Value.absent(),
                Value<String?> note = const Value.absent(),
                Value<String> tags = const Value.absent(),
                Value<String?> clientMutationId = const Value.absent(),
                Value<int> clientVersion = const Value.absent(),
                Value<int> serverRevision = const Value.absent(),
                Value<String?> lastClientMutationId = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<DateTime?> deletedAt = const Value.absent(),
                Value<String> syncStatus = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalBookmarksTableCompanion(
                id: id,
                userId: userId,
                contentType: contentType,
                contentReference: contentReference,
                surahNumber: surahNumber,
                ayahNumber: ayahNumber,
                hadithCollection: hadithCollection,
                hadithNumber: hadithNumber,
                duaCategory: duaCategory,
                articleId: articleId,
                bookId: bookId,
                folderName: folderName,
                note: note,
                tags: tags,
                clientMutationId: clientMutationId,
                clientVersion: clientVersion,
                serverRevision: serverRevision,
                lastClientMutationId: lastClientMutationId,
                createdAt: createdAt,
                updatedAt: updatedAt,
                deletedAt: deletedAt,
                syncStatus: syncStatus,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String userId,
                required String contentType,
                required String contentReference,
                Value<int?> surahNumber = const Value.absent(),
                Value<int?> ayahNumber = const Value.absent(),
                Value<String?> hadithCollection = const Value.absent(),
                Value<int?> hadithNumber = const Value.absent(),
                Value<String?> duaCategory = const Value.absent(),
                Value<String?> articleId = const Value.absent(),
                Value<String?> bookId = const Value.absent(),
                Value<String> folderName = const Value.absent(),
                Value<String?> note = const Value.absent(),
                Value<String> tags = const Value.absent(),
                Value<String?> clientMutationId = const Value.absent(),
                Value<int> clientVersion = const Value.absent(),
                Value<int> serverRevision = const Value.absent(),
                Value<String?> lastClientMutationId = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<DateTime?> deletedAt = const Value.absent(),
                Value<String> syncStatus = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalBookmarksTableCompanion.insert(
                id: id,
                userId: userId,
                contentType: contentType,
                contentReference: contentReference,
                surahNumber: surahNumber,
                ayahNumber: ayahNumber,
                hadithCollection: hadithCollection,
                hadithNumber: hadithNumber,
                duaCategory: duaCategory,
                articleId: articleId,
                bookId: bookId,
                folderName: folderName,
                note: note,
                tags: tags,
                clientMutationId: clientMutationId,
                clientVersion: clientVersion,
                serverRevision: serverRevision,
                lastClientMutationId: lastClientMutationId,
                createdAt: createdAt,
                updatedAt: updatedAt,
                deletedAt: deletedAt,
                syncStatus: syncStatus,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$LocalBookmarksTableTable, LocalBookmark>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $LocalBookmarksTableTable,
                    LocalBookmark
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalBookmarksTableTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalBookmarksTableTable,
      LocalBookmark,
      $$LocalBookmarksTableTableFilterComposer,
      $$LocalBookmarksTableTableOrderingComposer,
      $$LocalBookmarksTableTableAnnotationComposer,
      $$LocalBookmarksTableTableCreateCompanionBuilder,
      $$LocalBookmarksTableTableUpdateCompanionBuilder,
      (
        LocalBookmark,
        BaseReferences<_$AppDatabase, $LocalBookmarksTableTable, LocalBookmark>,
      ),
      LocalBookmark,
      PrefetchHooks Function()
    >;
typedef $$LocalReadingProgressTableTableCreateCompanionBuilder =
    LocalReadingProgressTableCompanion Function({
      required String id,
      required String userId,
      required String bookId,
      Value<String?> editionId,
      Value<int> volumeNumber,
      Value<String?> sectionId,
      Value<int?> pageNumber,
      Value<double> progressPercentage,
      Value<DateTime> lastReadAt,
      Value<String?> clientMutationId,
      Value<int> clientVersion,
      Value<int> serverRevision,
      Value<String?> lastClientMutationId,
      Value<DateTime> createdAt,
      Value<DateTime> updatedAt,
      Value<DateTime?> deletedAt,
      Value<String> syncStatus,
      Value<int> rowid,
    });
typedef $$LocalReadingProgressTableTableUpdateCompanionBuilder =
    LocalReadingProgressTableCompanion Function({
      Value<String> id,
      Value<String> userId,
      Value<String> bookId,
      Value<String?> editionId,
      Value<int> volumeNumber,
      Value<String?> sectionId,
      Value<int?> pageNumber,
      Value<double> progressPercentage,
      Value<DateTime> lastReadAt,
      Value<String?> clientMutationId,
      Value<int> clientVersion,
      Value<int> serverRevision,
      Value<String?> lastClientMutationId,
      Value<DateTime> createdAt,
      Value<DateTime> updatedAt,
      Value<DateTime?> deletedAt,
      Value<String> syncStatus,
      Value<int> rowid,
    });

class $$LocalReadingProgressTableTableFilterComposer
    extends Composer<_$AppDatabase, $LocalReadingProgressTableTable> {
  $$LocalReadingProgressTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get userId => $composableBuilder(
    column: $table.userId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get bookId => $composableBuilder(
    column: $table.bookId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get editionId => $composableBuilder(
    column: $table.editionId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get volumeNumber => $composableBuilder(
    column: $table.volumeNumber,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get sectionId => $composableBuilder(
    column: $table.sectionId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get pageNumber => $composableBuilder(
    column: $table.pageNumber,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get progressPercentage => $composableBuilder(
    column: $table.progressPercentage,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get lastReadAt => $composableBuilder(
    column: $table.lastReadAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get clientMutationId => $composableBuilder(
    column: $table.clientMutationId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get clientVersion => $composableBuilder(
    column: $table.clientVersion,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get serverRevision => $composableBuilder(
    column: $table.serverRevision,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get lastClientMutationId => $composableBuilder(
    column: $table.lastClientMutationId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get deletedAt => $composableBuilder(
    column: $table.deletedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get syncStatus => $composableBuilder(
    column: $table.syncStatus,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalReadingProgressTableTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalReadingProgressTableTable> {
  $$LocalReadingProgressTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get userId => $composableBuilder(
    column: $table.userId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get bookId => $composableBuilder(
    column: $table.bookId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get editionId => $composableBuilder(
    column: $table.editionId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get volumeNumber => $composableBuilder(
    column: $table.volumeNumber,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get sectionId => $composableBuilder(
    column: $table.sectionId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get pageNumber => $composableBuilder(
    column: $table.pageNumber,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get progressPercentage => $composableBuilder(
    column: $table.progressPercentage,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get lastReadAt => $composableBuilder(
    column: $table.lastReadAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get clientMutationId => $composableBuilder(
    column: $table.clientMutationId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get clientVersion => $composableBuilder(
    column: $table.clientVersion,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get serverRevision => $composableBuilder(
    column: $table.serverRevision,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get lastClientMutationId => $composableBuilder(
    column: $table.lastClientMutationId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get deletedAt => $composableBuilder(
    column: $table.deletedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get syncStatus => $composableBuilder(
    column: $table.syncStatus,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalReadingProgressTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalReadingProgressTableTable> {
  $$LocalReadingProgressTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get userId =>
      $composableBuilder(column: $table.userId, builder: (column) => column);

  GeneratedColumn<String> get bookId =>
      $composableBuilder(column: $table.bookId, builder: (column) => column);

  GeneratedColumn<String> get editionId =>
      $composableBuilder(column: $table.editionId, builder: (column) => column);

  GeneratedColumn<int> get volumeNumber => $composableBuilder(
    column: $table.volumeNumber,
    builder: (column) => column,
  );

  GeneratedColumn<String> get sectionId =>
      $composableBuilder(column: $table.sectionId, builder: (column) => column);

  GeneratedColumn<int> get pageNumber => $composableBuilder(
    column: $table.pageNumber,
    builder: (column) => column,
  );

  GeneratedColumn<double> get progressPercentage => $composableBuilder(
    column: $table.progressPercentage,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get lastReadAt => $composableBuilder(
    column: $table.lastReadAt,
    builder: (column) => column,
  );

  GeneratedColumn<String> get clientMutationId => $composableBuilder(
    column: $table.clientMutationId,
    builder: (column) => column,
  );

  GeneratedColumn<int> get clientVersion => $composableBuilder(
    column: $table.clientVersion,
    builder: (column) => column,
  );

  GeneratedColumn<int> get serverRevision => $composableBuilder(
    column: $table.serverRevision,
    builder: (column) => column,
  );

  GeneratedColumn<String> get lastClientMutationId => $composableBuilder(
    column: $table.lastClientMutationId,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get deletedAt =>
      $composableBuilder(column: $table.deletedAt, builder: (column) => column);

  GeneratedColumn<String> get syncStatus => $composableBuilder(
    column: $table.syncStatus,
    builder: (column) => column,
  );
}

class $$LocalReadingProgressTableTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalReadingProgressTableTable,
          LocalReadingProgress,
          $$LocalReadingProgressTableTableFilterComposer,
          $$LocalReadingProgressTableTableOrderingComposer,
          $$LocalReadingProgressTableTableAnnotationComposer,
          $$LocalReadingProgressTableTableCreateCompanionBuilder,
          $$LocalReadingProgressTableTableUpdateCompanionBuilder,
          (
            LocalReadingProgress,
            BaseReferences<
              _$AppDatabase,
              $LocalReadingProgressTableTable,
              LocalReadingProgress
            >,
          ),
          LocalReadingProgress,
          PrefetchHooks Function()
        > {
  $$LocalReadingProgressTableTableTableManager(
    _$AppDatabase db,
    $LocalReadingProgressTableTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalReadingProgressTableTableFilterComposer(
                $db: db,
                $table: table,
              ),
          createOrderingComposer: () =>
              $$LocalReadingProgressTableTableOrderingComposer(
                $db: db,
                $table: table,
              ),
          createComputedFieldComposer: () =>
              $$LocalReadingProgressTableTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> userId = const Value.absent(),
                Value<String> bookId = const Value.absent(),
                Value<String?> editionId = const Value.absent(),
                Value<int> volumeNumber = const Value.absent(),
                Value<String?> sectionId = const Value.absent(),
                Value<int?> pageNumber = const Value.absent(),
                Value<double> progressPercentage = const Value.absent(),
                Value<DateTime> lastReadAt = const Value.absent(),
                Value<String?> clientMutationId = const Value.absent(),
                Value<int> clientVersion = const Value.absent(),
                Value<int> serverRevision = const Value.absent(),
                Value<String?> lastClientMutationId = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<DateTime?> deletedAt = const Value.absent(),
                Value<String> syncStatus = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalReadingProgressTableCompanion(
                id: id,
                userId: userId,
                bookId: bookId,
                editionId: editionId,
                volumeNumber: volumeNumber,
                sectionId: sectionId,
                pageNumber: pageNumber,
                progressPercentage: progressPercentage,
                lastReadAt: lastReadAt,
                clientMutationId: clientMutationId,
                clientVersion: clientVersion,
                serverRevision: serverRevision,
                lastClientMutationId: lastClientMutationId,
                createdAt: createdAt,
                updatedAt: updatedAt,
                deletedAt: deletedAt,
                syncStatus: syncStatus,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String userId,
                required String bookId,
                Value<String?> editionId = const Value.absent(),
                Value<int> volumeNumber = const Value.absent(),
                Value<String?> sectionId = const Value.absent(),
                Value<int?> pageNumber = const Value.absent(),
                Value<double> progressPercentage = const Value.absent(),
                Value<DateTime> lastReadAt = const Value.absent(),
                Value<String?> clientMutationId = const Value.absent(),
                Value<int> clientVersion = const Value.absent(),
                Value<int> serverRevision = const Value.absent(),
                Value<String?> lastClientMutationId = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<DateTime?> deletedAt = const Value.absent(),
                Value<String> syncStatus = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalReadingProgressTableCompanion.insert(
                id: id,
                userId: userId,
                bookId: bookId,
                editionId: editionId,
                volumeNumber: volumeNumber,
                sectionId: sectionId,
                pageNumber: pageNumber,
                progressPercentage: progressPercentage,
                lastReadAt: lastReadAt,
                clientMutationId: clientMutationId,
                clientVersion: clientVersion,
                serverRevision: serverRevision,
                lastClientMutationId: lastClientMutationId,
                createdAt: createdAt,
                updatedAt: updatedAt,
                deletedAt: deletedAt,
                syncStatus: syncStatus,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<
                    $LocalReadingProgressTableTable,
                    LocalReadingProgress
                  >(table),
                  BaseReferences<
                    _$AppDatabase,
                    $LocalReadingProgressTableTable,
                    LocalReadingProgress
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalReadingProgressTableTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalReadingProgressTableTable,
      LocalReadingProgress,
      $$LocalReadingProgressTableTableFilterComposer,
      $$LocalReadingProgressTableTableOrderingComposer,
      $$LocalReadingProgressTableTableAnnotationComposer,
      $$LocalReadingProgressTableTableCreateCompanionBuilder,
      $$LocalReadingProgressTableTableUpdateCompanionBuilder,
      (
        LocalReadingProgress,
        BaseReferences<
          _$AppDatabase,
          $LocalReadingProgressTableTable,
          LocalReadingProgress
        >,
      ),
      LocalReadingProgress,
      PrefetchHooks Function()
    >;
typedef $$SyncQueueTableTableCreateCompanionBuilder =
    SyncQueueTableCompanion Function({
      required String id,
      required String clientMutationId,
      required String entityType,
      required String entityId,
      required String operation,
      required String payloadJson,
      Value<int> attempts,
      Value<DateTime?> lastAttemptAt,
      Value<String?> errorMessage,
      Value<DateTime> createdAt,
      Value<int> rowid,
    });
typedef $$SyncQueueTableTableUpdateCompanionBuilder =
    SyncQueueTableCompanion Function({
      Value<String> id,
      Value<String> clientMutationId,
      Value<String> entityType,
      Value<String> entityId,
      Value<String> operation,
      Value<String> payloadJson,
      Value<int> attempts,
      Value<DateTime?> lastAttemptAt,
      Value<String?> errorMessage,
      Value<DateTime> createdAt,
      Value<int> rowid,
    });

class $$SyncQueueTableTableFilterComposer
    extends Composer<_$AppDatabase, $SyncQueueTableTable> {
  $$SyncQueueTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get clientMutationId => $composableBuilder(
    column: $table.clientMutationId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get entityType => $composableBuilder(
    column: $table.entityType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get entityId => $composableBuilder(
    column: $table.entityId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get operation => $composableBuilder(
    column: $table.operation,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get payloadJson => $composableBuilder(
    column: $table.payloadJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get attempts => $composableBuilder(
    column: $table.attempts,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get lastAttemptAt => $composableBuilder(
    column: $table.lastAttemptAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get errorMessage => $composableBuilder(
    column: $table.errorMessage,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$SyncQueueTableTableOrderingComposer
    extends Composer<_$AppDatabase, $SyncQueueTableTable> {
  $$SyncQueueTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get clientMutationId => $composableBuilder(
    column: $table.clientMutationId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get entityType => $composableBuilder(
    column: $table.entityType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get entityId => $composableBuilder(
    column: $table.entityId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get operation => $composableBuilder(
    column: $table.operation,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get payloadJson => $composableBuilder(
    column: $table.payloadJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get attempts => $composableBuilder(
    column: $table.attempts,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get lastAttemptAt => $composableBuilder(
    column: $table.lastAttemptAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get errorMessage => $composableBuilder(
    column: $table.errorMessage,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$SyncQueueTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $SyncQueueTableTable> {
  $$SyncQueueTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get clientMutationId => $composableBuilder(
    column: $table.clientMutationId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get entityType => $composableBuilder(
    column: $table.entityType,
    builder: (column) => column,
  );

  GeneratedColumn<String> get entityId =>
      $composableBuilder(column: $table.entityId, builder: (column) => column);

  GeneratedColumn<String> get operation =>
      $composableBuilder(column: $table.operation, builder: (column) => column);

  GeneratedColumn<String> get payloadJson => $composableBuilder(
    column: $table.payloadJson,
    builder: (column) => column,
  );

  GeneratedColumn<int> get attempts =>
      $composableBuilder(column: $table.attempts, builder: (column) => column);

  GeneratedColumn<DateTime> get lastAttemptAt => $composableBuilder(
    column: $table.lastAttemptAt,
    builder: (column) => column,
  );

  GeneratedColumn<String> get errorMessage => $composableBuilder(
    column: $table.errorMessage,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);
}

class $$SyncQueueTableTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $SyncQueueTableTable,
          SyncQueueItem,
          $$SyncQueueTableTableFilterComposer,
          $$SyncQueueTableTableOrderingComposer,
          $$SyncQueueTableTableAnnotationComposer,
          $$SyncQueueTableTableCreateCompanionBuilder,
          $$SyncQueueTableTableUpdateCompanionBuilder,
          (
            SyncQueueItem,
            BaseReferences<_$AppDatabase, $SyncQueueTableTable, SyncQueueItem>,
          ),
          SyncQueueItem,
          PrefetchHooks Function()
        > {
  $$SyncQueueTableTableTableManager(
    _$AppDatabase db,
    $SyncQueueTableTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SyncQueueTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SyncQueueTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SyncQueueTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> clientMutationId = const Value.absent(),
                Value<String> entityType = const Value.absent(),
                Value<String> entityId = const Value.absent(),
                Value<String> operation = const Value.absent(),
                Value<String> payloadJson = const Value.absent(),
                Value<int> attempts = const Value.absent(),
                Value<DateTime?> lastAttemptAt = const Value.absent(),
                Value<String?> errorMessage = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SyncQueueTableCompanion(
                id: id,
                clientMutationId: clientMutationId,
                entityType: entityType,
                entityId: entityId,
                operation: operation,
                payloadJson: payloadJson,
                attempts: attempts,
                lastAttemptAt: lastAttemptAt,
                errorMessage: errorMessage,
                createdAt: createdAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String clientMutationId,
                required String entityType,
                required String entityId,
                required String operation,
                required String payloadJson,
                Value<int> attempts = const Value.absent(),
                Value<DateTime?> lastAttemptAt = const Value.absent(),
                Value<String?> errorMessage = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SyncQueueTableCompanion.insert(
                id: id,
                clientMutationId: clientMutationId,
                entityType: entityType,
                entityId: entityId,
                operation: operation,
                payloadJson: payloadJson,
                attempts: attempts,
                lastAttemptAt: lastAttemptAt,
                errorMessage: errorMessage,
                createdAt: createdAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$SyncQueueTableTable, SyncQueueItem>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $SyncQueueTableTable,
                    SyncQueueItem
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$SyncQueueTableTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $SyncQueueTableTable,
      SyncQueueItem,
      $$SyncQueueTableTableFilterComposer,
      $$SyncQueueTableTableOrderingComposer,
      $$SyncQueueTableTableAnnotationComposer,
      $$SyncQueueTableTableCreateCompanionBuilder,
      $$SyncQueueTableTableUpdateCompanionBuilder,
      (
        SyncQueueItem,
        BaseReferences<_$AppDatabase, $SyncQueueTableTable, SyncQueueItem>,
      ),
      SyncQueueItem,
      PrefetchHooks Function()
    >;
typedef $$SyncCursorsTableTableCreateCompanionBuilder =
    SyncCursorsTableCompanion Function({
      required String entityType,
      required DateTime cursorUpdatedAt,
      required String cursorId,
      Value<DateTime?> lastSyncCompletedAt,
      Value<int> rowid,
    });
typedef $$SyncCursorsTableTableUpdateCompanionBuilder =
    SyncCursorsTableCompanion Function({
      Value<String> entityType,
      Value<DateTime> cursorUpdatedAt,
      Value<String> cursorId,
      Value<DateTime?> lastSyncCompletedAt,
      Value<int> rowid,
    });

class $$SyncCursorsTableTableFilterComposer
    extends Composer<_$AppDatabase, $SyncCursorsTableTable> {
  $$SyncCursorsTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get entityType => $composableBuilder(
    column: $table.entityType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get cursorUpdatedAt => $composableBuilder(
    column: $table.cursorUpdatedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get cursorId => $composableBuilder(
    column: $table.cursorId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get lastSyncCompletedAt => $composableBuilder(
    column: $table.lastSyncCompletedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$SyncCursorsTableTableOrderingComposer
    extends Composer<_$AppDatabase, $SyncCursorsTableTable> {
  $$SyncCursorsTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get entityType => $composableBuilder(
    column: $table.entityType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get cursorUpdatedAt => $composableBuilder(
    column: $table.cursorUpdatedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get cursorId => $composableBuilder(
    column: $table.cursorId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get lastSyncCompletedAt => $composableBuilder(
    column: $table.lastSyncCompletedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$SyncCursorsTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $SyncCursorsTableTable> {
  $$SyncCursorsTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get entityType => $composableBuilder(
    column: $table.entityType,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get cursorUpdatedAt => $composableBuilder(
    column: $table.cursorUpdatedAt,
    builder: (column) => column,
  );

  GeneratedColumn<String> get cursorId =>
      $composableBuilder(column: $table.cursorId, builder: (column) => column);

  GeneratedColumn<DateTime> get lastSyncCompletedAt => $composableBuilder(
    column: $table.lastSyncCompletedAt,
    builder: (column) => column,
  );
}

class $$SyncCursorsTableTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $SyncCursorsTableTable,
          SyncCursorEntry,
          $$SyncCursorsTableTableFilterComposer,
          $$SyncCursorsTableTableOrderingComposer,
          $$SyncCursorsTableTableAnnotationComposer,
          $$SyncCursorsTableTableCreateCompanionBuilder,
          $$SyncCursorsTableTableUpdateCompanionBuilder,
          (
            SyncCursorEntry,
            BaseReferences<
              _$AppDatabase,
              $SyncCursorsTableTable,
              SyncCursorEntry
            >,
          ),
          SyncCursorEntry,
          PrefetchHooks Function()
        > {
  $$SyncCursorsTableTableTableManager(
    _$AppDatabase db,
    $SyncCursorsTableTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SyncCursorsTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SyncCursorsTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SyncCursorsTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> entityType = const Value.absent(),
                Value<DateTime> cursorUpdatedAt = const Value.absent(),
                Value<String> cursorId = const Value.absent(),
                Value<DateTime?> lastSyncCompletedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SyncCursorsTableCompanion(
                entityType: entityType,
                cursorUpdatedAt: cursorUpdatedAt,
                cursorId: cursorId,
                lastSyncCompletedAt: lastSyncCompletedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String entityType,
                required DateTime cursorUpdatedAt,
                required String cursorId,
                Value<DateTime?> lastSyncCompletedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SyncCursorsTableCompanion.insert(
                entityType: entityType,
                cursorUpdatedAt: cursorUpdatedAt,
                cursorId: cursorId,
                lastSyncCompletedAt: lastSyncCompletedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$SyncCursorsTableTable, SyncCursorEntry>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $SyncCursorsTableTable,
                    SyncCursorEntry
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$SyncCursorsTableTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $SyncCursorsTableTable,
      SyncCursorEntry,
      $$SyncCursorsTableTableFilterComposer,
      $$SyncCursorsTableTableOrderingComposer,
      $$SyncCursorsTableTableAnnotationComposer,
      $$SyncCursorsTableTableCreateCompanionBuilder,
      $$SyncCursorsTableTableUpdateCompanionBuilder,
      (
        SyncCursorEntry,
        BaseReferences<_$AppDatabase, $SyncCursorsTableTable, SyncCursorEntry>,
      ),
      SyncCursorEntry,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$LocalUserStateTableTableTableManager get localUserStateTable =>
      $$LocalUserStateTableTableTableManager(_db, _db.localUserStateTable);
  $$AppSettingsTableTableTableManager get appSettingsTable =>
      $$AppSettingsTableTableTableManager(_db, _db.appSettingsTable);
  $$LocalBookmarksTableTableTableManager get localBookmarksTable =>
      $$LocalBookmarksTableTableTableManager(_db, _db.localBookmarksTable);
  $$LocalReadingProgressTableTableTableManager get localReadingProgressTable =>
      $$LocalReadingProgressTableTableTableManager(
        _db,
        _db.localReadingProgressTable,
      );
  $$SyncQueueTableTableTableManager get syncQueueTable =>
      $$SyncQueueTableTableTableManager(_db, _db.syncQueueTable);
  $$SyncCursorsTableTableTableManager get syncCursorsTable =>
      $$SyncCursorsTableTableTableManager(_db, _db.syncCursorsTable);
}
