# Laravel Inertia i18n

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sematico/laravel-inertia-i18n.svg?style=flat-square)](https://packagist.org/packages/sematico/laravel-inertia-i18n)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/alessandrotesoro/laravel-inertia-i18n/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/alessandrotesoro/laravel-inertia-i18n/actions?query=workflow%3Arun-tests+branch%3Amain)

This package bridges Laravel's JSON translations with your Inertia.js React frontend. The backend reads your `lang/{locale}.json` files and shares them as Inertia props. The React package provides a `useTranslation` hook and a `Trans` component that support Laravel's full translation syntax, including pluralization rules and `:placeholder` interpolation.

## Features

- Automatic sharing of translations via Inertia props
- `useTranslation` hook with `t()` function, locale info, and `setLocale()`
- `Trans` component for embedding React elements inside translation strings
- Laravel-compatible pluralization (`{0} None|{1} One|[2,*] :count items`)
- `:placeholder` interpolation with case variants (`:name`, `:Name`, `:NAME`)
- Locale switching with session persistence via middleware
- Fallback locale support — missing translations fall back to your default language
- Full TypeScript support

## Requirements

- PHP 8.2+
- Laravel 11 or 12
- Inertia.js Laravel adapter ^3.0
- React 19+
- `@inertiajs/react` ^3.0

## Installation

### Backend

```bash
composer require sematico/laravel-inertia-i18n
```

Publish the config file (optional):

```bash
php artisan vendor:publish --tag="inertia-i18n-config"
```

Add the locale-switching middleware to your routes or HTTP kernel:

```php
use Sematico\InertiaI18n\Http\Middleware\HandleLocale;

Route::middleware([HandleLocale::class])->group(function () {
    // your routes
});
```

### Frontend

```bash
bun add 'git+ssh://git@github.com/alessandrotesoro/laravel-inertia-i18n.git#main'
```

The repository package builds during installation. Bun consumers must list
`@sematico/laravel-inertia-i18n-react` in `trustedDependencies` so the package's
`prepare` script can produce the distributable files. If GitHub SSH keys are not
configured, route GitHub SSH URLs through an authenticated HTTPS credential:

```bash
gh auth setup-git
git config --global --add url.https://github.com/.insteadOf ssh://git@github.com/
```

Wrap your app with the `I18nProvider`:

```tsx
import { I18nProvider } from "@sematico/laravel-inertia-i18n-react";

export default function App({ children }) {
  return <I18nProvider>{children}</I18nProvider>;
}
```

## Usage

### Translation files

Create JSON translation files in your `lang/` directory:

```jsonc
// lang/en.json
{
  "Welcome!": "Welcome!",
  "Hello, :name!": "Hello, :name!",
  "One apple|:count apples": "One apple|:count apples"
}
```

```jsonc
// lang/es.json
{
  "Welcome!": "Bienvenido!",
  "Hello, :name!": "Hola, :name!",
  "One apple|:count apples": "Una manzana|:count manzanas"
}
```

> **Note:** JSON does not support comments. The `//` lines above are for illustration only — omit them in your actual files.

### Basic translations

```tsx
import { useTranslation } from "@sematico/laravel-inertia-i18n-react";

function Greeting() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div>
      <h1>{t("Welcome!")}</h1>
      <p>{t("Hello, :name!", { name: "Alessandro" })}</p>
      <button onClick={() => setLocale("es")}>Switch to Spanish</button>
    </div>
  );
}
```

### Pluralization

The `t()` function supports Laravel's pluralization syntax:

```tsx
// Simple: singular|plural
t("One apple|:count apples", { count: 5 });
// => "5 apples"

// Explicit values and ranges
t("{0} No items|{1} One item|[2,*] :count items", { count: 3 });
// => "3 items"
```

### Component interpolation with `Trans`

Use the `Trans` component to embed React elements inside translation strings:

```json
{
  "Please <link>click here</link> to continue.": "Por favor <link>haz clic aqui</link> para continuar."
}
```

```tsx
import { Trans } from "@sematico/laravel-inertia-i18n-react";

<Trans
  i18nKey="Please <link>click here</link> to continue."
  components={{ link: <a href="/next" /> }}
/>;
```

The tag names in your translation strings map to the keys in the `components` prop. The translated text becomes the children of each component.

### Translation key fallback

If a key is not found in the current locale's translations, `t()` returns the key itself. This means you can use your default-language strings as keys and skip the default locale's JSON file entirely:

```tsx
// No en.json needed — the key IS the English text
t("Welcome!"); // => "Welcome!" (when no translation exists)
```

### Locale switching

Calling `setLocale()` triggers an Inertia partial reload via `router.reload()` with a `_locale` query parameter. The `HandleLocale` middleware picks this up, persists the locale to the session, and applies it to all subsequent requests. This is not a full browser refresh — Inertia re-fetches page props from the server and swaps them in place.

## Configuration

The published config file (`config/inertia-i18n.php`) supports these options:

| Option | Default | Description |
|--------|---------|-------------|
| `auto_share` | `true` | Automatically share translations via `Inertia::share()` |
| `prop_name` | `'i18n'` | The Inertia prop key for translation data |
| `lang_path` | `null` | Custom path to JSON translation files (defaults to Laravel's `lang_path()`) |
| `supported_locales` | `null` | Array of allowed locale codes, e.g. `['en', 'es', 'fr']`. When null, any well-formed locale is accepted |

### Manual sharing

If you set `auto_share` to `false`, use the `SharesTranslations` trait in your Inertia middleware:

```php
use Sematico\InertiaI18n\SharesTranslations;

class HandleInertiaRequests extends Middleware
{
    use SharesTranslations;

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'i18n' => $this->translationProps(),
        ]);
    }
}
```

### Custom prop name

If you change the `prop_name` config value, pass the same value to the React provider:

```tsx
<I18nProvider propName="translations">{children}</I18nProvider>
```

## API Reference

### React exports

| Export | Type | Description |
|--------|------|-------------|
| `I18nProvider` | Component | Context provider. Reads i18n data from Inertia page props |
| `useTranslation` | Hook | Returns `{ t, locale, setLocale }` |
| `Trans` | Component | Renders translations with embedded React components |

### `useTranslation()` return value

| Property | Type | Description |
|----------|------|-------------|
| `t(key, options?)` | `(string, TranslationOptions?) => string` | Translate a key with optional interpolation and pluralization |
| `locale` | `string` | Current locale |
| `setLocale(locale)` | `(string) => void` | Switch locale (triggers Inertia partial reload) |

### `TranslationOptions`

| Property | Type | Description |
|----------|------|-------------|
| `count` | `number` | Triggers pluralization |
| `[key: string]` | `string \| number` | Interpolation values for `:key` placeholders |

### `Trans` props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `i18nKey` | `string` | Yes | Translation key |
| `values` | `Record<string, string \| number>` | No | Interpolation values |
| `count` | `number` | No | Pluralization count |
| `components` | `Record<string, ReactElement>` | No | Map of tag names to React elements |
| `as` | `ElementType` | No | Wrapper element type (e.g. `"p"`, `"span"`, a custom component) |

The `as` prop wraps the entire output in the given element:

```tsx
<Trans i18nKey="Welcome!" as="p" />
// Renders: <p>Bienvenido!</p>
```

## Testing

```bash
# PHP tests
composer test

# React tests
pnpm test:js
```

## Credits

- [Alessandro Tesoro](https://github.com/alessandrotesoro)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). See [LICENSE.md](LICENSE.md) for details.
