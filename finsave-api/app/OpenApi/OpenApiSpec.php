<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\OpenApi]
#[OA\Info(
    version: "1.0.0",
    title: "FinSave API",
    description: "OpenAPI specifikacija za FinSave aplikaciju."
)]
#[OA\Server(
    url: "http://localhost:8080",
    description: "Local Docker Server"
)]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "Token"
)]
class OpenApiSpec {}