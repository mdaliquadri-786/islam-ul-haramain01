import 'package:flutter/material.dart';

/// Authentic Sacred Islamic Color Palette & Theme Definitions.
class AppTheme {
  // Sacred Islamic Color Palette
  static const Color emeraldPrimary = Color(0xFF0F5132);
  static const Color emeraldLight = Color(0xFF1B6A44);
  static const Color emeraldDark = Color(0xFF093822);

  static const Color goldAccent = Color(0xFFD4AF37);
  static const Color goldLight = Color(0xFFE5C158);
  static const Color goldDark = Color(0xFFB08D23);

  // Backgrounds & Surfaces
  static const Color lightBg = Color(0xFFFDFBF7);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color darkBg = Color(0xFF121614);
  static const Color darkSurface = Color(0xFF1A221E);
  static const Color darkSurfaceElevated = Color(0xFF222C27);

  // Text Colors
  static const Color textLightPrimary = Color(0xFF1C241F);
  static const Color textLightSecondary = Color(0xFF55635B);
  static const Color textDarkPrimary = Color(0xFFF2F5F3);
  static const Color textDarkSecondary = Color(0xFFA6B3AB);

  /// Light Theme Definition
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: emeraldPrimary,
      scaffoldBackgroundColor: lightBg,
      colorScheme: const ColorScheme.light(
        primary: emeraldPrimary,
        onPrimary: Colors.white,
        secondary: goldAccent,
        onSecondary: Colors.black,
        surface: lightSurface,
        onSurface: textLightPrimary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: emeraldPrimary,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
      cardTheme: CardThemeData(
        color: lightSurface,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: Colors.grey.withAlpha(50)),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: lightSurface,
        selectedItemColor: emeraldPrimary,
        unselectedItemColor: textLightSecondary,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }

  /// Dark Theme Definition
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: emeraldLight,
      scaffoldBackgroundColor: darkBg,
      colorScheme: const ColorScheme.dark(
        primary: emeraldLight,
        onPrimary: Colors.white,
        secondary: goldAccent,
        onSecondary: Colors.black,
        surface: darkSurface,
        onSurface: textDarkPrimary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: darkSurface,
        foregroundColor: textDarkPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: textDarkPrimary,
        ),
      ),
      cardTheme: CardThemeData(
        color: darkSurface,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: Colors.white.withAlpha(25)),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: darkSurface,
        selectedItemColor: goldAccent,
        unselectedItemColor: textDarkSecondary,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
