import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  { name: 'app/files', files: ['**/*.{ts,mts,tsx,vue}'] },
  { name: 'app/ignores', ignores: ['dist/**', 'node_modules/**'] },
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
  skipFormatting,
  // Dot.vue is a low-level SVG primitive component; single-word name is intentional.
  {
    name: 'app/dot-component-exception',
    files: ['src/components/Dot.vue'],
    rules: { 'vue/multi-word-component-names': 'off' },
  },
]
