<?php

namespace Sematico\InertiaI18n;

trait SharesTranslations
{
    /**
     * Get the i18n translation payload for Inertia sharing.
     *
     * @return array{locale: string, fallbackLocale: string, translations: array<string, string>}
     */
    protected function translationProps(): array
    {
        return app(InertiaI18n::class)->toInertiaPayload();
    }
}
