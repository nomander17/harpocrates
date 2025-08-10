package com.harpo.crates.DTO;

import java.util.UUID;

public record UserDTO(
    UUID id,
    String email
) {}
