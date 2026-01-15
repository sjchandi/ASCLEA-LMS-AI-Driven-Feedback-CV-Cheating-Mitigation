<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="icon" href="{{ asset('asclea_favicon.png') }}" type="image/png">
  @viteReactRefresh
  @routes
  @vite('resources/js/app.jsx')
  @vite('resources/css/app.css')
  @inertiaHead
</head>

<body>
  @inertia
</body>

</html>