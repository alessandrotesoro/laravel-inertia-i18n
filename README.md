# Laravel Inertia i18n

Share Laravel JSON translations with an Inertia.js React application. The Composer package loads locale files and exposes them as Inertia props; the React package provides translation hooks and component interpolation.

| Package | Install from |
| --- | --- |
| `sematico/laravel-inertia-i18n` | [Packagist](https://packagist.org/packages/sematico/laravel-inertia-i18n) |
| `@sematico/laravel-inertia-i18n-react` | [npm](https://www.npmjs.com/package/@sematico/laravel-inertia-i18n-react) |

> [!NOTE]
> The React package reads an `i18n` prop shared by the Laravel service provider. Keep `<I18nProvider>` inside your Inertia app tree.

## Requirements

- PHP 8.2 or newer
- Laravel 11, 12, or 13
- `inertiajs/inertia-laravel` 3.x
- React 19 and `@inertiajs/react` 3.x

## Installation

Install the backend package:

```bash
composer require sematico/laravel-inertia-i18n
```

The service provider registers itself through Laravel package discovery. Publish the configuration file only when you need to change its defaults:

```bash
php artisan vendor:publish --tag=inertia-i18n-config
```

Install the React package:

```bash
npm install @sematico/laravel-inertia-i18n-react
```

## Backend setup

Create JSON files in Laravel's `lang` directory. The file name is the locale:

```json
{
  "Welcome!": "Welcome!",
  "Hello, :name!": "Hello, :name!",
  "One item|:count items": "One item|:count items"
}
```

By default, the package shares this payload as `page.props.i18n`:

```php
[
    'locale' => 'en',
    'fallbackLocale' => 'en',
    'translations' => [/* ... */],
]
```

For locale switching, add the middleware to the routes that should accept the `_locale` query parameter:

```php
use Sematico\InertiaI18n\Http\Middleware\HandleLocale;

Route::middleware([HandleLocale::class])->group(function () {
    // localized routes
});
```

`HandleLocale` validates locale names and stores an accepted locale in the session. Set `supported_locales` in the config file to restrict the accepted list.

## React setup

Mount the provider once around the part of the tree that uses translations:

```tsx
import type { ReactNode } from "react";
import { I18nProvider } from "@sematico/laravel-inertia-i18n-react";

export function AppShell({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
```

Use `t`, read the active locale, or request a locale reload:

```tsx
import { useTranslation } from "@sematico/laravel-inertia-i18n-react";

export function Greeting() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div>
      <h1>{t("Welcome!")}</h1>
      <p>{t("Hello, :name!", { name: "Alex" })}</p>
      <p>Current locale: {locale}</p>
      <button type="button" onClick={() => setLocale("es")}>
        Español
      </button>
    </div>
  );
}
```

`t()` supports Laravel-style plural forms and interpolation:

```tsx
t("One item|:count items", { count: 3 });
t("{0} None|{1} One|[2,*] :count items", { count: 3 });
```

Use `Trans` when translated text contains named component tags:

```tsx
import { Trans } from "@sematico/laravel-inertia-i18n-react";

<Trans
  i18nKey="Read the <link>docs</link>."
  components={{ link: <a href="/docs" /> }}
/>;
```

## Configuration

The published `config/inertia-i18n.php` file supports:

| Option | Default | Purpose |
| --- | --- | --- |
| `auto_share` | `true` | Share translations through the service provider |
| `prop_name` | `i18n` | Name of the Inertia prop |
| `lang_path` | `null` | Custom directory containing `{locale}.json` files |
| `supported_locales` | `null` | Optional allow-list for `HandleLocale` |

Set `auto_share` to `false` when you want to call `translationProps()` from the `SharesTranslations` trait in your own Inertia middleware. If `prop_name` is changed, pass the same value to `<I18nProvider propName="translations">`.

## Public API

- `I18nProvider` reads the configured translation payload from Inertia page props.
- `useTranslation()` returns `t`, `locale`, and `setLocale`.
- `Trans` supports `i18nKey`, `values`, `count`, `components`, and `as`.
- `InertiaI18n::translations()` loads the current locale and merges missing keys from the Laravel fallback locale.
- `InertiaI18n::toInertiaPayload()` returns the locale, fallback locale, and translations.
- `SharesTranslations` exposes the same payload for manual sharing.

## Development

```bash
composer install
composer validate --strict
composer test
composer analyse
composer format -- --test

pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:js
pnpm lint
pnpm build
npm pack --dry-run
```

The package build writes distributable files to `packages/react/dist`. The published npm package contains that build output plus the project README and license file.
