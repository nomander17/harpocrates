package com.harpo.crates.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

public record SecretDTO(
    UUID id,
    UUID userId,
    String title,
    String body,
    LocalDateTime createdAt
) {}
