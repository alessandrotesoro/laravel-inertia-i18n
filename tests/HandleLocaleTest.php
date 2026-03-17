<?php

use Illuminate\Support\Facades\Route;
use Sematico\InertiaI18n\Http\Middleware\HandleLocale;

beforeEach(function () {
    Route::middleware(['web', HandleLocale::class])
        ->get('/test-locale', fn () => response()->json([
            'locale' => app()->getLocale(),
        ]));
});

it('sets locale from _locale request parameter', function () {
    $this->get('/test-locale?_locale=es')
        ->assertOk()
        ->assertJson(['locale' => 'es']);
});

it('persists locale to session', function () {
    $this->get('/test-locale?_locale=fr');

    $this->get('/test-locale')
        ->assertOk()
        ->assertJson(['locale' => 'fr']);
});

it('restores locale from session on subsequent requests', function () {
    $this->withSession(['locale' => 'de'])
        ->get('/test-locale')
        ->assertOk()
        ->assertJson(['locale' => 'de']);
});

it('leaves locale unchanged when no _locale and no session', function () {
    $defaultLocale = config('app.locale');

    $this->get('/test-locale')
        ->assertOk()
        ->assertJson(['locale' => $defaultLocale]);
});

it('rejects invalid locale format with path traversal', function () {
    $defaultLocale = config('app.locale');

    $this->get('/test-locale?_locale=../../etc/passwd')
        ->assertOk()
        ->assertJson(['locale' => $defaultLocale]);
});

it('rejects empty string locale', function () {
    $defaultLocale = config('app.locale');

    $this->get('/test-locale?_locale=')
        ->assertOk()
        ->assertJson(['locale' => $defaultLocale]);
});

it('rejects locale with special characters', function () {
    $defaultLocale = config('app.locale');

    $this->get('/test-locale?_locale=en<script>')
        ->assertOk()
        ->assertJson(['locale' => $defaultLocale]);
});

it('accepts valid two-letter locale', function () {
    $this->get('/test-locale?_locale=fr')
        ->assertOk()
        ->assertJson(['locale' => 'fr']);
});

it('accepts valid locale with region', function () {
    $this->get('/test-locale?_locale=pt_BR')
        ->assertOk()
        ->assertJson(['locale' => 'pt_BR']);
});

it('accepts valid locale with hyphen', function () {
    $this->get('/test-locale?_locale=zh-Hans')
        ->assertOk()
        ->assertJson(['locale' => 'zh-Hans']);
});

it('rejects locale not in supported_locales when configured', function () {
    config()->set('inertia-i18n.supported_locales', ['en', 'es']);
    $defaultLocale = config('app.locale');

    $this->get('/test-locale?_locale=fr')
        ->assertOk()
        ->assertJson(['locale' => $defaultLocale]);
});

it('accepts locale in supported_locales when configured', function () {
    config()->set('inertia-i18n.supported_locales', ['en', 'es', 'fr']);

    $this->get('/test-locale?_locale=es')
        ->assertOk()
        ->assertJson(['locale' => 'es']);
});

it('overrides session locale with new _locale parameter', function () {
    $this->withSession(['locale' => 'de'])
        ->get('/test-locale?_locale=ja')
        ->assertOk()
        ->assertJson(['locale' => 'ja']);
});

it('rejects poisoned session locale with path traversal', function () {
    $defaultLocale = config('app.locale');

    $this->withSession(['locale' => '../../etc/passwd'])
        ->get('/test-locale')
        ->assertOk()
        ->assertJson(['locale' => $defaultLocale]);
});
