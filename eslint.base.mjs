// Configuración ESLint base para paquetes TypeScript de Node (apps/api, packages/shared).
// apps/web usa eslint-config-next y solo comparte las reglas de prettier.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * @param {string} tsconfigRootDir Directorio del paquete (import.meta.dirname).
 */
export function nodeTypeScriptConfig(tsconfigRootDir) {
  return tseslint.config(
    { ignores: ['dist/**', 'coverage/**', 'src/generated/**'] },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    {
      languageOptions: {
        globals: globals.node,
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      rules: {
        '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
        // Los módulos de Nest son clases vacías decoradas con @Module().
        '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },
    {
      files: ['**/*.mjs', '**/*.js'],
      ...tseslint.configs.disableTypeChecked,
    },
    prettier,
  );
}
