import { expect, test } from '@playwright/test';

test('la página inicial carga y confirma la conexión con API y base de datos', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('POS Taquería Don Juan');
  await expect(page.getByRole('heading', { level: 1, name: 'Taquería Don Juan' })).toBeVisible();
  await expect(page.getByText('API conectada')).toBeVisible();
  await expect(page.getByText('Base de datos conectada')).toBeVisible();
});
