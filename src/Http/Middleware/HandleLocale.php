<?php

namespace Sematico\InertiaI18n\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->has('_locale')) {
            $locale = $request->input('_locale');

            if ($this->isValidLocale($locale)) {
                app()->setLocale($locale);
                session()->put('locale', $locale);
            }
        } elseif (session()->has('locale')) {
            $locale = session('locale');

            if ($this->isValidLocale($locale)) {
                app()->setLocale($locale);
            }
        }

        return $next($request);
    }

    protected function isValidLocale(mixed $locale): bool
    {
        if (! is_string($locale) || ! preg_match('/^[a-zA-Z]{2,3}([_-][a-zA-Z0-9]{2,8})*$/', $locale)) {
            return false;
        }

        $supported = config('inertia-i18n.supported_locales');

        if (is_array($supported)) {
            return in_array($locale, $supported, true);
        }

        return true;
    }
}
