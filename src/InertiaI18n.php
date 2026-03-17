<?php

namespace Sematico\InertiaI18n;

class InertiaI18n
{
    /**
     * Load translations for a given locale from lang/{locale}.json.
     *
     * When the requested locale differs from the fallback locale, fallback
     * translations are merged in first so that missing keys are covered.
     *
     * @return array<string, string>
     */
    public function translations(?string $locale = null): array
    {
        $locale = $locale ?? app()->getLocale();
        $fallbackLocale = config('app.fallback_locale', 'en');

        $translations = $this->loadTranslationsFor($locale);

        if ($locale !== $fallbackLocale) {
            $fallback = $this->loadTranslationsFor($fallbackLocale);
            $translations = array_merge($fallback, $translations);
        }

        return $translations;
    }

    /**
     * Load and decode translations for a single locale.
     *
     * @return array<string, string>
     */
    protected function loadTranslationsFor(string $locale): array
    {
        $path = $this->langPath().DIRECTORY_SEPARATOR."{$locale}.json";

        if (! file_exists($path)) {
            return [];
        }

        $contents = file_get_contents($path);

        if ($contents === false) {
            return [];
        }

        $decoded = json_decode($contents, true, depth: 10);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Build the full i18n payload for Inertia sharing.
     *
     * @return array{locale: string, fallbackLocale: string, translations: array<string, string>}
     */
    public function toInertiaPayload(?string $locale = null): array
    {
        $locale = $locale ?? app()->getLocale();

        return [
            'locale' => $locale,
            'fallbackLocale' => config('app.fallback_locale', 'en'),
            'translations' => $this->translations($locale),
        ];
    }

    /**
     * Get the configured lang path.
     */
    public function langPath(): string
    {
        return config('inertia-i18n.lang_path') ?? lang_path();
    }
}
